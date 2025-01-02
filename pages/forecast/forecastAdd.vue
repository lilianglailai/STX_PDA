<template>
    <view class="forecastAdd">
        <view class="data-box flex-a">
            <view class="containernumber">{{ $t("forecast.container-number") }}：{{ obj.palletContainerNum }}</view>
            <view class="client flex-a" style="width: 80%;">{{ $t('forecast.client') }}：
                <view class="flex1"> 
                    <uni-load-more status="loading" style="justify-content: unset;"
                        :contentText="{ contentrefresh: $t('loading') }" v-show="clientLoading"></uni-load-more>
                    <view v-if="existclient && clientList.length">
                        {{ existclientName }}
                    </view>
                    <as-select v-else v-show="!clientLoading" :placeholder="$t('select',{label:$t('forecast.client')})" :searchPlaceholder="$t('please',{label:''})" v-model="obj.clientId" :options="clientList"
                        labelKey="label" valueKey="value" @change="change"></as-select>
                </view>
            </view>
        </view>
        <view class="flex" style="margin: 0 20rpx 20rpx;"><uni-easyinput :focus="true" class="flex1 scan-input"
                type="text" :placeholder="$t('put.placeholder')" placeholder-class="placeholder" v-model="number"
                @confirm="getBycode(number)" />
            <button class="scan-submit" @click="getBycode(number)">{{ $t('search') }}</button>
        </view>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>

        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.trackingCode">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code">{{ item.trackingCode }}</view>
                    <view>{{ $t("quantity") }}:{{ item.total }}</view>
                </view>
                <button class="Handover-btn flex-a flex-c" @click="goLpn(item.trackingCode)">
                    {{ $t('detail') }}
                </button>
            </view>
        </transition-group>

        <uni-popup ref="inputDialog" type="dialog">
            <uni-popup-dialog ref="inputClose" mode="input" :title="$t('please', { label: $t('weight')+'/KG' })"
                :placeholder="$t('please', { label: $t('weight')+'/KG' })" @confirm="dialogInputConfirm"></uni-popup-dialog>
        </uni-popup>
        <div class="confirm-box flex-c" @click="submit">
            <button class="temporarily" @click="back">{{ $t('forecast.Temporary-stock-box') }}</button>
            <button class="submit">{{ $t('forecast.submit') }}</button>
        </div>
    </view>
</template>

<script>
var mainz, receiverz, filterz;
export default {
    name: 'forecastAdd',
    data() {
        return {
            clientList: [],
            loading: true,
            clientLoading: true,
            list: [

            ],
            number: "",
            obj: {},
            existclient: '',
            clientName: ""
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
        console.log(999);

        this.stopScan();
        // #endif
    },
    destroyed: function () {
        // #ifdef APP 
        this.stopScan();
        // #endif 
       
    },
    computed: {
        existclientName() {

            return this.clientList.find(res => res.value == this.existclient)?.label
        }
    },
    methods: {
        change(e) {
            this.clientName = e.label
            //晚点再改成对象了
        },
        initScan() {
            let _this = this;
            mainz = plus.android.runtimeMainActivity(); //获取activity
            var IntentFilter = plus.android.importClass(
                "android.content.IntentFilter"
            );
            filterz = new IntentFilter();
            filterz.addAction("com.android.server.scannerservice.broadcast"); // 换你的广播动作 

            receiverz = plus.android.implements(
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
            mainz.registerReceiver(receiverz, filterz);
        },
        stopScan() {
            mainz.unregisterReceiver(receiverz);
        },
        goLpn(code) {

            uni.navigateTo({
                url: `/pages/forecast/forecastLpn?palletContainerNum=${this.obj.palletContainerNum}&palletContainerId=${this.obj.palletContainerId}&trackingCode=${code}&clientId=${this.obj.clientId}`,
            });
        },
        submit() {
            this.$refs.inputDialog.open()

        },
        async dialogInputConfirm(e) {

            this.apifn({
                url: `pad/v1/forecastReceipt/pdaForecastReceivingFullPacking`,
                method: "post",

                data: {
                    palletContainerId: this.obj.palletContainerId,
                    actualWeight: e
                }
            }).then(res => {
                uni.showToast({
                    title: res.msg,
                    duration: 1500,
                    icon: "none",
                })
                console.log(999);
                
                uni.$emit("refreshl")
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1,
                    });
                }, 1000);
            }, err => this.loading = false
            )
        },
        back() {
            uni.navigateBack({
                delta: 1,
            });
        },
        async getBycode(code) {
            if (this.codeQueryTag) return false;
            if (!code.replace(/\s/g, "")) {
                this.codeQueryTag = false;
                return false;
            }
            if (!this.obj.clientId) {
                uni.showToast({
                    title: this.$t('select', { label: this.$t('forecast.client') }),
                    duration: 1500,
                    icon: "none",
                })
                return
            }
            this.codeQueryTag = true;
            code=code.replace(/\n/g, "")
            this.number = code.replace(/\n/g, "")
            let clientName
            let isrefresh
            //This code is a huge mess, because the beginning of the business process is not determined, changed several times, junk code 
            if (this.clientName) {//选择则代表空箱
                clientName = this.clientName
                isrefresh = true
            } else {
                if (!this.existclientName) {
                    clientName = this.list[0].clientNumber || ""
                } else {
                    clientName = this.existclientName
                }
            }
            try {

                let res = await this.apifn({
                    url: `pad/v1/forecastReceipt/getCargoBoxPackageDetail?trackingCode=${code}`,
                })


                if (res.data.package.length) {
                    let exisit = res.data.package.some(res => res.clientId == this.obj.clientId)

                    if (!exisit) {
                        uni.showToast({
                            title: this.$t('forecast.clientinconformity'),
                            duration: 1500,
                            icon: "none",
                        })
                        this.codeQueryTag = false;
                        return false
                    }


                    uni.navigateTo({
                        url: `/pages/forecast/forecastLpn?palletContainerNum=${this.obj.palletContainerNum}&palletContainerId=${this.obj.palletContainerId}&trackingCode=${code}&clientId=${this.obj.clientId}&clientName=${clientName}&isrefresh=${isrefresh}`,
                    });
                } else {
                    uni.navigateTo({
                        url: `/pages/forecast/forecastLpn?palletContainerNum=${this.obj.palletContainerNum}&palletContainerId=${this.obj.palletContainerId}&trackingCode=${code}&clientId=${this.obj.clientId}&clientName=${clientName}&isrefresh=${isrefresh}`,
                    });
                } 
                this.codeQueryTag = false;
            } catch (error) {
                this.codeQueryTag=false
            }



        },
        getDetail() {
            this.loading = true
            this.apifn({
                url: `pad/v1/forecastReceipt/getPalletPackageData?palletContainerId=${this.obj.palletContainerId}&clientId=${this.obj.clientId}`,
            }).then(res => {
                this.list = res.data
                this.loading = false
            }, err => this.loading = false)
        },
        async refreshDetail() {
            this.loading = true
            this.loading = true
            try {
                let res = await this.apifn({
                    url: "pad/v1/forecastReceipt/getPalletContainerNum?palletContainerNum=" + this.obj.palletContainerNum,
                })
                let data = res.data
                this.existclient = data.clientId
                this.obj.clientId = data.clientId

                this.apifn({
                    url: `pad/v1/forecastReceipt/getPalletPackageData?palletContainerId=${data.palletContainerId}&clientId=${data.clientId}`,
                }).then(resp => {
                    this.list = resp.data
                    this.loading = false
                    this.clientLoading = false
                }, err => {
                    uni.navigateBack({
                        delta: 1,
                    });
                })
            } catch (error) {
                uni.navigateBack({
                    delta: 1,
                });
            }

        },
    },
    onLoad(e) {
        this.obj = JSON.parse(decodeURIComponent(e.obj))
        if (this.obj.clientId) {
            this.existclient = this.obj.clientId
        }
        if (this.obj.clientId) {
            this.getDetail()
        } else {
            this.loading = false
        }

    },
    created() {
        this.apifn({
            url: `pad/v1/client/listAll`,
        }).then(res => {
            this.clientLoading = false
            this.clientList = res.data.map(res => { return { label: res.clientNumber, value: res.id } })
        }
        )
        uni.$on("refresh", (e) => {
            this.clientName = null
            if (e && e.isrefresh) {

                this.refreshDetail();
            } else {
                this.getDetail();
            }
        });
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
    flex-direction: column;

    >view:not(:last-child) {
        margin-bottom: 20rpx;
    }
}

.content-box {
    >view {

        background: #ffffff;
        padding: 22rpx 16rpx 22rpx 30rpx;
        margin-bottom: 12.5rpx;
        margin-left: 10rpx;
        margin-right: 10rpx;
        border-radius: 16rpx;
    }

    .Handover-btn {
        height: 74rpx;
        background: #3882ee;
        border-radius: 9rpx;
        font-size: 38rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
    }

    .code {
        color: #333333;
        font-size: 42rpx;
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

    .temporarily {
        border: 1px solid #a1a0a0;
        background-color: #ffffff;
    }

    .submit {
        color: white;
        background: #0099ff;
        border: unset;

        &::after {
            border: unset !important;
        }
    }

    button {
        height: 80rpx;
        font-size: 32rpx;
        border-radius: 13rpx;
        margin: 0 30rpx;
    }
}

.containernumber {
    font-size: 40rpx;
}
</style>