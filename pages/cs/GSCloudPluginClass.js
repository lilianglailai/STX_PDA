export class GSCloudPluginClass {
    Install = null;
    Load = function () {
        let thisObj = this;
        let firstLoadStatus = 'unknown';

        let objhead =
            document?.head ||
            document.getElementsByTagName('head')[0] ||
            document.documentElement;
        let objscript = document.createElement('script');
        objscript.type = 'text/javascript'
        objscript.src ="https://alioss.ilsau.cn/order/2023/10/07/GSCloudPlugin_ad35582f1bc145dd90a00b18a3395cfa.js"
        objscript.onload = function () {
            firstLoadStatus = 'success';
            thisObj.Install = window.GSCloudPlugin;
            if (typeof thisObj.onLoadSuccess == 'function') {
                thisObj.onLoadSuccess();
            }
        };
        objscript.onerror = function () {
            firstLoadStatus = 'error';
            if (typeof thisObj.onLoadError == 'function') {
                thisObj.onLoadError();
            }
        };
        objhead.insertBefore(objscript, objhead.firstChild);

        // 为了防止端口被占用，增加一个备用
        objscript = document.createElement('script');
        objscript.type = 'text/javascript'
        objscript.src = "https://alioss.ilsau.cn/order/2023/10/07/GSCloudPlugin_ad35582f1bc145dd90a00b18a3395cfa.js"
        objscript.onload = function () {
            if (firstLoadStatus != 'success') {
                thisObj.Install = window.GSCloudPlugin;
                if (typeof thisObj.onLoadSuccess == 'function') {
                    thisObj.onLoadSuccess();
                }
            }
        };
        objscript.onerror = function () {
            if (
                firstLoadStatus == 'error' &&
                typeof thisObj.onLoadError == 'function'
            ) {
                thisObj.onLoadError();
            }
        };
        objhead.insertBefore(objscript, objhead.firstChild);
    };
    onLoadSuccess;
    onLoadError;
}
