<template>
  <view class="forecastAdd">
    <view class="data-box flex-a">
      <view>{{ $t("Package_number") }}：{{ Package_number }}</view>
      <view>{{ $t("quantity") }}：{{ list.length }}</view>
    </view>
    <view class="flex" style="margin: 0 20rpx 20rpx;"><uni-easyinput :focus="true" class="flex1 scan-input" type="text"
        :placeholder="$t('put.placeholder')" placeholder-class="placeholder" v-model="number"
        @confirm="getBycode(number)" />
      <button class="scan-submit" @click="getBycode(number)">{{ $t('search') }}</button>
    </view>
    <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
    v-show="loading"></uni-load-more>
    <transition-group tag="view" name="list" class="content-box">
      <view class="flex-a" v-for="(item, index) in list" :key="item.lpn">
        <!-- key是关键 -->
        <view class="flex1">
          <view class="code">{{ item.lpn }}</view>

        </view>
        <button class="cancel flex-a flex-c" v-if="!item.id" @click="list.splice(index, 1)">
          {{ $t('cancel') }}
        </button>
      </view>
    </transition-group>
    <view class="confirm-box">
      <button @click="submit" :loading="sumloading" :disabled="sumloading">{{ $t("lpn.submit") }}</button>
    </view>

  </view>
</template>

<script>
var main, receiver, filter;
export default {
  name: 'temporarycountingAdd',
  data() {
    return {
      sumloading:false,
      loading:true,
      Package_number: "",
      client: "",
      clientList: [],
      list: [

      ],
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
 
  onLoad(e) {
    this.Package_number = e.code
    this.apifn({
      url: "api/abroadDepot/checkRecord/getLpnCodeList?pageNum=1&pageSize=99&palletContainerNum="+e.code,
    }).then(res=>{
      this.list=res.rows
      this.loading=false
    },
    err=>this.loading=false
  )
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
      if (!code.replace(/\s/g, "")) {
        return false;
      }
      let index = this.list.findIndex(res => res.lpn == code)
      if (index != -1) {
        index = index + 1;
        uni.showToast({
          title: this.$t('numberDuplication', { num: index }),
          duration: 1500,
          icon: "none",
        });
        return false
      }
      this.number = code;
      this.list.push({
        lpn:code
      })
      this.playsucc()
    },
    submit() {
  
      let list=this.list.filter(res=>res.lpn&&!res.id).map(res=>res.lpn)
      if (!list.length) {
        uni.showToast({
          title: this.$t('minLength'),
          icon: "none",
        });
        return
      }
      this.sumloading=true
      this.apifn({
        url: "api/abroadDepot/checkRecord/addLpnCode",
        method: "post",
        data: {
          palletContainerNum: this.Package_number,
          lpn: list.join(',')
        },
      }).then(res => {
        this.sumloading=false
        uni.showToast({
          title: res.msg,
          duration: 1500,
          icon: "none",
        })
        setTimeout(() => {
          uni.navigateBack({
            delta: 1,
          });
        }, 1000);
      }
    ,  err=> this.sumloading=false
    )
    }
  
  }
}
</script>

<style lang="scss" scoped>
.forecastAdd {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 120rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx)
}

.data-box {
  padding: 20rpx;
  border-radius: 30rpx;
  border: 1px solid skyblue;
  flex-direction: column;
  margin: 20rpx 25%;

  >view:not(:last-child) {
    margin-bottom: 10rpx;
  }
}

.content-box {
  >view {
    height: 100rpx;
    background: #ffffff;
    padding: 0 16rpx 0 30rpx;
    margin-bottom: 12.5rpx;
    margin-left: 10rpx;
    margin-right: 10rpx;
    border-radius: 16rpx;
  }

  .cancel {
    height: 68rpx;
    width: 120rpx;
    background: #fa3534;
    border-radius: 9rpx;
    font-size: 26rpx;
    font-weight: 400;
    color: #ffffff;
    margin-left: 10rpx;
  }

  .code {
    color: #333333;
    font-size: 42rpx;
    margin-bottom: 10rpx;
  }

  .Customer_Number {
    font-size: 36rpx;
  }
}

.confirm-box {
  position: fixed;
  bottom: calc(constant(safe-area-inset-bottom) + 30rpx);
  bottom: calc(env(safe-area-inset-bottom) + 30rpx);
  left: 0;
  right: 0;

  button {
    color: white;
    background: #0099ff;
    height: 80rpx;
    font-size: 32rpx;
    border-radius: 13rpx;
    margin: 0 30rpx;
    border: unset;

    &::after {
      border: unset !important;
    }
  }
}

.containernumber {
  font-size: 40rpx;
}
</style>