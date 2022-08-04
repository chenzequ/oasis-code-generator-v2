export interface JavaClass {
    package: string // 包名
    import: string[] // 导入包集合
    extends: string // 继承父类
    name: string // 类名
    comment: string // 类备注
    annoList: JavaAnno[] // 类注解
    fields: JavaField[] // 类字段
}

export interface JavaAnno {
    name: string // 注解名
    params: Map<string, any> // 注解参数
}

export interface JavaField {
    name: string // 字段名
    type: string // 字段类型
    comment: string // 字段备注
    desc?: string // 字段描述
    annoList: JavaAnno[] // 字段注解
}