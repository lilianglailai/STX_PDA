<template>
    <view class="router-box">
        <Navigation :backTitle="$t('caPai.menu')"></Navigation>
        <view class="content-box">
            <view v-for="(item, index) in list" :key="index">
                <view class="label">
                    <text
                        v-if="item.required"
                        style="color: red; margin-right: 10rpx"
                        >*</text
                    >
                    {{ item.label }}:
                </view>
                <template v-if="(item.slot == 'select') ">
                    <uni-load-more
                        status="loading"
                        :contentText="{ contentrefresh: $t('loading') }"
                        v-if="loading"
                    ></uni-load-more>
                    <uni-data-select
                        :placeholder="item.pl"
                        :localdata="driverList"
                        v-model="value"
                        @change="item.fn"
                        v-else
                    >
                    </uni-data-select>
                </template>

                <input
                    v-else
                    :type="item.type || 'text'"
                    v-model="obj[item.prop]"
                    ref="input"
                    class="pop_input"
                    placeholder-class="input-pl"
                    :placeholder="item.pl"
                />
            </view>
        </view>
        <button
            class="submit"
            :disabled="btnloading"
            :loading="btnloading"
            @click="submit"
        >
            Submit
        </button>
    </view>
</template>

<script>
export default {
    name: "vehicle",
    data() {
        return {
            obj: {},
            loading: false,
            driverList: [],
            btnloading: false,
            type: "",
            value: "",
            list: [
                {
                    required: true,
                    label: "Driver",
                    prop: "driver",
                    slot: "select",
                    pl: "Please enter driver name",

                    fn: (e) => {
                       
                        if (e) {
                            this.driverList.some((res) => {
                                if (res.id == e) {
                                    this.obj.rego = res.rego;
                                    this.obj.phone = res.phone;
                                    this.obj.driver = res.driverName;
                                     if (this.type != "Create Task")  {
                                         this.obj.driverName = res.driverName;
                                    }
                                    return true;
                                }
                            });
                        } else {
                            this.obj = {};
                        }
                    },
                },
                {
                    required: true,
                    label: "Rego",
                    prop: "rego",

                    pl: "Please enter the rego",
                },
                {
                    required: true,
                    label: "Phone",
                    prop: "phone",

                    pl: "Please enter the telephone no",
                },
            ],
            time: "",
            refreshPage:undefined
        };
    },
    created() {
        this.loading = true;
        this.apifn({
            url: "oms/v1/OrderAbroadParcel/listDriver?page=1&pageSize=999",
        }).then((res) => {
            this.loading=false
            this.driverList = res.body.current_data.map((res) => {
                return {
                    value: res.id,
                    text: res.driverName,
                    ...res,
                };
            });
            if (this.type != "Create Task") {
                let a = this.driverList.some((res) => {
                    if (res.driverName == this?.obj?.driver) {
                        this.value = res.id;
                     
                        return true;
                    }
                });
                if (!a) {
                    uni.showToast({
                        title: "Driver does not exist",
                         icon:"none"
                    });
                }
            }
        });
    },
    onLoad(e) {
        if (e.obj) {
            this.obj = JSON.parse(decodeURIComponent(e?.obj));
            this.obj.driverName= this.obj.driver
            console.log(this.obj);
          
        }
        if (e.type) {
            this.type = e.type;
        }
        if (e.refreshPage) {
            this.refreshPage=e.refreshPage
        }
    },
    destroyed() {
        clearTimeout(this.time);
    },

    methods: {
        submit() {
            let a = this.list.some((res, index) => {
                if (!this.obj[res.prop]) {
                    uni.showToast({
                        title: "please " + (res.slot || "input ") + res.label,
                        icon: "none",
                    });
                    return true;
                }
            });
            if (a) {
                return false;
            }

            if (this.type == "Create Task") {
                uni.navigateTo({
                    url:
                        "/pages/out/scan/scan?obj=" +
                        encodeURIComponent(JSON.stringify(this.obj)) +
                        "&type=" +
                        this.type,
                });
            } else {
                this.btnloading=true
                this.apifn({
                    url: "oms/v1/OrderAbroadParcel/updateDriver",
                    method: "post",
                    header: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    data: {
                        ...this.obj,
                        scanOutCode: this.obj.scanOut,
                    },
                }).then((res) => {
                    this.time = setTimeout(() => {
                        uni.navigateBack({
                            delta: 1,
                        });
                        this.btnloading=false
                    }, 1500);
                 
                    uni.$emit("refresh",{
                        refreshPage:this.refreshPage
                    });
                });
            }
        },
    },
};
</script>

<style  lang='scss' scoped>
.content-box {
    background: white;
    padding: 26rpx 40rpx 45rpx;
    > view:not(:last-child) {
        margin-bottom: 37.5rpx;
    }
    .label {
        margin-bottom: 17rpx;
        font-size: 38rpx;
        font-weight: bold;
        color: #333333;
    }
    .pop_input {
        height: 84rpx;
        border: 2rpx solid #9f9f9f;
        border-radius: 9rpx;
        padding-left: 23rpx;
        width: 100%;
        box-sizing: border-box;
        font-size: 38rpx;
        font-weight: 500;
        color: black;
    }

    /deep/ .uni-select__input-placeholder {
        font-size: 38rpx;
        font-weight: 500;
        color: #9f9f9f;
    }

    /deep/ .uni-select__input-text {
        font-weight: 500;
        font-size: 38rpx;
    }
    /deep/ .uni-select {
        height: 84.38rpx;
    }
}
.submit {
    width: 714rpx;
    height: 84rpx;
    background: #3882ee;
    border-radius: 9rpx;
    margin: 65rpx auto 0;
    font-size: 47rpx;
    line-height: 84rpx;
    font-weight: bold;
    color: #ffffff;
}
/deep/.input-pl {
    font-size: 38rpx;
    font-weight: 500;
     color: #9f9f9f;
}
</style>