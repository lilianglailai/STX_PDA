<template>
    <div class="top-box">
        <div class="flex-a" style="margin: 0 10rpx;">
            <uni-easyinput class="scan-input flex1" v-model="packNumber" placeholder="请输入包裹号"
                @confirm="search()"></uni-easyinput>
            <button class="scan-submit" @click="search()">{{$t('search')}}</button>
        </div>

        <view class="content-box">
            <view v-for="(item, index) in list" :key="index" class="flex">

                <view class="code flex" style="justify-content: space-between;">
                    <span>{{ item.batchCode }}</span> <span>{{ item.createTime }}</span>
                </view>
                <view class="last  flex">
                        <span>包裹号:{{ item.packNumber }}</span>

                 </view>





            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box"> 暂无更多数据 </view>
        <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
            v-if="list.length >= 10 && pageNo * pageSize >= total && !loading">
            ~~~~~~~~到底啦~~~~~~~~
        </view>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
    </div>
</template>

<script>
export default {
    name: 'putdetailList',
    data() {
        return {
            loading: true,
            list: [],
            pageNo: 1,
            pageSize: 10,
            packNumber: "",
            total: ""
        };
    },
    methods: {
        search() {
            this.list = []
            this.pageNo = 1;
            this.getList()
        },
        getList() {
            this.loading = true
            let data = {
                pageNum: this.pageNo,
                pageSize: this.pageSize
            }
            if (this.batchCode) {
                data.batchCode = this.batchCode
            }
            if (this.packNumber) {
                data.packNumber = this.packNumber
            }
            this.apifn({
                url: "api/abroadDepot/checkRecord/packExitScanningList",
                method: "get",
                data: data
            }).then(res => {
                this.list = this.list.concat(res.rows)
                this.loading = false
                this.total = res.total
            })
        },
    },
    onLoad(e) {
        if (e.id) {
            this.batchCode = e.id
        }
        this.getList()

    }
}
</script>
 
<style lang="scss" scoped>
.top-box {
    position: relative;
    margin-top: 10px;
}

 

.content-box {
    margin-top: 30rpx;

    >view {
        height: 133rpx;
        background: #ffffff;
        padding: 0 60rpx 0 30rpx;
        margin-bottom: 12.5rpx;
        margin-left: 10rpx;
        margin-right: 10rpx;
        border-radius: 16rpx;
        box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
        flex-direction: column;
        justify-content: center;
    }
}
.last{
    margin-top: 10rpx;
}
</style>