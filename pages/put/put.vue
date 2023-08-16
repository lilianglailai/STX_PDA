<template>
    <view class="router-box">
        <Navigation backTitle="提交"  ></Navigation>
        <view class="top-box">
           <uni-easyinput
                :focus="true"
                type="text"
                placeholder="请输入或扫描客户单号"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getBycode(number)"
            />
            <image src="/static/put/put.png" @click="scan" mode="widthFix" />
        </view>
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
            isSearch: false,
            list: [],
            number: "", //HYW1298000418
        };
    },
    created: function (option) {
       
         uni.$on("refresh", () => {
            this.number = ""
            this.$refs.list.getList()
        });
        
    },
    onShow(){
        this.initScan();
        this.startScan();
    },
    onHide(){
        this.stopScan();
    },
    destroyed: function () {
          
        /*页面退出时一定要卸载监听,否则下次进来时会重复，造成扫一次出2个以上的结果*/
        this.stopScan();
     
        uni.$off("refresh");
    },
      onReachBottom() {
        let _this=  this.$refs.list
        if (_this.pageNo * _this.pageSize < _this.total && !_this.loading) {
            _this.loading = true;
            _this.pageNo += 1;
            _this.getList(_this.pageNo);
        }
    },
    methods: {
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
        queryCode: function (code) {
            //防重复
            if (_codeQueryTag) return false;
            _codeQueryTag = true;
            setTimeout(function () {
                _codeQueryTag = false;
            }, 150);
            this.number = code;
            this.getBycode(code);
        },

        sumbit() {
            uni.navigateTo({
                url: "/pages/putAdd/putAdd",
            });
        },
        scan() {
            if (this.isSearch) {
                return false;
            }

            uni.scanCode({
                success: (res) => {
                    this.isSearch = true;
                    this.getBycode(res.result);
                },
            });
        },
        getList() {
            this.apifn({
                url: "pda/api/v1/list",
                method: "post",
                data: {
                    code: "/pda/api/v1/list",
                },
            }).then((res) => {
                if (res.result) {
                } else {
                    uni.showToast({
                        title: res.message,
                        icon: "none",
                    });
                }
            });
        },
        getBycode(code) {
            uni.showLoading({
                title: "加载中",
            });
            this.apifn({
                url: "pda/api/v1/findChannelNameByCode",
                method: "post",
                data: {
                    code: code,
                },
            }).then(
                (res) => {
                    if (res.result ) {
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
                        this.$store.commit("setputObj",obj)
                        this.stopScan();
                        uni.navigateTo({
                            url:"/pages/putAdd/putAdd" 
                        });
                    } else {
                        const innerAudioContext = uni.createInnerAudioContext();
                    innerAudioContext.autoplay = true;
                    innerAudioContext.src ="https://tts.baidu.com/text2audio.mp3?tex=%22%E5%8D%95%E5%8F%B7%E4%B8%8D%E5%AD%98%E5%9C%A8%22&cuid=baike&amp&lan=ZH&amp&ctp=1&amp&pdt=301&amp&vol=100&amp&rate=32&amp"
                         
                    innerAudioContext.onPlay(() => {});
                        uni.showToast({
                            title: "此单号未在系统下单",
                            icon: "none",
                        });
                    }
                },
                (err) => {
                    this.isSearch = false;
                   
                }
            );
        },
    },
};
</script>

<style  lang='scss'>
.top-box {
    position: relative;
    /deep/ .is-input-border{
        border: unset !important;
    }
    /deep/ .uni-easyinput__content-input {
        height: 103rpx;
        background: #ffffff;
        font-size: 38rpx;
       
       
    }
    /deep/.content-clear-icon{
         padding-right:  160rpx !important;
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
    color: #333333;
    > view {
        margin-top: 15.6rpx;
        padding: 16rpx 28rpx;
        background: white;
        > view:not(:last-child) {
            margin-bottom: 20rpx;
        }
    }
    .sumbit {
        width: 714rpx;
        height: 84rpx;
        background: #3882ee;
        border-radius: 6px;
        margin: 16rpx auto 0;
        font-size: 47rpx;
        line-height: 84rpx;
        font-weight: bold;
        color: #ffffff;
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
</style>