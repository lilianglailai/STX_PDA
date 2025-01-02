<template>
    <view v-if="showPopup" class="as-popup" :class="'as-popup-' + type">
        <uni-transition key="1" mode-class="fade" :show="showContent">
            <view class="as-mask" @tap="close" @touchmove.stop.prevent="stopPrevent"></view>
        </uni-transition>
        <uni-transition key="2" :mode-class="animate" :show="showContent" class="as-popup-content-wapper">
            <view class="as-popup-content"  @touchmove.stop.prevent="stopPrevent">
                <slot></slot>
            </view>
        </uni-transition>
    </view>
</template>
<script>
    export default{
        name: 'AsPopup',
        model: {
            prop: 'status',
            event: 'change'
        },
        props: {
            status: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'bottom'
            }
        },
        data(){
            return {
                showPopup: false,
                showContent: false,
                timer: null
            }
        },
        watch: {
            status(status){
                if(status){
                    this.open();
                }else{
                    this.close();
                }
            },
			// H5 下禁止底部滚动
			showPopup(show) {
				// #ifdef H5
				// fix by mehaotian 处理 h5 滚动穿透的问题
				document.getElementsByTagName('body')[0].style.overflow = show ? 'hidden' : 'visible'
				// #endif
			}
        },
        computed: {
            animate() {
                let animate;
                switch(this.type){
                    case 'top':
                        animate = ['fade', 'slide-top'];
                        break;
                    case 'bottom':
                        animate = ['fade', 'slide-bottom'];
                        break;
                    case 'left':
                        animate = ['fade', 'slide-left'];
                        break;
                    case 'right':
                        animate = ['fade', 'slide-right'];
                        break;
                    case 'center':
                    case 'dialog':
                        animate = ['zoom-out', 'fade'];
                        break;
                }
                return animate;
            }
        },
        methods: {
            stopPrevent() {
            
            },
            open() {
				if (this.showPopup) {
					clearTimeout(this.timer)
					this.showPopup = false
				}
                this.showPopup = true;
                this.showContent = true;
                this.$emit('change', true);
            },
            close() {
                this.showContent = false;
                this.$emit('change', false);
				clearTimeout(this.timer)
                this.timer = setTimeout(()=>{
                    this.showPopup = false;
                }, 300);
            }
        }
    }
</script>
<style scoped lang="scss">
    .as-popup{
        position: fixed;
        /* #ifndef APP-NVUE */
        z-index: 999;
        /* #endif */
        
        .as-popup-content-wapper{
            position: fixed;
            left: 0px;
            right: 0px;
            bottom: 0px;
            z-index: 9;
        }
        
        &.as-popup-dialog, &.as-popup-center{
            .as-popup-content-wapper{
                display: flex;
                align-items: center;
                top: 0;
                justify-content: center;
            }
            .as-popup-content{
                position: fixed;
                left: 0px;
                right: 0px;
                bottom: 0px;
                z-index: 9;
                display: flex;
                align-items: center;
                top: 0;
                justify-content: center;
            }
        }
    }
    .as-mask {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
    }
</style>
