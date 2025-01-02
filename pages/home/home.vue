<template>
    <view class="router-box">
        <Navigation :backShow="false" backTitle="菜单"></Navigation>
        <view class="content-title orange">{{ $t('home.Storage-module') }}</view>
        <view class="content-box">
            <view class="flex-a" v-for="(item, index) in contentList" :key="index" @click="go(item)">
                <template v-if="item.titile">
                    <view class="item-box" :style="{
                        backgroundColor: item.bj ? item.bj : '#17abf1'
                    }">
                        <image :src="item.img" mode="widthFix" v-if="item.img" :class="{ filter: item.disabled }" />
                    </view>
                    <view class="title">{{ item.titile }}</view>
                </template>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "home",
    data() {
        return {

        };
    },
    computed: {
        contentList() {
            return [
                {
                    img: require("@/static/home/forecast.png"),
                    url: "/pages/forecast/forecast",
                    titile: this.$t("forecast.receipt"),
                },


                {
                    img: require("@/static/home/put.png"),
                    url: "/pages/put/put",
                    titile: "调拨入库",
                },
                {
                    img: require("@/static/home/put.png"),
                    url: "/pages/temporarycounting/temporarycounting",
                    titile: this.$t("temporary.counting"),

                },
                {

                },
                {
                    img: require("@/static/home/forecast.png"),
                    url: "/pages/forecast/forecastdetail",
                    titile: this.$t("forecast.receipt.detail"),
                    bj: "#EDC271"

                },
                {
                    img: require("@/static/home/putdetail.png"),
                    url: "/pages/put/putList",
                    titile: "入库调拨详情",
                    bj: "#EDC271"
                },
                {

                },
                {

                }


            ]
        }
    },
    methods: {
        go(item) {
            if (!item.disabled) {
                uni.navigateTo({
                    url: item.url,
                });
            }
        },
    },
};
</script>

<style lang='scss'>
.content-box {
    display: flex;
    padding: 20rpx 40rpx;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 30rpx;
    // 低配机row-gap不生效
    
    >view {
        // font-weight: bold;
        color: #333333;
        text-align: center;
        flex-direction: column;
        width: 140rpx;
        margin-bottom: 30rpx;
        .item-box {
            width: 140rpx;
            height: 140rpx;
            border-radius: 30rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16rpx;

            image {
                width: 75%;

            }
        }

        .title {
            font-size: 28rpx;
            width: 120rpx;
            line-height: 1.2;
            // word-wrap: break-word;
            word-wrap: break-word;
        }
    }
}

.filter {
    filter: grayscale(1);
}

.content-title {
    height: 76rpx;
    line-height: 76rpx;
    font-size: 36rpx;
    padding: 0px 2px;
    border-radius: 6px;
    margin: 16rpx 20rpx;
    padding-left: 30rpx;
    color: white;
}

.orange {
    background-color: #ffa900;
}
</style>