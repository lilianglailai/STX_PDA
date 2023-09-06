<template>
    <view class="router-box">
        <Navigation :backTitle="$t('caPai.menu')"></Navigation>
        <view class="content-box">
            <view v-for="(item, index) in list" :key="index">
                <view class="label">
                    <text
                        v-if="item.required"
                        style="color: red; margin-right: 10rpx"
                        >*</text
                    >
                    {{ item.label }}:
                </view>
                <uni-data-select
                    v-if="item.slot == 'select'"
                    :placeholder="$t('please') + item.label"
                >
                </uni-data-select>
                <input
                    v-else
                    :type="item.type||'text'"
                    v-model="obj[item.prop]"
                  
                    ref="input"
                    class="pop_input"
                    placeholder-class="input-pl"
                    :placeholder="$t('please') + item.label"
                   
                />
            </view>
        </view>
        <button
            class="submit"
            :disabled="loading"
            :loading="loading"
            @click="submit"
        >
            {{ $t("submit") }}
        </button>
    </view>
</template>

<script>
export default {
    name: "vehicle",
    data() {
        return {
            obj: {},
            list: [
                {
                    required: true,
                    label: this.$t("vehicle.list.Driver"),
                    prop: "lth",
                    slot: "select",
                },
                {
                    required: true,
                    label: this.$t("vehicle.list.Rego"),
                    prop: "lth",
                    unit: "CM",
                    slot: "select",
                },
                {
                    required: true,
                    label: this.$t("vehicle.list.Phone"),
                    prop: "lth",
                    unit: "CM",
                     slot: "select",
                },
            ],
        };
    },
    methods: {},
};
</script>

<style  lang='scss' scoped>
.content-box {
    background: white;
    padding: 26rpx 40rpx 45rpx;
    > view:not(:last-child) {
        margin-bottom: 37.5rpx;
    }
    .label {
        margin-bottom: 17rpx;
        font-size: 38rpx;
        font-weight: bold;
        color: #333333;
    }
    .pop_input {
        height: 84rpx;
        border: 2rpx solid #9f9f9f;
        border-radius: 9rpx;
        padding-left: 23rpx;
        width: 100%;
        box-sizing: border-box;
    }
     .input-pl {
        font-size: 38rpx;
        font-weight: 500;
        color: #9f9f9f;
    }
    /deep/ .uni-select__input-placeholder {
        font-size: 38rpx;
        font-weight: 500;
        color: #9f9f9f;
    }
    /deep/ .uni-select {
        height: 84.38rpx;
    }
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 65rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
</style>