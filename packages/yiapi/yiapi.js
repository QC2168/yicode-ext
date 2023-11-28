import path from 'node:path';
import fs from 'fs-extra';
import Fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import fp from 'fastify-plugin';
import localize from 'ajv-i18n';
import logSymbols from 'log-symbols';
import { forOwn as _forOwn } from 'lodash-es';
import fg from 'fast-glob';
import fastifyStatic from '@fastify/static';
import gracefulShutdown from 'http-graceful-shutdown';

// 环境变量，必须在配置信息之前执行
import './env.js';

// 配置信息
import { appConfig } from './config/appConfig.js';
import { codeConfig } from './config/codeConfig.js';
import { crosConfig } from './config/crosConfig.js';
import { fieldType } from './config/fieldType.js';
import { logConfig } from './config/logConfig.js';
import { schemaField } from './config/schemaField.js';
import { schemaType } from './config/schemaType.js';
import { sysConfig } from './config/sysConfig.js';
import { tableField } from './config/tableField.js';

// 脚本
import { syncDatabase } from './scripts/syncDatabase.js';
// 工具函数
import {
    //
    fnSchema,
    fnUUID,
    fnSaltMD5,
    fnPureMD5,
    fnRoute,
    fnMeta,
    fnField
} from './utils/index.js';

// 启动前验证
if (appConfig.devPassword === 'dev123456') {
    console.log(`${logSymbols.warning} 请修改超级管理员密码！！！（位置：appConfig.devPassword）`);
    process.exit(1);
}

// 启动前验证
if (appConfig.salt === 'yiapi-123456.') {
    console.log(`${logSymbols.warning} 请修改默认加密盐值！！！（位置：appConfig.salt）`);
    process.exit(1);
}

// 确保关键目录存在
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'apis'));
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'tables'));
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'plugins'));
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'env'));
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'logs'));
fs.ensureDirSync(path.resolve(sysConfig.appDir, 'public'));
fs.ensureFileSync(path.resolve(sysConfig.appDir, 'yiapi.js'));

// 初始化项目实例
let fastify = Fastify({
    logger: logConfig,
    pluginTimeout: 0,
    genReqId: () => fnUUID(),
    ajv: {
        customOptions: {
            allErrors: true,
            verbose: true
        }
    }
});

// 处理全局错误
fastify.setErrorHandler(function (err, req, res) {
    if (err.validation) {
        localize.zh(err.validation);
        let msg = err.validation
            .map((error) => {
                return (error.parentSchema.title + ' ' + error.message).trim();
            })
            .join(',');
        res.status(200).send({ code: 1, msg: msg, symbol: 'GLOBAL_ERROR' });
        return;
    }

    if (err.statusCode >= 500) {
        fastify.log.error(err);
        // 发送错误响应
    } else if (err.statusCode === 429) {
        err.message = '请求过快，请降低请求频率。';
    } else if (err.statusCode >= 400) {
        fastify.log.warn(err);
    } else {
        fastify.log.warn(err);
    }

    // 发送错误响应
    res.status(200).send({
        code: 1,
        msg: err.message,
        symbol: 'GLOBAL_ERROR'
    });
});

// 处理未找到路由
fastify.setNotFoundHandler(function (req, res) {
    // 发送错误响应
    res.status(200).send({
        code: 1,
        msg: '未知路由',
        data: req.url
    });
});

// 静态资源托管
fastify.register(fastifyStatic, {
    root: path.resolve(sysConfig.appDir, 'public'),
    prefix: '/'
});

// 根请求
fastify.get('/', function (req, res) {
    res.send({
        code: 0,
        msg: `${appConfig.appName} 接口程序已启动`
    });
});

// 路由映射列表
// fastify.register(autoLoad, {
//     dir: path.join(sysConfig.yiapiDir, 'plugins'),
//     matchFilter: (path) => {
//         return path === '/routes.js';
//     }
// });

// 接口文档生成
if (appConfig.isSwagger === true) {
    fastify.register(autoLoad, {
        dir: path.join(sysConfig.yiapiDir, 'plugins'),
        matchFilter: (path) => {
            return path === '/swagger.js';
        }
    });
}

// 加载启动插件
fastify.register(autoLoad, {
    dir: path.join(sysConfig.yiapiDir, 'bootstrap'),
    matchFilter: (path) => {
        return path.endsWith('.js') === true;
    },
    ignorePattern: /^[_.]/
});

// 加载用户插件
fastify.register(autoLoad, {
    dir: path.join(sysConfig.appDir, 'plugins'),
    matchFilter: (path) => {
        return path.endsWith('.js') === true;
    },
    ignorePattern: /^[_.]/
});

// 加载系统接口
fastify.register(autoLoad, {
    dir: path.join(sysConfig.yiapiDir, 'apis'),
    matchFilter: (path) => {
        return path.endsWith('.js') === true;
    },
    ignorePattern: /^[_.]/,
    options: {
        prefix: '/api'
    }
});

// 加载用户接口
fastify.register(autoLoad, {
    dir: path.join(sysConfig.appDir, 'apis'),
    matchFilter: (path) => {
        return path.endsWith('.js') === true;
    },
    ignorePattern: /^[_.]/,
    options: {
        prefix: '/api'
    }
});

// 初始化服务
function initServer() {
    return new Promise(async (resolve, reject) => {
        // 启动服务！
        fastify.listen({ port: appConfig.port, host: '127.0.0.1' }, async function (err, address) {
            if (err) {
                fastify.log.error(err);
                process.exit(1);
            }
            // await fastify.cacheMenuData();
            // await fastify.cacheApiData();
            fastify.log.warn(`${appConfig.appName} 接口服务已启动： ${address}`);
            console.log(`${appConfig.appName} 接口服务已启动： ${address}`);
        });

        fastify.ready((err) => {
            if (err) {
                throw err;
            } else {
                return resolve(fastify);
            }
        });

        // 监听服务停止
        gracefulShutdown(fastify.server, {
            finally: function () {
                fastify.log.warn('服务已停止');
            }
        });
    });
}

export {
    // 内部工具
    fastify,
    initServer,
    fp,
    // 配置
    appConfig,
    codeConfig,
    crosConfig,
    fieldType,
    schemaField,
    schemaType,
    sysConfig,
    tableField,
    // 脚本
    syncDatabase,
    // 工具函数
    fnUUID,
    fnSaltMD5,
    fnPureMD5,
    fnSchema,
    fnRoute,
    fnMeta,
    fnField
};
