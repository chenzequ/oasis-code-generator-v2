import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'

import { configMockPlugin } from './mock'
import { configHtmlPlugin } from './html'
import { configWindicss } from './windicss'

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean): (Plugin | Plugin[])[] {
    const vitePlugins: (Plugin | Plugin[])[] = [
        vue(),
        vueJsx(),
        vueSetupExtend()
    ]
    const { LEGACY, USE_MOCK } = viteEnv
    LEGACY && isBuild && vitePlugins.push(legacy())
    USE_MOCK && vitePlugins.push(configMockPlugin(isBuild))
    vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))
    vitePlugins.push(configWindicss())

    return vitePlugins
}