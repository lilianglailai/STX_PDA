<template>
    <view class="fixed-box">
        <view class="top-box"></view>
        <view class="menu-box flex flex-a">
            <view class="flex-a" @click="goback">
                <div>
                    <image class="back" v-show="backShow" src="/static/navigation/arrows.png" mode="widthFix" />
                </div>
                <!-- <view @click="isSearchFilter = !isSearchFilter" class="info flex-a"> -->
                <view class="flex-a" @click="goPersonal">
                    <image src="@/static/logo/applogo.png" mode="widthFix" alt="" srcset="" class="logo"></image>
                    <text>{{ title }}</text>
                </view>
                <!-- <view class="search-filter"
                        :style="{ 'height': isSearchFilter ? list.length * 76 + 12 + 'rpx' : 0 }">
                        <view style="position:relative">
                            <view class="triangle"></view>
                            <view class="filter">
                                <view class="flex-a" @click.stop="isSearchFilter = false; item.fn()"
                                    v-for="(item, index) in list" :key="index">{{ item.laebl }}</view>
                            </view>
                        </view>
                    </view> -->
                <!-- </view> -->
            </view>
            <view   @click="isSearchFilter = !isSearchFilter" class="info">
                {{ localeText }}
                <image  mode="widthFix" src="@/static/public/toparrows.png"  class="toparrows" alt="" srcset="" style="transition-duration: 0.3s;margin-left: 10rpx;" :style="{ transform: isSearchFilter ?   'rotate(180deg)': 'rotate(0deg)' }"></image>
               

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
        </view>
    </view>
</template>

<script>
export default {
    name: "navigation",
    props: {
        backTitle: {
            type: String,
        },
        titleShow: {
            type: Boolean,
            default: true,
        },
        backShow: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isSearchFilter: false,
            localeText: 'zh',
            isSearchFilter: false,
            localeList: [
                { laebl: '中文', value: "zh-Hans" },    
                { laebl: 'English', value: "en" },
                { laebl: '日本語', value: "ja" },    
                { laebl: 'Deutsch DE', value: "de" },
            ],
        };
    },
    computed: {
        title() {
            return uni.getStorageSync("username");
        },
    },
    methods: {
        setlocale(item) {
            this.isSearchFilter = false;
           
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
        goPersonal(){
            uni.navigateTo({
                url:'/pages/my/my'
            })
        },
        quit() {
            this.apifn({
                url: "moveLoginOut",
                method: "post",
                header: {
                    'Content-Type': "application/json",

                },
                data: {
                    Authorization: uni.getStorageSync('token')
                }
            }).then(res => {
                uni.removeStorageSync('username');
                uni.removeStorageSync('token');
                uni.reLaunch({
                    url: '/pages/login/login'
                });
            }).catch(err => {
                uni.removeStorageSync('username');
                uni.removeStorageSync('token');
                uni.reLaunch({
                    url: '/pages/login/login'
                });
                // uni.showToast({
                //     title: err.msg,
                //     icon: "none",
                // });

            })

        },
        goPassword() {
            uni.navigateTo({
                url: '/pages/password/password'
            });
        },
        goback() {
            if (this.backShow) {
                uni.navigateBack({
                    delta: 1,
                });
            }
        },
    },
    created(){
        let systemInfo = uni.getSystemInfoSync(); 
        this.localeList.some(res => {
            if (res.value == uni.getLocale()) {
                this.localeText = res.laebl
                return true
            }
        }) 
        
        this.isAndroid = systemInfo.platform.toLowerCase() === 'android';
    }
};
</script>

<style lang='scss' scoped>
.fixed-box {
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 999;
}

.top-box {
    height: var(--status-bar-height);
    background: white;
}

.menu-box {
    justify-content: space-between;
    height: 120rpx;
    background: white;
    padding-left: 48rpx;
    padding-right: 57rpx;
    font-size: 38rpx;
    font-weight: 400;

    .logo {
        width: 96rpx;
        height: 96rpx;
        margin-right: 20rpx;
        border-radius: 50%;
        border: 1px solid #E1E1E1;
    }

    .flex-a {
        .back {
            width: 23.44rpx;
            margin-right: 43.75rpx;
        }

        text {
            line-height: 1;

        }
    }
}

.info {
    position: relative;
    display: flex;
    align-items: center;
    .toparrows{
        width: 26rpx;
         height: 8rpx;
    }
    .search-filter {
        position: absolute;
        min-width: 160rpx;

        overflow: hidden;
        transition: all 0.5s;
        top: 50rpx;
        right: 0;
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