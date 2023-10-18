<template>
    <view class="router-box">
        <Navigation :backTitle="$t('Handover.title')"></Navigation>
        <view class="btn">
            <view class="top-box">
                <uni-easyinput
                    type="text"
                    :placeholder="$t('Handover.placeholder')"
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
            <button
                class="submit"
                @click="add"
                :loading="btnLoading"
                :disabled="btnLoading"
            >
                <text class="add"> </text> 新增交接单
            </button>
        </view>
        <view class="list-title">{{ $t("record") }}</view>
        <view v-if="list.length">
            <view class="content-box">
                <view
                    v-for="(item, index) in list"
                    :key="index"
                    class="flex-a"
                    @click="go(item)"
                >
                    <view class="flex1">
                        <view class="black_title"
                            >交接单号：{{ item.batchCode }}</view
                        >
                        <view
                            >预报件数：
                            <text class="blue">{{
                                item.parcelForecastCounts
                            }}</text
                            >{{ $t("deliveryOrderList.piece") }}
                        </view>
                        <view
                            >实际交接件数：<text class="blue">{{
                                item.parcelCounts
                            }}</text>
                            {{ $t("deliveryOrderList.piece") }}
                        </view>
                    </view>
                    <image
                        src="@/static/Handover/right_arrows.png"
                        mode="widthFix"
                        style="width: 25rpx; margin-left: 10rpx"
                    />
                </view>
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
        <uni-popup ref="popup" class="handover-popup">
            <view class="box">
                <view class="title"> 提示 </view>
                <view class="main-text">单号不存在，是否新增交接单?</view>
                <view class="btn-box flex">
                    <button
                        class="confirm-bnt flex-a flex-c"
                        @click="popConfirm"
                    >
                        确定
                    </button>
                    <button class="cancel-bnt flex-a flex-c" @click="popCancel">
                        取消
                    </button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>


<script>
var main, receiver, filter;
export default {
    name: "Handover",
    data() {
        return {
            codeQueryTag: false,

            number: "", //HYW1298000418
            list: [],
            loading: true, //单独控制loading，别放在方法里面。uni.$emit的时候不需要loading
            pageNo: 1,
            pageSize: 10,
            total: 0,
            btnLoading: false,
        };
    },
    created: function (option) { 
        this.getList();
        uni.$on("refresh", () => {
            this.number = "";
            this.list = [];
            this.loading = true;
            this.pageNo = 1;
            this.getList();
        });
    },
    // watch: {
    //     codeQueryTag(val) {
    //         console.log(val);
    //     },
    // },
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
        this.stopScan();

        uni.$off("refresh");
    },
    onReachBottom() {
        if (this.pageNo * this.pageSize < this.total && !this.loading) {
            this.loading = true;
            this.pageNo += 1;
            this.getList(this.pageNo);
        }
    },
    methods: {
        popConfirm() {
            this.number = "";
            this.add();
            this.codeQueryTag = false;
            this.$refs.popup.close();
        },
        popCancel() {
            this.$refs.popup.close();
            this.codeQueryTag = false;
        },
       
        go(item) {
            uni.navigateTo({
                url:
                    "/pages/HandoverEdit/HandoverEdit?batchCode=" +
                    item.batchCode,
            });
        },
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
            //防重复
      
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
                url:
                    "oms/v1/OrderParcelForecast/checkBatchCode?checkCode=" +
                    code,
                method: "post",
            }).then(
                (res) => {
                    this.number = "";
                    this.codeQueryTag = false;
                    uni.hideLoading();
                    this.playsucc()
                    uni.navigateTo({
                        url:
                            "/pages/HandoverEdit/HandoverEdit?batchCode=" +
                            code,
                    });
                },
                (err) => {
                    this.playfail()
                    this.$refs.popup.open();
                    uni.hideLoading();
                }
            );
        },
        getList(page) {
            this.apifn({
                url: "oms/v1/OrderParcelForecast/listDailyHandOverNo",
                method: "get",
                // data: {
                //     pageNo: page ? page : 1,
                //     pageSize: page ? 10 : this.pageNo * 10,
                //     scanCode: "",
                // },
            }).then(
                (res) => {
                    if (page) {
                        this.list = this.list.concat(res?.result?.body);
                    } else {
                        this.list = res?.body;
                        uni.hideLoading();
                    }

                    this.total = res?.result?.total;
                    this.loading = false;
                },
                (err) => {
                    this.loading = false;
                }
            );
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
    font-size: 38rpx;
    font-weight: 500;
    color: #999999;

    .flex1 > view:not(:last-child) {
        margin-bottom: 20rpx;
    }
    > view {
        margin-top: 15.6rpx;
        padding: 25rpx 50rpx 25rpx 37rpx;
        background: white;
    }
    .black_title {
        font-size: 38rpx;
        font-weight: 500;
        color: #333333;
    }
   
    
}
.list-title {
    margin-top: 217rpx;
    padding: 16rpx 0 16rpx 22rpx;
    height: 36rpx;
    font-size: 38rpx;
    font-weight: bold;
    color: #3882ee;
}
.blue {
    color: #3882ee;
}
.btn {
    z-index: 9;
    position: fixed;
    top: calc(var(--status-bar-height) + 116rpx);
    background: #f2f2f2;
    padding: 16rpx 0;
    width: 100%;
    .add {
        position: relative;
        // width: 38.75rpx;
        margin-right: 64rpx;
        &::before {
            position: absolute;
            content: "";
            width: 4rpx;
            height: 38.75rpx;
            background: white;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &::after {
            content: "";
            width: 38.75rpx;
            height: 4rpx;
            position: absolute;
            background: white;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin-top: 16rpx;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;

    &::after {
        border: none;
    }
}
.handover-popup {
    .box {
        width: 713rpx;
        height: 470rpx;
        background: #ffffff;
        border-radius: 9rpx;
        overflow: auto;
        .title {
            font-size: 50rpx;
            font-weight: 800;
            color: #3882ee;
            text-align: center;
            margin-top: 52rpx;
            margin-bottom: 72rpx;
        }
        .main-text {
            font-size: 38rpx;
            font-weight: 800;
            color: #666666;
            margin-bottom: 76rpx;
            text-align: center;
        }
        .btn-box {
            width: 597rpx;
            margin: 0 auto;
            justify-content: space-between;
            > button {
                width: 283rpx;
                height: 84rpx;
                border-radius: 9rpx;
                font-size: 47rpx;
                font-weight: 500;
                color: #3882ee;
                &::after {
                    border: none;
                }
            }
            .confirm-bnt {
                color: white;
                background: #3882ee;
            }
            .cancel-bnt {
                background: white;
                border: 2px solid #3882ee;
            }
        }
    }
}
</style>