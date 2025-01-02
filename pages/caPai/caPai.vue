<template>
    <view class="router-box">
        <Navigation :backTitle="$t('put.title')"></Navigation>
        <view class="top-box">
            <uni-easyinput
                :focus="true"
                type="text"
                :placeholder="'Please enter or scan the package'"
                placeholder-class="placeholder"
                v-model="number"
                @confirm="getBycode(number)"
            />
            < src="/static/put/put.png" @click="scan" mode="widthFix" />
        </view>
        <picker-col ref="pickers"  @change="list=[]; getList()"></picker-col>
            <view v-if="list.length">
            <view class="content-box">
                <view
                    v-for="(item, index) in list"
                    :key="index"
                    
                    @click="go(item)"
                >
                    
                        <view class="black_title flex" style="justify-content: space-between;"
                            >
                            <view> HBL:{{ item.hbl }}</view>
                            <view> QTY:{{ item.preNum }}/{{ item.realNum }}</view>
                           </view
                        >
                        <view
                            > 
                           {{ item.eventDesc}}
                        </view>
                     
                  
                
                </view>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box">
            {{ $t("not_data") }}
        </view>
         <view
                style="
                    margin: 10pt 0;
                    color: #999;
                    font-size: 8pt;
                    text-align: center;
                "
                v-if="list.length >= 10 && pageNo == total && !loading"
            >
                ~~~~~~~~In the end~~~~~~~~
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

import PickerCol from '@/components/pickerCol/pickerCol.vue';
export default {
    components: { PickerCol },
    name: "caPai",
    data() {
        return {
            // show: false,
            codeQueryTag: false,
            
            number: "", 
            list: [],
            loading: false, //单独控制loading，别放在方法里面。uni.$emit的时候不需要loading
            pageNo: 1,
            pageSize: 10,
            total: "",
        };
    },
    mounted() {
        // this.show = true
        
          this.getList();
         uni.$on("refresh", (e) => {
            if (e?.refreshPage) { 
                uni.showToast({
                    title: this.$t("loading"), 
                    icon: "none",
                });
                this.getList(e?.refreshPage);
            } else {
                this.pageNo = 1;
                this.list = [];
                this.getList();
            }
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
       
        if (this.pageNo * this.pageSize < this.total && !this.loading) {
            
            this.pageNo += 1;
            this.getList();
        }
    },
    methods: {
        go(){
            
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
             
            this.getBycode(code);
        },
           getList(refreshPage) {
            if (!refreshPage) {
                this.loading=true
            }
            this.apifn({
                url: `oms/v1/OrderAbroadDelivery/ListDelivery?page=${ refreshPage ?refreshPage : this.pageNo}&pageSize=${this.pageSize}&createTime=${this.$refs.pickers.time}`,
                method: "POST",
                
            }).then(
                (res) => {
                    if (refreshPage) {
                        this.list.splice(
                            (refreshPage - 1) * this.pageSize,
                            refreshPage ** this.pageSize,
                            ...res?.body?.current_data
                        );
                        uni.hideLoading();
                    } else {
                        this.list = this.list.concat(res?.body?.current_data);
                  
                    }

                    this.total = res?.result?.total_page;
                    this.loading = false;
                },
                (err) => {
                    this.loading = false;
                }
            );
        },
        scan() {
          
            uni.scanCode({
                success: (res) => {
                    this.getBycode(res.result);
                },
            });
        },

        getBycode(code) {
           uni.navigateTo({
             url: '/pages/caPai/sign/sign?refCode='+code
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
     {
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
        margin-bottom: 19rpx;
        padding: 18rpx 35rpx;
        background: white;
        > view:not(:last-child) {
            margin-bottom: 24rpx;
        }
    }
}
</style>