<template>
    <view class="router-box">
        <Navigation backTitle="装柜详情"></Navigation>
        <view class="top-box">
            <uni-easyinput
                :focus="true"
                type="text"
                placeholder="请扫描收到的包裹"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getBycode(number)"
            />
            <image src="/static/put/put.png" @click="scan" mode="widthFix" />
        </view>
        <view class="title-box">
            <view>出库单号：{{ obj.outNo }}</view>

            <view>
                已装柜：
                <text class="blue">{{ list.length }}</text>
                件</view
            >
        </view>
        <view :style="{ paddingBottom: obj.status == 3 ? '235rpx' : '120rpx' }">
            <uni-load-more
                status="loading"
                :contentText="{ contentrefresh: $t('loading') }"
                v-show="loading"
            ></uni-load-more>
            <transition-group tag="view" name="list" class="content-box">
                <view class="flex-a" v-for="item in list" :key="item.id">
                    <!-- key是关键 -->
                    <view class="flex1">{{ item.parcelCode }}</view>
                    <button
                        class="remove-btn flex-a flex-c"
                        @click="del(item, index)"
                        :disabled="codeQueryTag || obj.status == 3"
                    >
                        移除
                    </button>
                </view>
            </transition-group>
        </view>
        <view class="btn">
            <button
                v-if="obj.status != 3"
                class="submit"
                @click="seal"
                :loading="bntloading"
                :disabled="bntloading"
            >
                封柜
            </button>
            <button class="back submit" @click="submit">返回</button>
        </view>
        <uni-popup ref="popup">
            <view class="err-pop">
                <view class="title">提示</view>
                <view class="err-box" v-if="err.length && err[1].length">
                    <view
                        class="err-title"
                        v-for="(item, index) in err[0]"
                        :key="'err0' + index"
                        >{{ item }}</view
                    >

                    <view
                        class="err"
                        v-for="(item, index) in err[1]"
                        :key="'err1' + index"
                    >
                        单号：{{ item }}
                    </view>
                </view>
                <view class="err-box" v-if="err.length && err[3].length">
                    <view
                        class="err-title"
                        v-for="(item, index) in err[2]"
                        :key="'errtitle' + index"
                        >{{ item }}</view
                    >
                    <view
                        class="err"
                        v-for="(item, index) in err[3]"
                        :key="'err' + index"
                    >
                        单号：{{ item }}
                    </view>
                </view>
                <button class="confirm" @click="back">确定</button>
            </view>
        </uni-popup>
    </view>
</template>

<script>
var Editmain, Editreceiver, Editfilter;
export default {
    name: "stuffingScan",
    data() {
        return {
            codeQueryTag: false,

            number: "", //HYW1298000418
            list: [],
            obj: {
                parcelCode: [], //关键
            },
            err: [],
            bntloading: false,
            loading: false,
            // update: false,
            HandoverEditList: [],
            time: null,
            index: undefined,
            warehouse: uni.getStorageSync("warehouse") || "深圳仓",
            isUpdate:false
        };
    },
    created() {
        // #ifdef APP
        this.initScan();
        this.startScan();
        // #endif
    },
    destroyed() {
        if (this.isUpdate) {
            uni.$emit("refresh");
        }
        
        // #ifdef APP
        this.stopScan();

        // #endif
    },
    methods: {
        goseal(){
             this.bntloading = true;
             this
              this.apifn({
                method: "post",
                url: "oms/v1/OrderWmsOut/complete",
                data: {
                    outNo: this.obj.outNo,
                    status: 3,
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.msg||"操作成功",
                       
                    });
                    
                    this.$set(this.obj, 'status', res.body.status);
                    this.bntloading = false;
                },
                (err) => {
                    this.bntloading = false;
                }
            );
        },
        seal() { 
            uni.showModal({
                title: '提示',
                content: '封柜后不可再增减包裹，是否仍要封柜？',
                success :(res)=> {
                    if (res.confirm) {
                        this.goseal()
                    } else if (res.cancel) {
                        console.log('用户点击取消');
                    }
                }
            });
          
        },
        popChange(e) {
            if (!e.show) {
                if (this.err[1].length) {
                    uni.$emit("refresh");
                    uni.navigateBack({
                        delta: 1,
                    });
                }
            }
        },
        back() {
            this.$refs.popup.close();
        },
        initScan() {
            let _this = this;
            Editmain = plus.android.runtimeMainActivity(); //获取activity
            var IntentFilter = plus.android.importClass(
                "android.content.IntentFilter"
            );
            Editfilter = new IntentFilter();
            Editfilter.addAction("android.intent.ACTION_DECODE_DATA"); // 换你的广播动作
            Editreceiver = plus.android.implements(
                "io.dcloud.feature.internal.reflect.BroadcastReceiver",
                {
                    onReceive: function (context, intent) {
                        plus.android.importClass(intent);
                        let code = intent.getStringExtra("barcode_string"); // 换你的广播标签

                        _this.queryCode(code);
                    },
                }
            );
        },
        startScan() {
            Editmain.registerReceiver(Editreceiver, Editfilter);
        },
        stopScan() {
            Editmain.unregisterReceiver(Editreceiver);
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
        del(item, index) {
             this.isUpdate=true
            uni.showLoading({
                title: this.$t('loading'),
                mask: true,
            });

            this.apifn({
                method: "post",
                url: "oms/v1/OrderWmsOut/movedOut",
                data: {
                    parcelCode: item.parcelCode,
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.msg || "删除成功",
                        duration: 1500,
                        icon: "none",
                    });
                   
                    this.getDetails();
                },
                (err) => {
                    uni.showToast({
                        title: err.msg,
                        icon: "none",
                    });
                }
            );
            // this.setlocalStorage();
        },
        update(code) {
             this.isUpdate=true
            uni.showLoading({
                title: this.$t('loading'),
                mask: true,
            });
            this.apifn({
                url: "oms/v1/OrderWmsOut/wmsout",
                method: "post",
                data: {
                    outNo: this.obj.outNo,
                    parcelCode: code,
                    warehouse: uni.getStorageSync("warehouse") || "深圳仓",
                },
            }).then(
                (res) => {
                    this.number = "";
                    this.codeQueryTag = false;
                    uni.showToast({
                        title: res.msg || "新增成功",
                        duration: 1000,
                        icon: "none",
                    });
                     this.playsucc()
                    this.getDetails();
                },
                (err) => {
                    this.number = "";
                    uni.hideLoading();
                    this.playfail()
                    this.codeQueryTag = false;
                    this.getDetails();
                    if (err.body) {
                        this.$refs.popup.open();
                        this.err = err.body;
                    } else {
                        uni.showToast({
                            title: err.msg,
                            icon: "none",
                        });
                    }
                }
            );
        },
        submit() {
            uni.navigateBack({
                delta: 1,
            });
            return false;

            if (!this.obj.parcelCode.length) {
                uni.showToast({
                    title: "至少扫码一个包裹",
                    duration: 1500,
                    icon: "none",
                });
                return false;
            }

            this.bntloading = true;
            this.apifn({
                url: "oms/v1/OrderParcelForecast/confirmSubmit",
                method: "post",
                data: {
                    batchCode: this.obj.batchCode,
                    orderNos: this.obj.parcelCode,
                    warehouse: uni.getStorageSync("warehouse") || "深圳仓",
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.body,
                        duration: 1500,
                    });
                },
                (err) => {
                    this.bntloading = false;
                    if (err.body) {
                        this.$refs.popup.open();
                        this.err = err.body;
                        if (this.index != undefined && err.body[1].length) {
                            this.HandoverEditList.splice(this.index, 1);
                            this.setlocalStorage();
                        }
                    } else {
                        uni.showToast({
                            title: err.msg,
                            icon: "none",
                        });
                    }
                }
            );
        },
        getBycode(code) {
                if (this.codeQueryTag) {
                return false;
            }
            this.codeQueryTag=true
            if (!code.replace(/\s/g, "")) {
                this.codeQueryTag = false;
                return false;
            }
            this.number=code
            if (this.obj.status == 3) {
                this.playfail()
                uni.showToast({
                    title: "已封柜，不能再操作",
                    icon: "none",
                });
                return false;
            }
            let index = this.list.findIndex((res) => code == res.parcelCode);
            if (index != -1) {
                index = index + 1;
                uni.showToast({
                    title: "单号已在列表第" + index + "行",
                    duration: 1500,
                    icon: "none",
                });
                this.codeQueryTag = false;
                this.playfail()
            } else {
                this.update(code);
            }
        },
        getDetails() {
            this.loading = true;
            this.apifn({
                url: "oms/v1/OrderWmsOut/getParcelByOutNo",
                // +this.obj.outNo,
                data: {
                    // outNo:"123123"
                    outNo: this.obj.outNo || 123123,
                },
                method: "post",
            }).then((res) => {
                this.loading = false;
                this.list = res.body;
            });
        },

        setlocalStorage() {
            uni.setStorageSync(
                "HandoverEditList",
                JSON.stringify(this.HandoverEditList)
            );
        },
    },
    onLoad(e) {
        if (e.obj) {
            this.obj = JSON.parse(decodeURIComponent(e?.obj));
        }
        this.getDetails();
    },
};
</script>

<style  lang='scss' scoped>
.back {
    background: #cfcfcf !important;

    margin-top: 31rpx;
}
.top-box {
    position: relative;
    background: #f2f2f2;
    /deep/ .is-input-border {
        border: unset !important;
    }
    /deep/ .uni-easyinput__content-input {
        height: 103rpx;
        background: #ffffff;
        font-size: 38rpx;
    }
    /deep/.content-clear-icon {
        padding-right: 160rpx !important;
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
.title-box {
    margin: 16rpx 0;
    background: white;
    padding: 16rpx 32rpx;
    font-size: 38rpx;
    font-weight: 500;
    color: #333333;
    > view:not(:last-child) {
        margin-bottom: 20rpx;
    }
}
.blue {
    color: #3882ee;
}
.list-title {
    padding-left: 32rpx;
    height: 36rpx;
    font-size: 38rpx;
    height: 96rpx;
    line-height: 96rpx;
}
.content-box {
    > view {
        height: 133rpx;
        background: #ffffff;
        padding: 22rpx 16rpx 22rpx 30rpx;
        margin-bottom: 12.5rpx;
    }
    .remove-btn {
        height: 84rpx;
        background: #3882ee;
        border-radius: 9rpx;
        font-size: 38rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
    }
}
.btn {
    z-index: 999;
    position: fixed;
    bottom: 20rpx;
    width: 100%;
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;

    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;

    &::after {
        border: none;
    }
}

.err-pop {
    padding: 44rpx 56rpx;
    background: #ffffff;
    border-radius: 9rpx;
    width: 713rpx;
    box-sizing: border-box;

    .title {
        font-size: 50rpx;

        font-weight: 800;
        color: #3882ee;
        text-align: center;
        margin-bottom: 40rpx;
    }
    .err-box {
        margin-bottom: 28rpx;
        > .err:not(:last-child) {
            margin-bottom: 10rpx;
        }
    }
    .err-title {
        font-size: 38rpx;
        text-align: center;
        font-weight: 800;
        color: #666666;
        margin-bottom: 15rpx;
    }
    .err {
        font-size: 28rpx;
        font-weight: bold;
        color: #df1111;
        text-align: center;
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
}
.list-enter-active,
.list-leave-active {
    transition: all 0.5s;
}
.list-enter,
.list-leave-to {
    opacity: 0;
}
</style>
 