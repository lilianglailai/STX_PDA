<template>
    <view class="router-box">
        <Navigation backTitle="装柜"></Navigation>

        <view class="top-box">
            <button
                :style="{ marginTop: !list.length ? '100rpx' : '0' }"
                class="submit"
                @click="add"
                :loading="btnLoading"
                :disabled="btnLoading"
            >
                装柜
            </button>
        </view>

        <view v-if="list.length">
            <view class="list-title">{{ $t("record") }}</view>
            <view class="content-box">
                <view
                    v-for="(item, index) in list"
                    :key="index"
                    class="flex-a"
                    @click="go(item)"
                >
                    <view class="flex1">
                        <view class="black_title"
                            >出库单号：{{ item.outNo }}</view
                        >

                        <view class="black_title"
                            >已装柜：<text class="blue">{{ item.pcs }}</text>
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
        </view>
        <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
					v-if="list.length>=10&&pageNo * pageSize >=total && !loading">
					~~~~~~~~到底啦~~~~~~~~
				</view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"
        ></uni-load-more>
    </view>
</template>


<script>
export default {
    name: "stuffing",
    data() {
        return {
             
            number: "", //HYW1298000418
            list: [],
            loading: true,  
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

    destroyed: function () {
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
        go(item) {
            uni.navigateTo({
                url:
                    "/pages/stuffing/stuffingScan?obj=" +
                    encodeURIComponent(JSON.stringify(item)),
            });
        },
        add() {
            uni.navigateTo({
                url: "/pages/stuffing/stuffingDetail",
            });
        },

        
        getList(page) {
            this.apifn({
                url: `oms/v1/OrderWmsOut/getPageList?pageNo=${
                    page || 1
                }&pageSize=${this.pageSize}`,
                method: "post",
            }).then(
                (res) => {
                    if (page) {
                        this.list = this.list.concat(res?.body?.datas);
                    } else {
                        this.list = res?.body?.datas;
                        uni.hideLoading();
                    }

                    this.total = res?.body?.sumDataCount;
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
    padding: 16rpx 0 16rpx 22rpx;
    height: 36rpx;
    font-size: 38rpx;
    font-weight: bold;
    color: #3882ee;
}
.blue {
    color: #3882ee;
}
// .btn {
//     z-index: 999;
//     position: fixed;
//     top: calc(var(--status-bar-height) + 116rpx);
//     background: #f2f2f2;
//     padding: 16rpx 0;
//     width: 100%;
//     .add {
//         position: relative;
//         // width: 38.75rpx;
//         margin-right: 64rpx;
//         &::before {
//             position: absolute;
//             content: "";
//             width: 4rpx;
//             height: 38.75rpx;
//             background: white;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//         }
//         &::after {
//             content: "";
//             width: 38.75rpx;
//             height: 4rpx;
//             position: absolute;
//             background: white;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//         }
//     }
// }
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