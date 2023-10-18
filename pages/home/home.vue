<template>
    <view class="router-box">
        <Navigation
            :backShow="false"
            backTitle="菜单(深圳仓)"
            
        ></Navigation>
        
        <view class="content-box">
            <view
                class="flex-a item-box"
                v-for="(item, index) in contentList"
                :key="index"
                @click="go(item)"
            >
                <image :src="item.img" mode="widthFix" v-if="item.img" :class="{filter: item.disabled}" />
                <view class="title">{{ item.titile }}</view>
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
                    titile: this.$t('home.list.put'),
                },
                {
                    img: require("@/static/home/out.png"),
                    url: "/pages/out/out",
                    titile:  "Scan Out",
                    
                },
                 {titile:"Signature",url:'/pages/caPai/caPai', img: require("@/static/home/caPai.png") },
                {
                    img: require("@/static/home/search.png"),
                    url: "/pages/search/search",
                    titile: this.$t('home.list.search'),
                    
                },
                {
                    img: require("@/static/home/check.png"),
                    url: "/pages/check/check",
                    titile: this.$t('home.list.check'),
                    disabled:true
                },
                {
                    img: require("@/static/home/deliveryOrder.png"),
                    url: "/pages/deliveryOrder/deliveryOrder",
                    titile: this.$t('home.list.deliveryOrder'),
                    
                },
                
                  {titile:this.$t('home.list.Handover'),url:'/pages/Handover/Handover', img: require("@/static/home/Handover.png")},
                   {titile:this.$t('home.list.stuffing'), img: require("@/static/home/stuffing.png"),   url: "/pages/stuffing/stuffing"},
                {titile:this.$t('setup'),url:'/pages/set/set', img: require("@/static/home/set.png")},
               
                // {titile:this.$t('setup'),url:'/pages/cs/cs', img: require("@/static/home/set.png")},
                
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
    // display: grid; 老板安卓机，不支持
    // grid-template-columns: 1fr 1fr 1fr;
    display:  flex;
    justify-content: space-between;
    // column-gap: 73rpx;
    padding: 51.5rpx 21rpx;
    flex-wrap: wrap;
    .item-box {
        font-size: 47rpx;
        font-weight: bold;
        color: #333333;
        flex-direction: column;
        margin-bottom: 67rpx;
        width: 214rpx;
        image {
            width: 176.56rpx;
            margin-bottom: 25rpx;
        }
        .title{
            text-align: center;
              
        }
    }
}
.filter{
        filter: grayscale(1);
}
</style>