const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendConfirmation = async (email, _id) => {
    try {
        const status = new Promise((resolve, reject) => {
            jwt.sign(
                { _id },
                process.env.JWT_KEY,
                { expiresIn: 600 },
                (async (error, token) => {
                    if (error) reject("Something went wrong... Try again later or contact us");

                    const request = {
                        email,
                        token
                    };
                    resolve(await sendEmail(request, "confirm"));
                })
            );
        });
        return status;
    } catch (error) {
        console.log("Send confirmation" + error);
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
};

const sendReset = async (email, _id) => {
    try {
        const status = new Promise((resolve, reject) => {
            jwt.sign(
                { _id },
                process.env.JWT_KEY,
                { expiresIn: 600 },
                (async (error, token) => {
                    if (error) reject("Something went wrong... Try again later or contact us");

                    const request = {
                        email,
                        token
                    };
                    resolve(await sendEmail(request, "reset"));
                })
            );
        });
        return status;
    } catch (error) {
        console.log("Send reset" + error);
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
}

const sendEmail = async (request, type) => {
    const transporter = await generateTransporter();
    try {
        switch (type) {
            case "reset":
                const resetMail = await getResetEmail(request);
                const resetStatus = await new Promise((resolve, reject) => {
                    transporter.sendMail(resetMail, (error, info) => {
                        if (error) reject(error);
                        resolve(`Email has been sent to ${request.email}`);
                    });
                });
                return resetStatus;
            case "confirm":
                const confirmMail = await getConfirmEmail(request);
                const confirmStatus = await new Promise((resolve, reject) => {
                    transporter.sendMail(confirmMail, (error, info) => {
                        if (error) reject("Something went wrong... Try again later or contact us");
                        resolve(`Email has been sent to ${request.email}`);
                    });
                });
                return confirmStatus;
        };
    } catch (error) {
        console.log("Send Email" + error);
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
};

const generateTransporter = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_PASSWORD}`
            },
        });
        return transporter;
    } catch (error) {
        console.log("Generate transporter" + error);
        return new Error({ msg: "Something went wrong... Try again later or contact us" });
    };
};

const getConfirmEmail = async (request) => {
    return {
        from: '"Taskster" <kontakt@mikeeggertsen.com>',
        to: request.email,
        subject: "Email verification",
        html:
            `<p>Hi! Thank you for creating an account, before we can let you loose on our website, 
            you need to verify youe email, by clicking the following link: <a href=http://mikeeggertsen/confirm?id=${request.token}>Verify email</a></p>`,
    };
};

const getResetEmail = async (request) => {
    return {
        from: '"Taskster" <kontakt@mikeeggertsen.com>',
        to: request.email,
        subject: "Reset Password",
        html:
            `<p>Hi, somebody (Hopefully you) have requested to reset their password on Taskster. 
            You can reset your password by clicking the following: http://mikeeggertsen.com/reset?id=${request.token}</p>
            <p>You have 10 minutes before it become invalid and have to request another email. 
            If you didn't request this, just ignore it.</p>`,
    };
};

module.exports = {
    sendConfirmation,
    sendReset
}