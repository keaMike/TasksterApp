const User = require("../models/User");

const verifyUserAsAdmin = (userId) => {
    return new Promise((resolve, reject) => {
        const filter = { _id: userId };
        User.findOne(filter)
            .then((doc) => {
                if (doc) {
                    resolve(doc.isAdmin);
                };
            })
            .catch(() => {
                reject(false);
            });
    });
};

module.exports = {
    verifyUserAsAdmin
};