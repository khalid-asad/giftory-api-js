const router = require('express').Router();
const authorize = require('./authorize');
const User = require('../model/User');

router.get('/', authorize, (req, res) => {
    // find logged in user info
    // const user = User.findById({ id: req.user._id });
    res.json({
        contacts: {
            name: "John Doe",
            birthday: '1994-10-22',
            gifts: [
                {
                    year: '2020',
                    sent: true,
                    giftName: 'Gift Card',
                    value: 100
                },
                {
                    year: '2020',
                    sent: false,
                    giftName: 'Gift Card',
                    value: 100
                }
            ]
        }
    });
});

router.post('/create', authorize, (req, res) => {

});

module.exports = router;