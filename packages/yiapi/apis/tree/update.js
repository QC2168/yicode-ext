// 工具函数
import { fnRoute } from '../../utils/index.js';
// 配置文件
import { codeConfig } from '../../config/codeConfig.js';
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    // 当前文件的路径，fastify 实例
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '更新树',
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                id: metaConfig.schema.id,
                pid: metaConfig.schema.pid,
                category: metaConfig.schema.category,
                name: metaConfig.schema.name,
                value: metaConfig.schema.value,
                icon: metaConfig.schema.icon,
                sort: metaConfig.schema.sort,
                describe: metaConfig.schema.describe,
                is_bool: metaConfig.schema.is_bool,
                is_open: metaConfig.schema.is_open
            },
            required: ['id']
        },
        // 返回数据约束
        schemaResponse: {},
        // 执行函数
        apiHandler: async (req, res) => {
            // TODO: 此处需要使用事务
            try {
                const treeModel = fastify.mysql.table('sys_tree');
                const parentData = null;
                // 如果传了 pid 值
                if (req.body.pid) {
                    parentData = await treeModel //
                        .clone()
                        .where('id', req.body.pid)
                        .first('id', 'pids');
                    if (!parentData?.id) {
                        return {
                            ...codeConfig.FAIL,
                            msg: '父级树不存在'
                        };
                    }
                }

                const selfData = await treeModel //
                    .clone()
                    .where('id', req.body.id)
                    .first('id');
                if (!selfData?.id) {
                    return {
                        ...codeConfig.FAIL,
                        msg: '菜单不存在'
                    };
                }

                let updateData = {
                    pid: req.body.pid,
                    category: req.body.category,
                    name: req.body.name,
                    value: req.body.value,
                    icon: req.body.icon,
                    sort: req.body.sort,
                    is_open: req.body.is_open,
                    is_bool: req.body.is_bool,
                    describe: req.body.describe,
                    state: req.body.state,
                    pids: req.body.pids
                };

                if (parentData !== null) {
                    updateData.pids = [parentData.pids, parentData.id].join(',');
                }
                const result = await treeModel
                    //
                    .clone()
                    .where({ id: req.body.id })
                    .updateData(updateData);

                // 如果更新成功，则更新所有子级
                if (result) {
                    const childrenPids = [updateData.pids || selfData.pid, selfData.id];
                    await treeModel
                        .clone()
                        .where({ pid: selfData.id })
                        .updateData({
                            pids: childrenPids.join(','),
                            level: childrenPids.length
                        });
                }

                return {
                    ...codeConfig.UPDATE_SUCCESS,
                    data: result
                };
            } catch (err) {
                fastify.log.error(err);
                return codeConfig.UPDATE_FAIL;
            }
        }
    });
};
