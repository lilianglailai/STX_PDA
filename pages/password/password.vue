<template>
    <view class="router-box">
        <Navigation :backTitle="$t('update') + $t('login.password')" :titleShow="false"></Navigation>
        <view class="box">
            <view v-for="(item, index) in list" class="flex" :key="index">
                <label
                    >{{ item.label }}
                    <text
                        v-if="item.required"
                        style="color: red; margin-left: 10rpx"
                        >*</text
                    >
                
                </label>
                <input
                    v-if="!item.slot"
                    type="text"
                    v-model="obj[item.value]"
                    :placeholder="$t('please')+ item.label"
                    class="pop_input"
                    @confirm="index == list.length - 1 ? submit() : null"
                />
            </view>
            <button
                class="submit"
                @click="submit"
                :loading="loading"
                :disabled="loading"
            >
                {{$t('submit')}}
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
            list: [{ label: this.$t("login.password"), value: "password", required: true }],
            loading: false,
            obj: {},
        };
    },

    methods: {
        submit() {
            let a = this.list.some((ele) => {
                if (ele.required && !this.obj[ele.value]) {
                    uni.showToast({
                        title: this.$t('please') + ele.label,
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
                url: "jeecg-boot/pda/api/v1/updatePassWord",
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
.submit {
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