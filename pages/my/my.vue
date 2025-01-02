<template>
  <div>
    <view class="container">
      <view> <text>{{ $t("login.username") }}</text>： {{username}} </view>
      <view><text>{{ $t("my.warehouse") }}</text>：{{abroadDepotName}} </view>
    </view>
    <div class="fixed_bottom">
      <button @click="quit">{{ $t('my.exit') }}</button>

    </div>
  </div>
</template>

<script>
export default {
  name: 'my',
  data() {
    return {
      username:"",
      abroadDepotName:""
    };
  },
  methods: {
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
        uni.clearStorageSync()
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }).catch(err => {
        // uni.removeStorageSync('username');
        // uni.removeStorageSync('token');
        uni.clearStorageSync()
        uni.reLaunch({
          url: '/pages/login/login'
        });
        // uni.showToast({
        //     title: err.msg,
        //     icon: "none",
        // });

      })

    },
  },
  created(){
    this.abroadDepotName=uni.getStorageSync('abroadDepotName')
    this.username=uni.getStorageSync('username')
  }
}
</script>

<style lang="scss">
.container {
  height: 200rpx;
  background-color: #ffffff;  
  border-radius: 16rpx;
  margin: 20rpx 10rpx;
  padding: 40rpx 20rpx;
  box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
  >view:first-child{
    margin-bottom: 40rpx;
  }
  text{
    font-weight: bold;
  }
}

.fixed_bottom {
  bottom: 60rpx;

  button {
    background-color: #F00000;
    color: white;
    border-radius: 40rpx;
  }
}
</style>