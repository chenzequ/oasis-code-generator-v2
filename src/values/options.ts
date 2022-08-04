import { newProperty } from '@/typings/meta'

export const QuickAddPropsOptions: any[] = [
    {
        type: 'String', items: [
            newProperty({ key: 'id', title: 'id', pk: true, type: 'String', max: 16 }),
            newProperty({ key: 'id', title: 'uuid', pk: true, type: 'String', max: 32 }),
            newProperty({ key: 'name', title: '名称', type: 'String', max: 32 }),
            newProperty({ key: 'title', title: '标题', type: 'String', max: 32 }),
            newProperty({ key: 'no', title: '编号', type: 'String', max: 16 }),
            newProperty({ key: 'code', title: '编码', type: 'String', max: 16 }),
            newProperty({ key: 'phone', title: '电话', type: 'String', max: 16 }),
            newProperty({ key: 'email', title: '邮箱', type: 'String', max: 64 }),
            newProperty({ key: 'username', title: '用户名', type: 'String', max: 16 }),
            newProperty({ key: 'password', title: '密码', type: 'String', max: 32 }),
            newProperty({ key: 'logo', title: 'logo', require: false, type: 'String', max: 128 }),
            newProperty({ key: 'cover', title: '封面', require: false, type: 'String', max: 128 }),
            newProperty({ key: 'avatar', title: '头像', require: false, type: 'String', max: 128 }),
            newProperty({ key: 'url', title: '链接', require: false, type: 'String', max: 128 }),
            newProperty({ key: 'address', title: '地址', require: false, type: 'String', max: 128 }),
            newProperty({ key: 'memo', title: '备注', require: false, type: 'String', max: 400 }),
            newProperty({ key: 'desc', title: '描述', require: false, type: 'String', max: 200 }),
            newProperty({ key: 'content', title: '内容', require: false, type: 'String', exts: [{ key: 'rich', value: '1' }] }),
        ],
    },
    {
        type: 'Int', items: [
            newProperty({ key: 'id', title: 'id', pk: true, type: 'Int' }),
            newProperty({ key: 'id', title: 'autoId', pk: true, type: 'Int', exts: [{ key: 'autoIncrement', value: '1' }] }),
            newProperty({ key: 'type', title: '类型', type: 'Int' }),
            newProperty({ key: 'index', title: '排序', type: 'Int' }),
            newProperty({ key: 'status', title: '状态', type: 'Int' }),
            newProperty({ key: 'level', title: '等级', type: 'Int' }),
            newProperty({ key: 'amount', title: '数量', type: 'Int' }),
            newProperty({ key: 'count', title: '数量', type: 'Int' }),
        ]
    },
    {
        type: 'Long', items: [
            newProperty({ key: 'id', title: 'id', pk: true, type: 'Long' }),
            newProperty({ key: 'id', title: 'autoId', pk: true, type: 'Long', exts: [{ key: 'autoIncrement', value: '1' }] }),
            newProperty({ key: 'type', title: '类型', type: 'Long' }),
            newProperty({ key: 'createdAt', title: '创建于', type: 'Long', exts: [{ key: 'timestamp', value: '1' }] }),
            newProperty({ key: 'updatedAt', title: '更新于', type: 'Long', exts: [{ key: 'timestamp', value: '1' }] }),
            newProperty({ key: 'deletedAt', title: '删除于', type: 'Long', exts: [{ key: 'timestamp', value: '1' }] }),
            newProperty({ key: 'expiredAt', title: '过期于', type: 'Long', exts: [{ key: 'timestamp', value: '1' }] }),
        ]
    },
    {
        type: 'Boolean', items: [
            newProperty({ key: 'enabled', title: '启用', type: 'Boolean' }),
            newProperty({ key: 'disabled', title: '禁用', type: 'Boolean' }),
        ]
    },
    {
        type: 'Float', items: [
            newProperty({ key: 'blance', title: '余额', type: 'Float' }),
            newProperty({ key: 'amount', title: '数量', type: 'Float' }),
        ]
    },
    {
        type: 'DateTime', items: [
            newProperty({ key: 'createTime', title: '创建时间', type: 'DateTime' }),
            newProperty({ key: 'updateTime', title: '更新时间', type: 'DateTime' }),
            newProperty({ key: 'recordTime', title: '记录时间', type: 'DateTime' }),
            newProperty({ key: 'publishTime', title: '发布时间', type: 'DateTime' }),
            newProperty({ key: 'logTime', title: '日志时间', type: 'DateTime' }),
            newProperty({ key: 'regTime', title: '注册时间', type: 'DateTime' }),
        ]
    }
]