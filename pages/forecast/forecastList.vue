<template>
    <div class="top-box">
        <scan v-model="checkCode" @scan="search"></scan>
        <view class="content-box">
            <view v-for="(item, index) in list" :key="index" class="flex">
                <view>
                    <span>{{ index + 1 }}. {{ item.checkCode }}</span>

                </view>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box"> {{ $t("not_data") }} </view>
        <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
            v-if="list.length >= 10 && pageNo * pageSize >= total && !loading">
            ~~~~~~~~{{ $t("not_data") }}~~~~~~~~
        </view>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
    </div>
</template>

<script>
export default {
    name: 'forecastList',
    data() {
        return {
            loading: true,
            list: [],
            pageNo: 1,
            pageSize: 20,
            packNumber: "",
            total: "",
            checkCode: ''
        };
    },
    methods: {
        init() {
            this.pageNo = 1
            this.pageSize = 10
            this.list = []
        },
        search() {
            this.init()
            this.getList()
        },
        getList() {
            this.loading = true
            let data = {
                pageNum: this.pageNo,
                pageSize: this.pageSize
            }

            data.searchValue = this.searchValue

            if (this.checkCode) {
                data.checkCode = this.checkCode
            }
            this.apifn({
                url: `pad/v1/forecastReceipt/getInventoryItemRecordList`,
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
        if (e.searchValue) {
            this.searchValue = e.searchValue
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
        height: 100rpx;
        background: #ffffff;
        padding: 0 30rpx 0 30rpx;
        border-bottom: 1rpx solid #E5E5E5;
        flex-direction: column;
        justify-content: center;
    }
}

.last {
    margin-top: 10rpx;
}
</style>