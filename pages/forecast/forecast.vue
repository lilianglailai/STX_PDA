<template>
  <div class="app-box">
    <view class="flex" style="margin: 0px 5px">
      <uni-easyinput :focus="true" class="flex1 scan-input" type="text" :placeholder="$t('put.placeholder')"
        placeholder-class="placeholder" v-model="number" @confirm="getBycode(number)" />
      <button class="scan-submit" @click="getBycode(number)">{{ $t('search') }}</button>
    </view>
    <view class="container">
      {{ $t('forecast.container-number') }}:{{ number }}
    </view>
  </div>
</template>

<script>
var main, receiver, filter;
export default {
  name: 'forecast',
  data() {
    return {
      number: ""
    };
  },
  onShow() {
    // #ifdef APP 
    this.initScan();
    this.startScan();
    // #endif
  },
  onHide() {
    // #ifdef APP
    
    this.stopScan();
    // #endif
  },
  destroyed: function () {
    // #ifdef APP 
    this.stopScan();
    // #endif 
  },
  methods: {
    initScan() {
      let _this = this;
      main = plus.android.runtimeMainActivity(); //获取activity
      var IntentFilter = plus.android.importClass(
        "android.content.IntentFilter"
      );
      filter = new IntentFilter();
      filter.addAction("com.android.server.scannerservice.broadcast"); // 换你的广播动作 

      receiver = plus.android.implements(
        "io.dcloud.feature.internal.reflect.BroadcastReceiver",
        {
          onReceive: function (context, intent) {
            plus.android.importClass(intent);
            let code = intent.getStringExtra("scannerdata"); // 换你的广播标签
            console.log('code', code);

            _this.getBycode(code);
          },
        }
      );
    },
    startScan() {
      main.registerReceiver(receiver, filter);
    },
    stopScan() {
      main.unregisterReceiver(receiver);
    },
    getBycode(code) {
      if (this.codeQueryTag) return false;
      this.codeQueryTag = true;
      if (!code.replace(/\s/g, "")) {
        this.codeQueryTag = false;
        return false;
      }

      this.number = code;
      uni.showLoading({
        title: this.$t('loading'),
      });
      this.apifn({
        url: "pad/v1/forecastReceipt/getPalletContainerNum?palletContainerNum=" + code,
      }).then((res) => {
        // console.log(res,'aaa');
        if (res.code == 200) {
          let data=res.data
          let obj=  {
            palletContainerId:data.palletContainerId,
            clientId:data.clientId,
            palletContainerNum:this.number
          }
          uni.navigateTo({
            url: '/pages/forecast/forecastAdd?obj='+  encodeURIComponent(JSON.stringify(obj)) ,
          });
          this.playsucc()
        } else {
          this.playfail()
        }

        this.codeQueryTag = false;
        uni.hideLoading();
      },
        (err) => {
          this.playfail()
          uni.hideLoading();
          this.codeQueryTag = false;
        }
      );
    },
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 130rpx;
  background-color: #ffffff;
  line-height: 130rpx;
  border-radius: 16rpx;
  margin: 20rpx 10rpx;
  text-align: center;
  box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
}
</style>