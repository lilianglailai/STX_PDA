<template>
    <view class="router-box">
        <Navigation :backTitle="$t('caPai.menu')"></Navigation>
        <view class="content-box">
            <view>
                <view class="grey-title">
                    <text style="color: red; margin-left: 10rpx">*</text>
                    {{ $t("signature.Signature_Type") }}</view
                >
                <uni-data-select
                    :placeholder="'Please select a delivery type'"
                    :localdata="range"
                    v-model="value"
                    @change="selectChange"
                >
                </uni-data-select>
            </view>
            <view v-if="value == 2 || value == 3">
                <view class="black-title"> {{ $t("signature.signatur") }}</view>
                <view class="signature-box">
                    <view class="empty flex-a flex-c" @click="empty"
                        >clean up</view
                    >
                    <signatureCom
                        ref="signatureCom"
                        v-model="img"
                    ></signatureCom>
                </view>
            </view>
            <view v-if="value == 4">
                <input
                    type="text"
                    placeholder="Please enter the reason"
                    class="rejection"
                    placeholder-class="placeholder"
                    v-model="rejectReason"
                />
            </view>
            <view v-if="value != 4">
                <view class="black-title">Please upload client signature</view>
                <view class="camera-box flex">
                  
                    <uni-file-picker
                        v-model="tempFilePaths"
                        limit="9"
                        @select="fileSelect"
                        @delete="deleteCh"
                        :image-styles="{
                            width: filePickerWidth,
                            height: filePickerHeight,
                        }"
                    >   <image src="@/static/home/camera.png" mode="widthFix" style="width:81.25rpx"/></uni-file-picker>
                </view>
            </view>
        </view>
        <view class="btn">
            <button class="submit" @click="submit">{{ $t("submit") }}</button>
        </view>
    </view>
</template>

<script>
import signatureCom from "./signatureCom.vue";
export default {
    name: "signature",
    components: {
        signatureCom,
    },
    data() {
        return {
            img: "",
            tempFilePaths: [],
            value: "",
            signatureDetailDTOList: [],
            imgList: [],
            courier: "",
            rejectReason: "",
            range: [
                // { value: 1, text: "Delivered with signature from other" },
                // { value: 2, text: "Delivered with signature" },
                // { value: 3, text: "Left in a safe place" },
                // { value: 4, text: "Declined by receiver at delivery" }, //拒收
            ],
        };
    },
    computed: {
        filePickerWidth() {
            return uni.upx2px(192);
        },
        filePickerHeight() {
            return uni.upx2px(192);
        },
    },
    methods: {
        fileSelect(e) {
            e.tempFilePaths.forEach((res) => {
                this.tempFilePaths.push({ url: res });
            });
        },
        deleteCh(e) {
            this.tempFilePaths.some((res, index) => {
                if (res.url == e.tempFilePath) {
                    this.tempFilePaths.splice(index, 1);
                    if (this.imgList.length) {
                        this.imgList.splice(index, 1);
                    }
                    return true;
                }
            });
        },
        goCamera() {
            uni.chooseImage({
                count: 6, //默认9
                sizeType: ["original", "compressed"], //可以指定是原图还是压缩图，默认二者都有
                sourceType: ["album"], //从相册选择
                success: (res) => {
                    this.tempFilePaths = this.tempFilePaths.concat(
                        res.tempFilePaths
                    );
                },
            });
        },
        selectChange(e) {
            this.range.some((res) => {
                if (res.value == e) {
                    this.deliveryType = res.text;
                }
            });
        },
        async submit() {
            if (!this.value) {
                uni.showToast({
                    title: "Please select a delivery type",
                    icon: "none",
                });
                return false;
            }
            if (!this.tempFilePaths.length) {
                 uni.showToast({
                    title: "Please upload client signature",
                    icon: "none",
                });
                  return false;
            }
            if (this.value == 2 || this.value == 3) {
                this.$refs.signatureCom.finish();
            }
             
            if (this.tempFilePaths.length) {
                await this.confirmuploading(this.tempFilePaths);
            }
              let imgList
            if (this.img) {
               imgList  =this.imgList.concat(this.img)
            }else{
                  imgList  =this.imgList
            }
         
            this.apifn({
                url: "oms/v1/OrderAbroadDelivery/signature",
                method: "post",
                data: {
                    typeId: this.value,
                    imgList: imgList,
                    signatureDetailDTOList: this.signatureDetailDTOList,
                    userCode: uni.getStorageSync("token"),
                    signedPerson: "", //签收人
                    signedPersonTel: "", //签收电话
                    courier: this.courier,
                    rejectReason: this.rejectReason,
                    deliveryType: this.deliveryType,
                },
            }).then(
                (res) => {
                    uni.showToast({
                        title:  res.msg || "succeed",
                        
                         icon:'none'
                    });
                },
                (err) => {
                        uni.showToast({
                        title:err.msg,
                        icon:'none'  ,
                    });
                    // this.tempFilePaths = [];
                }
            );
        },
        empty() {
            this.$refs.signatureCom.clear();
        },
        uploadingImge(element) {
            return new Promise((resolve, reject) => {
                uni.uploadFile({
                    url: this.apiUrl + "oms/v1/Order/upload",
                    filePath: element,

                    name: "file",
                    formData: {
                        orderNo: this.signatureDetailDTOList[0].hbl,
                    },
                    success: (res) => {
                        let data = JSON.parse(res.data).body;
                        resolve(data);
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
              
                this.imgList.push(img);
            }
        },
    },
    created() {
        if (uni.getStorageSync("signatureDetailDTOList")) {
            this.signatureDetailDTOList = JSON.parse(
                uni.getStorageSync("signatureDetailDTOList")
            );
            uni.removeStorageSync("signatureDetailDTOList");
        }
        this.apifn({
            url: `oms/v1/OrderAbroadDelivery/signatureType`,
        }).then((res) => {
            this.range = res.body.map((item) => {
                return {
                    value: item.typeId,
                    text: item.typeDesc,
                };
            });
        });
    },
};
</script>

<style  lang='scss' scoped>
.content-box {
    > view {
        margin-bottom: 18rpx;
        padding: 28rpx 40rpx 45rpx;
        background: white;
    }
    .grey-title {
        margin-bottom: 17rpx;
        font-size: 41rpx;
        font-weight: 500;
        color: #333333;
    }
    .black-title {
        margin-bottom: 17rpx;
        font-size: 41rpx;

        font-weight: bold;
        color: #333333;
    }
}
/deep/ .uni-select__input-placeholder {
    font-size: 38rpx;
    font-weight: 500;
    color: #333333;
}
/deep/ .uni-select {
    height: 84.38rpx;
}
.signature-box {
    width: 666rpx;
    height: 395rpx;
    position: relative;
    .empty {
        position: absolute;
        right: 16rpx;
        top: 16rpx;
        z-index: 99;
        width: 159rpx;
        height: 53rpx;
        background: #c1c1c1;
        border-radius: 9rpx;
        font-size: 31rpx;
        font-weight: bold;
        color: #ffffff;
    }
    > view {
        background: #f1f1f1;
        height: 100%;
        width: 100%;
    }
    > image {
        width: 100%;
    }
}
.btn {
    z-index: 999;
    position: fixed;
    bottom: 20rpx;
    width: 100%;
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
 
// .camera {
//     background: #e8e8e8;
//     border-radius: 9rpx;
//     image {
//         width: 81rpx;
//         height: 66rpx;
//     }
// }
/deep/.placeholder {
    font-size: 38rpx;
    font-weight: 500;
    color: #bcbcbc;
}
::-webkit-input-placeholder {
    font-size: 38rpx;
    font-weight: 500;
    color: #bcbcbc;
}
.rejection {
    font-size: 38rpx;
    font-weight: 500;
    color: #333333;
    border: 1rpx solid #9f9f9f;
    border-radius: 9rpx;
    height: 84rpx;
    padding-left: 20rpx;
}
/deep/.file-picker__box-content{
    border: unset !important;
    background: #E8E8E8;
}
</style>