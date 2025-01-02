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
  name: 'temporarycounting',
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
      this.number=code
      uni.navigateTo({
        url: "/pages/temporarycounting/temporarycountingAdd?code=" + code
      })

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