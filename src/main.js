import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/base.css'
import './components/_global'

Vue.use(Element)

Vue.config.productionTip = false

const app = new Vue({
  render: h => h(App)
}).$mount('#app')

export default app
