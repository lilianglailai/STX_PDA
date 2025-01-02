<template>
  <div>
    <!-- <scan   @scan="scan" v-model="number"> </scan> -->
    <view class="flex" style="margin:   20rpx 20rpx;"><uni-easyinput class="flex1 scan-input" type="text"
        :placeholder="$t('put.placeholder')" placeholder-class="placeholder" v-model="number"
        @confirm="getBycode(number)" />
      <button class="scan-submit" @click="getBycode(number)">{{ $t('search') }}</button>
    </view>
    <view class="wuc-tab" scroll-with-animation scroll-x :scroll-left="scrollLeft">
      <div class="wuc-tab-item" v-for="(item, index) in tabList" :key="index" :id="index" @tap="tabSelect(index)">
        <span class="text" :class="[index === tabCur ? 'cur' : '']">{{ item.name }} ({{ item.num || 0 }})</span>
      </div>
    </view>
    <view v-if="list.length" class="content-box">
      <view v-for="(item, index) in list" :key="index" class="flex">
        <view class="flex1">

          <view class="data-box">
            <view class="palletContainerNum">{{ item.palletContainerNum }}</view>
            <view class="flex item">
              <text>{{ $t('forecastdetail.customerNumber') }}:{{ item.clientNumber }}</text>
              <text>{{ $t('forecastdetail.packingTime') }}:{{ item.packingTime && item.packingTime.slice(0,
                10)
                }}</text>
            </view>
            <view class="flex item">
              <text>{{ $t('quantity') }}:{{ item.count }}</text>
              <view class="flex">
                <view style="word-break: break-all;flex: 1; ">
                  {{ $t('forecastdetail.accomplish_time') }}
                </view>
                <view style="width: 180rpx;">:{{ item.accomplishTime && item.accomplishTime.slice(0, 10) }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="btn-box flex" v-if="tabList[tabCur].status !== 2">
          <button class="viewdata" @click="goScan(item)">{{ $t('forecastdetail.code_scan_pack') }}</button>
          <!-- <button @click="download(item.batchCode)">导出</button> -->
        </view>
        <view class="btn-box flex">
          <button class="viewdata" @click="goDetail(item)">
            {{ $t('viewdata') }}</button>
          <!-- <button @click="download(item.batchCode)">导出</button> -->
        </view>
      </view>
    </view>
    <view v-if="!list.length & !loading" class="tips_box"> {{ $t('not_data') }} </view>
    <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
      v-if="list.length >= 10 && pageNo * pageSize >= total && !loading">
      ~~~~~~~~{{ $t('not_data') }}~~~~~~~~
    </view>
    <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }" v-show="loading"></uni-load-more>
  </div>
</template>

<script>
var mainz, receiverz, filterz;
export default {
  name: 'forecastdetail',
  data() {
    return {
      number: "",
      pageNo: 1,
      pageSize: 10,
      total: 0,
      tabCur: 0,
      scrollLeft: 0,
      list: [],
      loading: true,
      // 0=空箱,1=装箱中,2=已封箱,
      tabList: [
        {
          status: 0,
          name: "空箱"
        },
        {
          status: 1,
          name: "装箱"
        },
        {
          status: 2,
          name: "已封箱"
        },
      ]
    };
  },
  onReachBottom() {
    if (this.pageNo * this.pageSize < this.total && !this.loading) {
      this.pageNo += 1;
      this.getList();
    }
  },
  deactivated() {
    uni.$off("refreshList");
  },
  onShow() {
        // #ifdef APP 
        this.initScan();
        this.startScan();
        // #endif
    },
    onHide() {
        // #ifdef APP
        console.log(999);

        this.stopScan();
        // #endif
    },
    destroyed: function () {
        // #ifdef APP 
        this.stopScan();
        // #endif 
       
    },
  methods: {
    initScan() {
      let _this = this;
      mainz = plus.android.runtimeMainActivity(); //获取activity
      var IntentFilter = plus.android.importClass(
        "android.content.IntentFilter"
      );
      filterz = new IntentFilter();
      filterz.addAction("com.android.server.scannerservice.broadcast"); // 换你的广播动作 

      receiverz = plus.android.implements(
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
      mainz.registerReceiver(receiverz, filterz);
    },
    stopScan() {
      mainz.unregisterReceiver(receiverz);
    },
    getBycode(code) {
      this.number = code.replace(/\n/g, "")
      this.scan()
    },
    goScan(item) {
      let obj = {
        palletContainerId: item.palletContainerId,
        clientId: item.clientId,
        palletContainerNum: item.palletContainerNum
      }
      uni.navigateTo({
        url: '/pages/forecast/forecastAdd?obj=' + encodeURIComponent(JSON.stringify(obj)),
      });

    },
    goDetail(item) {
      uni.navigateTo({
        url: '/pages/forecast/forecastList?searchValue=' + item.palletContainerNum,
      });
      // forecastList
    },

    init() {
      this.pageNo = 1
      this.pageSize = 10
      this.list = []
    },
    scan(e) {
      this.init()
      this.getList();
    },
    tabSelect(index, e) {
      this.init()
      this.tabCur = index
      this.getList()
    },
    getList() {
      this.loading = true

      let data = {
        pageNum: this.pageNo,
        pageSize: this.pageSize,
        status: this.tabList[this.tabCur].status
      }
      if (this.number) {
        data.palletContainerNum = this.number
      }
      this.apifn({
        url: "pad/v1/forecastReceipt/getCargoBoxListQuery",
        method: "get",
        data: data
      }).then(res => {
        this.list = this.list.concat(res.rows)
        this.loading = false
        this.total = res.total
      },
        err => {
          this.loading = false
        }
      )
      // pad/v1/forecastReceipt/getCargoBoxListStatusCount

    },
    getCargoBoxListStatusCount() {
      this.apifn({
        url: "pad/v1/forecastReceipt/getCargoBoxListStatusCount",
        method: "get",

      }).then(resp => {

        this.tabList.forEach(res => {
          // res.num = 0
          resp.data.some(item => {
            if (item.status == res.status) {
              this.$set(res, 'num', item.num)
              return true
            }
          })
        });
        
      })
    }
  },
  created() {
    uni.$on("refreshl", (res) => {
      this.init()
      this.getList()
      this.getCargoBoxListStatusCount()
    })

    this.getList()
    this.getCargoBoxListStatusCount()
  }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}

.wuc-tab {
  margin-top: 20rpx;
  background: white;
  white-space: nowrap;
  border-bottom: 1rpx solid #E5E5E5;
  // height: 88rpx;
  display: flex;
}

.wuc-tab-item {
  display: inline-block;
  flex: 1;
  line-height: 100rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  padding: 0 20rpx;
  font-weight: 400;
  height: 100rpx;
}

.cur {
  position: relative;
  color: #3377FF;
  font-weight: 500;
  letter-spacing: 1px;
  height: 100%;
  display: inline-block;
}

.cur::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 4rpx;
  width: calc(100% - 34rpx);
  border-radius: 4prx;
  background: #3377FF;
}

.content-box {
  margin-top: 30rpx;

  >view {
    position: relative;
    min-height: 160rpx;
    background: #ffffff;
    padding: 0 16rpx;
    margin-bottom: 12.5rpx;

    border-radius: 16rpx;
    box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
  }

  .code {
    font-size: 40rpx;
    color: #333333;
    margin-bottom: 10rpx;
  }

  .btn-box {
    margin-left: 10rpx;

    >button {
      background: #3882ee;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
    }

    .viewdata {
      word-break: break-all;
      line-height: 1.4;
      width: 90rpx;
      padding: 10rpx;
    }
  }
}



.palletContainerNum {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.data-box {
  padding: 10rpx 0;
}

.item {
  font-size: 28rpx;
  margin-bottom: 5rpx;

  >text:first-child {
    width: 40%;
    word-break: break-word;
  }
}
</style>