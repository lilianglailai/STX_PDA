<template>
    <div class="app-box">
        <view class="flex" style="margin: 0 5px 20rpx 5px">
            <uni-easyinput :focus="true" class="flex1 scan-input" type="text"
                :placeholder="placeholder || $t('put.placeholder')" placeholder-class="placeholder" :value="value"
                @confirm="queryCode(value)" @input="$emit('input', $event)" />
            <button class="scan-submit" @click="queryCode(value)">{{ $t('search') }}</button>
        </view>
    </div>
</template>

<script>
var main, receiver, filter;
export default {
    name: 'scan',
    data() {
        return {
            main: ""
        }
    },
    props: {
        value: {

        },
        placeholder: {

        }
    },
    destroyed: function () {
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

                        code = code.replace(/\n/g, "")
                        _this.$emit('input', code);
                        _this.queryCode(code);
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
        queryCode(code) {
            if (!code.replace(/\s/g, "")) {
                return false;
            }
            this.$emit('scan', code)
        },

    },
    created() {
        // #ifdef APP 
        this.initScan();

        // #endif

    }
}
</script>

<style lang="scss" scoped></style>
