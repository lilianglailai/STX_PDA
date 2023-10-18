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
                    @confirm="getBycode(number)"
                />
                <image
                    src="/static/put/put.png"
                    @click="scan"
                    mode="widthFix"
                />
            </view>
            <view class="title-box">
                <view>ScanOunt:{{ obj.scanOutCode }}</view>

                <view> Total packages: {{ totalPackages }} ps </view>
            </view>
        </view>
        <view class="list-title"> </view>

        <view v-if="list.length" class="content-box">
            <view v-for="(item, index) in list" :key="index">
                <view>
                    <view class="content-top-box flex-a">
                        REF#:{{ item.refCode
                        }}<span class="blue"
                            >{{ item.parcelCode.length }}/{{item.pcs || 0}}</span
                        >
                    </view>
                </view>
                <transition-group tag="view" name="list" class="scan-box">
                    <view
                        class="flex-a"
                        v-for="(childItem, i) in item.parcelCode"
                        :key="childItem"
                    >
                        <view>Number：{{ childItem }}</view>
                        <view>
                            <button
                                class="remove-btn flex-a flex-c"
                                @click.stop="del(childItem, index, i)"
                                :disabled="codeQueryTag"
                            >
                                Remove
                            </button>
                        </view>
                    </view>
                </transition-group>
            </view>
        </view>
        <!-- <view v-if="!list.length & !loading" class="tips_box">
            {{ $t("not_data") }}
        </view> -->
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"
        ></uni-load-more>
        <view class="flex-c bottom-btn" v-if="list.length">
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
    name: "scan",
    data() {
        return {
            codeQueryTag: false,
            number: "", //HYW1298000418
            list: [],
            loading: false,
            isUpdate: false,
            btnLoading: false,
            obj: {},
            type: "",
            totalPackages:0
        };
    },
    computed: {
        getParcelCodeList() {
            return this.list.reduce((prev, cur) => {
                return prev + cur.parcelCode.length;
            }, 0);
        },
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
        if (this.isUpdate) {
            uni.$emit("refresh", { pageNo: 1 });
        }
    },

    onLoad(e) {
        if (e.obj) {
            this.obj = JSON.parse(decodeURIComponent(e?.obj));
            console.log(this.obj);
            if (this.obj.scanOut) {
                this.obj.scanOutCode = this.obj.scanOut;
                delete this.obj.scanOut;
                 this.getDetail()
            }
        }
        if (e.type) {
            this.type = e.type;
        }

        if (e.type == "Create Task") {
            this.apifn({
                url: "oms/v1/OrderAbroadParcel/generateAbroadParcelNo",
            }).then((res) => {
                // this.obj.scanOutCode=res.body
                this.$set(this.obj, "scanOutCode", res.body);
            });
        }
    },
    methods: {
        getDetail(){
                this.loading = true;
                this.apifn({
                    url: "oms/v1/OrderAbroadParcel/getScanOutDetail",
                    method: "post",
                    header: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    data: {
                        ScanOutCode: this.obj.scanOutCode,
                    },
                }).then((res) => {
                    // this.obj.scanOutCode=res.body
                    this.loading = false;
                
                    this.totalPackages=res.body.totalPackages
                    // this.list = this.list.concat(res.body.orderInfoList);
                    this.list=res.body.orderInfoList
                });
        },
        del(item, index, i) {
            this.isUpdate = true;
            this.apifn({
                url: "oms/v1/OrderAbroadParcel/removeAbroadParcelCode",
                method: "post",
                data: {
                    ...this.obj,
                    parcelCode: item,
                },
            }).then((res) => {
                uni.showToast({
                    title: res.body,
                });
                this.getDetail()
                // this.list[index].parcelCode.splice(i, 1);
                // if (!this.list[index].parcelCode.length) {
                //     this.list.splice(index, 1);
                // }
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
        submit() {
          
            uni.redirectTo({
                url: "/pages/out/out",
            });
  
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
            let refCode;
            if (this.list.length) {
                refCode = this.list.some((res, index) => {
                    let cldindex = res.parcelCode.findIndex((item, i) => {
                        if (item == code) {
                            refCode = res.refCode;
                            return true;
                        }
                    });

                    if (cldindex != -1) {
                        uni.showToast({
                            title: `number already exists ${refCode} the ${cldindex}`,
                            icon: "none",
                        });
                        this.codeQueryTag = false;
                        return true;
                    }
                });
            }
            if (refCode) {
                return false;
            }
            this.isUpdate = true;
            uni.showLoading({
                title: this.$t("loading"),
            });

            this.apifn({
                url: "oms/v1/OrderAbroadParcel/addAbroadParcelCode",
                method: "post",
                data: {
                    ...this.obj,
                    parcelCode: code,
                },
            }).then((res) => {
                    this.number = "";
                    this.codeQueryTag = false;
                    uni.hideLoading();
                    this.getDetail()
                },
                (err) => {
                    
                     this.codeQueryTag = false;
                    this.getDetail()
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
    font-size: 31rpx;
    padding-bottom: calc(var(--status-bar-height) + 94rpx);
    font-weight: 500;
    color: #333333;
    .content-top-box {
        height: 78rpx;
        background: #cbddf7;
        font-size: 38rpx;
        padding-left: 32rpx;
        padding-right: 19rpx;
        font-weight: 500;
        color: #333333;
        .blue {
            margin-left: 20px;
        }
    }
    .scan-box {
        > view:not(:last-child) {
            position: relative;
            &::after {
                position: absolute;
                content: "";
                width: 641rpx;
                height: 2rpx;
                background: #ededed;
                left: 50%;
                transform: translateX(-50%);
                bottom: 0;
            }
        }
        > view {
            display: flex;
            justify-content: space-between;
            padding-left: 32rpx;
            padding-right: 19rpx;
            padding: 20rpx 19rpx 20rpx 32rpx;
        }
    }
    > view {
        background: #ffffff;
        margin-bottom: 12.5rpx;
    }
    .remove-btn {
        height: 67rpx;
        background: #3882ee;
        border-radius: 9rpx;
        font-size: 38rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
        padding-left: 12rpx;
        padding-right: 12rpx;
    }
}
.list-title {
    margin-top: 270rpx;

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
    .title-box {
        margin-top: 16rpx;
        background: white;
        padding: 16rpx 51rpx;
        font-size: 38rpx;
        font-weight: 500;
        color: #333333;
        > view:not(:last-child) {
            margin-bottom: 20rpx;
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