<template>
    <view class="router-box">
        <Navigation :backTitle="$t('putAdd.title')"></Navigation>
        <view class="content-box">
            <view class="top-box">
                <view>{{$t("list.oldCode")}}:{{ obj.scanCode }}</view>
                <view>{{$t("list.trunk_line")}}：{{ obj.channelName }}</view>
            </view>
            <view class="form-box">
                <view v-for="(item, index) in list" class="flex-a" :key="index">
                    <view class="label">
                        <text v-if="item.required" style="color: red">*</text>
                        {{ item.label }}:
                    </view>
                    <input
                        type="number"
                        v-model="obj[item.prop]"
                        :focus="focus == index"
                        ref="input"
                        class="pop_input"
                        @confirm="enter(index)"
                    />
                    <view>{{ item.unit }}</view>
                </view>
            </view>
            <view class="upload-box">
                <view class="title">{{$t("put.upload")}}</view>
                <uni-file-picker
                    v-model="tempFilePaths"
                    limit="9"
                    @select="fileSelect"
                    @delete="deleteCh"
                    :image-styles="{
                        width: filePickerWidth,
                        height: filePickerHeight,
                    }"
                ></uni-file-picker>
                <view v-if="updatetempFilePaths.length" class="img-box">
                    <image
                        v-for="(item, index) in updatetempFilePaths"
                        :key="index"
                        :src="item"
                        mode="widthFix"
                        @click="lookImg(updatetempFilePaths, index)"
                        :style="{ width: filePickerWidth + 'px' }"
                    />
                    <!-- <image src="https://ilsgoods.oss-cn-shenzhen.aliyuncs.com/upload/test/test_1691752235998.png" mode="" /> -->
                </view>
            </view>
        </view>
        <view class="flex-c btn">
            <button
                class="submit"
                :disabled="loading"
                :loading="loading"
                @click="submit"
            >
                {{ obj.update ? $t("update") :$t("submit")  }}
            </button>
            <!-- <button
                class="submit"
                :disabled="loading"
                :loading="loading"
              
                @click="cs"
            >
                参数
            </button> -->
        </view>
    </view>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "putAdd",

    data() {
        return {
            loading: false,
           
            focus: null,
            tempFilePaths: [],
            time: null,
            updatetempFilePaths: "",
            list: [
                {
                    required: true,
                    label: this.$t("list.length"),
                    prop: "lth",
                    unit: "CM",
                },
                {
                    required: true,
                    label: this.$t("list.width"),
                    prop: "wth",
                    unit: "CM",
                },
                {
                    required: true,
                    label: this.$t("list.high"),
                    prop: "hth",
                    unit: "CM",
                },
                {
                    required: true,
                    label:this.$t("list.weight"),
                    prop: "weight",
                    unit: "KG",
                },
            ],
            obj: {
                lth: "",
                wth: "",
                hth: "",
                weight: "",
                img: [],
            },
        };
    },

    created() {
        let obj = JSON.stringify(this.putObj);
        this.obj = JSON.parse(obj);
        if (this.obj.img) {
            this.updatetempFilePaths = this.obj.img;
        }
    },

    computed: {
        ...mapState(["putObj"]),
        filePickerWidth() {
            return uni.upx2px(192);
        },
        filePickerHeight() {
            return uni.upx2px(192);
        },
    },
    destroyed() {
        clearTimeout(this.time);
    },

    methods: {
        lookImg(url, index = 0) {
            uni.previewImage({
                urls: url,
                current: index,
            });
        },
        uploadingImge(element) {
            console.log(this.apiUrl);
            return new Promise((resolve, reject) => {
                uni.uploadFile({
                    url: this.apiUrl + "jeecg-boot/pda/api/v1/uploadByOss",
                    filePath: element,
                    name: "file",

                    success: (res) => {
                        let data = JSON.parse(res.data);
                        resolve(data.message);
                    },
                    fail(res) {
                        console.log(res);
                    },
                });
            });
        },

        async confirmuploading(list) {
            for (let index = 0; index < list.length; index++) {
                let img = await this.uploadingImge(list[index].url);
                this.obj.img.push(img);
            }
        },
        enter(index) {
            this.focus = null;
            this.$nextTick(() => {
                this.focus = index + 1;
            });
            if (index == this.list.length - 1) {
                this.submit();
            }
        },
        fileSelect(e) {
            console.log(e);
            e.tempFilePaths.forEach((res) => {
                this.tempFilePaths.push({ url: res });
            });
        },
        deleteCh(e) {
            this.tempFilePaths.some((res, index) => {
                if (res.url == e.tempFilePath) {
                    this.tempFilePaths.splice(index, 1);
                    return true;
                }
            });
        },
        async add() {
            this.obj.img = [];
            this.loading = true;
            this.obj.storeCode = uni.getStorageSync("warehouse") || "深圳仓"
            if (this.tempFilePaths.length) {
                await this.confirmuploading(this.tempFilePaths);
            }

            this.apifn({
                url: "jeecg-boot/pda/api/v1/add",
                method: "post",
                data: this.obj,
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.message,
                    });
                     
                    uni.$emit("refresh");
                    this.playsucc()
                    this.time = setTimeout(() => {
                        this.loading = false;
                        uni.navigateBack({
                            delta: 1,
                        });
                    }, 1500);
                },
                (err) => {
                    this.playfail()
                    this.loading = false;
                   
                }
            );
        },
        submit() {
            let a = this.list.some((res) => {
                if (!this.obj[res.prop]) {
                    uni.showToast({
                        title: "请填写" + res.label,
                        icon: "none",
                    });
                    return true;
                }
            });
            if (a) {
                return false;
            }

            if (this.obj.update) {
                uni.showModal({
                    
                    content: this.$t("putAdd.showModal"),
                    success: (res) => {
                        if (res.confirm) {
                            this.add();
                        } else if (res.cancel) {
                            return false;
                        }
                    },
                });
            } else {
                this.add();
            }
        },
    },
};
</script>

<style  lang='scss' scoped>
.content-box {
    > view {
        margin-bottom: 20rpx;
        background: white;
        padding: 20rpx 37.5rpx;
    }
    .top-box {
        font-size: 38rpx;
        font-weight: 500;
        color: #333333;
        > view:not(:last-child) {
            margin-bottom: 16rpx;
        }
    }
    .form-box {
        font-size: 38rpx;
        font-weight: bold;
        color: #333333;
        > view:not(:last-child) {
            margin-bottom: 18.75rpx;
        }
        input {
            width: 470.63rpx;
            margin-right: 16rpx;
            margin-left: 16rpx;
            height: 84.38rpx;
            border: 1px solid #858585;
            border-radius: 9rpx;
            text-indent: 12px;
        }
    }
    .upload-box {
        .title {
            font-size: 38rpx;
            font-weight: bold;
            color: #333333;
            margin-bottom: 22rpx;
        }
    }
}
.btn {
    z-index: 999;
    position: fixed;
    bottom: 10px;
    padding: 20rpx 0;
    width: 100%;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 16rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
.img-box {
    display: flex;
    flex-wrap: wrap;

    image {
        width: 125.47rpx;
        margin-right: 26rpx;
        margin-top: 26rpx;
    }
}
</style>