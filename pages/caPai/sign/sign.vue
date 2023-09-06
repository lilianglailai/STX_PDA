<template>
    <view class="router-box">
        <Navigation :backTitle="$t('Handover.title')"></Navigation>
          <view class="btn">
        <view class="top-box">
            <uni-easyinput
                :focus="true"
                type="text"
                :placeholder="$t('Handover.placeholder')"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getConfirm(number)"
            />
            <image src="/static/put/put.png" @click="scan" mode="widthFix" />
          
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
        <view class="content-box" v-if="list.length">
            <view v-for="(item, index) in list" :key="index" class="flex-a" @click="go(item)">
                <view class="flex1">
                    <view class="black_title"
                        >交接单号：{{ item.batchCode }}</view
                    >
                    <view
                        >预报件数：
                        <text class="blue">{{ item.parcelForecastCounts }}</text
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
        <view v-if="!list.length & !loading" class="tips_box">
            {{ $t("not_data") }}
        </view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"
        ></uni-load-more>
      
    </view>
</template>


<script>
var main, receiver, filter;
export default {
    name: "sign",
    data() {
        return {
            codeQueryTag: false,
            codeQueryTag: false,
            number: "", //HYW1298000418
            list: [],
            loading: false, //单独控制loading，别放在方法里面。uni.$emit的时候不需要loading
            pageNo: 1,
            pageSize: 10,
            total: "",
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
    onShow() {
        // #ifdef APP
        this.initScan();
        this.startScan();
        // #endif
    },
    onHide() {
        
        this.stopScan();
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
         getConfirm(code) {
            if (this.codeQueryTag) return false;
            this.getBycode(code);
        },
        go(item){ 
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
            if (this.codeQueryTag) return false;
            this.codeQueryTag = true;
            setTimeout(() => {
                 this.codeQueryTag = false;
            }, 1000);
        
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

        getBycode(code) {
            console.log(code);
            uni.showLoading({
                title: "加载中",
            });
            this.apifn({
                url:
                    "oms/v1/OrderParcelForecast/checkBatchCode?checkCode=" + code,
                method: "post",
            }).then(
                (res) => {
                     this.number=""
                    this.codeQueryTag = false;
                    uni.hideLoading();
                    uni.navigateTo({
                        url:
                            "/pages/HandoverEdit/HandoverEdit?batchCode=" +
                            code,
                    });
                },
                (err) => {
                    console.log("err"+err);
                    this.codeQueryTag = false;
                    uni.hideLoading();
                    uni.showModal({
                        title: "提示",
                        content: err.msg + "是否新增交接单",
                        success:  (res)=> {
                            if (res.confirm) {
                                 this.number=""
                                 this.add()
                            } else if (res.cancel) {
                                
                            }
                        },
                    });
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
                        this.list = this.list.concat(res?.result?.records);
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
    .artery {
        display: flex;
        justify-content: space-between;
        .right {
            font-size: 38rpx;
            font-weight: bold;
            color: #a4a4a4;
        }
    }
    .img-box {
        display: flex;
        flex-wrap: wrap;
        image {
            width: 125.47rpx;
            margin: 26rpx;
        }
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
    z-index: 999;
    position: fixed;
    top:  calc(var(--status-bar-height) + 116rpx);
       background: #F2F2F2;
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
</style>