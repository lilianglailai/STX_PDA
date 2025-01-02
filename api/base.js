import VueI18n from 'vue-i18n'
import Vue from 'vue'
// let baseURL = 'http://192.168.1.60:8091/'
// let baseURL = 'http://192.168.1.55:8092/'
// let baseURL= "http://www.ilsau.cn/";
 let baseURL

if (process.env.NODE_ENV == 'development') {
    // baseURL = 'http://112.74.125.36:8803/'  
	// baseURL = 'http://192.168.1.197:8093/'   //和浩
	// baseURL = 'http://192.168.1.200:8093/'   //雷
	baseURL= "http://112.74.125.36:8803/";//测试
 
} else {
     
    baseURL= "http://112.74.125.36:8803/";//测试
}
export default  baseURL  
 
 
 
import en from "../locale/en.json";
import zh from "../locale/zh-Hans.json"; 
import de from "../locale/de.json"; 
 
Vue.use(VueI18n)
 
export const i18n = new VueI18n({
    locale:uni.getLocale() || 'zh-Hans',
    messages:{
        'zh-Hans': zh, // 中文
        'en': en, 
		'de':de
    }
  })
   
export const myRequest = (options) => {
	return new Promise((resolve, reject) => { 
		let ContentType
		if (options.header&&options.header['Content-Type'] ) {
			ContentType=options.header['Content-Type']
		}
		uni.request({
			url: baseURL + options.url, 
			method: options.method || 'GET',  
			data: options.data || {}, 
		    timeout:20000,
            header:{
				'Content-type': ContentType|| 'application/x-www-form-urlencoded',
                'authorization':uni.getStorageSync('token'),
            },
			
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
				}else if(res.data.code == 401){
					reject(res.data) 
					 
                    uni.showModal({
						title: '登录状态失效，是否重新登录' ,
						content:res.data.msg  ||res.data.message ||i18n.t('err'),
						success: function (res) {
							if (res.confirm) {
								uni.removeStorageSync('username');
								uni.removeStorageSync('token');
								uni.reLaunch({
									url: '/pages/login/login'
								});
							} else if (res.cancel) {
								console.log('用户点击取消');
							}
						}
					});
				}else if(res.data.code==0){
					
					resolve(res.data);
				}else if(res.data.code==200){
					
					resolve(res.data);
				}else {
					if ( !options?.header?.notMsg ) {
						uni.showToast({
							title: res.data.msg  ||res.data.message ||i18n.t('err'),
							icon: "none",
						});
					}
				
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
				 
				
                //  if (err.msg) {
				// 	uni.showToast({
                //         title: err.msg,
                //          icon:"none"
                //     });
				//  }
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
    