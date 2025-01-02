<template>
    <view class="as-select-container" :class="{'as-select-disabled': disabled, 'as-select-border': border}">
        <view class="as-select-input" @tap="open"  >
			<input :name="name" :value="selfLabel" :placeholder="placeholder" :placeholderStyle="placeholderStyle" disabled/>
			
			<slot name="suffix-icon">
			    <uni-icons type="bottom" size="18" color="#999"></uni-icons>
			</slot>
		</view>
        <as-popup ref="popup" type="bottom">
            <view class="as-select-popup">
                <view class="as-select-popup-mask" @tap="close"></view>
                <view class="as-select-popup-content">
                    <as-nav-bar :color="titleColor" :backgroundColor="titleBackgroundColor" :border="false" :statusBar="false"
                        :title="title" class="as-select-nav-bar">
                        <template slot="left">
                            <text v-if="multiple" @click="close" class="nav-left-text">取消</text>
                        </template>
                        <template slot="right">
                            <text v-if="multiple" @click="confirm" class="nav-right-text">确定</text>
                            <uni-icons class="rightIcon" :color="titleColor" type="closeempty"
                                size="23" @click="close" v-else></uni-icons>
                        </template>
                    </as-nav-bar>
                    <uni-search-bar radius="5" :value="searchValue" :placeholder="searchPlaceholder" clearButton="auto" cancelButton="none" @input="onSearchValueChange" v-if="showSearch && options.length"/>
                    
                    <scroll-view scroll-y="true" :lower-threshold="80" @scrolltolower="scrollToBottom" :style="{'height': listHeight}">
                        <view class="as-list" v-if="pageList && pageList.length">
                            <view
                                class="as-list-item"
                                :class="{
                                    'focus': focusValue == item[valueKey],
                                    'active': multiple && selfValue.indexOf(item[valueKey]) > -1,
                                    'disabled': item.disabled || (multiple && multipleLimit && selfValue.length >= multipleLimit && selfValue.indexOf(item[valueKey]) == -1)
                                }"
                                @tap="onClick(item,index)"
                                v-for="item,index in pageList"
                                :key="index">
                                <view class="as-list-content">
									<slot name="label" :row="item" >
										<text>{{item[labelKey]}}</text>
									</slot>
                                    <view class="icon">
                                        <uni-icons type="checkmarkempty" color="#2979ff" size="18"></uni-icons>
                                    </view>
                                </view>
                                <view class="as-list-border"></view>
                            </view>
                        </view>
                        <as-empty v-else text="暂无数据"></as-empty>
                    </scroll-view>
                </view>
            </view>
        </as-popup>
    </view>
</template>

<script>
    import { debounce } from 'lodash';
    // import AsSelectItem from './as-select-item.vue';
	
    export default {
        name: "as-select",
        // components: {
        //     AsSelectItem
        // },
        model: {
            prop: 'value',
            event: 'input'
        },
        props: {
            name: {
                type: String,
                require: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            // 是否多选
            multiple: {
                type: Boolean,
                default: false
            },
            // 多选时用户最多可以选择的项目数，为 0 则不限制
            multipleLimit: {
                type: Number,
                default: 0
            },
            value: [Array, String, Number],
            label: [Array, String, Number],
            listHeight: {
                type: String,
                default: 'calc(100% - 57px)'
            },
            // 自动查找label值, 默认为true, 此时label可以不传 
            // autoLabel: {
            //     type: Boolean,
            //     default: true
            // },
            placeholder: {
                type: String
            },
			// 选项数组
            options: {
                type: Array,
                default: function() {
                    return []
                }
            },
            valueKey: {
                type: String,
                default: 'value'
            },
            labelKey: {
                type: String,
                default: 'label'
            },
            // 标题
            title: {
                type: String,
                default: ''
            },
            searchPlaceholder: {
                type: String,
                default: '输入关键词进行搜索'
            },
            // 窗口弹出方式 'top' | 'left' | 'bottom' | 'right' | 'center'
            // modalType: {
            //     type: String,
            //     default: 'bottom'
            // },
            // 标题栏文字颜色
            titleColor: {
                type: String,
                default: '#333'
            },
            // 标题栏背景色
            titleBackgroundColor: {
                type: String,
                default: '#fff'
            },
            // 页码
            pageSize: {
                type: Number,
                default: 30
            },
            // 是否显示搜索
            showSearch: {
                type: Boolean,
                default: true
            },
			// 是否显示边框
			border: {
				Type: Boolean,
				default: true
			},
			// placeholder的样式(内联样式，字符串)，如"color: #ddd"
			placeholderStyle: {
				Type: String
			}
        },
        data() {
            return {
                searchValue: '',
                selfPageSize: this.pageSize,
                selfPageIndex: 1,
                // 记录点击value，用于点击效果显示
                focusValue: null,
                selfValue: ''
            }
        },
        created(){
            this.initSelfValue(this.value);
        },
        watch: {
            pageSize(val){
                this.selfPageSize = val;
            },
            value(val){
                this.initSelfValue(val);
            }
        },
        computed:{
            filterList: function(){
                return this.options.filter(item => item[this.labelKey]?.indexOf(this.searchValue) > -1);
            },
            pageList: function(){
                return this.filterList.slice(0, this.selfPageIndex * this.selfPageSize)
            },
            selfLabel: function(){
                let text;
                let selfValue = this.selfValue, options = this.options;
                if(this.label){
                    text = this.label;
                }else{
                    if(this.multiple){
                        const checked = options.filter(item => this.value?.indexOf(item[this.valueKey]) > -1 );
                        text = checked.map(item => item[this.labelKey]).join();
                    }else{
                        const checked = options.find(item => item[this.valueKey] === selfValue);
                        checked && (text = checked[this.labelKey]);
                    }
                }
                return text;
            },
            loadMoreStatus: function(){
                return this.selfPageIndex * this.selfPageSize >= this.filterList.length ? 'noMore' : 'more';
            }
        },
        methods: {
            open() {
                if(!this.disabled){
                    this.searchValue = '';
                    this.selfPageIndex = 1;
                    this.initSelfValue(this.value);
                    this.$refs.popup.open();
                }
            },
            close(){
                this.$refs.popup.close();
            },
            confirm(index,label){
                this.$emit('change', {value:this.selfValue,index:index,label:label});
                this.$emit('input', this.selfValue);
                this.close();
            },
            onClick(e,index) {
                if(e.disabled) return;
                if(this.multiple){
                    let index = this.selfValue.indexOf(e[this.valueKey]);
                    if(index > -1){
                        this.selfValue.splice(index, 1);
                    }else{
                        if(this.multipleLimit && this.selfValue.length >= this.multipleLimit) return;
                        this.selfValue.push(e[this.valueKey]);
                    }
                }else{
                    this.focusValue = e[this.valueKey];
                    console.log(e);
                    
                    setTimeout(()=> {
                        this.focusValue = null;
                        this.selfValue = e[this.valueKey];
                        this.$emit('update:label', e[this.labelKey]);
                        this.confirm(index,e.label);
                    }, 100)
                }
            },
            onSearchValueChange: debounce(function(val) {
                this.searchValue = val;
                this.selfPageIndex = 1;
            }, 300),
            scrollToBottom(){
                this.selfPageIndex++;
            },
            // 更新pageSize
            updatePageSize(val){
                this.selfPageSize = val;
                this.$emit('update:page-size', val);
            },
            initSelfValue(val){
                if(val !== undefined && val !== null){
                    this.selfValue =  this.multiple ? [].concat(val) : val;
                } else{
                    this.selfValue = this.multiple ? [] : '';
                }
            }
        }
    }
</script>

<style lang="scss">
    $border-color: #EFEFF0;
    
    .as-select-container {
        width: 100%;
        border-radius: 4px;
        box-sizing: border-box;

		.as-select-input{			
			display: flex;
			align-items: center;
			min-height: 36px;
			position: relative;
			gap: 16rpx;
			
			/deep/ .uni-input-input{
				pointer-events: none;
			}
		}
        input {
            width: 100%;
            height: 1.4em;
            min-height: 1.4em;
            line-height: 1;
            font-size: 14px;
            color: rgb(51, 51, 51);
        }

        .uni-icons {
            flex-shrink: 0;
        }
        
        &.as-select-disabled{
            background-color: #eee;
        }
		
		&.as-select-border{
			border: 1px solid #e5e5e5;
			padding: 0 10px;
		}
    }
    .as-select-nav-bar{
		border-bottom:1px solid #e5e5e5;
		display: block;
		
		.nav-left-text{
			color: #888;
		}
		
		.nav-right-text{
			color: #2979ff;
		}
    }

    .as-select-popup {
        height: calc(100vh - 50px);
        position: relative;
        
        .as-select-popup-mask{
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
        }
        
        .as-select-popup-content{
            background: #fff;
            // display: flex;
            flex-direction: column;
            position: absolute;
            bottom: 0;
            width: 100%;
        }
        
        // .uni-navbar{
        //     border-bottom: 1px solid #e5e5e5;
            
        //     /deep/ {
        //         .uni-status-bar{
        //             display: none;
        //         }
        //         .uni-navbar__content{
        //             width: 100%;
        //         }
        //     }
        // }

        .uni-searchbar {
            flex-shrink: 0;
            border-bottom: 1px solid $border-color;
        }

        // uni-scroll-view {
        //     flex: 1;
        //     height: 0;
        // }
    }
	
	
    .as-list-item {
        color: #666;
		font-size: 26rpx;

        .as-list-border{
            position: relative;
            margin-left: 15px;
            
            &::after {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                height: 1px;
                content: "";
				display: block;
                -webkit-transform: scaleY(.5);
                transform: scaleY(.5);
                background-color: $border-color;
            }
        }
        
        .as-list-content{
            padding: 10px 15px;
            line-height: 30px;
            display: flex;
            justify-content: space-between;
            
            .icon{
                height: 30px;
                overflow: hidden;
                margin-right: 5px;
                display: none;
            }
        }
        
        
        &.focus{
            background: #f1f1f1;
        }
        &.active{
            color: #2979ff;
            
            .as-list-content{
                .icon{
                    display: block;
                }
            }
        }
        &.disabled{
            color: #c7c7c7; 
        }
    }
    .as-empty{
        height: 258px;
    }
</style>
