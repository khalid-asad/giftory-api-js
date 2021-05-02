const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailgun = require('mailgun-js');
const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
const User = require('../model/User');
const { accountVerification } = require('../accountVerification');
const { passwordReset } = require('../passwordReset');
const { validateRegistration, validateAuthentication, validateResetPassword } = require('../validation');

const sendActivationEmail = (user, res) => {
    const jwtToken = jwt.sign({ _id: user.id }, process.env.JWT_TOKEN_SECRET, {expiresIn: '20m'});
    const link = process.env.BASE_URL + "api/user/activate?token=" + jwtToken;

    const data = {
        from: "noreply@giftstory.com",
        to: user.email,
        subject: "Account activation link",
        html: accountVerification(link)
    };

    mg.messages().send(data, function (error, body) {
        if(error) {
            console.log('[Giftstory] Failed to send activation e-mail.');
            return res.json({
                error: error.message
            });
        }
        console.log('[Giftstory] Successfully sent activation e-mail.');
        return res.json({
            message: 'Activation e-mail has been sent. Please activate your account with the link in the email before logging in.'
        })
    });
};

const sendResetPasswordEmail = (user, res) => {
    const jwtToken = jwt.sign({ _id: user.id }, process.env.JWT_RESET_PASSWORD_TOKEN_SECRET, {expiresIn: '20m'});
    const link = process.env.BASE_URL + "api/user/resetPassword?token=" + jwtToken;

    const data = {
        from: "noreply@giftstory.com",
        to: user.email,
        subject: "Password reset link",
        html: passwordReset(link)
    };

    return User.updateOne({ _id: user.id }, { resetPasswordLink: jwtToken }, function (err, success) {
        if(err) return res.status(400).json({ error: "Reset password link is invalid." });
        mg.messages().send(data, function (error, body) {
            if(error) {
                console.log('[Giftstory] Failed to send password reset e-mail.');
                return res.json({
                    error: error.message
                });
            }
            console.log('[Giftstory] Successfully sent password reset e-mail.');
            return res.json({
                message: 'Password reset e-mail has been sent. Please check the spam folder for any e-mails.'
            })
        });
    });
};

router.post('/register', async (req, res) => {
    const { error } = validateRegistration(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const emailExists = await User.findOne({ email: req.body.email });
    if(emailExists) return res.status(400).send('Email already exists!');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        birthday: req.body.birthday
    });

    try {
        await user.save();
        console.log('[Giftstory] User ' + user.id + ' created.')
        sendActivationEmail(user, res);
    } catch (err) {
        res.status(400).send(err);
        console.log('[Giftstory] 400 on /register');
    }
});

router.get('/activate', async (req, res) => {
    const token = req.query.token;
    if (!token) return res.json({ error: "Something went wrong." });
    jwt.verify(token, process.env.JWT_TOKEN_SECRET, async function (err, decodedToken) {
        if (err) return res.status(400).json({ error: 'Incorrect or expired link.' });
        const { _id } = decodedToken;

        const foundUser = await User.findOne({ _id: _id, isActivated: true });
        if (foundUser) return res.status(400).send('Account is already activated!');

        const updateResponse = await User.updateOne({ _id: _id }, { isActivated: true });

        if (updateResponse.nModified > 0) {
            return res.status(200).send('Account was successfully activated.');
        } else {
            return res.status(400).send('Sorry, something went wrong with the activation.');
        }
    });
});

router.post('/login', async (req, res) => {
    const { error } = validateAuthentication(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Email is not registered.');

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword) return res.status(400).send('Email or password is incorrect.');

    const inactiveUser = await User.findOne({ email: req.body.email, isActivated: false });
    if(inactiveUser) return sendActivationEmail(user, res);

    const jwtToken = jwt.sign({ _id: user.id }, process.env.JWT_TOKEN_SECRET);

    console.log('[Giftstory] 200 on /login');
    return res.header(process.env.JWT_TOKEN_HEADER, jwtToken).status(200).send('Successfully logged in!');
});

router.put('/forgotPassword', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Email is not registered.');
    sendResetPasswordEmail(user, res);
});

router.put('/resetPassword', async (req, res) => {
    const { resetPasswordLink, password } = req.body;
    if(resetPasswordLink == '') return res.status(400).send('Invalid reset password link or expired link.');

    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD_TOKEN_SECRET, async function (err, decodedToken) {
        if (err || !decodedToken) return res.status(400).send('Invalid reset password link or expired link.');

        const user = await User.findOne({ resetPasswordLink: resetPasswordLink });
        if (!user) return res.status(400).send('Invalid reset password link or expired link.');

        const { error } = validateResetPassword(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const updateResponse = await User.updateOne({ resetPasswordLink: resetPasswordLink }, { password: hashedPassword, resetPasswordLink: '' });

        if (updateResponse.nModified > 0) {
            return res.status(200).send('Password successfully reset.');
        } else {
            return res.status(400).send('Sorry, something went wrong with the password reset.');
        }
    });
});

// logout

// delete

module.exports = router;