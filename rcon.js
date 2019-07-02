require('dotenv').config()

const host = process.env.RCON_HOST
const port = process.env.RCON_PORT
const password = process.env.RCON_PASSWORD

const Rcon = require('rcon')

const client = new Rcon(host, port, password)

client.connect()

module.exports = client

