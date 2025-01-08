<template>
    <div>
        <scan ref="scan" v-model="number" @scan="scan"></scan>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
        <transition-group tag="view" name="list" class="content-box">
            <view class="flex-a" v-for="(item, index) in list" :key="item.checkCode">
                <!-- key是关键 -->
                <view class="flex1">
                    <view class="code" :class="{ highlight: item.id }">{{ item.checkCode }}</view>
                    <view @click="previewImage(item)" v-if="item.conductorFile">{{ $t('lpnDel.viewphotos') }}</view>
                </view>
                <button class="primary-btn flex-a flex-c" @click="photograph(item)">
                    {{ $t('lpnDel.photograph') }}
                </button>
                <!-- <button class="cancel flex-a flex-c" v-if="!item.id" @click="list.splice(index, 1)">
                    {{ $t('cancel') }}
                </button> -->
            </view>
        </transition-group>
        <!-- <view class="confirm-box">
            <button @click="submit" :loading="sumloading" :disabled="sumloading"> {{ $t('lpnDel.del_btn_title')
                }}</button>
        </view> -->
    </div>
</template>

<script>
export default {
    name: 'lpnremove',
    data() {
        return {
            number: "",
            sumloading: false,
            loading: false,
            obj: {},
            list: [
            ]
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
        this.$refs.scan.stopScan()
        // #endif
    }, methods: {
        scan(code) {

            if (!code.replace(/\s/g, "")) {
                return false;
            }

            this.apifn({
                // url: `pad/v1/lpnStorageRecord/getLpn?palletContainerId=${this.obj.palletContainerId}`,
                url: `pad/v1/lpnStorageRecord/getLpn?checkCode=${code}`,
            }).then(res => {
                this.list.unshit(res.data)
                // this.$set(this.list, 0, res.data);
                // this.total = res.total
                this.loading = false
            },
                err => {
                    this.loading = false
                }
            )
        },
        previewImage(item) {
            uni.previewImage({
                urls: [item.conductorFile],
            });
        },
        photograph(item) {
            let id=item.id
            uni.chooseImage({
                count: 6, //默认9
                sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
                sourceType: ['camera'], //从相册选择
                success: (res) => {
                    console.log(res.tempFiles[0].path);
                    console.log(res.tempFilePaths[0]);

                    uni.uploadFile({
                        url: this.apiUrl + `pad/v1/lpnStorageRecord/updateLpnConductorFile`,
                        name: "file",
                        filePath: res.tempFiles[0].path,
                        header: {
                            'authorization': uni.getStorageSync('token')
                        },
                        formData: {
                            id: id
                        },
                        success: (res) => {
                            uni.showToast({
                                title: this.$t('succeed'),
                                duration: 1000,
                            });
                            this.scan(this.number)
                        },
                        fail(res) {
                            console.log(res);
                        },
                    })
                }
            });
        },

    },
    onLoad(e) {
        //  for (const key in e) { 

        //    this.obj[key]=e[key]
        //  }

    }
}
</script>

<style lang="scss" scoped>
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

    .primary-btn {
        height: 68rpx;
        min-width: 120rpx;
        font-size: 26rpx;
        font-weight: 400;
        margin-left: 20rpx;
    }
}
</style>