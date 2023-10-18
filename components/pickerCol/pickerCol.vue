<template>
  <view>
        <picker mode="date" @change="dateChange">
                <view class="list-title flex-a">
                    <view>{{ time   }} </view>
                    <image
                        src="@/static/public/top_arrows.png"
                        mode="widthFix"
                    />
                </view>
            </picker>
  </view>
</template>

<script>
export default {
  name: 'pickerCol',
 
  data() {
    return {
        time: '',
    };
  },
   mounted(){
    this.time=this.getDate()
   },
 
  methods: {
    
    getDate() {
            const date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            month = month > 9 ? month : "0" + month;
            day = day > 9 ? day : "0" + day;
            return `${year}-${month}-${day}`;
        },
        dateChange(e) {
            this.time = e.detail.value;
           this.$emit('change',e.detail.value)
        },
  }
}
</script>

<style  lang='scss'>
.list-title {
    height: 100rpx;
    background: #ffffff;
    font-size: 38rpx;
    font-weight: 500;
    color: #333333;
    padding: 0 78rpx 0 67rpx;
    justify-content: space-between;
    margin: 16rpx 0;
    box-sizing: border-box;
    image {
        width: 28.28rpx;
    }
}
</style>