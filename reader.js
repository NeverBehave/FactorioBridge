const Tail = require('tail').Tail
require('dotenv').config()

const log = new Tail(proccess.env.LOG_FILE, {
    flushAtEOF: true
})

module.exports = log