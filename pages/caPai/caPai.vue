<template>
    <view>
        <view class="router-box">
            <Navigation :backTitle="$t('caPai.menu')"></Navigation>
       
        <button
            class="submit"
            @click="add"
            :loading="btnLoading"
            :disabled="btnLoading"
            :style="{ marginTop: !list.length ? '125rpx' : '16rpx' }"
        >
            <text class="add"> </text> {{ $t("caPai.Create_Task") }}
        </button>
        <view v-if="list.length">
            <view class="list-title">{{ $t("record") }}</view>
        </view>
        <view class="content-box">
            <view v-for="(item, index) in list" :key="index">
                <view class="flex-a top-view">
                    <view class="flex1">{{ item }}</view>
                    <button
                        class="Handover-btn flex-a flex-c"
                        :disabled="!update"
                        :class="{ disabled: !update }"
                        @click="del(item, index)"
                    >
                        移除
                    </button>
                </view>
                <view class="bottom-view flex-a"> 
                    <view class="flex1">aaa</view>
                        <button
                        class="Handover-btn flex-a flex-c"
                        :disabled="!update"
                        :class="{ disabled: !update }"
                        @click="del(item, index)"
                    >
                        移除
                    </button>
                     </view>
            </view>
        </view>
         </view>
    </view>
</template>

<script>
export default {
    name: "caPai",
    data() {
        return {
            btnLoading: false,
            list: [{}, {}],
        };
    },
    methods: {
        add() {},
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
.list-title {
    padding: 16rpx 0 16rpx 22rpx;
    height: 36rpx;
    line-height: 36rpx;
    font-size: 38rpx;
    font-weight: bold;
    color: #3882ee;
}
.content-box {
    > view {
        background: white;
        margin-bottom: 12.5rpx;
          padding-left: 17rpx;
          padding-right: 31rpx;
    }
    .top-view,.bottom-view{
        padding-top: 28rpx;
        padding-bottom: 18rpx;
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
    }
}
</style>