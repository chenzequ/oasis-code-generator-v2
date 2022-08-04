import type { Plugin } from 'vite'

import html from 'vite-plugin-html'
import pkg from '../../../package.json'

const APP_CONFIG_FILE_NAME = '_app.config.js'

export function configHtmlPlugin(env: ViteEnv, isBuild: boolean) {
    const { APP_TITLE, PUBLIC_PATH } = env
    const path = PUBLIC_PATH ? (PUBLIC_PATH.endsWith('/') ? PUBLIC_PATH : `${PUBLIC_PATH}/`) : '/'

    const getAppConfigSrc = () => {
        return `${path || '/'}${APP_CONFIG_FILE_NAME}?v=${pkg.version}-${new Date().getTime()}`;
    }

    const htmlPlugin: Plugin[] = html({
        minify: isBuild,
        inject: {
            injectData: {
                title: APP_TITLE,
            },
            tags: isBuild
                ? [
                    {
                        tag: 'script',
                        attrs: {
                            src: getAppConfigSrc(),
                        },
                    },
                ]
                : [],
        }
    })
    return htmlPlugin
}