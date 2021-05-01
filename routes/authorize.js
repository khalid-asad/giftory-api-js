const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header(process.env.JWT_TOKEN_HEADER);
    if(!token) return res.status(401).send('Access Denied');

    try {
        const verifiedContent = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        req.user = verifiedContent;
        next();
    } catch(err) {
        res.status(400).send('Invalid Token');
    }
};