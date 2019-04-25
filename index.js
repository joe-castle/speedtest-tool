require('dotenv').config()
const speedtest = require('speedtest-net')
const fs = require('fs')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const { CINEMA_URI } = process.env

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'running speedtest' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const start = new Date()

const test = speedtest()

test.on('data', (speedtestData) => {
  const stop = new Date()

  fs.readFile('speedtest.json', (err, jsonData) => {
    if (err) {
      logger.error(err)
    }
    
    const obj = [...JSON.parse(jsonData)]

    obj.push({
      start,
      stop,
      from: speedtestData.client.isp,
      fromIp: speedtestData.client.ip,
      server: `${speedtestData.server.sponsor} (${speedtestData.server.location})`,
      serverDist: `${speedtestData.server.distance}km`,
      serverPing: `${speedtestData.server.ping}ms`,
      download: `${speedtestData.speeds.download}Mbps`,
      upload: `${speedtestData.speeds.upload}Mbps`
    })

    fs.writeFile('speedtest.json', JSON.stringify(obj), (err, data) => {
      if (err) {
        logger.error(err)
      }

      logger.info('Succesfully ran speedtest')
    })
  })
})

test.on('error', (err) => {
  logger.error(err)
})