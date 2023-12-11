import * as yiapi from '@yicode/yiapi';
import { metaConfig } from './_meta.js';

export const apiName = '查询资讯详情';

export default async (fastify) => {
    // 当前文件的路径，fastify 实例
    yiapi.fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: apiName,
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: metaConfig.schema.id
            },
            required: ['id']
        },
        // 返回数据约束
        schemaResponse: {},
        // 执行函数
        apiHandler: async (req, res) => {
            try {
                const newsModel = fastify.mysql.table('news');

                const result = await newsModel //
                    .clone()
                    .where({ id: req.body.id })
                    .selectOne();

                return {
                    ...yiapi.httpConfig.SELECT_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return yiapi.httpConfig.SELECT_FAIL;
            }
        }
    });
};
