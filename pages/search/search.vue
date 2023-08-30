<template>
    <view class="router-box">
         <Navigation :backTitle="$t('search')"  ></Navigation>
             <List ref="list"></List>
    </view>
</template>

<script>
import List from "@/components/list/list.vue";
export default {
    name: "searh",
     components: { List },
    data() {
        return {
            list:[],
            loading: true,
            pageNo:1,
            pageSize:10,
            total:"",
        };
    },
   onReachBottom() {
         let _this=  this.$refs.list
        if (_this.pageNo * _this.pageSize < _this.total && !_this.loading) {
            _this.loading = true;
            _this.pageNo += 1;
            _this.getList(_this.pageNo);
        }
    },
   
};
</script>

<style  lang='scss'>
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
           margin-right: 26rpx;
            margin-bottom: 26rpx;
        }
    }
}
</style>