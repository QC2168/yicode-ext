// 外部模块
// 工具函数
import { toOmit } from '../../utils/toOmit.js';
import { fnRoute } from '../../utils/fnRoute.js';
import { fnSchema } from '../../utils/fnSchema.js';
import { fnPureMD5 } from '../../utils/fnPureMD5.js';
import { fnSaltMD5 } from '../../utils/fnSaltMD5.js';
import { fnResponseSchema } from '../../utils/fnResponseSchema.js'
// 配置文件
import { httpConfig } from '../../config/http.js';
// 数据表格
import { tableData } from '../../tables/admin.js';
// 接口元数据
import { metaConfig } from './_meta.js';

// 处理函数
export default async (fastify) => {
    // 当前文件的路径，fastify 实例
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                account: fnSchema(tableData.username),
                password: fnSchema(tableData.password)
            },
            required: ['account', 'password']
        },
        schemaResponse: {
            200: fnResponseSchema({
                schema: tableData,
                extract: ['password']
            }),
            404: fnResponseSchema()
        },
        // 执行函数
        apiHandler: async (req, rep) => {
            try {
                const adminModel = fastify.mysql.table('sys_admin');
                const loginLogModel = fastify.mysql.table('sys_login_log');

                // 查询管理员是否存在
                // TODO: 增加邮箱注册和邮箱登录
                const adminData = await adminModel //
                    .clone()
                    .orWhere({ username: req.body.account })
                    .selectOne(['id', 'password', 'username', 'nickname', 'role']);

                // 判断用户不存在
                rep.code(404).send({
                    ...httpConfig.FAIL,
                    msg: '用户不存在'
                });


                // 判断密码
                if (fnSaltMD5(req.body.password) !== adminData.password) {
                    rep.code(404).send({
                        ...httpConfig.FAIL,
                        msg: '密码错误'
                    });
                }
                // 记录登录日志
                await loginLogModel.clone().insertData({
                    username: adminData.username,
                    nickname: adminData.nickname,
                    role: adminData.role,
                    ip: req.ip || '',
                    ua: req.headers['user-agent'] || ''
                });

                // 成功返回
                return {
                    ...httpConfig.SUCCESS,
                    msg: '登录成功',
                    data: toOmit(adminData, ['password']),
                    token: await fastify.jwt.sign({
                        id: adminData.id,
                        username: adminData.username,
                        nickname: adminData.nickname,
                        role_type: 'admin',
                        role: adminData.role
                    })
                };
            } catch (err) {
                fastify.log.error(err);
                rep.code(404).send({
                    ...httpConfig.FAIL,
                    msg: '登录失败'
                });
            }
        }
    });
};
