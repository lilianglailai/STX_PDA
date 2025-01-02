<template>
    <view class="forecastAdd">
        <!-- <button @click="cs">cs</button> -->
        <view class="flex-c">
            <view class="data-box ">
                <view>{{ $t("Package_number") }}：{{ this.trackingCode }}</view>
                <view class=" flex-a" style="width: 80vw;">{{ $t('forecastLpn.clientNum') }}：
                    <view class="flex1">
                        <uni-load-more status="loading" style="justify-content: unset;"
                            :contentText="{ contentrefresh: $t('loading') }" v-show="loading"></uni-load-more>
                        <view v-if="clientName">{{ clientName }}</view>
                        <template v-else>
                            <view v-if="existclient && clientList.length">
                                {{ clientList.find(res => res.clientId == existclient).clientNumber }}
                            </view>
                            <as-select v-else v-show="!loading" v-model="clientId" :options="clientList"
                                labelKey="clientNumber" valueKey="clientId" @change="change"></as-select>
                        </template>
                    </view>
                </view>
                <!-- <view class="flex-a">{{ $t('forecastLpn.clientNum') }}：{{ obj.clientNumber }}</view> -->
                <view>{{ $t("quantity") }}:{{ list.length }}</view>
            </view>
        </view>

        <view class="flex" style="margin: 0 20rpx 20rpx;"><uni-easyinput   class="flex1 scan-input"
                type="text" :placeholder="$t('put.placeholder')" placeholder-class="placeholder" v-model="number"
                @confirm="getBycode(number)" />
            <button class="scan-submit" @click="getBycode(number)">{{ $t('search') }}</button>
        </view>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.checkCode">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code" :class="{ highlight: item.id }">{{ item.checkCode }}</view>

                </view>
                <button class="cancel flex-a flex-c" v-if="!item.id" @click="list.splice(index, 1)">
                    {{ $t('cancel') }}
                </button>
            </view>
        </transition-group>
        <view class="confirm-box" v-if="DisabledBtn">
            <button @click="submit" :loading="sumloading" :disabled="sumloading"> {{ $t('submit') }}</button>
        </view>

    </view>
</template>

<script>
var main, receiver, filter;
export default {
    name: 'forecastLpn',
    data() {
        return {
            trackingCode: '',
            sumloading: false,
            existclient: '',
            clientId: '',
            clientName: '',
            clientList: [],
            obj: {

            },
            id: '',
            isrefresh: false,
            list: [

            ],
            loading: true,
            DisabledBtn: true,
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
        cs() {
            uni.$emit('refresh')
        },
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
            if (!code.replace(/\s/g, "")) {
                this.codeQueryTag = false;
                return false;
            }
            let params = 'checkCode'
            let index = this.list.findIndex(res => res[params] == code)
            if (index != -1) {
                index = index + 1;
                uni.showToast({
                    title: this.$t('numberDuplication', { num: index }),
                    duration: 1500,
                    icon: "none",
                });
                return false
            }
            this.codeQueryTag = true;
            code= code.replace(/\n/g, "")
            this.number = code;
            // console.log(code,'code')
            let obj = {}
            obj[params] = code
            this.list.push(obj) 
            this.playsucc()
            this.codeQueryTag = false;
        },
        change(e) {
            this.advanceOrderId = this.clientList[e.index].advanceOrderId
            this.id = this.clientList[e.index].id
            //晚点再改成对象了
        },
        async submit() {
            if (!this.clientId) {
                uni.showToast({
                    title: this.$t('select', { label: this.$t('forecast.client') }),
                    duration: 1500,
                    icon: "none",
                })
                return
            }
            let params = 'checkCode'
            let list = this.list.filter(res => res[params] && !res.id).map(res => res[params])
            if (!list.length) {
                uni.showToast({
                    title: this.$t('minLength'),
                    icon: "none",
                });
                return
            }
            this.sumloading = true
            if (this.clientName || this.existclient && !this.obj.id) {
                try {
                    let res = await this.apifn({
                        url: "pad/v1/forecastReceipt/pdaDerelictionRecordPacking",
                        method: "post",
                        data: {
                            containerId: this.palletContainerId, //接口里面的数据为空，只能自己传了
                            courierLpn: this.trackingCode,
                            lpn: list.join(' '),
                            clientId: this.clientId
                        },
                        header: {
                            'Content-Type': 'application/json'
                        }
                    })
                    uni.showToast({
                        title: res.msg,
                        duration: 1500,
                        icon: "none",
                    })
                    if (this.isrefresh) {
                        uni.$emit('refresh', { isrefresh: this.isrefresh })
                    } else {
                        uni.$emit('refresh')
                    }
                    setTimeout(() => {
                        uni.navigateBack({
                            delta: 1,
                        });
                    }, 1000);
                } finally {
                    this.sumloading = false
                }
                return
            }
            let stxAmazonRemoveInfo = []
            if (this.existclient) {
                
                stxAmazonRemoveInfo[0] = { ...this.obj, lpn: list.join(' '), 


                }
                console.log(stxAmazonRemoveInfo,'stxAmazonRemoveInfo');
                
            } else {
                stxAmazonRemoveInfo[0] = {
                    palletContainerId: this.palletContainerId,
                    palletContainerNum: this.palletContainerNum,
                    clientId: this.clientId,
                    trackingCode: this.trackingCode,
                    advanceOrderId: this.advanceOrderId,
                    id: this.id,
                    lpn: list.join(' '),
                }
            }
            try {
                let res = await this.apifn({
                    url: "pad/v1/forecastReceipt/pdaForecastReceivingPacking",
                    method: "post",
                    data: {
                        palletContainerId: this.palletContainerId, //接口里面的数据为空，只能自己传了
                        palletContainerNum: this.palletContainerNum,
                        trackingCode: this.trackingCode,
                        clientId: this.clientId,
                        stxAmazonRemoveInfo: stxAmazonRemoveInfo
                    },
                    header: {
                        'Content-Type': 'application/json'
                    }
                })
                uni.showToast({
                    title: res.msg,
                    duration: 1500,
                    icon: "none",
                })
                if (this.isrefresh) {
                    uni.$emit('refresh', { isrefresh: this.isrefresh })
                } else {
                    uni.$emit('refresh')
                }
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1,
                    });
                }, 1000);

            } finally {
                this.sumloading = false
            }

        },

    },
    onLoad(e) {
        this.palletContainerId = e.palletContainerId
        this.palletContainerNum = e.palletContainerNum
        this.trackingCode = e.trackingCode
        if (e.isrefresh) {
            this.isrefresh = true
        }
        this.apifn({
            url: `pad/v1/forecastReceipt/getCargoBoxPackageDetail?trackingCode=${e.trackingCode}`,
        }).then(res => {
            this.list = res.data.lpn
            this.clientList = res.data.package
            if (res.data.package.length) {
                res.data.package.some(res => {
                    if (res.clientId == e.clientId) {
                        this.obj = res
                        this.clientId = e.clientId
                        this.existclient = this.obj.clientId
                        return
                    }
                })
            } else {
                this.clientId = e.clientId
                this.existclient = e.clientId
                this.clientName = e.clientName

            }
            this.loading = false
        },
            // err => {
            //     this.clientId = e.clientId
            //     this.existclient = e.clientId
            //     this.clientName = e.clientName
            //     this.loading = false
            // }
        )
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
    flex-direction: column;
    margin: 30rpx 0;

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