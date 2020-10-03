const Discord = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.json');
let { defaultSprintTime, defaultBufferTime } = require('./sprintConfig.json');

const client = new Discord.Client();

let sprinters = [];
let sprintObjectStarting;
let sprintObjectRunning;
let sprintIsStarting = false;
let sprintIsFinished = false;

client.once('ready', () => {
    console.log('Discord Bot Operational!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const diceRegex = /(\d+)?[d](\d+)/i;

    if (command === 'ping') {
        console.log(message.author);
        return message.channel.send(`${args[0]}`);
    }
    else if (command === 'sprint') {
        // message.channel.send('Sprinting!');
        // time = 5 * 1000;
        if (sprintIsStarting === false) {
            sprintIsStarting = true;
            sprinters = [];
            if (args[0] && args[1]) {
                sprint(message, parseInt(args[0]), parseInt(args[1]));
            }
            else if (args[0]) {
                sprint(message, parseInt(args[0]));
            }
            else {
                sprint(message);
            }
        }
        return;
    }
    else if (command === 'join') {
        if (sprintIsStarting) {
            if (parseInt(args[0])) {
                addAndUpdateSprinters(message, args[0]);
            } else {
                addAndUpdateSprinters(message);
            }
        } else {
            return message.reply(`There's no sprint currently starting, start one by typing !sprint`);
        }
    }
    else if (command === 'cancel') {
        sprintIsStarting = false;
        clearTimeout(sprintObjectStarting);
        clearTimeout(sprintObjectRunning);
        return message.reply(`Sprint has been cancelled! Start a new one with !sprint <time>`);
    }
    else if (command === 'wc') {
        if (sprintIsFinished && parseInt(args[0])) {
            index = sprinters.findIndex((sprinter) => sprinter.name === message.author.username);
            delta = parseInt(args[0]) - sprinters[index].wordcount;
            sprinters[index].wordcount = args[0];
            sprinters[index].delta = delta;
            return message.reply(`completed with ${delta} new words!`);
        } else {
            return message.reply(`I didn't catch that, try again!`);
        }
    }
    else if (command === 'setdefault') {
        if (Number.isInteger(parseInt(args[0]))) {
            let json = JSON.stringify({
                defaultSprintTime: parseInt(args[0])
            }, null, 4);
            fs.writeFileSync('sprintConfig.json', json + '\r\n', 'utf8');
            defaultSprintTime = parseInt(args[0]);
            return message.channel.send(`The new default sprint time is ${defaultSprintTime} minutes`);
        } else {
            return message.channel.send(`To set a new default time, write !sprint #`);
        }
    }
    else if (command === 'roll') {
        if (args[0] && diceRegex.test(args[0])) {
            let diceToRoll = args[0].split(diceRegex).filter(e => e !== '');
            if (diceToRoll[0] !== undefined) {
                return message.reply(rollDice(diceToRoll[0], diceToRoll[1]).join(', '));
            } else {
                return message.reply(rollDice(false, diceToRoll[1]));
            }
        }
        else if (!diceRegex.test(args[0])) {
            return message.reply(`Roll a specific die or dice by writing !roll d# or !roll #d#`);
        }
        else {
            return message.reply(rollDice());
        }
    }
});
client.login(token);


function sprint(message, time, buffer) {
    if (!time) {
        time = defaultSprintTime;
    }
    if (!buffer) {
        buffer = defaultBufferTime;
    }
    let sprintingTime = time * 60 * 1000;
    let bufferTime = buffer * 60 * 1000;

    if (sprintIsStarting) {
        message.channel.send(`In ${bufferTime / 60 / 1000} minutes, we're going to be sprinting for ${time} minutes.
Use !join <wordcount> to join the sprint, leave out the wordcount to start from zero.`)
            .then(() => {
                sprintObjectStarting = setTimeout(() => {
                    sprintIsStarting = false;
                    minutesAndSeconds = new Date;
                    let sprintEndMinute = (parseInt(minutesAndSeconds.getMinutes()) + time) % 60;
                    message.channel.send(`**Starting the sprint!**
You have ${time} minutes!
~ It runs until ${sprintEndMinute}m and ${minutesAndSeconds.getSeconds()}s ~`);
                }, bufferTime);
            }).then(() => {
                sprintObjectRunning = setTimeout(() => {
                    sprintIsFinished = true;
                    message.channel.send(`Finished the sprint, give your final word count with !wc #
You have ${bufferTime / 60 / 1000} minutes!`);
                }, bufferTime + sprintingTime);
            }).then(() => {
                setTimeout(() => {
                    message.channel.send(`The results are in:
${finishedList(time)}`);
                    sprintIsFinished = false;
                }, bufferTime + sprintingTime + bufferTime);
            }).catch((err) => {
                console.log(err);
            });
    }
}

function addAndUpdateSprinters(message, wordcount) {
    if (!wordcount) {
        wordcount = 0;
    }
    const author = message.author.username;
    if (sprinters.length !== 0) {
        if (sprinters.reduce((a, e) => e.name === author)) {
            index = sprinters.findIndex((sprinter) => sprinter.name === author);
            sprinters[index].wordcount = wordcount;
            return message.reply(`updated join with ${wordcount} starting words`);
        }
    } else {
        sprinters.push({ name: author, wordcount: wordcount, delta: 0, wpm: 0 });
        return message.reply(`joined with ${wordcount} starting words`);
    }
}

function finishedList(time) {
    sprinters.sort((a, b) => {
        let wcA = a.delta;
        let wcB = b.delta;
        if (wcA < wcB) return -1;
        if (wcA > wcB) return 1;
        return 0;
    });
    let result = sprinters.map((author, index) => {
        return `${index + 1}. ${author.name} with ${author.delta} new words, (${author.delta / time} wpm)`;
    });
    return result.join('\r\n');
}

function rollDice(quantity, type) {
    if (quantity && type) {
        let result = [];
        for (let i = 0; i < quantity; i++) {
            result.push(random(type, 1));
        }
        return result.sort((a, b) => a - b);
    } else if (type) {
        return random(type, 1);
    } else {
        return random(6, 1);
    }
}

function random(max, min = 0) {
    return Math.round(Math.random() * (max - min) + min);
}
