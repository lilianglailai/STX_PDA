<template>
    <view  >
        
     
    </view>
</template>

<script>
export default {
    name: "deliveryOrderList",
    data() {
        return {
         
        };
    },
 
    methods: {
  
        getList(page) {
            this.apifn({
                url: "jeecg-boot/pda/api/v1/findGroupBilLLogList",
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