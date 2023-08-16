<template>
    <view class="router-box">
        <Navigation backTitle="修改密码" :titleShow="false"></Navigation>
        <view class="box">
            <view v-for="(item, index) in list" class="flex" :key="index">
                <label
                    >{{ item.label }}
                    <text
                        v-if="item.required"
                        style="color: red; margin-left: 10rpx"
                        >*</text
                    >
                    <text
                        class="ask"
                        v-if="item.label == '绑定邮箱'"
                        @tap="ask(index)"
                        >?</text
                    >
                </label>
                <input
                    v-if="!item.slot"
                    type="text"
                    v-model="obj[item.value]"
                    :placeholder="'请输入' + item.label"
                    class="pop_input"
                    @confirm="index == list.length - 1 ? sumbit() : null"
                />
            </view>
            <button
                class="sumbit"
                @click="sumbit"
                :loading="loading"
                :disabled="loading"
            >
                保存
            </button>
        </view>
    </view>
</template>

<script>
export default {
    name: "password",
    data() {
        return {
            time: null,
            list: [{ label: "新密码", value: "password", required: true }],
            loading: false,
            obj: {},
        };
    },

    methods: {
        sumbit() {
            let a = this.list.some((ele) => {
                if (ele.required && !this.obj[ele.value]) {
                    uni.showToast({
                        title: "请输入" + ele.label,
                        icon: "none",
                    });
                    return true;
                }
            });
            if (a) {
                return false;
            }
            this.loading = true;
            this.obj.username = uni.getStorageSync("username");
            this.apifn({
                url: "pda/api/v1/updatePassWord",
                method: "post",
                data: this.obj,
            }).then(
                (res) => {
                    uni.showToast({
                        title: res.message,
                        icon: "none",
                    });

                    uni.removeStorageSync("username");
                    uni.removeStorageSync("token");
                    uni.showToast({
                        title: '修改成功，请重新登陆',
                        icon:"none",
                        duration:1000,
                        mask:true
                    });
                    setTimeout(() => {
                        uni.reLaunch({
                        url: "/pages/login/login",
                    });
                    }, 1000);
                    
                },
                (err) => {
                    this.loading = false;
                     
                }
            );
        },
    },
};
</script>

<style  lang='scss' scoped>
.box {
    padding: 20rpx 40rpx;
}
.flex {
    align-items: center;
    padding: 34rpx 0;
    border-bottom: 1px solid #e6e6e6;

    label {
        font-size: 28rpx;

        font-weight: 500;
        margin-right: 40rpx;
        line-height: 28rpx;
        min-width: 130rpx;
    }

    .pop_input {
        flex: 1;
        font-size: 28rpx;

        font-weight: 500;
    }
}
.sumbit {
    margin-top: 50rpx;
    width: 600rpx;
    height: 80rpx;
    background-color: #3882ee;
    border-radius: 200rpx;
    font-weight: bold;
    font-size: 28rpx;
    color: #ffffff;
    line-height: 80rpx;

    &::after {
        border: none;
    }
}
</style>