export let baseURL = 'http://192.168.1.19:9090/jeecg-boot/';
// export let baseURL= "https://ils.tangzhen.net/jeecg-boot/";
let token =uni.getStorageSync('token')?uni.getStorageSync('token') :undefined
if (uni.getStorageSync('token')) {
    token
}
export const myRequest = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseURL + options.url, 
			method: options.method || 'GET',  
			data: options.data || {}, 
		 
            header:{
                'X-Access-Token':uni.getStorageSync('token')
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
					reject()
                    uni.showToast({
                        title: "系统错误请联系管理员",
                        icon: "none",
                    });
				}else{
					// uni.showToast({
					// 	title: res.data.code,
					// 	icon: 'none',
					// 	mask: true,
					// 	duration: 2000
					// });
					resolve(res.data);
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
	            
				console.log(err)
				reject(err)
			}
		})
	})
}
    