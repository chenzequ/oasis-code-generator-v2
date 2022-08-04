// 扩展项
export interface ExtItem {
    key: string // 扩展 key
    value: string // 扩展 value
}

// 元数据基类
export interface MetaBase {
    name: string // 名称
    desc: string // 描述
    exts: Array<ExtItem> // 扩展项
}

// EJS模版
export interface EJSTemplate {
    name: string // 名称
    setting: Array<EJSTemplateSetting>
    template: string // 模版内容
}
// EJS模版设置项
export interface EJSTemplateSetting {
    id: string // 自动id
    key: string
    title: string
    type: 'boolean' | 'enum'
    default: string | boolean
    enumValues?: string // type='enum'时的可选值，使用|号分隔
}

// 项目
export interface Project extends MetaBase {
    title: string // 显示标题
    author: string // 开发者
    children: Array<TreeChild> // 项目下级目录或者模型
    templates: Array<EJSTemplate> // 模版
}

export interface TreeChild extends MetaBase {
    key: string // key
    isLeaf: boolean // 是否叶子节点
}
// 目录
export interface Category extends TreeChild {
    short: string // 简称
    children: Array<Model> // 
}
// 模型
export interface Model extends TreeChild {
    table: string // 表名
    setting: {} // 模版自定义设置值
    properties: Array<Property> // 属性
}

// 属性
export interface Property extends MetaBase {
    key: string // 键
    type: PropertyType // 类型
    title: string // 标题(comment)
    require: boolean // 是否必须
    pk: boolean // 是否主键
    min: number | null // 最小(值|长度)
    max: number | null // 最大(值|长度)
    default: string // 默认值
}

export type PropertyType = 'String' | 'Int' | 'Long' | 'Boolean' | 'DateTime' | 'Float'

// 数据导出
export const PropertyTypeOptions: Array<PropertyType> = ['String', 'Boolean', 'Int', 'Long', 'Float', 'DateTime']

export const newProject = (): Project => {
    return {
        name: '',
        title: '',
        desc: '',
        author: '',
        exts: [],
        templates: [],
        children: []
    }
}

export const newCategory = (): Category => {
    return {
        name: '',
        desc: '',
        exts: [],
        short: '',
        children: [],
        key: new Date().valueOf().toString(),
        isLeaf: false
    }
}

export const newModel = (): Model => {
    return {
        name: '',
        desc: '',
        exts: [],
        key: new Date().valueOf().toString(),
        isLeaf: true,
        setting: {},
        properties: [],
        table: ''
    }
}

export const newProperty = (data?: Partial<Property>): Property => {
    return {
        key: new Date().valueOf().toString(),
        name: '',
        desc: '',
        exts: [],
        title: '',
        require: true,
        pk: false,
        min: null,
        max: null,
        default: '',
        type: 'String',
        ...data
    }
}

export const newEJSTemplate = (): EJSTemplate => {
    return {
        name: '',
        setting: [],
        template: ''
    }
}

export const newEJSTemplateSetting = (): EJSTemplateSetting => {
    return {
        id: new Date().valueOf().toString(),
        key: '',
        title: '',
        type: 'boolean',
        default: true,
        enumValues: ''
    }
}