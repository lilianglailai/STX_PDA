<template>
    <view class="router-box">
         <Navigation backTitle="查询"  ></Navigation>
        <view class="content-box" v-if="list.length">
            <view v-for="(item, index) in list" :key="index">
                <view>编码：{{item.conCode}}</view>
              
                <view>尺寸：高:{{ item.hth }} CM 长:{{item.lth}}CM 宽 {{item.wth}} CM </view>
                <view>重量：{{item.weight}}KG</view>
                <view>入库时间：{{item.createdDate}}</view>
                <view class="artery"><text>干线：{{item.channelName}}</text> </view>
                <view class="img-box" v-if="item.img && item.img.length" >
                    <image 
                        v-for="(itemImg, i) in getImg(item.oosUrl)" :key="i" @click="lookImg(getImg(item.oosUrl),i)"
                        :src="itemImg"
                        mode="widthFix"
                        
                    />
                </view>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box"> 暂无数据 </view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: '正在加载中' }"
            v-show="loading"
        ></uni-load-more>
    </view>
</template>

<script>
export default {
    name: "searh",
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
        if (this.pageNo * this.pageSize < this.total && !this.loading) {
            this.loading = true;
            this.pageNo += 1;
            this.getList(this.pageNo);
        }
    },
    methods: {
        getImg(oosUrl){
            return oosUrl.split(',')
        },
        lookImg(url,index=0){
                uni.previewImage({
                urls: url,
                current: index,
            });
        },
        getList(page) {
            this.apifn({
                url: "pda/api/v1/list",
                method: "post",
                data: {
                     pageNo: page ? page : 1,
                     pageSize: page ? 10 : this.pageNo * 10,
                     scanCode: "",
                },
            }).then((res) => {
                      if (page) {
                        this.list = this.list.concat(
                            res?.result?.records
                        );
                    } else {
                        this.list = res?.result?.records;
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
    created() {
        this.getList()
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