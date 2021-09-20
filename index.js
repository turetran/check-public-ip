"use strict";

const publicIp = require('public-ip');
const nodemailer = require("nodemailer");
const fs = require('fs');

let currentIP = "";
let myPublicIp = "";

const ENV_PUBLIC_IP_INTERVAL = process.env.ENV_MAIL_SENDER || ""; // milisecond unit. 3600000 milisecond -> 3600 seconds -> 60 minutes
const ENV_PUBLIC_IP_MAIL_SENDER = process.env.ENV_MAIL_SENDER || "";
const ENV_PUBLIC_IP_MAIL_PASSWORD = process.env.ENV_MAIL_PASSWORD || "";
const ENV_PUBLIC_IP_MAIL_RECEIVER = process.env.ENV_MAIL_RECEIVER || "";

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: ENV_PUBLIC_IP_MAIL_SENDER,
        pass: ENV_PUBLIC_IP_MAIL_PASSWORD,
    },
});

setInterval(async () => {
    myPublicIp = await publicIp.v4();
    if (!currentIP) {
        try {
            currentIP = fs.readFileSync('./ip.txt').toString()
        }
        catch (error) {
            fs.openSync('ip.txt', 'w')
        }
    }
    if (currentIP !== myPublicIp) {
        try {
            let info = await transporter.sendMail({
                from: ENV_PUBLIC_IP_MAIL_SENDER, // sender address
                to: ENV_PUBLIC_IP_MAIL_RECEIVER, // list of receivers
                subject: "Machine's Public IP Change", // Subject line
                text: "IP Change Found\n New IP: " + myPublicIp + "\n Old IP: " + currentIP, // plain text body
            })
        } catch (error) {
            console.log("Error: ", error)
        }
        currentIP = myPublicIp
        //Write to file
        fs.writeFileSync('./ip.txt', currentIP)
        console.log('Public IP has change and sent.')
    }
}, ENV_PUBLIC_IP_INTERVAL || 3600000)
