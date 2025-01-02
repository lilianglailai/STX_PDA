<template>
    <view>
        <!-- <Navigation :backTitle="$t('put.title')"></Navigation> -->
        <view class="top-box">
            <view class="flex" style="margin: 0px 5px">
                <uni-easyinput :focus="true" class="flex1" type="text" :placeholder="$t('put.placeholder')"
                    placeholder-class="placeholder" v-model="number" @confirm="getBycode(number)" />

                <button class="scan-submit" @click="getBycode(number)">{{$t('search')}}</button>
            </view>
        </view>
        <view class="list-title"> {{ $t('quantity') }}：{{ list.length }}</view>


        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.palletContainerNum">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code">{{ item.palletContainerNum }}</view>
                    <view>客户序号:{{ item.clientNumber }}</view>
                </view>
                <button :disabled="codeQueryTag" class="cancel flex-a flex-c" @click="del(index)">
                    取消
                </button>
            </view>
        </transition-group>
        <button class="confirm" @click="submit">{{ $t('submit') }}</button>
        <!-- <List ref="list"></List> -->
    </view>
</template>

<script>
var main, receiver, filter; 
export default {

    name: "put",
    data() {
        return {
            // show: false,
            codeQueryTag: false,
            list: [],
            number: "", //HYW1298000418
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

                        _this.queryCode(code);
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
        queryCode(code) { 
            this.getBycode(code);
        },

        scan() {

            uni.scanCode({
                success: (res) => {
                    this.getBycode(res.result);
                },
            });
        },

        getBycode(code) {
         
            if (this.codeQueryTag) return false;
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
            this.codeQueryTag = true;
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
        submit() {
            if (!this.list.length) {
                uni.showToast({
                    title: this.$t('minLength'),
                    icon: "none",
                });
                return
            }
            this.apifn({
                url: "api/abroadDepot/checkRecord/chuku",
                method: "post",
                data: {
                    searchValue: this.list.map(res => res.palletContainerNum).join(),
                },
            }).then(res => {
                uni.showToast({
                    title: res.msg,
                    icon: "none",
                });
                this.list = []
            }).catch(res => {
                uni.showToast({
                    title: res.msg,
                    icon: "error",
                });
            })


        },
        del(index) {
            this.list.splice(index, 1)
        }
    },
};
</script>

<style lang='scss'>
.top-box {
    position: relative;
    margin-top: 10px;

    /deep/ .is-input-border {
        border: unset !important;
    }

    /deep/ .uni-easyinput__content-input {
        height: 80rpx;
        background: #ffffff;
        font-size: 38rpx;
    }

   
    image {
        width: 71.88rpx;
        position: absolute;
        right: 65.6rpx;
        top: 50%;
        transform: translate(0, -50%);
        z-index: 9;
    }

    .placeholder {
        font-size: 38rpx;
        font-weight: 500;
        color: #949494;
    }
}

.list-title {
    text-align: center;
    color: #3882ee;
  
    border-radius: 16rpx;
    height: 100rpx;
    line-height: 100rpx;
    margin: 20rpx 10rpx;
    background-color: white;
}

.content-box {
    >view {
    
        background: #ffffff;
        padding: 22rpx 16rpx 22rpx 30rpx;
        margin-bottom: 12.5rpx;
        margin-left: 10rpx;
        margin-right: 10rpx;
        border-radius: 16rpx;
        box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
    }

    .cancel {
        height: 74rpx;
        background: #fa3534;
        border-radius: 9rpx;
        font-size: 38rpx;
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

.confirm {
    width: 598rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 36rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: 800;
    color: #ffffff;
}


</style>