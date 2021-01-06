const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('auth-token');

    if (!token) return res.status(401).json({ msg: "Your are not authorized to use this feature" });

    try {
        jwt.verify(token, process.env.JWT_KEY, (error, user) => {
            if (error) return res.status(400).json({ msg: "Something went wrong... try again or contact us " });
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(400).json({ msg: "Your session has expired", sessionExpired: true });
    };
};

module.exports = {
    auth
};