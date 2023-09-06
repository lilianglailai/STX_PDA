<template>
   <view>
    <view class="signature"  >
      <canvas
        class="mycanvas"
        canvas-id="mycanvas"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend="touchend"
      ></canvas>
       
      
    </view>
    
  </view>
</template>

<script>
 
 
export default {
name:"signatureCom",
props:{
    value:{
        type:String
    }
},
  data() {
    return {
      
      showCanvas: false,
      ctx: "", //绘图图像
      points: [], //路径点集合
      signature: ""
    };
  },
  mounted() {
    this.createCanvas();
  },
//   onShow() {
//     this.createCanvas();
//     let that = this;
//     // setTimeout(function() {
//     //   // 笔迹反显
//     //   if (Local.local.getItem("canvasPath")) {
//     //     let imgPath = Local.local.getItem("canvasPath");
//     //     const sInfo = uni.getSystemInfoSync();
//     //     that.ctx.drawImage(
//     //       imgPath,
//     //       0,
//     //       0,
//     //       sInfo.windowWidth,
//     //       sInfo.windowHeight
//     //     );
//     //     that.ctx.draw(true);
//     //   }
//     // }, 500);
//   },
  methods: {
    
    //关闭并清空画布
    close: function() {
      this.showCanvas = false;
      this.clear();
    },
    //创建并显示画布
    createCanvas: function() {
    //   this.showCanvas = true;

      this.ctx = uni.createCanvasContext("mycanvas", this); //创建绘图对象

      //设置画笔样式
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    },
    //触摸开始，获取到起点
    touchstart: function(e) {
      let startX = e.changedTouches[0].x;
      let startY = e.changedTouches[0].y;
      let startPoint = { X: startX, Y: startY };
      this.points.push(startPoint);
      //每次触摸开始，开启新的路径
      this.ctx.beginPath();
    },

    //触摸移动，获取到路径点
    touchmove: function(e) {
      let moveX = e.changedTouches[0].x;
      let moveY = e.changedTouches[0].y;
      let movePoint = { X: moveX, Y: moveY };
      this.points.push(movePoint); //存点
      let len = this.points.length;
      if (len >= 2) {
        this.draw(); //绘制路径
      }
    },

    // 触摸结束，将未绘制的点清空防止对后续路径产生干扰
    touchend: function() {
      this.points = [];
    },

 
    draw: function() {
      let point1 = this.points[0];
      let point2 = this.points[1];
      this.points.shift();
      this.ctx.moveTo(point1.X, point1.Y);
      this.ctx.lineTo(point2.X, point2.Y);
      this.ctx.stroke();
      this.ctx.draw(true);
    },

    //清空画布
    clear: function() {
      let that = this;
      uni.getSystemInfo({
        success: function(res) {
          let canvasw = res.windowWidth;
          let canvash = res.windowHeight;
          that.ctx.clearRect(0, 0, canvasw, canvash);
          that.ctx.draw(true);
        }
      });
    },
    //完成绘画并保存到本地
    finish(){
      let that = this;
      uni.canvasToTempFilePath({
        canvasId: "mycanvas",
        success:(res)=> {
        
          
          this.$emit('input',res.tempFilePath)
        }
      });
    }
  }
};
</script>

<style>
 
 
 
.title {
  height: 50upx;
  line-height: 50upx;
  font-size: 16px;
}
.mycanvas {
  width: 100%;
  background: #F1F1F1;
}
.footer {
  font-size: 14px;
  height: 150upx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.left,
.right{
  line-height: 100upx;
  height: 100upx;
  width: 300upx;
  text-align: center;
  font-weight: bold;
  color: white;
  border-radius: 5upx;
}
.left {
  background: #007aff;
}
.right {
  background: orange;
}
</style>