const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {

            if (err) reject({ msg: "Something went wrong... Try again later or contact us" });

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) return { msg: "Something went wrong... Try again later or contact us" };
                resolve(hash);
            });
        });
    });
}

const comparePassword = (password, userPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, userPassword)
            .then(isMatch => {
                if (!isMatch) reject();
                resolve();
            });
    })
}

module.exports = {
    hashPassword,
    comparePassword
}