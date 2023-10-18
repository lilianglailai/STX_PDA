import VueI18n from 'vue-i18n'
import Vue from 'vue'
// let baseURL = 'http://192.168.1.60:8091/'
// let baseURL = 'http://192.168.1.55:8092/'
// let baseURL= "http://www.ilsau.cn/";
 let baseURL

if (process.env.NODE_ENV == 'development') {
    baseURL = 'http://192.168.1.60:8091/' // 开发环境37唐哥，10吴，60公用开发,55吴鹏
             
 
} else {
     
    baseURL= "http://www.ilsau.cn/";
}
export default  baseURL 
// export let baseURL= "http://www.ilsau.cn/jeecg-boot/";
 
import en from "../locale/en.js";
import zh from "../locale/zh.js";
let locale=uni.getStorageSync('locale') || 'zh'

 
Vue.use(VueI18n)
 
export const i18n = new VueI18n({
    locale:locale,
    messages:{ 
        'zh': zh, // 中文
        'en': en, 
    }
  })
   
export const myRequest = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseURL + options.url, 
			method: options.method || 'GET',  
			data: options.data || {}, 
		    timeout:20000,
            header:{
                'X-Access-Token':uni.getStorageSync('token'),
                ...options.header
            },
			// header: {
			//    'Admin-Token':uni.getStorageSync('Admin-Token'), //自定义请求头信息
			//    'visa':uni.getStorageSync('userId'), //自定义请求头信息
			//    'content-type':options.headers['Content-Type'] || 'application/x-www-form-urlencoded;charset=UTF-8'
			// },
			success: (res) => {
			 
				if(res.data.code == 302){//用户另一端登录
					uni.showModal({
						title: '提示',
						content: res.data.msg  ||res.data.message, 
						showCancel: false, 
						success: function (res) {
							if (res.confirm) {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							} 
						}
					});
				}else if(res.data.code == 500){
					reject(res.data)
                    uni.showToast({
                        title: res.data.msg  ||res.data.message||i18n.t('err'),
                        icon: "none",
                    });
				}else if(res.data.code==200){
					// uni.showToast({
					// 	title: res.data.code,
					// 	icon: 'none',
					// 	mask: true,
					// 	duration: 2000
					// });
					resolve(res.data);
				}else{
                    reject(res.data)
                  
                }
				//返回的数据（不固定，看后端接口，这里是做了一个判断，如果不为true，用uni.showToast方法提示获取数据失败)
				// if (res.data.success != true) {
				// 	return uni.showToast({
				// 		title: '获取数据失败',
				// 		icon: 'none'
				// 	})
				// }
				// 如果不满足上述判断就输出数据
				
			},
		 
			fail: (err) => {
                
                 if (err.errMsg.includes('timeout')) {
                    uni.showToast({
                        title: '请求接口超时，请检查网络',
                         icon:"none"
                    });
                 }else  if (err.errMsg.includes('request:fail')) {
                    uni.showToast({
                        title: '请检查网络',
                         icon:"none"
                    });
                    
                  } 
              
		        setTimeout(() => {
                    reject(err)
                }, 1500);
				
			}
		})
	})
}
    