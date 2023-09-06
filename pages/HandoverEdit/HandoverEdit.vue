<template>
    <view class="router-box">
        <Navigation :backTitle="'交接单编辑'"></Navigation>
        <view class="top-box">
            <uni-easyinput
               
                type="text"
                :placeholder="$t('HandoverEdit.placeholder')"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getConfirm(number)"
            />
            <image src="/static/put/put.png" @click="scan" mode="widthFix" />
        </view>
        <view class="title-box">
            <view>交接单号：{{ obj.batchCode }}</view>
            <view>预计交接仓：{{ warehouse }}</view>
            <view>
                交接/预报件数：
                <text class="blue"
                    >{{ obj.parcelCounts || 0 }}/{{
                        obj.parcelForecastCounts || 0
                    }}</text
                >
                件</view
            >
        </view>
       <view style="padding-bottom: 120rpx;">

     
        <transition-group tag="view" name="list" class="content-box">
            <view
                class="flex-a"
                v-for="item in obj.parcelCode"
                :key="item"  
            >
            <!-- key是关键 -->
                <view class="flex1">{{ item }}</view>
                <button
                    class="Handover-btn flex-a flex-c"
                    @click="del(item, index)"
                >
                    移除
                </button>
            </view>
        </transition-group>
          </view>
        <view class="btn flex-c">
            <!-- <button
                class="submit"
                @click="submit"
                :loading="loading"
                :disabled="loading"
            >
                确定
            </button> -->
            <button class="submit" @click="submit">返回</button>
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
    name: "HandoverEdit",
    data() {
        return {
            codeQueryTag: false,
      
            number: "", //HYW1298000418
            list: [],
            obj: {
                parcelCode: [], //关键
            },
            err: [],
            loading: false,
            // update: false,
            HandoverEditList: [],
            time: null,
            index: undefined,
            warehouse: uni.getStorageSync("warehouse") || "东莞仓",
        };
    },
    created() {
        // #ifdef APP
        this.initScan();
        this.startScan();
        // #endif
    },
    destroyed() {
        // #ifdef APP
        this.stopScan();

        // #endif
    },
    methods: {
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
         getConfirm(code) { 
            if (this.codeQueryTag) return false;
            this.getBycode(code);
        },
        queryCode(code) {
            //防重复
            if (this.codeQueryTag) return false;
            this.codeQueryTag = true;  
            this.number = code;
            this.getBycode(code);
        },
        scan() {
            if (this.codeQueryTag) {
                return false;
            }

            uni.scanCode({
                success: (res) => {
                    this.codeQueryTag = true;
                    this.getBycode(res.result);
                },
            });
        },
        del(item, index) {
            uni.showLoading({
                title: "加载中",
                mask: true,
            });
            // this.obj.parcelCode.splice(index, 1);
            this.apifn({
                method: "post",
                url: "oms/v1/OrderParcelForecast/deleteSingleRecord",
                data: {
                    batchCode: this.obj.batchCode,
                    orderNos: [item],
                    warehouse: uni.getStorageSync("warehouse") || "东莞仓",
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.body,
                        duration: 1500,
                         icon: "none",
                    });
                    this.obj.parcelCode.splice(index, 1);
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
             
            uni.showLoading({
                title: "加载中",
                mask: true,
            });
            this.apifn({
                url: "oms/v1/OrderParcelForecast/confirmSubmit",
                method: "post",
                data: {
                    batchCode: this.obj.batchCode,
                    orderNos: [code],
                    warehouse: uni.getStorageSync("warehouse") || "东莞仓",
                },
            }).then(
                (res) => {
                     this.number = "";
                    this.codeQueryTag=false
                    uni.showToast({
                        title: res.body,
                        duration: 1000,
                        icon:'none'
                    });
                    this.obj.parcelCode.unshift(code);
                    this.getDetails();
                },
                (err) => {
                     this.number = "";
                    uni.hideLoading();
                    this.loading = false;
                    this.codeQueryTag=false
                    this.getDetails();
                    if (err.body) {
                        this.$refs.popup.open();
                        this.err = err.body;
                        if (!this.err[3].length) {
                            this.obj.parcelCode.unshift(code);
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
        submit() {
            uni.$emit("refresh");
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

            this.loading = true;
            this.apifn({
                url: "oms/v1/OrderParcelForecast/confirmSubmit",
                method: "post",
                data: {
                    batchCode: this.obj.batchCode,
                    orderNos: this.obj.parcelCode,
                    warehouse: uni.getStorageSync("warehouse") || "东莞仓",
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.body,
                        duration: 1500,
                    });
                },
                (err) => {
                    this.loading = false;
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
           if (!code) {
             this.codeQueryTag=false
            return false
           
           }
           
            let index = undefined;
            index = this.obj.parcelCode.findIndex((res) => code == res);
            if (index != -1) {
                index = index + 1;
                uni.showToast({
                    title: "单号已在列表第" + index + "行",
                    duration: 1500,
                    icon: "none",
                });
                this.codeQueryTag=false
            } else {
                // this.obj.parcelCode.unshift(code);
                this.update(code);
                // if (this.index == undefined ) {
                //     this.HandoverEditList.push({ ...this.obj });
                //     this.index = this.HandoverEditList.length - 1;
                // } else {
                //     this.HandoverEditList[this.index] = this.obj;
                // }
                // this.setlocalStorage();
            }
        },
        getDetails() {
            this.apifn({
                url:
                    "oms/v1/OrderParcelForecast/checkBatchCode?checkCode=" +
                    this.obj.batchCode,
                method: "post",
            }).then((res) => {
                if (!this.obj.parcelCounts) {
                    this.obj = res?.body;
                } else {
                    this.obj.parcelCounts = res?.body?.parcelCounts;
                    this.obj.parcelForecastCounts =
                        res?.body.parcelForecastCounts;
                }
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
        if (e.batchCode) {
            this.obj.batchCode = e?.batchCode;
        }
        this.getDetails();
        // this.HandoverEditList = uni.getStorageSync("HandoverEditList")
        //     ? JSON.parse(uni.getStorageSync("HandoverEditList"))
        //     : [];
        // if (this.HandoverEditList.length) {
        //     let a = this.HandoverEditList.some((res, index) => {
        //         if (res.batchCode == this.obj.batchCode) {
        //             this.obj = this.HandoverEditList[index];
        //             this.index = index;
        //             return true;
        //         }
        //     });
        // } else {
        //     this.getDetails();
        // }
    },
};
</script>

<style  lang='scss' scoped>
.top-box {
    position: relative;
    background: #F2F2F2;
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
    .Handover-btn {
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
.disabled {
    color: rgba(0, 0, 0, 0.3) !important;
    background-color: #f7f7f7 !important;
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
 