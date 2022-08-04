import { createApp } from 'vue'
import 'ant-design-vue/dist/antd.less'
import 'virtual:windi.css'
import './index.less'
import App from './App.vue'

async function bootstrap() {
    const app = createApp(App)
    // setupGlobalComp(app)
    app.mount('#app', true)
}

void bootstrap()