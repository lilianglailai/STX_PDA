<template>
    <view style="position: relative;">
        <image src="@/static/login/bj.png" mode="widthFix" class="phone-100" />
        <div class="locale">
            <view v-if="showlanguage" @click="isSearchFilter = !isSearchFilter" class="info">
                {{ localeText }}
                <span class="triangle-icon"
                    :style="{ transform: isSearchFilter ?   'rotate(0deg)':'rotate(180deg)' }"></span>


                <view class="search-filter"
                    :style="{ 'height': isSearchFilter ? localeList.length * 76 + 12 + 'rpx' : 0 }">
                    <view style="position:relative">
                        <!-- <view class="triangle"></view> -->
                        <view class="filter">
                            <view class="flex-a" @click.stop="setlocale(item)" v-for="(item, index) in localeList"
                                :key="index">{{ item.laebl }}

                            </view>

                            <!-- <view class="flex-a" @click.stop="isSearchFilter =false;goPassword()"
									 >修改密码</view> -->
                        </view>
                    </view>

                </view>
            </view>
        </div>

        <view class="box flex-a flex-c">
            <view>
                <uni-easyinput prefixIcon="person-filled" v-model="obj.username"
                    :placeholder="$t('please',{label:$t('login.username')})" @confirm="focus = 1">
                </uni-easyinput>
            </view>
            <view>
                <uni-easyinput :focus="focus == 1" prefixIcon="locked-filled" v-model="obj.password"
                    :placeholder="$t('please',{label: $t('login.password') }) " type="password" @confirm="focus = 2; submit()">
                </uni-easyinput>
            </view>
            <view>
                <button :disabled="loading" :loading="loading" class="submit" @click="submit" @keyup.enter="submit">
                    {{ $t('login.login') }}
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
            showlanguage: true,
            localeText: 'zh',
            isSearchFilter: false,
            localeList: [
                { laebl: '中文', value: "zh-Hans" },    
                { laebl: 'English', value: "en" },
                { laebl: '日本語', value: "ja" },    
                { laebl: 'Deutsch DE', value: "de" },
            ],
            loading: false,
            focus: 0,
            obj: {
                password: "",
                username: "",
            },
            isAndroid: ''
        };
    },
    created() {
        if (uni.getStorageSync('token')) {
            uni.redirectTo({
                url: "/pages/home/home",
            });
        }
        let systemInfo = uni.getSystemInfoSync(); 
        this.localeList.some(res => {
            if (res.value == uni.getLocale()) {
                this.localeText = res.laebl
                return true
            }
        }) 
        
        this.isAndroid = systemInfo.platform.toLowerCase() === 'android';

        // if (uni.getStorageSync('locale')) {
        //     this.locale = uni.getStorageSync('locale')
        // }
    },

    methods: {
        setlocale(item) {
            this.isSearchFilter = false;
            if (item.value==uni.getLocale()) {
                return 
            }  
            this.localeText = item.laebl
            if (this.isAndroid) {
                uni.showModal({
                    content: this.$t('language-change-confirm'),
                    success: (res) => {
                        if (res.confirm) {
                            uni.setLocale(item.value);
                        }
                    }
                })
            } else {
                uni.setLocale(item.value);
                this.$i18n.locale = item.value;
            }
           
        },
        submit() {
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
                url: "moveLogin",
                method: "post",
                data: this.obj,
            }).then(
                (res) => {
                    this.loading = false;
                    uni.setStorageSync('token', res.data.token)
                    uni.setStorageSync('username', this.obj.username)
                    uni.setStorageSync('abroadDepotName', res.data.user.abroadDepotName)
                    uni.redirectTo({
                        url: "/pages/home/home",
                    });
                },
                (err) => {
                    this.loading = false;
                    // uni.showToast({
                    //     title: "账号或密码错误",
                    //     icon: "none",
                    // });
                }
            );
        },
    },
};
</script>

<style lang='scss'>
.box {
    position: relative;
    background: white;
    margin: -86rpx 18.75rpx 0;
    height: 470rpx;
    background: #ffffff;
    box-shadow: 0rpx 0rpx 58rpx 9rpx rgba(227, 227, 227, 0.29);
    border-radius: 9rpx;
    flex-direction: column;

    >view {
        width: 600rpx;
        height: 84rpx;
    }

    >view:not(:last-child) {
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

.submit {
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

.locale {
    position: absolute;
    top: 50rpx;
    right: 50rpx;
    z-index: 99;
    min-width: 107px;

    height: 60rpx;
    line-height: 60rpx;
    background: rgba(53, 120, 135, 0.50);
}

.info {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    font-weight: 400;
    font-size: 28rpx;
    padding: 0 25rpx 0 15rpx;

    .triangle-icon {
        width: 0;
        height: 0;
        border-left: 12rpx solid transparent;
        border-right: 12rpx solid transparent;
        border-bottom: 16rpx solid white;
        transition-duration: 0.3s;
    }

    .search-filter {
        position: absolute;
        min-width: 160rpx;
        overflow: hidden;
        transition: all 0.5s;
        top: 54rpx;
        right: -10rpx;
        z-index: 10;
        border-radius: 16rpx;

        .triangle {
            width: 0;
            height: 0;
            border-left: 12rpx solid transparent;
            border-right: 12rpx solid transparent;
            border-bottom: 20rpx solid rgba(0, 0, 0, 0.5);
            // transform: translateX(36rpx);
            position: absolute;
            right: 36rpx;
        }

        .filter {
            width: 100%;
            position: relative;
            top: 20rpx;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 16rpx;

            >view {
                color: #ffffff;
                font-size: 28rpx;
                white-space: nowrap;
                box-sizing: border-box;
                font-weight: 500;
                padding: 0 16rpx;
                height: 76rpx;
            }

            >view:not(:last-child) {

                border-bottom: 1rpx solid #646566;

            }
        }
    }

}
</style>