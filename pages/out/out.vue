<template>
    <view>
        <view class="router-box">
            <Navigation :backTitle="$t('caPai.menu')"></Navigation>

            <button class="submit" @click="add">
                <text class="add"> </text> Create Task
            </button>
            <picker-col ref="pickers" @change="dateChange"></picker-col>
            <view class="content-box">
                <view v-for="(item, index) in list" :key="index">
                    <view class="flex-a top-view" @click="unfold(index)">
                        <view class="flex1">Scanou#:{{ item.scanOut }}</view>
                        <button
                            class="Handover-btn flex-a flex-c"
                            @click.stop="UpdateTask(item, index)"
                        >
                            Update Task
                        </button>
                    </view>
                    <view
                        class="bottom-view flex-a"
                        :class="{ 'search-filter-active': !item.show }"
                    >
                        <view class="flex1">
                            <div>Driver:{{ item.driver }}</div>
                            <div>Rego: {{ item.rego }}</div>
                            <div>HBL Qty: {{ item.hblQty }}</div>
                            <div>Scanout Qty: {{ item.scanOutQty }}</div>
                        </view>
                        <button
                            class="Handover-btn flex-a flex-c"
                            @click.stop="Package(item, index)"
                        >
                            Add Package
                        </button>
                    </view>
                </view>
            </view>
            <uni-load-more
                status="loading"
                :contentText="{ contentrefresh: $t('loading') }"
                v-show="loading"
            ></uni-load-more>
            <view
                style="
                    margin: 10pt 0;
                    color: #999;
                    font-size: 8pt;
                    text-align: center;
                "
                v-if="list.length >= 10 && pageNo == total && !loading"
            >
                ~~~~~~~~In the end~~~~~~~~
            </view>
            <view v-if="!list.length && !loading" class="tips_box">
                {{ $t("not_data") }}
            </view>
        </view>
    </view>
</template>

<script>
import pickerCol from "../../components/pickerCol/pickerCol.vue";
export default {
    components: { pickerCol },
    name: "out",
    data() {
        return {
            btnLoading: false,
            pageNo: 1,
            pageSize: 10,
            total: 0,
            list: [],
            loading: false,
        };
    },
    computed: {},
    created() {
        uni.$on("refresh", (e) => {
            if (e?.refreshPage) { 
                uni.showToast({
                    title: this.$t("loading"), 
                    icon: "none",
                });
                this.getList(e?.refreshPage);
            } else {
                this.pageNo = 1;
                this.list = [];
                this.getList();
            }
        });
    },
    destroyed() {
        uni.$off("refresh");
    },

    onReachBottom() {
        if (this.pageNo < this.total && !this.loading) {
            this.pageNo += 1;
            this.getList();
        }
    },
    mounted() {
        this.getList();
    },
    methods: {
        Package(item) {
            delete item.show;
            uni.navigateTo({
                url:
                    "/pages/out/scan/scan?obj=" +
                    encodeURIComponent(JSON.stringify(item)),
            });
        },
        UpdateTask(item, index) {
            delete item.show;
            uni.navigateTo({
                url:
                    "/pages/out/vehicle/vehicle?obj=" +
                    encodeURIComponent(JSON.stringify(item)) +
                    "&refreshPage=" +
                    Math.ceil((index + 1) / this.pageSize),
            });
        },
        add() {
            uni.navigateTo({
                url: "/pages/out/vehicle/vehicle?type=Create Task",
            });
        },
        unfold(index) {
            if (!this.list[index].show) {
                this.$set(this.list[index], "show", true);
            } else {
                this.list[index].show = !this.list[index].show;
            }
        },
        getList(refreshPage) {
            if (!refreshPage) {
                this.loading = true;
            }
            
            this.apifn({
                url: "oms/v1/OrderAbroadParcel/ListAbroadParcel",
                method: "POST",
                header: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                data: {
                    page: refreshPage ? refreshPage : this.pageNo,
                    pageSize: this.pageSize,
                    createTime: this.$refs.pickers.time,
                    // createTime: "",
                },
            }).then(
                (res) => {
                    if (refreshPage) {
                        this.list.splice(
                            (refreshPage - 1) * this.pageSize,
                            refreshPage ** this.pageSize,
                            ...res?.body.current_data
                        );
                        uni.hideLoading();
                    } else {
                        this.list = this.list.concat(res?.body.current_data);
                     
                    }
                       this.total = res?.body?.total_page;
                        this.loading = false;
                },
                (err) => {
                    this.list = [];
                    this.loading = false;
                }
            );
        },
        dateChange(e) {
            this.list=[]
            this.getList();
        },
    },
};
</script>

<style  lang='scss' scoped>
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
    &::after {
        border: none;
    }
    .add {
        position: relative;
        // width: 38.75rpx;
        margin-right: 64rpx;
        &::before {
            position: absolute;
            content: "";
            width: 4rpx;
            height: 38.75rpx;
            background: white;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &::after {
            content: "";
            width: 38.75rpx;
            height: 4rpx;
            position: absolute;
            background: white;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}

.content-box {
    > view {
        background: white;
        margin-bottom: 12.5rpx;
        padding-right: 17rpx;
        padding-left: 31rpx;
    }
    .top-view {
        padding-top: 28rpx;
        padding-bottom: 18rpx;
    }
    .bottom-view {
        height: 0rpx;
        overflow: hidden;
        transition: all 0.5s;
        box-sizing: border-box;
        > .flex1 {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            height: 100%;
        }
    }
    .search-filter-active {
        height: 270rpx;
    }
    .top-view {
        height: 133rpx;
        position: relative;
        &::after {
            content: "";
            position: absolute;
            height: 2rpx;
            background: #e7e7e7;
            width: calc(100% - 12.5rpx);

            left: 0;
            bottom: 0;
        }
    }
    .Handover-btn {
        height: 84rpx;
        background: #3882ee;
        border-radius: 9rpx;
        font-size: 38rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
        padding-left: 18.75rpx;
        padding-right: 18.75rpx;
    }
}
</style>