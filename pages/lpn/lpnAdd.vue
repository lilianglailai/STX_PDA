<template>
  <view class="forecastAdd">
    <view class="flex-c">
      <view class="data-box">
        <view>{{ $t("forecast.container-number") }}：{{ obj.palletContainerNum }}</view>
        <view class="client flex-a">{{ $t('forecastLpn.clientNum') }}：
          <view class="flex1">
            <uni-load-more status="loading" style="justify-content: unset;"
              :contentText="{ contentrefresh: $t('loading') }" v-show="clientLoading"></uni-load-more>
            <view v-if="existclient && clientList.length">
              {{ existclientName }}
            </view>
            <!-- <as-select v-else v-show="!clientLoading" :placeholder="$t('select', { label: $t('forecast.client') })"
              :searchPlaceholder="$t('please', { label: '' })" v-model="obj.clientId" :options="clientList"
              labelKey="label" valueKey="value"></as-select> -->
          </view>
        </view>

      </view>
    </view>

    <view class="num-box">
      <view>{{ $t("forecast.receipt") }}<text style="width: 6rpx;display: inline-block;" v-if="setItem"></text> {{
        $t("quantity") }}:{{ quantity }}</view>
      <view>{{ $t("lpn.inventoryNumber") }}:{{ inventoryNumber }}</view>
    </view>
    <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }" v-show="loading"></uni-load-more>
    <transition-group tag="view" name="list" class="content-box">
      <view class="flex-a" v-for="(item, index) in list" :key="item.id">
        <!-- key是关键 -->
        <view class="flex1">
          <view class="title">{{ $t('lpn.model') }}: {{ item.model }}</view>
          <view class="flex" style="justify-content: space-between;">
            <text>{{ $t('lpn.forecastnumber') }}:{{ item.forecastQuantity || 0 }}</text>
            <text>{{ $t('lpn.inventoryNumber') }}:{{ item.packQuantity || 0 }}</text>
          </view>
        </view>
        <button class="primary-btn" @click="gomakeinventory(item)">{{ $t("lpn.inventory") }}</button>
        <button class="cancel flex-a flex-c" @click="del(item)" :loading="item.loading" :disabled="item.loading">
          {{ $t('lpn.delete') }}
        </button>
      </view>
    </transition-group>
    <view class="confirm-box">
      <view class="flex btn-box">
        <button class="add" @click="$refs.model.open()">{{ $t('lpn.addmodel') }}</button>
        <button class="del" @click="goremove">{{ $t('lpn.Excludedproducts') }}</button>
      </view>
      <button @click="submit" class="submit">{{ $t('lpn.submit') }}</button>
    </view>
    <uni-popup ref="inputDialog" type="dialog">
      <uni-popup-dialog ref="inputClose" mode="input" :title="$t('please', { label: $t('weight') + '/KG' })"
        :placeholder="$t('please', { label: $t('weight') + '/KG' })" @confirm="dialogInputConfirm"></uni-popup-dialog>
    </uni-popup>
    <uni-popup ref="model" background-color="#fff" class="model">
      <uni-popup-dialog @confirm="modelConfirm" :before-close="true" @close="$refs.model.close()">
        <div class="model-box">
          <select-lay style="margin-bottom: 10rpx;" svalue="id" slabel="model" :value="productId"
            @selectitem="selectitem" :placeholder="$t('select', { label: $t('lpn.model') })" :options="datalist">
          </select-lay>
          <textarea v-model="checkCodes" style="border: 1px solid #E5E5E5;border-radius: 10rpx;"
            :placeholder="$t('lpn.textAreaPl')"></textarea>
        </div>
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
var main, receiver, filter;
export default {
  name: 'lpn',
  data() {
    return {
      productId: '',
      setItem: false,
      checkCodes: '',
      datalist: [

      ],
      list: [

      ],
      number: "",
      clientLoading: false,
      existclient: '',
      clientList: [],
      total: 0,
      pageNo: 1,
      pageSize: 8,
      quantity: 0,
      inventoryNumber: 0
    };
  },
  onReachBottom() {
    if (this.pageNo * this.pageSize < this.total && !this.loading) {
      this.pageNo += 1;
      this.getDetail(this.pageNo);
    }
  },
  destroyed() {
    uni.$off("refresh");
     // #ifdef APP 
     this.stopScan();
    // #endif 
  },
  onShow() {
    // #ifdef APP 
    this.initScan();
    this.startScan();
    // #endif
  },
  onHide() {
    // #ifdef APP
    
    this.stopScan();
    // #endif
  },
  
  methods: {
    initScan() {
      let _this = this;
      main = plus.android.runtimeMainActivity(); //获取activity
      var IntentFilter = plus.android.importClass(
        "android.content.IntentFilter"
      );
      filter = new IntentFilter();
      filter.addAction("com.android.server.scannerservice.broadcast"); // 换你的广播动作 
      receiver = plus.android.implements(
        "io.dcloud.feature.internal.reflect.BroadcastReceiver",
        {
          onReceive: function (context, intent) {
            plus.android.importClass(intent);
            let code = intent.getStringExtra("scannerdata"); // 换你的广播标签
            _this.getBycode(code);
          },
        }
      );
    },
    startScan() {
      main.registerReceiver(receiver, filter);
    },
    stopScan() {
      main.unregisterReceiver(receiver);
    },
    getBycode(code){
      if (this.$refs.model.showPopup) {
          this.checkCodes+=code+' '
      }
    
    },
    modelConfirm() {
      let checkCodes = this.checkCodes.replace(/\n/g, ' ')
      this.checkCodesloading = true
      if (checkCodes.endsWith(' ')) {
        checkCodes = checkCodes.slice(0, -1);
      }
      this.apifn({
        url: "pad/v1/lpnStorageRecord/lpnStorage",
        method: "post",
        data: {
          palletContainerId: this.obj.palletContainerId,
          productId: this.productId,
          checkCodes: checkCodes
        }
      }).then(res => {
        this.checkCodesloading = false
        this.checkCodes = ""
        uni.showToast({
          title: res.msg,
          duration: 1500,
          icon: "none",
        });
        this.$refs.model.close()
        this.init()
      },
        err => this.checkCodesloading = false
      )

    },
    selectitem(index, item) {
      this.productId = item.id
      // console.log( this.modelName);

    },
    init() {
      this.pageNo = 1
      this.getDetail()
    },
    gomakeinventory(item) {
      let obj = {
        palletContainerId: item.palletContainerId,
        clientName: this.existclient ? this.existclientName : null,
        productId: item.productId,
        model: item.model
      }
      uni.navigateTo({
        url: '/pages/lpn/lpnmakeinventory?obj=' + encodeURIComponent(JSON.stringify(obj)),
      });
    },
    submit() {
      this.$refs.inputDialog.open()
    },
    async dialogInputConfirm(e) {
      this.apifn({
        url: `pad/v1/forecastReceipt/pdaUpdateOrderStatusToRePicked`,
        method: "post",
        data: {
          palletContainerId: this.obj.palletContainerId,
          actualWeight: e
          // searchValue:'affirm'
        }
      }).then(res => {
        uni.showToast({
          title: res.msg,
          duration: 1500,
          icon: "none",
        })
        setTimeout(() => {
          uni.navigateBack({
            delta: 1,
          });
        }, 1000);
      }, err => this.loading = false
      )
    },
    del(item) {
      uni.showModal({
        content: this.$t('lpn.deleteTitle'),
        success: (res) => {
          if (res.confirm) {
            this.$set(item, 'loading', true)

            this.apifn({
              url: "pad/v1/lpnStorageRecord/removeByProductId",
              method: "post",
              data: {
                productId: item.productId,
                palletContainerId: item.palletContainerId
              }
            }).then(res => {
              this.init()
              uni.showToast({
                title: res.msg,
                duration: 1500,
                icon: "none",
              })
            }
              , err => {
                item.loading = false
              }
            )
          }
        }
      })

    },
    goremove() {
      // palletContainerId: this.obj.palletContainerId
      uni.navigateTo({
        // url: "/pages/lpn/lpnremove?palletContainerId="+this.obj.palletContainerId,
        url: "/pages/lpn/lpnremove",
      });
    },
    async getDetail(page) {

      this.loading = true
      try {
        let res = await this.apifn({
          url: `pad/v1/lpnPackageMatch/list`,
          data: {
            pageNum: page ? page : 1,
            pageSize: page ? this.pageSize : this.pageNo * this.pageSize,
            palletContainerId: this.obj.palletContainerId
          }
        })
        if (page) {
          this.list = this.list.concat(res.rows);
        } else {
          this.list = res.rows
        }
        this.inventoryNumber = this.list.reduce((prev, cur) => {
          return prev + cur.packQuantity
        }, 0)
        this.quantity = this.list.reduce((prev, cur) => {
          return prev + cur.forecastQuantity
        }, 0)
        this.total = res.total
      } finally {
        this.loading = false
        uni.hideLoading();
      }

    }
  },
  computed: {
    existclientName() {

      return this.clientList.find(res => res.value == this.existclient)?.label
    }
  },
  created() {
    if (["de", 'en'].includes(uni.getLocale())) {
      this.setItem = true
    }
    this.apifn({
      url: `pad/v1/client/listAll`,
    }).then(res => {
      this.clientLoading = false
      this.clientList = res.data.map(res => { return { label: res.clientNumber, value: res.id } })
    }
    )
    uni.$on("refresh", (e) => { 
      if (e?.refresh) {
        // 刷新再走另外一套逻辑，时间不够了，交给你写吧：如果只是编辑，只更新当前页，如果删除该怎么更新才是最好的方案？
        setTimeout(() => {
          if (this.loading) { 
            uni.showLoading({
              title: this.$t('loading'),
            })
          }
        }, 1000);  
      }
      this.getDetail();
    });
  },
  onLoad(e) {
  
    
    this.obj = JSON.parse(decodeURIComponent(e.obj))
    if (this.obj.clientId) {
      this.existclient = this.obj.clientId
    }
    this.init()
    this.apifn({
      url: `client/product/list?clientId=${this.obj.clientId}&status=2&pageSize=999`
    }).then(res => {
      this.datalist = res.rows
    })

  },

}
</script>
<style lang="scss">
.model {
  /deep/ .uni-dialog-title {
    display: none !important;
  }

  /deep/.uni-dialog-content {
    padding: unset;

  }

  .model-box {
    width: 100%;
    padding: 10rpx;

    textarea {
      width: 100%;
      padding: 20rpx;
    }
  }
}
</style>

<style lang="scss" scoped>
.forecastAdd {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 216rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 216rpx)
}

.data-box {

  padding: 20rpx;
  flex-direction: column;
  margin-bottom: 20rpx;

  >view:not(:last-child) {
    margin-bottom: 10rpx;
  }
}

.content-box {

  .title {
    color: #006eff;
    font-size: 40rpx;
    margin-bottom: 10rpx;
  }

  >view {

    background: #ffffff;
    padding: 20rpx 16rpx 20rpx 30rpx;
    margin-bottom: 12.5rpx;

  }

  .cancel {
    height: 68rpx;
    min-width: 120rpx;
    background: #fa3534;
    border-radius: 9rpx;
    font-size: 26rpx;
    font-weight: 400;
    color: #ffffff;
    padding: 0 12rpx;
    margin-left: 10rpx;
  }

  .code {
    color: #333333;
    font-size: 42rpx;
    margin-bottom: 10rpx;
  }

  .Customer_Number {
    font-size: 36rpx;
  }

  .primary-btn {
    height: 68rpx;
    min-width: 120rpx;
    font-size: 26rpx;
    font-weight: 400;
    margin-left: 20rpx;
  }
}

.confirm-box {
  position: fixed;
  bottom: calc(constant(safe-area-inset-bottom) + 30rpx);
  bottom: calc(env(safe-area-inset-bottom) + 30rpx);
  left: 0;
  right: 0;
  margin: 0 30rpx;

  .btn-box {
    justify-content: space-between;
    margin-bottom: 20rpx;

    >button {
      border: 1px solid #0099ff;
      background: white;
      border-radius: 36rpx;
      width: 50%;
      height: 86rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
    }

    >button:first-child {
      margin-right: 40rpx;
    }
  }

  .submit {
    color: white;
    background: #0099ff;
    height: 80rpx;
    font-size: 32rpx;
    border-radius: 13rpx;

    border: unset;

    &::after {
      border: unset !important;
    }
  }
}

.containernumber {
  font-size: 40rpx;
}

.num-box {
  display: flex;
  flex-wrap: wrap;
  background-color: #ffe9da;
  font-size: 32rpx;
  padding: 12rpx 52rpx;
  justify-content: space-between;

}
</style>