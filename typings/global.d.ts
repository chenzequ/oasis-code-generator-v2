declare type Recordable<T = any> = Record<string, T>

declare interface ViteEnv {
    // 端口
    PORT: number
    // 标题
    APP_TITLE: string
    // 短标题
    APP_SHORT_NAME: string
    // 是否开启旧浏览器兼容模式
    LEGACY: boolean
    // 项目路径
    PUBLIC_PATH: string
    // 代理服务器设置
    PROXY: [string, string][],
    // 是否启用请求模拟
    USE_MOCK: boolean,
    // 是否删除控制台输出
    DROP_CONSOLE: boolean
}

declare interface KeyValuePair {
    key: string,
    value: any
}

declare interface ValueLabelPair {
    value: any,
    label: string
}