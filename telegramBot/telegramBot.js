const telegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const colors = require('colors');

if(!fs.existsSync('./telegramBot/TelegramBot.json')){
    console.log("\n[Telegram Bot] File TelegramBot.json not found\n");
    process.exit();
}

const token = (JSON.parse(fs.readFileSync('./telegramBot/TelegramBot.json', 'utf8'))).token;
let role = Object.entries((JSON.parse(fs.readFileSync('./telegramBot/TelegramBot.json', 'utf8'))).role);



const bot = new telegramBot(token, {polling: true});

class TelegramBot {

    logger = false;

    constructor(projectName) {
        this.projectName = projectName;
    }

    async message(text, obj) {
        text = "[ " + this.projectName + " ] " + " => " + text;
        await this.#sendMessage(text, obj)
    }

    async warn(text, obj) {
        text = "⚠️ " + this.projectName + " ⚠️\n\n" + text;
        await this.#sendMessage(text, obj)
    }

    async error(text, obj) {
        text = "❗️️ " + this.projectName + "❗️️️\n\n" + text;
        await this.#sendMessage(text, obj)
    }

    async #sendMessage(text, obj){
        if(obj.account !== undefined) {
            if (typeof obj.account === "object") {
                for (let i = 0; i < obj.account.length; i++) {
                    await bot.sendMessage(obj.account[i], text);
                }
                await bot.stopPolling();
            }

            if (typeof obj.account === "number")
                await bot.sendMessage(obj.account, text).then(() => {
                    bot.stopPolling()
                });
        }
        if(obj.role !== undefined){
            obj.role = obj.role.toLowerCase();
            for (let i = 0; i < role.length; i++) {
                if(role[i][0] === obj.role){
                    for (let j = 0; j < role[i][1].length; j++) {
                        await bot.sendMessage(role[i][1][j], text)
                            .then(() => {bot.stopPolling()});
                    }
                }
            }
        }
    }

    async getId(){
        bot.on('message', (msg) => {
            console.log("ID: " + msg.chat.id);
            console.log("username: " + msg.chat.username);
            console.log("text: " + msg.text);
            console.log("");
        });

    }

    async startBot(){
        bot.on("polling_error", console.log);

        bot.on('message', (msg) => {

            //msg.chat.id !== 724415959
            if(msg.text === undefined) msg.text = "undefined";
            if(this.logger)
                if(msg.chat.username === undefined)
                console.log(
                    "[ " + this.#getDateNow() + " ] " +
                    "ID: " + (msg.chat.id).toString().green + " | " +
                    "text: " + (msg.text).toString().blue);
                else
                    console.log(
                        "[ " + this.#getDateNow() + " ] " +
                        "ID: " + (msg.chat.id).toString().green + " | " +
                        "username: " + this.#getNameRole(msg.chat.id) + (msg.chat.username).toString().cyan + " | " +
                        "text: " + (msg.text).toString().blue);



            if(msg.text === "/command"){
                this.#botSend(msg.chat.id, "/send");
                this.#botSend(msg.chat.id, "/reload");
            }

            if(msg.text === "/reload"){
                if(this.#getRole(msg.chat.id) === "admin"){
                    role = Object.entries((JSON.parse(fs.readFileSync('./telegramBot/TelegramBot.json', 'utf8'))).role);
                    this.#botSend(msg.chat.id, "File TelegramBot.json reloaded");
                }else{
                    this.#botSend(msg.chat.id, "You don't have permission");
                }
            }

            if(msg.text === "/logger"){
                if(this.#getRole(msg.chat.id) === "admin"){

                    if(this.logger) {
                        bot.sendMessage(msg.chat.id, "Logger On").then(() => {
                                console.log("[ " + this.#getDateNow() + " ] " +
                                    "ID: " + "Bot".green +
                                    " | event: " + "send".red +
                                    " | who: " + (msg.chat.id).toString().cyan +
                                    " | message: " + "Logger Off".blue);
                        });
                    }
                    if(!this.logger) this.#botSend(msg.chat.id, "Logger On");

                    this.logger = !this.logger;

                }else{
                    this.#botSend(msg.chat.id, "You don't have permission");
                }
            }


            if((msg.text).split("\n")[0] === "/send"){
                if(this.#getRole(msg.chat.id) === "admin"){
                    if((msg.text).split("\n").length < 3){
                        this.#botSend(msg.chat.id, "Format:\n\n/send\n[ID]\n[message]");
                    }else {
                        this.#botSend((msg.text).split("\n")[1], (msg.text).split("\n")[2]);
                    }
                }else{
                    this.#botSend(msg.chat.id, "You don't have permission");
                }
            }
        });
    }

    #getNameRole(id){
        let result = "<";
        if(this.#getRole(id) === "admin") result += "ADMIN".red;
        if(this.#getRole(id) === "helper") result += "Helper".blue;
        if(this.#getRole(id) === "manager") result += "Manager".green;
        if(this.#getRole(id) === "user") result += "User".gray;
        result += "> ";
        return result;
    }

    #botSend(id, message){
        bot.sendMessage(id, message).then(() => {
            if (this.logger)
                console.log("[ " + this.#getDateNow() + " ] " +
                    "ID: " + "Bot".green +
                    " | event: " + "send".red +
                    " | who: " + id.toString().cyan +
                    " | message: " + message.blue);
        });
    }

    #getRole(id){
        let result = "user";
        for (let i = 0; i < role.length; i++) {
            role[i][1].forEach(elem => {
                if(elem === id)
                    result = role[i][0];
            });
        }
        return result;
    }

    #getDateNow() {
        let date = new Date();
        return (date.toDateString()).magenta + " | " + (date.toLocaleTimeString()).magenta;
    }
}

exports.TelegramBot = TelegramBot;