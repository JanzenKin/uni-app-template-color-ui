import Vue from 'vue'
import App from './App'
import dayjs from 'dayjs'

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs
App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
