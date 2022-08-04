// 构造辅助类
import { Property } from '@/typings/meta'

const getMySqlDBTypeBy = (prop: Property): string => {
    if (prop.exts) {
        let javaType = undefined
        for (let ext of prop.exts) {
            if (ext.key === 'JAVA_TYPE') {
                javaType = ext.value
                break
            } else if (ext.key === 'MYSQL_TYPE') {
                return ext.value
            }
        }
        if (javaType) {
            switch (javaType) {
                case 'Byte':
                    return 'TINYINT'
                case 'Short':
                    return 'SMALLINT'
                case 'BigInteger':
                    return 'BIGINT'
                case 'Timestamp':
                    return 'TIMESTAMP'
                case 'Double':
                    return 'DOUBLE'
                case 'BigDecimal':
                    return 'DECIMAL'
                case 'Date':
                    return ''
                case 'LocalDate':
                    return 'DATE'
                case 'LocalTime':
                    return 'TIME'
            }
        }
    }
    switch (prop.type) {
        case 'String':
            return prop.max && prop.max > 0 ? `VARCHAR('${prop.max}')` : 'VARCHAR'
        case 'Int':
            return 'INT'
        case 'Long':
            return 'BIGINT'
        case 'Float':
            return 'FLOAT'
        case 'Boolean':
            return 'BOOLEAN'
        case 'DateTime':
            return 'DATETIME'
    }

    return `[未知类型]`
}

export const getDatabaseFieldTypeBy = (prop: Property, dbType: string): string => {
    switch (dbType) {
        default:
            // mysql
            return getMySqlDBTypeBy(prop)
    }
}

export const getJavaTypeBy = (prop: Property): string => {
    for (let ext of prop.exts) {
        if (ext.key === 'JAVA_TYPE') {
            return ext.value
        }
    }
    return prop.type
}