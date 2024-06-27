import { fnSchema } from './fnSchema.js'
const DEFAULT_CONFIG = {
  schema: null,
  extract: [],
  hasToken: false
}
export function fnResponseSchame({ schema, extract = [], hasToken } = DEFAULT_CONFIG) {
  // 子数据
  const properties = Object.entries(schema).filter(i => !extract.includes(i[0])).reduce((pre, cur) => ({ ...pre, [cur[0]]: fnSchema(cur[1]) }), {})
  return {
    type: 'object',
    properties: {
      symbol: {
        title: '返回标识符',
        type: 'string',
      },
      code: {
        title: '返回代码',
        type: 'string',
      },
      msg: {
        title: '返回信息',
        type: 'string',
      },
      data: {
        title: '数据',
        type: 'object',
        properties,
        required: Object.keys(schema).filter(i => !extract.includes(i))
      },
      ...(hasToken ? { token: { title: 'token', type: 'string' } } : {}),
    },
    required: [
      'symbol',
      'code',
      'msg',
      ...(schema ? ['data'] : []),
    ]
  }
}
