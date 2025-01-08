<template>
    <view class="forecastAdd">
        <!-- <button @click="cs">cs</button> -->
        <view class="flex-c">
            <view class="data-box ">
                <view>{{ $t("lpn.model") }}：{{ obj.model }}</view>
                <view class=" flex-a" style="width: 80vw;">{{ $t('forecastLpn.clientNum') }}：
                    <view class="flex1">
                        <view>{{ obj.clientName }}</view>
                    </view>
                </view>

                <view>{{ $t("quantity") }}:{{ list.length }}</view>
            </view>
        </view>

        <scan ref="scan" v-model="number" @scan="getBycode"></scan>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.checkCode">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code" :class="{ highlight: item.id }">{{ item.checkCode }}</view>
                    <view v-if="item.model"> {{ $t('lpn.model') }}:{{ item.model }} </view>
                </view>
                <button class="cancel flex-a flex-c" @click="del(item, index)">
                    {{ $t('cancel') }}
                </button>
            </view>
        </transition-group>
        <view class="confirm-box" v-if="DisabledBtn">
            <button @click="submit" :loading="sumloading" :disabled="sumloading"> {{ $t('lpn.lpnmakeinventory_submit')
                }}</button>
        </view>

    </view>
</template>

<script>

export default {
    name: 'lpnmakeinventory',
    data() {
        return {
            trackingCode: '',
            sumloading: false,
            existclient: '',
            clientId: '',
            clientName: '',
            clientList: [],
            obj: {

            },
            id: '',
            isrefresh: false,
            list: [

            ],
            loading: false,
            DisabledBtn: true,
            number: "",
            total: 0,
            pageNo: 1,
            pageSize: 10,
        };
    },
    onShow() {
        // #ifdef APP 
        setTimeout(() => {
            this.$refs.scan.startScan();
        }, 0);

        // #endif
    },
    onHide() {
        // #ifdef APP
        this.$refs.scan.stopScan();
        // #endif
    },
    onReachBottom() {
        if (this.pageNo * this.pageSize < this.total && !this.loading) {
            this.pageNo += 1;
            this.getList(this.pageNo);
        }
    },
    methods: {
        getList(page) {
            let data = {
                palletContainerId: this.obj.palletContainerId,
                pageNum: page ? page : 1,
                pageSize: page ? this.pageSize : this.pageNo * this.pageSize,
                productId: this.obj.productId
            }
            if (this.number) {
                data.checkCode = this.number
            }
            this.loading = true
            this.apifn({
                url: `pad/v1/lpnStorageRecord/list`,
                data: data
            }).then(res => { 
                this.total = res.total 
                if (page) {
                    this.list = this.list.concat(res.rows);
                } else {
                    this.list = res.rows
                }
                this.loading = false
            },
                err => {
                    this.loading = false
                }
            )
        },
        getBycode(code) {

            if (!code.replace(/\s/g, "")) {
                return false;
            }
            if (this.codeQueryTag) return false;

            let params = 'checkCode'
            let index = this.list.findIndex(res => res[params] == code)
            if (index != -1) {
                index = index + 1;
                uni.showToast({
                    title: this.$t('numberDuplication', { num: index }),
                    duration: 1500,
                    icon: "none",
                });
                return false
            }
            this.codeQueryTag = true
            let obj = {}
            obj[params] = code
            this.list.unshift(obj)
            this.playsucc()
            this.codeQueryTag = false;
        },
        async submit() {
            let params = 'checkCode'
            let list = this.list.filter(res => res[params] && !res.id).map(res => res[params])
            if (!list.length) {
                uni.showToast({
                    title: this.$t('minLength'),
                    icon: "none",
                });
                return
            }
            this.sumloading = true
            try {
                let res = await this.apifn({
                    url: "pad/v1/lpnStorageRecord/lpnStorage",
                    method: "post",
                    data: {
                        palletContainerId: this.obj.palletContainerId,
                        productId: this.obj.productId,
                        checkCodes: list.join(' ')
                    }
                })
                uni.showToast({
                    title: res.msg,
                    duration: 1500,
                    icon: "none",
                })
                uni.$emit('refresh',{refresh:true})
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1,
                    });
                }, 400);

            } finally {
                this.sumloading = false
            }

        },
        del(item, index) {
            if (!item.id) {
                this.list.splice(index, 1)
            } else {
                uni.showModal({
                    content: this.$t('lpn.deleteTitle'),
                    success: (res) => {
                        if (res.confirm) {
                            this.apifn({
                                url: "pad/v1/lpnStorageRecord/removeById",
                                method: "post",
                                data: {
                                    id: item.id

                                }
                            }).then(res => {
                                uni.$emit('refresh')
                                this.getList()
                            })
                        }
                    }
                })
            }
        }

    },
    onLoad(e) {
        let obj = JSON.parse(decodeURIComponent(e.obj))
        this.obj = obj
        this.getList()

    }
}
</script>

<style lang="scss" scoped>
.forecastAdd {
    padding-bottom: calc(constant(safe-area-inset-bottom) + 120rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx)
}

.data-box {
    width: 400rpx;
    padding: 20rpx;
    border-radius: 30rpx;
    flex-direction: column;
    margin: 30rpx 0;
    border-radius: 18px;
    border: 1px solid #0099ff;

    >view:not(:last-child) {
        margin-bottom: 10rpx;
    }
}

.content-box {
    >view {

        background: #ffffff;
        padding: 16rpx 16rpx 30rpx;
        margin-bottom: 12.5rpx;
        margin-left: 10rpx;
        margin-right: 10rpx;
        border-radius: 16rpx;
    }

    .cancel {
        height: 68rpx;
        min-width: 120rpx;
        background: #fa3534;
        border-radius: 9rpx;
        font-size: 26rpx;
        font-weight: 400;
        color: #ffffff;
        margin-left: 10rpx;
    }

    .code {
        color: #333333;
        font-size: 42rpx;
        margin-bottom: 10rpx;
    }

    .Customer_Number {
        font-size: 36rpx;
    }
}

.confirm-box {
    position: fixed;
    bottom: calc(constant(safe-area-inset-bottom) + 30rpx);
    bottom: calc(env(safe-area-inset-bottom) + 30rpx);
    left: 0;
    right: 0;

    button {
        color: white;
        background: #0099ff;
        height: 80rpx;
        font-size: 32rpx;
        border-radius: 13rpx;
        margin: 0 30rpx;
        border: unset;

        &::after {
            border: unset !important;
        }
    }
}

.containernumber {
    font-size: 40rpx;
}
</style>