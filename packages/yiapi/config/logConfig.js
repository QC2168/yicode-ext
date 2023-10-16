import fs from 'fs-extra';
import { resolve } from 'node:path';
import winston from 'winston';
import 'winston-daily-rotate-file';

import { sysConfig } from './sysConfig.js';

fs.ensureDir(resolve(sysConfig.appDir, 'logs'));

let fileConfig = {
    dirname: resolve(sysConfig.appDir, 'logs'),
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '50m'
};

let fileTransport = new winston.transports.DailyRotateFile(fileConfig);

let configParams = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        trace: 4,
        debug: 5
    },
    level: 'warn',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: []
};

// 如果是产品环境，则将日志写到文件中
// 如果是开发环境，则直接打印日志
if (process.env.NODE_ENV === 'production') {
    configParams.transports = [fileTransport];
} else {
    configParams.transports = [new winston.transports.Console()];
}

let logConfig = winston.createLogger(configParams);

export { logConfig };
