<template>
    <view class="as-popup-dialog">
    	<view class="as-dialog-title">
    		<text class="as-dialog-title-text" :class="['as-popup__'+type]">{{title}}</text>
    	</view>
    	<view v-if="mode === 'base'" class="as-dialog-content">
    		<slot>
    			<text class="as-dialog-content-text">{{content}}</text>
    		</slot>
    	</view>
    	<view v-else class="as-dialog-content">
    		<slot>
    			<input class="as-dialog-input" v-model="val" :type="inputType" :placeholder="placeholderText" :focus="focus" >
    		</slot>
    	</view>
    	<view class="as-dialog-button-group">
    		<view class="as-dialog-button" @click="closeDialog">
    			<text class="as-dialog-button-text">{{cancelText}}</text>
    		</view>
    		<view class="as-dialog-button as-border-left" @click="onOk">
    			<text class="as-dialog-button-text as-button-color">{{confirmText}}</text>
    		</view>
    	</view>
    
    </view>
</template>

<script>
    export default{
        name: "AsPopupDialog",
		emits:['confirm','close'],
		props: {
			inputType:{
				type: String,
				default: 'text'
			},
			value: {
				type: [String, Number],
				default: ''
			},
			placeholder: {
				type: [String, Number],
				default: ''
			},
			type: {
				type: String,
				default: 'info'
			},
			mode: {
				type: String,
				default: 'base'
			},
			title: {
				type: String,
				default: ''
			},
			content: {
				type: String,
				default: ''
			},
			beforeClose: {
				type: Boolean,
				default: false
			},
			cancelText:{
				type: String,
				default: '取消'
			},
			confirmText:{
				type: String,
				default: '确定'
			}
		},
        data(){
            return {
                popup: null,
                focus: false,
                val: ""
            }
        },
		methods: {
            /**
             * 获取父元素实例
             */
            getParent() {
                let name = 'AsPopup';
                let parent = this.$parent;
                let parentName = parent.$options.name;
                while (parentName !== name) {
                    parent = parent.$parent;
                    if (!parent) return false
                    parentName = parent.$options.name;
                    console.log(parentName);
                }
                return parent;
            },
			/**
			 * 点击确认按钮
			 */
			onOk() {
				if (this.mode === 'input'){
					this.$emit('confirm', this.val)
				}else{
					this.$emit('confirm')
				}
				if(this.beforeClose) return
				this.popup.close()
			},
			/**
			 * 点击取消按钮
			 */
			closeDialog() {
				this.$emit('close')
				if(this.beforeClose) return
				this.popup.close()
			},
			close(){
				this.popup.close()
			}
		}
    }
</script>

<style lang="scss" >
	.as-popup-dialog {
		width: 300px;
		border-radius: 11px;
		background-color: #fff;
	}

	.as-dialog-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		padding-top: 25px;
	}

	.as-dialog-title-text {
		font-size: 16px;
		font-weight: 500;
	}

	.as-dialog-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.as-dialog-content-text {
		font-size: 14px;
		color: #6C6C6C;
	}

	.as-dialog-button-group {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		border-top-color: #f5f5f5;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.as-dialog-button {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */

		flex: 1;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: 45px;
	}

	.as-border-left {
		border-left-color: #f0f0f0;
		border-left-style: solid;
		border-left-width: 1px;
	}

	.as-dialog-button-text {
		font-size: 16px;
		color: #333;
	}

	.as-button-color {
		color: #007aff;
	}

	.as-dialog-input {
		flex: 1;
		font-size: 14px;
		border: 1px #eee solid;
		height: 40px;
		padding: 0 10px;
		border-radius: 5px;
		color: #555;
	}

	.as-popup__success {
		color: #4cd964;
	}

	.as-popup__warn {
		color: #f0ad4e;
	}

	.as-popup__error {
		color: #dd524d;
	}

	.as-popup__info {
		color: #333;
	}
</style>
