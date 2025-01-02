<script>
export default {
  onLaunch: function () {
    // console.log('App Launch')
  },
  onShow: function () {

  },
  onHide: function () {
    // console.log('App Hide')
  },
  methods: {
    update() {
      this.apifn({
        url: `pad/v1/client/appUpdate/newObject`,  //请求接口
      }).then(res => {
        let versions = res.data.versionName
        let apkUrl = res.data.apkUrl
        plus.runtime.getProperty(plus.runtime.appid, (inf) => { 
          if (inf.version != versions) {
            uni.showModal({
              title: this.$t('updateFn.title'),
              content: this.$t('updateFn.Download'),
              success: (res) => {
                if (res.confirm == true) {//当用户确定更新，执行更新
                  this.doUpData(apkUrl);
                }
              }
            })
          }
        });
      },
        err => {
          console.log(err);
        }
      )
    },

    doUpData(url) {

      let downloadTask = uni.downloadFile({//执行下载
        url: url, //下载地址
        success: downloadResult => {//下载成功
          uni.hideLoading();
          if (downloadResult.statusCode == 200) {
            uni.showModal({
              title: '',
              content: this.$t('updateFn.UpdateSuccess'),
              confirmText: this.$t('updateFn.restart'),
              confirmColor: '#EE8F57',
              success: function (res) {
                if (res.confirm == true) {
                  plus.runtime.install(//安装
                    downloadResult.tempFilePath, {
                    force: true
                  },
                    function (res) {
                      utils.showToast(this.$t('updateFn.Restarting'));
                      plus.runtime.restart();
                    }
                  );
                }
              }
            });
          }
        },
        fail: err => {
          uni.hideLoading()
          uni.showToast({
            title: this.$t('err'),
            icon: "none",
          });
        }
      });
      var showLoading = plus.nativeUI.showWaiting(this.$t('updateFn.updating'), { back: "none" });//{back: "none"}用来禁止返回键
      downloadTask.onProgressUpdate((res) => {
        showLoading.setTitle(this.$t('updateFn.downloading') + res.progress + "%  ");
        if (res.progress == 100) {
          plus.nativeUI.closeWaiting();
        } 
      });
    }


  },
  created() {
    // #ifdef APP 
    // this.update()
    let token= uni.getStorageSync('token');  //通过token判断是否登录
    console.log(token,'token');
    
    if (token) {
        //存在则关闭启动页进入首页
        plus.navigator.closeSplashscreen();
    } else {
        //不存在则跳转至登录页
        uni.reLaunch({
            url: "/pages/login/login",
            success: () => {
                plus.navigator.closeSplashscreen();
            }
        })
    }
    // #endif 
    
  },

}
</script>

<style lang="scss">
@import "@/static/ll_css.scss";

* {
  box-sizing: border-box;
}

/*每个页面公共css */
.router-box {
  padding-top: calc(var(--status-bar-height) + 131.6rpx)
}

.app-box {
  margin-top: 10px;
}

.highlight {
  color: #339f69 !important;
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

.as-select-popup-content {
  height: 70vh;
}
</style>
