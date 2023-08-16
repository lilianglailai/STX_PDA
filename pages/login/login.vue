<template>
    <view>
        <image src="@/static/login/bj.png" mode="widthFix" class="phone-100" />

        <view class="box flex-a flex-c">
            <view>
                <uni-easyinput
                    prefixIcon="person-filled"
                    v-model="obj.username"
                    placeholder="请输入您的账号"
                     @confirm="focus=1"
                >
                </uni-easyinput>
            </view>
            <view>
                <uni-easyinput
                   :focus="focus == 1"
                    prefixIcon="locked-filled"
                    v-model="obj.password"
                    placeholder="请输入您的密码" 
                    type="password"
                    @confirm="focus=2;sumbit()"
                >
                </uni-easyinput>
            </view>
            <view>
                <button
                    :disabled="loading"
                    :loading="loading"
                    class="sumbit"
                    @click="sumbit"
                    @keyup.enter="sumbit"
                >
                    登录
                </button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "login",
    data() {
        return {
            loading: false,
            focus:0,
            obj: {
                password: "",
                username: "",
            },
        };
    },
    created() {
        if (uni.getStorageSync('token')) {
              uni.redirectTo({
                        url: "/pages/home/home",
                    });
        }
    },
    
    methods: {
        sumbit() {
            if (!this.obj.username) {
                uni.showToast({
                    title: "请输入账号",
                    icon: "none",
                });
                return false;
            }
            if (!this.obj.password) {
                uni.showToast({
                    title: "请输入密码",
                    icon: "none",
                });
                return false;
            }
            this.loading = true;
            this.apifn({
                url: "pda/api/v1/login",
                method: "post",
                data: this.obj,
            }).then(
                (res) => {
                 this.loading = false;
                  uni.setStorageSync('token',res.result.token)
                  uni.setStorageSync('username',this.obj.username)
                    uni.redirectTo({
                        url: "/pages/home/home",
                    });
                },
                (err) => {
                    this.loading = false;
                    uni.showToast({
                        title: "账号或密码错误",
                        icon: "none",
                    });
                }
            );
        },
    },
};
</script>

<style  lang='scss'>
.box {
    position: relative;
    background: white;
    margin: -86rpx 18.75rpx 0;
    height: 470rpx;
    background: #ffffff;
    box-shadow: 0rpx 0rpx 58rpx 9rpx rgba(227, 227, 227, 0.29);
    border-radius: 9rpx;
    flex-direction: column;
    > view {
        width: 600rpx;
        height: 84rpx;
    }
    > view:not(:last-child) {
        margin-bottom: 50rpx;
    }
}
/deep/ .uni-easyinput__content-input {
    font-size: 38rpx;
    height: 84rpx !important;
}
/deep/ .uni-easyinput__placeholder-class {
    font-size: 38rpx;
    font-weight: 500;
    color: #959595;
}
/deep/.uni-icons {
    font-size: 42.19rpx !important;
}
.sumbit {
    height: 84rpx;
    background: #3882ee;
    background: #3882ee;
    box-shadow: 0rpx 8rpx 16rpx 0rpx rgba(6, 59, 177, 0.24);
    border-radius: 9rpx;
    font-weight: 800;
    color: #ffffff;
    height: 100%;
    line-height: 84rpx;
}
</style>