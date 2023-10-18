<template>
    <view  >
        
        <view class="content-box" v-if="list.length">
            <view v-for="(item, index) in list" :key="index">
                <view>{{$t("list.oldCode")}}：{{item.oldCode}}</view>
                <view class="artery"><text>{{$t("list.trunk_line")}}：{{item.channelName}}</text> </view>
                <view>{{$t("list.size")}}：{{$t("list.high")}}:{{ item.hth }} CM {{$t("list.length")}}:{{item.lth}}CM {{$t("list.width")}} {{item.wth}} CM </view>
                <view>{{$t("list.weight")}}：{{item.weight}}KG</view>
                <view>{{$t("list.createdDate")}}：{{item.createdDate}}</view>
               
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
             <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
					v-if="list.length>=10&&pageNo * pageSize >=total && !loading">
					~~~~~~~~到底啦~~~~~~~~
				</view>
        <uni-load-more
            status="loading"
            :contentText="{ contentrefresh: $t('loading')  }"
            v-show="loading"
        ></uni-load-more>
    </view>
</template>

<script>
export default {
    name: "list",
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
                url: "jeecg-boot/pda/api/v1/list",
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
        margin-bottom: 19rpx;
        padding: 16rpx 28rpx;
        background: white;
        > view:not(:last-child) {
            margin-bottom: 20rpx;
        }
    }
    .submit {
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
            margin-top: 16rpx;
        }
    }
    
}
</style>