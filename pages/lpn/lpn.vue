<template>
    <view class="forecastAdd">
      <view class="flex-c">
        <view class="data-box">
            <view>{{ $t("Package_number") }}：</view>
            <view class="client flex-a">{{ $t('forecastLpn.clientNum') }}：</view>
            <view>{{ $t("quantity") }}</view>
        </view>
      </view>
     
        <view class="flex" style="margin: 0 20rpx 20rpx;"><uni-easyinput :focus="true" class="flex1 scan-input"
                type="text" :placeholder="$t('put.placeholder')" placeholder-class="placeholder" v-model="number"
                @confirm="getBycode(number)" />
            <button class="scan-submit" @click="getBycode(number)">{{$t('search')}}</button>
        </view>
        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.palletContainerNum">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code">{{ item.palletContainerNum }}</view>

                </view>
                <button class="cancel flex-a flex-c">
                    {{ $t('cancel') }}
                </button>
            </view>
        </transition-group>
        <view class="confirm-box">
            <button @click="submit">确定</button>
        </view>

    </view>
</template>

<script>
export default {
    name: 'lpn',
    data() {
        return {
            client: "",
            clientList: [],
            list: [
                {
                    palletContainerNum: 1
                },
                {
                    palletContainerNum: 2
                },
                {
                    palletContainerNum: 3
                },
                {
                    palletContainerNum: 4
                },
                {
                    palletContainerNum: 4
                },
                {
                    palletContainerNum: 4
                },
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
      let index = this.list.findIndex(res => res.palletContainerNum == code)
      if (index != -1) {
        index = index + 1;
        uni.showToast({
          title: "单号已在列表第" + index + "行",
          duration: 1500,
          icon: "none",
        });
        return false
      }
      this.number = code;
      uni.showLoading({
        title: this.$t('loading'),
      });
      this.apifn({
        url: "api/abroadDepot/checkRecord/incomingInspection",
        method: "post",
        data: {
          searchValue: code,
        },
      }).then((res) => {
        // console.log(res,'aaa');
        if (res.code == 200) {
          this.list.push(res.data)
          this.number = ""
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
.forecastAdd {
    padding-bottom: calc(constant(safe-area-inset-bottom) + 120rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx)
}

.data-box {
    padding: 20rpx;
    border-radius: 30rpx;
    border: 1px solid skyblue;
    flex-direction: column;
    margin-bottom: 20rpx ;
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