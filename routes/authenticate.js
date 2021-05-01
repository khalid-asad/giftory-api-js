const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const { validateRegistration, validateAuthentication } = require('../validation');

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
        res.status(204).send();
        console.log('[Giftory] 200 on /register');
    } catch (err) {
        res.status(400).send(err);
        console.log('[Giftory] 400 on /register');
    }
});

router.post('/login', async (req, res) => {
    const { error } = validateAuthentication(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Email is not registered.');

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword) return res.status(400).send('Email or password is incorrect.');

    const jwtToken = jwt.sign({ _id: user.id }, process.env.JWT_TOKEN_SECRET);

    console.log('[Giftory] 200 on /login');
    return res.header(process.env.JWT_TOKEN_HEADER, jwtToken).status(200).send('Successfully logged in!');
});

module.exports = router;