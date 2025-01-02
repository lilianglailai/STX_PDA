<template>
    <div class="top-box">
        <uni-easyinput class="uni-mt-5" suffixIcon="search" v-model="packNumber" placeholder="请输入货箱编号或扫描货箱条码"
            @iconClick="search()" @confirm="search()"></uni-easyinput>
        <view v-if="list.length" class="content-box">
            <view v-for="(item, index) in list" :key="index" class="flex-a">
                <view class="flex1">
                    <view class="code">{{ item.batchCode }}</view>
                    <view class="data-box flex">
                        <span>总箱数:{{ item.boxCount }}</span>

                    </view>
                </view>
                <view class="btn-box flex">
                    <button class="viewdata" @click="goDetail(item.batchCode)">查看
                        <br>数据</button>
                    <!-- <button @click="download(item.batchCode)">导出</button> -->
                </view>
            </view>
        </view>
        <view v-if="!list.length & !loading" class="tips_box"> 暂无更多数据 </view>
        <view style="margin: 10pt 0;color: #999;font-size: 8pt;text-align: center;"
            v-if="list.length >= 10 && pageNo * pageSize >= total && !loading">
            ~~~~~~~~到底啦~~~~~~~~
        </view>
        <uni-load-more status="loading" :contentText="{ contentrefresh: $t('loading') }"
            v-show="loading"></uni-load-more>
    </div>
</template>

<script>
var main, receiver, filter;
let that
import baseURL from "@/api/base.js"
export default {
    name: 'putList',
    data() {
        return {
            packNumber: "",
            list: [],
            pageNo: 1,
            pageSize: 10,
            total: 0,
            loading: true
        };
    },
    onShow() {
        // #ifdef APP
        that = this
        this.initScan();
        this.startScan();
        // #endif
    },
    onHide() {
        // #ifdef APP

        this.stopScan();
        // #endif
    },
    destroyed: function () {
        // #ifdef APP

        this.stopScan();
        // #endif
        // uni.$off("refresh");
    },
    onReachBottom() {

        if (this.pageNo * this.pageSize < this.total && !this.loading) {

            this.pageNo += 1;
            this.getList();
        }
    },
    methods: {
        goDetail(id) {
            uni.navigateTo({
                url: '/pages/put/putdetailList?id=' + id,
            });
        },
        startScan() {
            main.registerReceiver(receiver, filter);
        },
        stopScan() {
            main.unregisterReceiver(receiver);
        },
        queryCode(code) {
            this.packNumber = code
            this.list = []
            this.getList()
        },
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
                        _this.queryCode(code);
                    },
                }
            );
        },
        search() {
            this.list = []
            this.pageNo = 1;
            this.getList()
        },
        getList() {
            this.loading = true
            let data = {
                pageNum: this.pageNo,
                pageSize: this.pageSize
            }
            if (this.packNumber) {
                data.batchCode = this.packNumber
            }
            this.apifn({
                url: "api/abroadDepot/checkRecord/selectGroupByBatchCode",
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
        },
        download(packNumber) {
            // let url = baseURL + 'api/abroadDepot/checkRecord/exportPackExitScanning'
            // let dtask = plus.downloader.createDownload(url, {
            //     //自定义下载文件路径
            //     filename: "file://storage/emulated/突发事件统计表.xls", 
            //     method: 'post',
            //     data: {
            //         batchCode: packNumber
            //     },

            // }, function (d, status) {
            //     //d为下载的文件对象
            //     if (status == 200) {
            //         console.log("下载成功", d)

            //         uni.openDocument({
            //             filePath: d.filename,
            //             showMenu: true,
            //             success: function (res) {
            //                 console.log('打开文档成功');
            //             },
            //             fail: function (err) {
            //                 console.log(err, 'err');

            //             }
            //         });
            //         //下载成功,d.filename是文件在保存在本地的相对路径，使用下面的API可转为平台绝对路径

            //     } else {
            //         //下载失败
            //         console.log("下载失败", d)
            //         // plus.downloader.clear();        //清除下载任务
            //     }
            // })
            // dtask.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // dtask.setRequestHeader("authorization", uni.getStorageSync('token'));
            // dtask.start()
            // return false
            // uni.request({
            //     url: baseURL + 'api/abroadDepot/checkRecord/exportPackExitScanning',
            //     method: "post",
            //     data: {
            //         batchCode: packNumber
            //     },
            //     responseType: "arraybuffer",
            //     header: {
            //         'authorization': uni.getStorageSync('token'),
            //         'Content-type': 'application/x-www-form-urlencoded'
            //     },
            //     success: (res) => {
            //         let data = res.data
            //         console.log(res, 'res');
            //         // return false
            //         // #ifdef H5
            //         this.downloadFormat(data, 'cs.xlsx')
            //         // #endif
            //         // #ifdef APP
            //         this.exportFile(data)
            //         // #endif
            //     }
            // })

            // #ifdef APP
            var xhr = new plus.net.XMLHttpRequest();

            // xhr.responseType = "blob"; // 设置返回类型blob
            let url = baseURL + 'api/abroadDepot/checkRecord/exportPackExitScanning'
            // let url= 'http://tsn.baidu.com/text2audio'

            xhr.open("post", url);
            xhr.responseType = "document"; // 设置返回类型blob
            xhr.setRequestHeader('Authorization', uni.getStorageSync('token')); //用来做身份校验的字符串
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange =  ()=> {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                    //    console.log("成功", );
                        this.exportFile(xhr.responseText)
                   }
                }
               

            }
            xhr.send({ batchCode: packNumber });
            // #endif



        },

        downloadFormat(res, cs, fileType) {
            const blob = new Blob([res], { type: "" });
            if (!blob) {
                return;
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', cs);

            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url); // 为了性能和内存使用状况，应该在适当的时候释放url
        },

        exportFile(fileData, documentName = '调拨入库详情') {
            plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, function (fs) {
                let root = fs.root
                console.log('开始导出数据********')
                // 创建文件夹
                root.getFile(
                    `${'调拨入库详情' + new Date().getTime()}.xlsx`,
                    {
                        create: true,
                    },
                    (fileEntry) => {

                        fileEntry.createWriter(
                            (writer) => {
                                // 写入数据
                                writer.write(fileData);
                                // 写入文件成功完成的回调函数 
                                writer.onwrite = (e) => {
                                    uni.openDocument({
                                        filePath: writer.fileName,
                                        showMenu: true,
                                        success: function (res) {
                                            console.log('打开文档成功');
                                        },
                                        fail: function (err) {
                                            console.log(err, 'err');

                                        }
                                    });
                                }
                            },
                            (err) => {
                                console.log(err, "创建文件写入器错误");
                            }
                        );
                    },
                    (err) => {
                        console.log(err);
                    }
                );

            })
        }
    },
    created() {
        this.getList()
    }
}
</script>

<style lang="scss" scoped>
.top-box {
    position: relative;
    margin-top: 10px;
}

.content-box {
    margin-top: 30rpx;

    >view {
        position: relative;
        height: 133rpx;
        background: #ffffff;
        padding: 0 16rpx 0 30rpx;
        margin-bottom: 12.5rpx;
        margin-left: 10rpx;
        margin-right: 10rpx;
        border-radius: 16rpx;
        box-shadow: 0px 0px 10rpx 0px rgba(0, 0, 0, 0.2);
    }

    .code {
        font-size: 40rpx;
        color: #333333;
        margin-bottom: 10rpx;
    }

    .data-box {
        color: #0099FF;
        justify-content: space-between;
        font-size: 30rpx;
    }

    .btn-box {
        margin-left: 20rpx;
        height: 100%;

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
            margin-right: 10rpx;
        }
    }
}
</style>