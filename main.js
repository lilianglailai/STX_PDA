import App from './App'
import { myRequest ,baseURL} from "./api/base.js"
Vue.prototype.apifn = myRequest
Vue.prototype.apiUrl = baseURL
import store from './store'  
Vue.prototype.$store = store


import navigation from "@/components/navigation/navigation.vue";
Vue.component('Navigation', navigation)
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
 

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif