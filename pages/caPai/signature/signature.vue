<template>
    <view class="router-box">
        <Navigation :backTitle="$t('caPai.menu')"></Navigation>
        <view class="content-box">
            <view >
                <view class="grey-title">{{
                    $t("signature.Signature_Type")
                }}</view>
                 <uni-data-select
                   
                    :placeholder="$t('signature.delivery')"
                >
                </uni-data-select>
            </view>
            <view> 
                <view class="black-title"> {{ $t("signature.signatur")}}</view>
                <view class="signature-box"   >
                    
                  <signatureCom  ref="signatureCom" v-model="img"></signatureCom>
                  
                </view>
            </view>
        </view>
        <button class="submit" @click="submit">{{$t('submit')}}</button>
       <!-- <uni-popup ref="popup" :showclose="true" >
        
       </uni-popup> -->
    </view>
</template>

<script>
import signatureCom from "./signatureCom.vue";
export default {
    name: "signature",
    components:{
        signatureCom
    },
    data() {
        return {
            img:""
        };
    },
    methods: {
        submit(){
            this.$refs.signatureCom.finish()
          
        },
      
        openSignature(){
            this.$refs.popup.open()
        }
    },
};
</script>

<style  lang='scss' scoped>
.content-box {
    >view {
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
    .black-title{
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
    .signature-box{
        width: 666rpx;
        height: 395rpx;
         >view{
            background: #F1F1F1;
            height: 100%;
            width: 100%;
         }
        >image{
            width: 100%;
            
        }
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
</style>