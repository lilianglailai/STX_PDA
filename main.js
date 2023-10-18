import Vue from 'vue'
import App from './App'
 
// #ifndef VUE3
import baseURL,{ myRequest ,i18n} from "./api/base.js"
import { fail,succ } from "./playMp3/play.js";
Vue.prototype.apifn = myRequest
Vue.prototype.playfail = fail
Vue.prototype.playsucc = succ
 
Vue.prototype.apiUrl = baseURL
import store from './store'  
Vue.prototype.$store = store

 
  
import navigation from "@/components/navigation/navigation.vue";
Vue.component('Navigation', navigation)

import './uni.promisify.adaptor'
Vue.config.productionTip = false
 

App.mpType = 'app'
const app = new Vue({
    i18n, 
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
const i18n = createI18n(i18nConfig)
export function createApp() {
    app.use(i18n)
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif