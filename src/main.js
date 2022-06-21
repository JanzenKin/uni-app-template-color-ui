import Vue from 'vue'
import App from './App'
import dayjs from 'dayjs'
import axios from "./config/axios";
import api from "./server/api";
import { compress, compressAccurately } from "image-conversion";
import QRCode from "qrcode";
import * as echarts from "echarts";
import MinRouter from './minRouter/min-router'
import minRouter from './minRouter/router'
import "@/static/css/common.css";
Vue.use(MinRouter)

Vue.config.productionTip = false

Vue.prototype.$dayjs = dayjs
Vue.prototype.$http = axios
Vue.prototype.$api = api
Vue.prototype.$echarts = echarts;
Vue.prototype.$qrcode = QRCode;

// 发布环境
if (process.env.NODE_ENV === 'production') {
    Vue.prototype.imgUrl = 'http://192.168.1.90/oss/' // 图片地址 或 视频地址
    Vue.prototype.uploadImage = ''// 图片上传域名
    Vue.prototype.h5Url = "http://192.168.1.55:8888/#";
}
// 体验环境
else if (process.env.NODE_ENV === 'staging') {
    Vue.prototype.imgUrl = '//oss.iktapp.com/' // 图片地址 或 视频地址
    Vue.prototype.uploadImage = ''// 图片上传域名
    Vue.prototype.h5Url = "https://skc-test.iktapp.com/#";
}
// 开发环境
else if (process.env.NODE_ENV === 'development') {
    Vue.prototype.imgUrl = 'http://192.168.1.90/oss/' // 图片地址 或 视频地址
    Vue.prototype.uploadImage = ''// 图片上传域名
    Vue.prototype.h5Url = "http://192.168.1.55:8888/#";
}


// 混入方法
Vue.mixin({
    methods: {
        //#ifdef H5
        //判断是否在微信中
        isWeiXin() {
            return navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;
        },
        isDingDing() {
            return dd.env.platform != "notInDingTalk";
        },
        // 判断是否是支付宝app浏览器
        isAliPayBrower() {
            var browser = navigator.userAgent.toLowerCase();
            return browser.match(/Alipay/i) == "alipay";
        },
        // 浙里办
        isZheliban() {
            const sUserAgent = window.navigator.userAgent.toLowerCase();
            const bIsDtDreamApp = sUserAgent.indexOf("dtdreamweb") > -1; // 浙里办APP
            return bIsDtDreamApp;
        },

        handleKeyboardPop(callBack) {
            // 判断设备类型
            var judgeDeviceType = function () {
                var ua = window.navigator.userAgent.toLocaleLowerCase();
                var isIOS = /iphone|ipad|ipod/.test(ua);
                var isAndroid = /android/.test(ua);

                return {
                    isIOS: isIOS,
                    isAndroid: isAndroid
                }
            }()

            // 监听输入框的软键盘弹起和收起事件
            function listenKeybord($input) {
                if (judgeDeviceType.isIOS) {
                    // IOS 键盘弹起：IOS 和 Android 输入框获取焦点键盘弹起
                    $input.addEventListener('focus', function () {
                        console.log('IOS 键盘弹起啦！');
                        // IOS 键盘弹起后操作
                    }, false)

                    // IOS 键盘收起：IOS 点击输入框以外区域或点击收起按钮，输入框都会失去焦点，键盘会收起，
                    $input.addEventListener('blur', () => {
                        console.log('IOS 键盘收起啦！');
                        // IOS 键盘收起后操作
                    })
                }

                // Andriod 键盘收起：Andriod 键盘弹起或收起页面高度会发生变化，以此为依据获知键盘收起
                if (judgeDeviceType.isAndroid) {
                    var originHeight = document.documentElement.clientHeight || document.body.clientHeight;

                    window.addEventListener('resize', function () {
                        var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
                        if (originHeight < resizeHeight) {
                            console.log('Android 键盘收起啦！');
                            callBack(true)
                            // Android 键盘收起后操作
                        } else {
                            console.log('Android 键盘弹起啦！');
                            callBack(false)
                        }
                        originHeight = resizeHeight;
                    }, false)

                }
            }
            var $inputs = document.querySelectorAll('input');
            var $textarea = document.querySelectorAll('textarea');
            console.log($inputs, $textarea)

            for (var i = 0; i < $inputs.length; i++) {
                listenKeybord($inputs[i]);
            }
            for (var i = 0; i < $textarea.length; i++) {
                listenKeybord($textarea[i]);
            }
        },
        //#endif

        mixinBeforeUpload(file) {
            console.log(file, "file");
            return new Promise((resolve, reject) => {
                let isLt2M = file.size / 1024 / 1024 < 0.5; // 判定图片大小是否小于4MB
                if (isLt2M) {
                    resolve(file);
                } else {
                    compress(file, 0.4).then(res => {
                        console.log("压缩之后", res);
                        resolve(res);
                    });
                }
            });
        }
    },


});

App.mpType = 'app'

const app = new Vue({
    ...App,
    minRouter
})
app.$mount()
