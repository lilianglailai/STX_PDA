<template>
    <view  >
        
        <view class="content-box" v-if="list.length">
            <view v-for="(item, index) in list" :key="index">
                <view>{{$t("list.oldCode")}}：{{item.oldCode}}</view>
                <view  >ref_code：{{item.refCode}} </view>
                <view>{{$t("deliveryOrderList.replacement")}}：<text class="number">{{item.num}}</text>{{$t("deliveryOrderList.piece")}}  </view>
                <view>{{$t("deliveryOrderList.Change_time")}}：{{item.createTime}}</view>
              
               
                <view class="img-box" v-if="item.img && item.img.length" >
                    <image 
                        v-for="(itemImg, i) in getImg(item.oosUrl)" :key="i" @click="lookImg(getImg(item.oosUrl),i)"
                        :src="itemImg"
                        mode="widthFix"
                        
                    />
                </view>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box"> {{$t("not_data")}} </view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading')  }"
            v-show="loading"
        ></uni-load-more>
    </view>
</template>

<script>
export default {
    name: "deliveryOrderList",
    data() {
        return {
            list:[],
            loading: true,
            pageNo:1,
            pageSize:10,
            total:"",
        };
    },
 
    methods: {
        getImg(oosUrl){
            return oosUrl? oosUrl.split(',') :[]
        },
        lookImg(url,index=0){
                uni.previewImage({
                urls: url,
                current: index,
            });
        },
        getList(page) {
            this.apifn({
                url: "pda/api/v1/findGroupBilLLogList",
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
        margin-top: 19rpx;
        padding: 16rpx 28rpx;
        background: white;
        > view:not(:last-child) {
            margin-bottom: 20rpx;
        }
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
            margin-top: 16rpx;
        }
    }
}
</style>