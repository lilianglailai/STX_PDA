<template>
    <view class="fixed-box">
        <view class="top-box"></view>
        <view class="menu-box flex flex-a">
            <view class="flex-a" @click="goback">
                <div>
                    <image
                        v-show="backShow"
                        src="/static/navigation/arrows.png"
                        mode="widthFix"
                    />
                </div>

                <text>{{ backTitle }}</text>
            </view>

            <view v-if="titleShow" @click="isSearchFilter = !isSearchFilter" class="info">{{ title }}
                	<view class="search-filter" :style="{ 'height':isSearchFilter ? list.length * 76 + 12+'rpx': 0}">
							<view class="triangle"></view>
							<view class="filter">
								<view class="flex-a"  @click.stop="isSearchFilter =false;item.fn()" v-for="(item, index) in list" :key="index"
									 >{{item.laebl}}</view>
                                   
								<!-- <view class="flex-a" @click.stop="isSearchFilter =false;goPassword()"
									 >修改密码</view> -->
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
            isSearchFilter:false,
            list:[
                {laebl:this.$t('exit'),fn:this.quit.bind()},
                
            ]
        };
    },
    computed: {
        title() {
            return uni.getStorageSync("username");
        },
    },
    methods: {
       
        quit() {
           
            uni.removeStorageSync('username');
            uni.removeStorageSync('token');
            uni.reLaunch({
                 url: '/pages/login/login'
            });
        },
        goPassword(){
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
};
</script>

<style  lang='scss' scoped>
.fixed-box {
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 99;
}
.top-box {
    height: var(--status-bar-height);
    background: #1266df;
}
.menu-box {
    justify-content: space-between;
    height: 116rpx;
    background: #3882ee;
    padding-left: 48rpx;
    padding-right: 57rpx;
    font-size: 38rpx;
    font-weight: 400;
    color: #ffffff;

    .flex-a {
        image {
            width: 23.44rpx;
        }
        text {
            line-height: 1;
            margin-left: 43.75rpx;
        }
    }
}
.info {
    position: relative;
    .search-filter {
        position: absolute;
        width: 160rpx;
        
        overflow: hidden;
        transition: all 0.5s;
        top: 54rpx;
        left: -10rpx;
        z-index: 10;
        border-radius: 16rpx;

        .triangle {
            width: 0;
            height: 0;
            border-left: 12rpx solid transparent;
            border-right: 12rpx solid transparent;
            border-bottom: 20rpx solid rgba(0,0,0,0.5);
            transform: translateX(36rpx);
        }

        .filter {
            width: 100%;
            
            background-color: rgba(0,0,0,0.5);
            border-radius: 16rpx;
            
            > view {
                color: #ffffff;
                font-size: 28rpx;
                
                box-sizing: border-box;
                font-weight: 500;
                padding-left: 16rpx;
                height: 76rpx;
            }
             > view:not(:last-child){
                 
                    border-bottom: 1rpx solid #646566;
                
            }
        }
     }
     
}
</style>