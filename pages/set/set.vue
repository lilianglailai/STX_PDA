<template>
  <view  class="router-box">
     <Navigation :backTitle="$t('setup')" :titleShow="false"></Navigation>
     <view class="content-box">
        <view class="flex-a" v-for="(item, index) in list" :key="index" @click="item.fn()">
            <image :src="item.img" mode="widthFix" />
            <view class="title">{{item.laebl}}</view>
        </view>
        
     </view>
  </view>
</template>

<script>
export default {
  name: 'set',
  data () {
    return {
         list:[
                {laebl:this.$t('set.list.label1'),fn:this.goUrl.bind(null,'/pages/printerSetup/printerSetup'),img:require("@/static/set/printerSetup.png")},
               
            ],

    }
  },
  methods: {
    goUrl(url){
       
          uni.navigateTo({
                 url: url
            });
    }
  }
}
</script>

<style  lang='scss' scoped>
.content-box{
    >view{
        flex-direction: column;
        image{
            margin: 50rpx;
            width: 559.38rpx;
        }
        .title{
            font-size: 47rpx;
 
font-weight: bold;
color: #333333;
        }
    }
}
</style>