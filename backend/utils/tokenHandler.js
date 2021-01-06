const jwt = require('jsonwebtoken');

const generateAccessToken = (_id) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { _id },
            process.env.JWT_KEY,
            { expiresIn: "10m" },
            (error, token) => {
                if (error) reject();
                resolve(token);
            }
        );
    });
};

const generateRefreshToken = (_id) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { _id },
            process.env.JWT_REFRESH_KEY,
            async (error, token) => {
                if (error) reject();
                const refreshToken = await saveRefreshToken(token);
                refreshToken ? resolve(refreshToken) : reject();
            }
        );
    });
};

const saveRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        const refreshToken = new RefreshToken({
            refreshToken: token
        });
        refreshToken.save()
            .then((doc) => {
                if (!doc) reject();
                resolve(doc.refreshToken);
            })
            .catch(() => {
                reject();
            });
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};