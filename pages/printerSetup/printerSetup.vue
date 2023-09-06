<template>
    <view class="router-box">
        <Navigation
            :backTitle="$t('printerSetup.title')"
            :titleShow="false"
        ></Navigation>
        <view class="box">
            <view v-for="(item, index) in list" class="flex" :key="index">
                <label
                    >{{ item.label }}
                    <text
                        v-if="item.required"
                        style="color: red; margin-left: 10rpx"
                        >*</text
                    >
                </label>
                <input
                    v-if="!item.slot"
                    type="text"
                    v-model="obj[item.value]"
                    :placeholder="$t('please') + item.label"
                    class="pop_input"
                    placeholder-class="placeholder"
                    @confirm="index == list.length - 1 ? submit() : null"
                />
                <view class="example" 
                    >{{ $t("printerSetup.example") }}:{{ item.example }} <image src="@/static/printerSetup/copy.png"  @click="copy(item.example)"  mode="widthFix"></image></view
                >
            </view>
        </view>
        <button
            class="submit"
            @click="submit"
            :loading="loading"
            :disabled="loading"
        >
            {{ $t("submit") }}
        </button>
    </view>
</template>

<script>
export default {
    name: "password",
    data() {
        return {
            time: null,
            list: [
                {
                    label: this.$t("printerSetup.form.label1"),
                    value: "add",
                    
                    example: "192.168.1.31",
                },
                {
                    label: this.$t("printerSetup.form.label2"),
                    value: "name",
                    
                      example: "Xprinter",
                    
                },
                {
                    label: this.$t("printerSetup.form.label3"),
                    value: "port",
                     
                    example: "www.ilsau.cn",
                },
            ],
            loading: false,
            obj: {},
        };
    },
   created(){
    this.obj.add=uni.getStorageSync("printerAdd") || ''
   
    this.obj.name=uni.getStorageSync("printerName") || ''
    this.obj.port=uni.getStorageSync("printerPort") || ''
   },
    methods: {
        copy(text){
             uni.setClipboardData({
				//准备复制的数据
				data: text,
				success:   (res)=> {
					uni.showToast({
						icon:'none',
						title: this.$t('succeed')
					});
				}
			})
        },
        submit() {
            let a = this.list.some((ele) => {
                if (ele.required && !this.obj[ele.value]) {
                    uni.showToast({
                        title: this.$t("please") + ele.label,
                        icon: "none",
                    });
                    return true;
                }
            });
            if (a) {
                return false;
            }
            this.loading = true;
            uni.setStorageSync("printerAdd", this.obj.add);
            uni.setStorageSync("printerName", this.obj.name);
            uni.setStorageSync("printerPort", this.obj.port);

            uni.showToast({
                title: this.$t("submit") + " " + this.$t("succeed"),
                duration: 1000,
            });
            this.time = setTimeout(() => {
                uni.navigateBack({
                    delta: 1,
                });
            }, 1000);
        },
    },
};
</script>

<style  lang='scss' scoped>
.box {
    background: white;
    //    margin-top:
}
.flex {
    flex-direction: column;
    padding: 31rpx 39rpx;

    label {
        font-size: 38rpx;

        font-weight: bold;
        color: #333333;
        margin-bottom: 14rpx;
    }

    .pop_input {
        width: 669rpx;
        height: 84rpx;
        border: 2px solid #9f9f9f;
        border-radius: 9rpx;
        text-indent: 22rpx;
        margin-bottom: 12rpx;
    }
    .placeholder {
        font-size: 38rpx;

        font-weight: 500;
        color: #9f9f9f;
    }
    .example{
        font-size: 31rpx;
font-weight: 500;
color: #9F9F9F;
display: flex;
   image{
        width: 40rpx;
        margin-left: 20rpx;
    }
    }
 
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 43rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
    &::after {
        border: none;
    }
}
</style>