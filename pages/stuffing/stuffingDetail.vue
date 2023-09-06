<template>
    <view class="router-box">
        <Navigation :backTitle="'装柜'"></Navigation>
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
                    v-model="obj[item.prop]"
                    v-if="item.slot == 'select'"
                    :placeholder="$t('please') + item.label"
                    :localdata="item.range"
                >
                </uni-data-select>
                <picker
                    class="flex-a"
                    mode="date"
                    :start="item.startDate"
                    
                    @change="item.fn($event, item.prop) || null"
                    v-else-if="item.slot == 'date'"
                >
                    <view v-if="obj[item.prop]">{{ obj[item.prop] }} </view>
                    <view v-else class="input-pl">
                        {{ $t("please") + item.label }}</view
                    >
                </picker>
                <input
                    v-else
                    :type="item.type || 'text'"
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
            :loading="loading"
            :disabled="loading"
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
            loading: false,
            obj: {},
            time: null,
            list: [
                {
                    required: true,
                    label: this.$t("stuffingDetail.list.destination"),
                    prop: "destination",
                    slot: "select",
                    range: [
                        { value: "AUBNE", text: "AUBNE" },
                        { value: "AUFRE", text: "AUFRE" },
                        { value: "AUMEL", text: "AUMEL" },
                        { value: "AUPER", text: "AUPER" },
                        { value: "AUSYD", text: "AUSYD" },
                        { value: "MYKUL", text: "MYKUL" },
                        { value: "NZAKL", text: "NZAKL" },
                    ],
                },
                {
                    required: true,
                    label: this.$t("stuffingDetail.list.container_number"),
                    prop: "containerNo",
                },
                {
                    required: true,
                    label: this.$t("stuffingDetail.list.date"),
                    prop: "outTime",
                    slot: "date",
                    fn: this.dateChange.bind(null),
                    startDate: this.getDate("start"),
                    endDate: this.getDate("end"),
                },
            ],
            date: "",
        };
    },
    destroyed() {
        clearTimeout(this.time);
    },
    methods: {
        dateChange(e, prop) {
            this.$set(this.obj, prop, e.detail.value);
        },
        submit() {
            let a = this.list.some((ele) => {
                if (ele.required && !this.obj[ele.prop]) {
                    uni.showToast({
                        title: this.$t("please") + ele.label,
                        icon: "none",
                    });
                    return true;
                }
            });
            if (a) {
                return false;
            }
            this.loading = true;
            this.apifn({
                url: "oms/v1/OrderWmsOut/create",
                method: "post",
                data: {
                    ...this.obj,
                    warehouse: uni.getStorageSync("warehouse") || "东莞仓",
                },
            }).then(
                (res) => {
                    this.loading = false;
                    uni.showToast({
                        title: res.msg || "保存成功",
                        duration: 1500,
                    });
                    this.time = setTimeout(() => {
                        uni.redirectTo({
                            url:
                                "/pages/stuffing/stuffingScan?obj=" +
                                encodeURIComponent(JSON.stringify(res.body))
                             ,
                        });
                    }, 1000);
                },
                (err) => {
                    this.loading = false;
                }
            );
        },
        getDate(type) {
            const date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();

            if (type === "end") {
                year = year + 2;
            }
            month = month > 9 ? month : "0" + month;
            day = day > 9 ? day : "0" + day;
            return `${year}-${month}-${day}`;
        },
    },
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
    .pop_input,
    uni-picker {
        height: 84rpx;
        border: 2rpx solid #9f9f9f;
        border-radius: 9rpx;
        padding-left: 23rpx;
        width: 100%;
        box-sizing: border-box;
    }
    .input-pl,
    .uni-input {
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