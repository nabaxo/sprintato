const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();

let sprinters = [];
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
        return message.channel.send(`${args[0]}`);
    }
    else if (command === 'sprint') {
        // message.channel.send('Sprinting!');
        // time = 5 * 1000;
        if (sprintIsStarting === false) {
            sprintIsStarting = true;
            sprinters = [];
            if (args[0]) {
                sprint(message, args[0]);
            } else {
                sprint(message);
            }
        }
        return;
    }
    else if (command === 'join') {
        if (sprintIsStarting) {
            if (args[0]) {
                sprinters.push({ name: message.author.username, wordcount: parseInt(args[0]), delta: 0, wpm: 0 });
                message.channel.send(`@${message.author.username} joined with ${args[0]} starting words`);
                return;
            } else {
                sprinters.push({ name: message.author.username, wordcount: 0 });
                message.channel.send(`@${message.author.username} joined with 0 starting words`);
                return;
            }
        } else {
            message.channel.send(`There's no sprint currently starting, start one by typing !sprint`);
            return;
        }
    }
    else if (command === 'wc') {
        if (sprintIsFinished && args[0]) {
            index = sprinters.findIndex((sprinter) => sprinter.name === message.author.username);
            delta = args[0] - sprinters[index];
            sprinters[index].wordcount = args[0];
            sprinters[index].delta = delta;
            // sprinters[index].wpm = delta / time;
            sprintIsFinished = false;
            return;
        } else {
            message.channel.send(`@${message.author.username} I didn't catch that, try again!`);
            return;
        }
    }
    else if (command === 'roll') {
        if (args[0]) {
            let diceToRoll = args[0].split(diceRegex).filter(e => e !== '');
            if (diceToRoll[0] !== undefined) {
                return message.reply(rollDice(diceToRoll[0], diceToRoll[1]).join(', '));
            } else {
                return message.reply(rollDice(false, diceToRoll[1]));
            }
        } else {
            return message.channel.send(rollDice());
        }
    }
});
client.login(token);


function sprint(message, time) {
    if (!time) {
        time = 1;
    }
    let bufferTime = 1 * 60 * 1000;
    let sprintingTime = time * 60 * 1000;
    message.channel.send(`In ${bufferTime / 60 / 1000} minutes, we're going to be sprinting for ${time} minutes.
Use !join <wordcount> to join the sprint, leave out the wordcount to start from zero.`)
        .then(() => {
            setTimeout(() => {
                sprintIsStarting = false;
                minutesAndSeconds = new Date;
                message.channel.send(`**Starting the sprint!**
You have ${time} minutes!
~ It runs until ${minutesAndSeconds.getMinutes() + time}m and ${minutesAndSeconds.getSeconds()}s ~`);
            }, bufferTime);
        }).then(() => {
            setTimeout(() => {
                sprintIsFinished = true;
                message.channel.send(`Finished the sprint, give your final word count with !wc <number>
You have ${time} minutes!`);
            }, bufferTime + sprintingTime);
        }).then(() => {
            setTimeout(() => {
                finishedList();
                message.channel.send(`The results are in:
${sprinters}`);
            }, bufferTime + sprintingTime + bufferTime);
        }).catch((err) => {
            console.log(err);
        });
}

function finishedList() {
    sprinters.sort((a, b) => {
        let wcA = a.delta;
        let wcB = b.delta;
        if (wcA < wcB) return -1;
        if (wcA > wcB) return 1;
        return 0;
    });
    let result = sprinters;
    return result;
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
