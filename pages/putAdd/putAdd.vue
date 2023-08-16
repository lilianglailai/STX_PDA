<template>
    <view class="router-box">
        <Navigation backTitle="入库信息"></Navigation>
        <view class="content-box">
            <view class="top-box">
                <view>编码:{{ obj.scanCode }}</view>
                <view>干线：{{ obj.channelName }}</view>
            </view>
            <view class="form-box">
                <view v-for="(item, index) in list" class="flex-a" :key="index">
                    <view class="label">
                        <text v-if="item.required" style="color: red">*</text>
                        {{ item.label }}
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
                <view class="title">请上传包裹图片</view>
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
                class="sumbit"
                :disabled="loading"
                :loading="loading"
                @click="sumbit"
            >
                {{ obj.update ? "修改" : "提交入库" }}
            </button>
            <!-- <button
                class="sumbit"
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
            artery: "",
            focus: null,
            tempFilePaths: [],
            time: null,
            updatetempFilePaths: "",
            list: [
                {
                    required: true,
                    label: "长度",
                    prop: "lth",
                    unit: "CM",
                },
                {
                    required: true,
                    label: "宽度",
                    prop: "wth",
                    unit: "CM",
                },
                {
                    required: true,
                    label: "高度",
                    prop: "hth",
                    unit: "CM",
                },
                {
                    required: true,
                    label: "重量",
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
                    url: this.apiUrl + "pda/api/v1/uploadByOss",
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
                this.sumbit();
            }
        },
        fileSelect(e) {
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
            this.obj.storeCode = "东莞";
            if (this.tempFilePaths.length) {
                await this.confirmuploading(this.tempFilePaths);
            }

            this.apifn({
                url: "pda/api/v1/add",
                method: "post",
                data: this.obj,
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.message,
                    });
                    uni.$emit("refresh");
                    const innerAudioContext = uni.createInnerAudioContext();
                    innerAudioContext.autoplay = true;
                    innerAudioContext.src =
                        "https://tts.baidu.com/text2audio.mp3?tex=%22%E5%85%A5%E5%BA%93%E6%88%90%E5%8A%9F%22&cuid=baike&amp&lan=ZH&amp&ctp=1&amp&pdt=301&amp&vol=100&amp&rate=32&amp";
                    innerAudioContext.onPlay(() => {});
                    this.time = setTimeout(() => {
                        this.loading = false;
                        uni.navigateBack({
                            delta: 1,
                        });
                    }, 1500);
                },
                (err) => {
                    this.loading = false;
                }
            );
        },
        sumbit() {
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
                    title: "提示",
                    content: "你已入库，是否二次入库",
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
    bottom: 0px;
    padding: 20rpx 0;
    width: 100%;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
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