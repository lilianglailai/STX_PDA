import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		putObj:{}
	},
	mutations: {
		setputObj(state, payload){
			state.putObj = payload
		},
		 
	}
})

export default store
