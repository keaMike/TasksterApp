const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    try {
        const salt = await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (error, salt) => {
                if (error) reject();
                resolve(salt)
            });
        });

        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) reject();
                resolve(hash);
            });
        });
        return hashedPassword;
    } catch (error) {
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
};

const comparePasswords = async (password, userPassword) => {
    try {
        return await bcrypt.compare(password, userPassword);
    } catch (error) {
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
};

module.exports = {
    hashPassword,
    comparePasswords
};