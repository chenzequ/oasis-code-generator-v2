// Build 相关的工具方法

// 进行类型转换的环境变量key 前缀
const VITE_PRE_NUMBER = 'VITE_N_'
const VITE_PRE_STRING = 'VITE_S_'
const VITE_PRE_BOOLEAN = 'VITE_B_'
const VITE_PRE_OBJECT = 'VITE_O_'
// 带类型的key前缀长度
const VITE_PRE_TYPE_LENGTH = VITE_PRE_OBJECT.length
// 普通vite key 前缀长度
const VITE_ANOTHER_LENGTH = 'VITE_'.length

/**
 * 包装环境变量配置值
 * N - Number 
 * S - String
 * B - Boolean
 * O - Object
 * @param envConf 环境变量配置值
 * @returns 
 */
export function wrapperEnv(envConf: Recordable): ViteEnv {
    const ret: any = {}

    for (const envName of Object.keys(envConf)) {
        // 值处理
        let val = envConf[envName].replace(/\\n/g, '\n')
        let keyStart = VITE_PRE_TYPE_LENGTH
        if (envName.startsWith(VITE_PRE_BOOLEAN)) {
            // boolean
            val = val.toLowerCase() === 'true' || val === '1'
        } else if (envName.startsWith(VITE_PRE_NUMBER)) {
            // number
            val = Number(val)
        } else if (envName.startsWith(VITE_PRE_OBJECT)) {
            // JSON OBJECT
            try {
                val = JSON.parse(val)
            } catch (err) { }
        } else if (envName.startsWith(VITE_PRE_STRING)) {
            // String
        } else {
            // 非标准前缀(VITE_)
            keyStart = VITE_ANOTHER_LENGTH
        }
        // key处理
        const key = envName.substring(keyStart)
        // 返回结果
        ret[key] = val
        // 将环境变量的配置值加入到当前处理线程的环境变量中
        process.env[key] = val
    }
    return ret;
}