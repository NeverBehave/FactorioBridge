require('dotenv').config()
const Telegraf = require('telegraf')
const rcon_client = require('./rcon')
const tail_client = require('./reader')

const bot = new Telegraf(process.env.BOT_TOKEN)
const group_id = process.env.TELEGRAM_GROUP_ID

bot.telegram.getMe().then((bot_informations) => {
    bot.options.username = bot_informations.username;
    console.log("Bot - Server has initialized bot nickname. Nick: "+bot_informations.username);
})

bot.start((ctx) => ctx.reply("Welcome to Ana's Factorio"))
bot.on('text', (ctx) => {
    let msg = `[${ctx.from}]: ${ctx.message.text}`
    console.log(`Telegram -> Factorio ${msg}`)
    if (ctx.message.text) {
        rcon_client.send(msg)
    }
})
bot.hears('!stop', (ctx) => ctx.reply('Relay STOPPED'))

// Rcon
rcon_client.on('auth', () => {
    console.log("RCON Authed!")
    bot.telegram.sendMessage(group_id, 'RCON: Auth OK!')
})

rcon_client.on('response', (data) => {
    if (data !== '') {
        console.log(`Factorio -> Telegram ${data}`)
        bot.telegram.sendMessage(group_id, data)
    }
})

rcon_client.on('end', () => {
    console.log("Socket closed! Exiting...")
    bot.telegram.sendMessage(group_id, 'RCON: Lose Connection, exiting...')
    process.exit()
})

// Tail
function breakLine(str) {
    return str.split('\n')
}

function checkMessage(str) {
    // 2019-07-02 05:55:27 [CHAT] <server>: hell!!!o
    if (!str.startsWith('=')) {
        arr = str.trim().split(' ')
        arr.splice(0, 2) // Remove first 2 info
        switch(arr[0]) {
            case '[CHAT]': 
            if (arr[1] === '<server>:') {
                arr = [] // Don't send anything
            }
            break
            default: 
        }
        return arr.join(' ')
    }

    return ''
}

tail_client.on("line", function(data) {
    breakLine(data).forEach(e => {
        let str = checkMessage(e)
        if (str) {
            console.log(`Factorio -> Telegram ${str}`)
            bot.telegram.sendMessage(group_id, str)
        }
    })
})
  
tail_client.on("error", function(error) {
    console.log('Tail ERROR: ', error)
    bot.telegram.sendMessage(group_id, 'Tail Err: ' + error)
})

bot.launch()

