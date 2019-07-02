require('dotenv').config()
const SocksProxyAgent = require('socks-proxy-agent')
const proxy = process.env.PROXY

module.exports = new SocksProxyAgent(proxy)