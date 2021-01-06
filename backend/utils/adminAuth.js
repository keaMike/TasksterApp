const User = require("../models/User");

const isUserAdmin = async (userId) => {
    const filter = { _id: userId };
    const user = await User.findOne(filter)
    if (user) {
        return user.isAdmin;
    };
    return false;
};

module.exports = {
    isUserAdmin
};