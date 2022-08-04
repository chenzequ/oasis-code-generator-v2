import { ConfigEnv, loadEnv } from 'vite'
import path from 'path'

import { wrapperEnv } from './build/utils'
import { createProxy } from './build/vite/proxy'
import { createVitePlugins } from './build/vite/plugins/'

export default ({ command, mode }: ConfigEnv) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const isBuild = command === 'build'
  const viteEnv = wrapperEnv(env)
  const { PUBLIC_PATH, PORT, PROXY, DROP_CONSOLE } = viteEnv

  return {
    base: PUBLIC_PATH,
    root,
    // 配置别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    // 配置代理服务器
    server: {
      host: true,
      port: PORT,
      proxy: createProxy(PROXY)
    },
    // 构建项目
    build: {
      target: 'es2015',
      // 配置 build 输出目录
      outDir: 'dist',
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     // 生产环境下删除控制台输出
      //     drop_console: DROP_CONSOLE,
      //   },
      // },
    },
    // 配置css
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // // 生成 less 自定义变量
          // modifyVars: generateModifyVars()
        }
      }
    },
    // 自定义全局变量
    define: {
      'process.env': { ...process.env }
    },
    // 配置插件
    plugins: createVitePlugins(viteEnv, isBuild)
  }
}