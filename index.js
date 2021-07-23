const chalk = require('chalk');
const myTeleBot = require('./telegramBot/telegramBot');

let bot = new myTeleBot.TelegramBot("TEST SITE");

bot.startBot().then();