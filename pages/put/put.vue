<template>
    <view class="router-box">
        <Navigation :backTitle="$t('submit')"></Navigation>
        <view class="top-box">
            <uni-easyinput
                :focus="true"
                type="text"
                :placeholder="$t('put.placeholder')"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getConfirm(number)"
            />
            <image src="/static/put/put.png" @click="scan" mode="widthFix" />
        </view>
        <view class="list-title">{{ $t("record") }}</view>
        <List ref="list"></List>
    </view>
</template>

<script>
var main, receiver, filter;
var _codeQueryTag = false;
import List from "@/components/list/list.vue";
export default {
    components: { List },
    name: "put",
    data() {
        return {
            // show: false,
            codeQueryTag: false,
            list: [],
            number: "", //HYW1298000418
        };
    },
    created: function (option) {
        // this.show = true
        uni.$on("refresh", () => {
            this.number = "";
            let _this = this.$refs.list;
             _this.loading = true;
            _this.pageNo = 1;
           _this.getList();
            
        });
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
        uni.$off("refresh");
    },
    onReachBottom() {
        let _this = this.$refs.list;
        if (_this.pageNo * _this.pageSize < _this.total && !_this.loading) {
            _this.loading = true;
            _this.pageNo += 1;
            _this.getList(_this.pageNo);
        }
    },
    methods: {
          getConfirm(code) {
            if (this.codeQueryTag) return false;
            this.getBycode(code);
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
        queryCode (code) {
            //防重复
            if (this.codeQueryTag) return false;
             this.codeQueryTag
           
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
            uni.showLoading({
                title: "加载中",
            });
            this.apifn({
                url: "jeecg-boot/pda/api/v1/findChannelNameByCode",
                method: "post",
                data: {
                    code: code,
                },
            }).then(
                (res) => {
                    this.codeQueryTag = false;
                    if (res.result) {
                        let obj = {};
                        obj.scanCode = code;
                        obj.channelName = res.result.channelName;
                        if (res.result.goodSize) {
                            obj.update = true;
                            obj = {
                                ...obj,
                                ...res.result.goodSize,
                            };
                        }
                        uni.hideLoading();
                        this.$store.commit("setputObj", obj);
                        // #ifdef APP
                        this.stopScan();
                        // #endif
                        uni.navigateTo({
                            url: "/pages/putAdd/putAdd",
                        });
                    } else {
                        const innerAudioContext = uni.createInnerAudioContext();
                        innerAudioContext.autoplay = true;
                        innerAudioContext.src = `https://tts.baidu.com/text2audio.mp3?tex=${this.$t(
                            "put.err"
                        )}&cuid=baike&amp&lan=ZH&amp&ctp=1&amp&pdt=301&amp&vol=100&amp&rate=32&amp`;
                        
                        innerAudioContext.onPlay(() => {});
                        uni.showToast({
                            title: this.$t("put.err"),
                            icon: "none",
                        });
                    }
                },
                (err) => {
                    this.codeQueryTag = false;
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
 
.list-title {
    padding: 16rpx 0 16rpx 22rpx;
    height: 36rpx;
    line-height: 36rpx;
    font-size: 38rpx;
    font-weight: bold;
    color: #3882ee;
}
</style>