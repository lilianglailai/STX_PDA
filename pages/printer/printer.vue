<template>
  <view class="router-box">
    <Navigation :backTitle="$t('printer.title')"></Navigation>
        <view class="content-box">
            <view class="top-box">
                <view>{{$t("list.oldCode")}}：{{ obj.clientCode }}</view>
                <view>{{$t("printer.form.number")}}：<text class="number">{{ obj.goodsNumber }}</text> </view>
             
            </view>
               <view>
                     <button
                class="submit"
                :disabled="loading"
                :loading="loading"
                @click="submit"
            >
                   {{ obj.update ? $t("update") :$t("printer.submit")  }}
            </button>
                </view>
        </view>
  </view>
</template>

<script>
export default {
  name: 'printer',
  data () {
    return {
        obj:{

        },
        time: null,
          loading: false,
    }
  },
  onLoad(e){
    if (e.obj) {
       this.obj=JSON.parse(e.obj)    
    }
  },
  methods: {
    submit(){
     
           this.loading=true
          
        let   httpRoot = 'http://'
		let	ilsApi =   uni.getStorageSync("printerPort")||'www.ilsau.cn'
		let printIp=  uni.getStorageSync("printerAdd")||'192.168.1.15'
		 let printName=   uni.getStorageSync("printerName")|| 'Xprinter'
         let serviceApi=":8080/ilsApp/print"
         uni.request({
				    url: httpRoot + printIp +serviceApi,
				    // url:  "http://192.168.1.15:8080/ilsApp/print",	
                   
					method: 'POST',
					data: {
							ilsApi: ilsApi,
							printIp: printIp,
							orderId: this.obj.refCode,
							printName: printName,
                            pdfNum : this.obj.goodsNumber||1
						},
				    success: (res) => {
				         this.loading=false
						if(res.data.code==200){
                            uni.$emit("refresh");
							uni.showToast({
								title: this.$t('printer.result'),
								icon: 'none',
								 
							});
						}else{
							uni.showToast({
							    title: res.data.message,
							    icon: 'none',
							     
							})
						}
				    },
					fail: (error) => {
                        this.loading=false
						uni.showToast({
						    title: this.$t("err"),
						    icon: 'none',
						    duration: 3000
						})
					},
				});
			},
    }
  
}
</script>

<style  lang='scss' scoped>
.content-box {
    
        background: white;
    padding: 20rpx 0;
    .top-box {
         padding: 0 37.5rpx;
        font-size: 38rpx;
        font-weight: 500;
        color: #333333;
        > view {
            margin-bottom: 16rpx;
        }
    }
    .submit {
   
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 24rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
}
</style>