const mongoose = require("mongoose");
console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});

module.exports = mongoose;