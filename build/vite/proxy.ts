// 代理服务器
import type { ProxyOptions } from 'vite'

type ProxyItem = [string, string]
type ProxyList = ProxyItem[]
type ProxyTargetList = Record<string, ProxyOptions & { rewrite: (path: string) => string }>
const httpsRegex = /^https:\/\//
// 创建代理服务器
export function createProxy(list: ProxyList = []) {
    const ret: ProxyTargetList = {}
    for (const [prefix, target] of list) {
        const isHttps = httpsRegex.test(target)

        ret[prefix] = {
            target: target,
            changeOrigin: true,
            ws: true,
            rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
            // https 请求时，必须设置 secure=false
            ...(isHttps ? { secure: false } : {})
        }
    }
    return ret
}