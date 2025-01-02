<script>
export default {
  onLaunch: function () {
    // console.log('App Launch')
  },
  onShow: function () {
    // console.log('App Show')
  },
  onHide: function () {
    // console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import "@/static/ll_css.scss";
*{
  box-sizing: border-box;
}
/*每个页面公共css */
.router-box {
  padding-top: calc(var(--status-bar-height) + 131.6rpx)
}

.app-box {
  margin-top: 10px;
}
.highlight{
  color:  #339f69 !important;
}
.scan-input { 
  .is-input-border {
    border: unset !important;
  }

   .uni-easyinput__content-input {
    height: 80rpx !important;
    background: #ffffff;
    font-size: 38rpx !important;
  }
}
.scan-submit {
    height: 80rpx;
    line-height: 80rpx;
    margin-left: 20rpx;
    background-color: #3882ee;
    border-radius: 40rpx;
    color: white;
}

body {
  background: #F2F2F2;
}

.number {
  color: #3882EE;
  font-weight: bold;
  transform: scale(1.3);
  display: inline-block;
  margin-right: 4px;
}

.fixed_bottom {
  position: fixed;
  bottom: 0;
  background: #ffff;
  left: 20rpx;
  right: 20rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid #e6e6e6;

  >view {
    justify-content: center;
    margin: 24rpx;
    height: 80rpx;
    background: #3377ff;
    border-radius: 80rpx;
    font-size: 30rpx;
    font-weight: 400;
    color: #ffffff;
  }
}
.as-select-popup-content{
  height: 70vh;
}
</style>
