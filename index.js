require('dotenv').config()
const speedtest = require('speedtest-net')
const fs = require('fs')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

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

const { JSON_FILE } = process.env

const start = new Date()

const test = speedtest()

test.on('data', (speedtestData) => {
  const stop = new Date()

  fs.readFile(JSON_FILE, (err, jsonData) => {
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

    fs.writeFile(JSON_FILE, JSON.stringify(obj), (err) => {
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