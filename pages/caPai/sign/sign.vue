<template>
    <view class="router-box">
        <Navigation :backTitle="'Menu'"></Navigation>
        <view class="btn">
            <view class="top-box">
                <uni-easyinput
                    :focus="true"
                    type="text"
                    :placeholder="'Please enter or scan the package'"
                    placeholder-class="placeholder"
                    v-model="number"
                    @confirm="getBycode(number)"
                />
                <image
                    src="/static/put/put.png"
                    @click="scan"
                    mode="widthFix"
                />
            </view>
            <!-- <picker-col></picker-col> -->
        </view>
        <view class="list-title"
            >Total HBL:
            <text style="color: #d80b0b; margin-left: 20rpx">{{
                list.length
            }}</text>
        </view>
        <view class="content-box" v-if="list.length">
            <view v-for="(item, index) in list" :key="index">
                <view class="head-box flex-a">
                    <text style="margin-right: 36rpx">
                        HBL#:{{ item.hbl }}</text
                    >
                    <text style="margin-right: 36rpx"
                        >0/{{
                            (item.parcelList && item.parcelList.length) || 0
                        }}PS</text
                    >
                    <button class="remove-btn flex-a" @click="del(index)">
                        Remove
                    </button>
                </view>
                <template v-if="item.parcelList.length">
                    <view class="chlld-box">
                        <view
                            v-for="itemChlld in item.parcelList"
                            :key="itemChlld.parcelCode"
                            :class="{ isScan: itemChlld.isScan }"
                        >
                            <view class="flex-a">
                                <view>{{ itemChlld.parcelCode }}</view>
                                <view>{{ itemChlld.parcelWeight }}KG</view>
                            </view>
                        </view>
                    </view>
                </template>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box">
            {{ $t("not_data") }}
        </view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"
        ></uni-load-more>
        <view class="flex-c bottom-btn">
            <button
                class="submit"
                :disabled="btnLoading"
                :loading="btnLoading"
                @click="submit"
            >
                Confirm
            </button>
        </view>
    </view>
</template>


<script>
var main, receiver, filter;
export default {
    name: "sign",
    data() {
        return {
            codeQueryTag: false,
            number: "", //HYW1298000418
            list: [],
            loading: false,
            pageNo: 1,
            pageSize: 10,
            total: "",
            btnLoading: false,
            obj: {},
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
        /*页面退出时一定要卸载监听,否则下次进来时会重复，造成扫一次出2个以上的结果*/
        // #ifdef APP
        this.stopScan();
        // #endif
        if (this.list.length) {
            uni.$emit("refresh");
        }
    },

    onLoad(e) {
        if (e?.refCode) {
            // this.obj.refCode=e?.refCode
            this.getBycode(e?.refCode);
        }

        console.log(this.obj);
    },
    methods: {
        add() {
            this.btnLoading = true;
            this.apifn({
                url: "oms/v1/OrderParcelForecast/generateHandoverNo",
                method: "get",
            }).then((res) => {
                uni.navigateTo({
                    url:
                        "/pages/HandoverEdit/HandoverEdit?batchCode=" +
                        res.body,
                });
                this.btnLoading = false;
            });
        },
        initScan() {
            let _this = this;
            main = plus.android.runtimeMainActivity(); //获取activity
            var IntentFilter = plus.android.importClass(
                "android.content.IntentFilter"
            );
            filter = new IntentFilter();
            filter.addAction("android.intent.ACTION_DECODE_DATA"); // 换你的广播动作
            receiver = plus.android.implements(
                "io.dcloud.feature.internal.reflect.BroadcastReceiver",
                {
                    onReceive: function (context, intent) {
                        plus.android.importClass(intent);
                        let code = intent.getStringExtra("barcode_string"); // 换你的广播标签
                        // console.log("我是"+code);
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
            // console.log(code);
            //防重复

            this.getBycode(code);
        },
        del(item, index) {
            // this.obj.parcelCode.splice(index, 1);
            // this.setlocalStorage();
            this.list.splice(index, 1);
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
            this.codeQueryTag = true;
            if (!code.replace(/\s/g, "")) {
                this.codeQueryTag = false;
                return false;
            }
            this.number = code;
            uni.showLoading({
                title: this.$t("loading"),
            });
            this.apifn({
                url:
                    "oms/v1/OrderAbroadDelivery/getDeliveryDetail?refCode=" +
                    code,
                method: "post",
            }).then(
                (res) => {
                    this.codeQueryTag = false;
                    let body = res.body;
                    if (res.body.parcelList.length) {
                        if (this.list.length) {
                            //是否同一个refCode

                            let refCode = this.list.findIndex((item, index) => {
                                if (item.hbl == res.body.hbl) return true;
                            });

                            if (refCode == -1) {
                                body.parcelList.some((item, index) => {
                                    if (code == item.parcelCode) {
                                        body.parcelList[index].isScan = true;
                                        return true;
                                    }
                                });
                                this.list.unshift(res.body);
                            } else {
                                //点亮
                                this.list[refCode].parcelList.some(
                                    (item, index) => {
                                        if (code == item.parcelCode) {
                                            this.list[refCode].parcelList[
                                                index
                                            ].isScan = true;
                                            return true;
                                        }
                                    }
                                );
                                this.$forceUpdate()
                            }
                        } else {
                            //点亮

                            body.parcelList.some((item, index) => {
                                if (code == item.parcelCode) {
                                    body.parcelList[index].isScan = true;
                                    return true;
                                }
                            });
                            this.list.unshift(body);
                        }
                    } else {
                        uni.showToast({
                            title: this.$t("not_data"),
                            icon: "none",
                        });
                    }
                    console.log(this.list);
                    uni.hideLoading();
                    this.playsucc();
                },
                (err) => {
                    this.playfail();
                    this.codeQueryTag = false;
                    uni.hideLoading();
                }
            );
        },
        submit() {
            if (!this.list.length) {
                uni.showToast({
                    title: this.$t("minLength"),
                    icon: "none",
                });
                return false;
            }
            let refCodeList = this.list
                .map((res) => {
                    return res.hbl;
                })
                .join(",");
            //oms/v1/OrderAbroadDelivery/checkScanout?refCodeList="123456","1234"
            //  this.apifn({
            // url: "oms/v1/OrderAbroadDelivery/checkScanout?refCodeList="+refCodeList,
            // method: "post",
            // }).then(res=>{

            // },
            // err=>{

            // }
            // )
            let noScan = this.list.some((res) => {
                let a = res.parcelList.some((item) => {
                    if (!item.isScan) {
                        uni.showModal({
                            title: "hint",
                            cancelText: "cancel",
                            confirmText: "confirm",
                            content: `Please finish scanning the code ${res.hbl}  All the small packages`,
                            success: function (res) {
                                if (res.confirm) {
                                } else if (res.cancel) {
                                }
                            },
                        });
                        return true;
                    }
                });
                if (a) {
                    return true;
                }
            });
            // if (noScan) {
            //     return false;
            // }
            //  let list=this.list.map((res=>{
            //     return
            //  }))
            uni.setStorageSync(
                "signatureDetailDTOList",
                JSON.stringify(this.list)
            );
            uni.navigateTo({
                url: "../signature/signature",
            });
        },
    },
};
</script>



<style  lang='scss'>
.top-box {
    position: relative;
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
.content-box {
    font-size: 31rpx;
    font-weight: 500;
    color: #333333;
    > view {
        margin-bottom: 15rpx;
    }
    .head-box {
        flex-wrap: wrap;
        height: 97rpx;
        background: #ffffff;
        margin-bottom: 12.5rpx;
        padding-left: 38rpx;
    }
    .remove-btn {
        height: 67rpx;
        background: #3882ee;
        border-radius: 9rpx;
        font-size: 38rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
        padding: 0 12rpx;
    }
    .chlld-box {
        background: white;
        color: #999999;
        > view {
            padding-left: 46rpx;
            padding-right: 62rpx;

            > view {
                justify-content: space-between;
                height: 75rpx;
                padding-left: 34rpx;
                padding-right: 120rpx;
            }
        }
        > view:not(:last-child) {
            > view {
                border-bottom: 2rpx solid #ededed;
            }
        }
        .isScan {
            background: #cbddf7;
            color: black;
        }
    }
}
.list-title {
    margin-top: 103rpx;
    padding: 16rpx 0 16rpx 22rpx;

    font-size: 38rpx;
    font-weight: bold;
    color: #3882ee;
}
.blue {
    color: #3882ee;
}
.btn {
    z-index: 999;
    position: fixed;
    top: calc(var(--status-bar-height) + 116rpx);
    background: #f2f2f2;
    padding: 16rpx 0;
    width: 100%;
}
.bottom-btn {
    z-index: 999;
    position: fixed;
    bottom: 10px;
    padding: 20rpx 0;
    width: 100%;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 16rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
</style>