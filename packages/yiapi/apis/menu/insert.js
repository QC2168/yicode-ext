import { fnSchema, fnTimestamp, fnClearInsertData, fnApiInfo } from '../../utils/index.js';

import { appConfig } from '../../config/appConfig.js';
import { sysConfig } from '../../config/sysConfig.js';
import { metaConfig } from './_meta.js';

const apiInfo = await fnApiInfo(import.meta.url);

export const apiSchema = {
    summary: `添加${metaConfig.name}`,
    tags: [apiInfo.parentDirName],
    body: {
        title: `添加${metaConfig.name}接口`,
        type: 'object',
        properties: {
            pid: fnSchema(sysConfig.schemaField.pid, '父级目录ID'),
            name: fnSchema(null, '目录名称', 'string', 1, 30),
            value: fnSchema(sysConfig.schemaField.code, '菜单路由'),
            icon: fnSchema(sysConfig.schemaField.image, '目录图标'),
            sort: fnSchema(sysConfig.schemaField.min0, '目录排序'),
            state: fnSchema(sysConfig.schemaField.state, '目录状态'),
            describe: fnSchema(sysConfig.schemaField.describe, '目录描述'),
            is_open: fnSchema(sysConfig.schemaField.boolEnum, '是否公开')
        },
        required: ['pid', 'name', 'value']
    }
};

export default async function (fastify, opts) {
    fastify.post(`/${apiInfo.pureFileName}`, {
        schema: apiSchema,
        handler: async function (req, res) {
            const trx = await fastify.mysql.transaction();
            try {
                let menuModel = trx.table(appConfig.table.sys_menu);

                let parentData = undefined;

                // 如果传了pid值
                if (req.body.pid) {
                    parentData = await menuModel.clone().where('id', req.body.pid).first();
                    if (!parentData) {
                        return {
                            ...appConfig.httpCode.FAIL,
                            msg: '父级菜单不存在'
                        };
                    }
                }

                // 需要更新的数据
                let insertData = {
                    pid: req.body.pid,
                    name: req.body.name,
                    value: req.body.value,
                    icon: req.body.icon,
                    sort: req.body.sort,
                    is_open: req.body.is_open,
                    describe: req.body.describe,
                    state: req.body.state
                };

                await menuModel.clone().insert(fnClearInsertData(insertData));

                await trx.commit();
                await fastify.cacheTreeData();
                return appConfig.httpCode.INSERT_SUCCESS;
            } catch (err) {
                await trx.rollback();
                fastify.log.error(err);
                return appConfig.httpCode.INSERT_FAIL;
            }
        }
    });
}
