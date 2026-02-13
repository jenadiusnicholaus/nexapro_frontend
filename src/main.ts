import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import './scss/main.scss'
import './assets/main.css'

import { createApp } from 'vue'
import pinia from '@/stores'
import i18n from '@/i18n'
import App from './App.vue'
import router from './router'
import vuesticGlobalConfig from '@/services/vuestic-ui/global-config'

const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(router)
app.use(createVuestic({ config: vuesticGlobalConfig }))
app.mount('#app')
