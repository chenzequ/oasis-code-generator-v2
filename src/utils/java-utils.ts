import { JavaAnno, JavaField, JavaClass } from '@/typings/java'
import { Model, newModel, newProperty, Property } from '@/typings/meta'

// 解析 java 代码
export const resolverJava = (javaCode: string): JavaClass => {
    const javaClass = {
        import: [] as string[],
        annoList: [] as JavaAnno[],
        fields: [] as JavaField[]
    } as JavaClass
    let isClass = true
    let tmpComment = ''
    let tmpField = {
        annoList: [] as JavaAnno[]
    } as JavaField
    // 一行一行的解析
    const lines = javaCode.split('\n')
    for (let line of lines) {
        line = line.trim()
        if (line.startsWith('package ')) {
            // package xxxxx;
            javaClass.package = line.substring('package '.length, line.length - 1)
        } else if (line.startsWith('import ')) {
            // import xxxxxx;
            javaClass.import.push(line.substring('import '.length, line.length - 1))
        } else if (line.startsWith('public class ')) {
            // !不解析接口实现
            // public class xxxx extend xxx xxxx {
            line = line.substring('public class '.length)
            const parts = line.split(' ')
            const extendIndex = line.indexOf(' extend ')
            javaClass.name = parts[0]
            if (extendIndex >= 0) {
                javaClass.extends = line.substring(extendIndex).split(' ')[0]
            }
            // 接下来就是在类内部的解析
            isClass = false
        } else if (line.startsWith('/**')) {
            // 解析注释 开始
            tmpComment = ''
        } else if (line.startsWith('*/')) {
            // 解析注释 结束
            tmpComment = tmpComment.trim()
            // 只解析第一行
            if (isClass) {
                javaClass.comment = tmpComment.split('\n')[0]
            } else {
                const lines = tmpComment.split('\n')
                tmpField.comment = lines[0]
                // 获取字段的备注
                for (let line of lines) {
                    const lineTrim = line.trim()
                    if (lineTrim.startsWith('@desc')) {
                        tmpField.desc = lineTrim.substring('@desc'.length).trim()
                    }
                }
            }
        } else if (line.startsWith('* ')) {
            // 解析注释 内容
            tmpComment += line.substring('* '.length) + '\n'
        } else if (line.startsWith('@')) {
            // 解析注解 
            const anno = {
                name: '',
                params: new Map()
            } as JavaAnno
            if (line.endsWith(')')) {
                // 带参数
                const leftStartIndex = line.indexOf('(')
                anno.name = line.substring(1, leftStartIndex)
                // 获取参数部分
                let paramsPart = (line.substring(leftStartIndex + 1, line.length - 1))
                if (paramsPart.indexOf('=') >= 0) {
                    // 带多个参数
                    // 先将 ""中间的,号去掉,使用,号分隔不会出错
                    const regex = /\"(.*?)\"/g
                    paramsPart.match(regex)?.map(str => {
                        if (str.indexOf(',') || str.indexOf('=')) {
                            let newStr = str.replace(',', '，').replace('=', '≡')
                            paramsPart = paramsPart.replace(str, newStr)
                        }
                    })
                    let arr = paramsPart.split(',')
                    for (let item of arr) {
                        const itemSplit = item.split('=')
                        const key = itemSplit[0].trim()
                        const value = itemSplit[1].trim()
                        anno.params.set(
                            key,
                            value.startsWith('"') ? value.substring(1, value.length - 1) : value
                        )
                    }
                } else {
                    // 只带一个参数
                    if (paramsPart.startsWith('"')) {
                        // 字符串
                        anno.params.set("value", paramsPart.substring(1, paramsPart.length - 1))
                    } else {
                        anno.params.set("value", paramsPart)
                    }
                }
            } else {
                // 不带参数
                anno.name = line.substring(1)
            }
            if (isClass) {
                javaClass.annoList.push(anno)
            } else {
                tmpField.annoList.push(anno)
            }
        } else if (line.startsWith('private ') && line.endsWith(';')) {
            // 只解析私有字段
            const parts = line.split(' ')
            tmpField.type = parts[1]
            tmpField.name = parts[2].substring(0, parts[2].length - 1)
            javaClass.fields.push(tmpField)
            tmpField = { annoList: [] as JavaAnno[] } as JavaField
        }
    }
    return javaClass
}

// Java类结构转成类模版
export const javaClassStructToModel = (struct: JavaClass): Model => {
    if (struct) {
        const model = newModel()
        model.name = struct.name
        model.desc = struct.comment
        if (struct.extends) {
            model.exts.push({
                key: 'JAVA_EXTENDS',
                value: struct.extends
            })
        }
        if (struct.package) {
            model.exts.push({
                key: 'JAVA_PACKAGE',
                value: struct.package
            })
        }

        if (struct.fields && struct.fields.length > 0) {
            for (let i = 0; i < struct.fields.length; i++) {
                model.properties.push(javaPropertyToPropertyMeta(struct.fields[i]))
            }
        }
        return model
    } else {
        throw new Error('Java类结构不能为空')
    }
}

// Java 数据类型转成 属性类型模版
const javaPropertyToPropertyMeta = (prop: JavaField): Property => {
    const propMeta = newProperty()
    propMeta.name = prop.name
    propMeta.title = prop.comment
    propMeta.desc = prop.desc ?? ''

    for (let anno of prop.annoList) {
        if (anno.name === 'NotNull' || anno.name === 'NotEmpty' || anno.name === 'NotBlank') {
            propMeta.require = true
        } else if (anno.name === 'Min') {
            propMeta.min = parseInt(anno.params.get('value'))
        } else if (anno.name === 'Max') {
            propMeta.max = parseInt(anno.params.get('value'))
        } else if (anno.name === 'DecimalMin') {
            propMeta.min = parseFloat(anno.params.get('value'))
        } else if (anno.name === 'DecimalMax') {
            propMeta.max = parseFloat(anno.params.get('value'))
        } else if (anno.name === 'Size' || anno.name === 'Length' || anno.name === 'Range') {
            if (anno.params.has('min')) {
                propMeta.min = parseInt(anno.params.get('min'))
            }
            if (anno.params.has('max')) {
                propMeta.max = parseInt(anno.params.get('max'))
            }
        } else if (anno.name === 'ConstProperty') {
            propMeta.exts.push({
                key: 'ConstProperty',
                value: anno.params.get('value')
            })
        } else if (anno.name === 'FKProperty') {
            propMeta.exts.push({
                key: 'FKProperty',
                value: anno.params.get('value')
            })
        } else {
            // 其他的不处理
        }
    }
    propMeta.exts.push({
        key: 'JAVA_TYPE',
        value: prop.type
    })
    switch (prop.type) {
        case 'String':
            propMeta.type = 'String'
            break
        case 'Integer':
        case 'Byte':
        case 'Short':
            propMeta.type = 'Int'
            break
        case 'Long':
        case 'BigInteger':
            propMeta.type = 'Long'
            break
        case 'Boolean':
            propMeta.type = 'Boolean'
            break
        case 'Float':
        case 'Double':
        case 'BigDecimal':
            propMeta.type = 'Float'
            break
        case 'LocalDateTime':
        case 'Date':
        case 'LocalDate':
        case 'Timestamp':
        case 'LocalTime':
            propMeta.type = 'DateTime'
            break
        default:
            throw new Error('未知的Java类型:' + prop.type)
    }

    return propMeta
}