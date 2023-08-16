<template>
    <view class="router-box">
        <Navigation
            :backShow="false"
            backTitle="菜单(东莞仓)"
            
        ></Navigation>
        
        <view class="content-box flex ">
            <view
                class="flex-a item-box"
                v-for="(item, index) in contentList"
                :key="index"
                @click="go(item)"
            >
                <image :src="item.img" mode="widthFix" :class="{filter: item.disabled}" />
                <view>{{ item.titile }}</view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "home",
    data() {
        return {
            contentList: [
                {
                    img: require("@/static/home/put.png"),
                    url: "/pages/put/put",
                    titile: "入库",
                },
                {
                    img: require("@/static/home/out.png"),
                    url: "/pages/out/out",
                    titile: "出库",
                    // disabled:true
                },
                {
                    img: require("@/static/home/search.png"),
                    url: "/pages/search/search",
                    titile: "查询",
                    
                },
                {
                    img: require("@/static/home/check.png"),
                    url: "/pages/check/check",
                    titile: "盘点",
                    disabled:true
                },
            ],
        };
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

<style  lang='scss'>
.content-box {
    justify-content: space-between;
    padding: 51.5rpx 37.5rpx;
    flex-wrap: wrap;
    .item-box {
        font-size: 47rpx;
        font-weight: bold;
        color: #333333;
        flex-direction: column;
        margin-bottom: 67rpx;
        image {
            width: 176.56rpx;
            margin-bottom: 25rpx;
        }
    }
}
.filter{
        filter: grayscale(1);
}
</style>