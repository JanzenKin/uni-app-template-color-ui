import axios from 'axios'
import qs from 'qs'


let loading;  
let isloading = true;  

axios.defaults.timeout = 90000; // 响应时间
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'; // 配置请求头
axios.defaults.withCredentials = true

// 发布环境
if (process.env.NODE_ENV === 'production') { // 线上 正式发布环境
    console.log("发布环境----")
    axios.defaults.baseURL =process.env.VUE_APP_BASE_API;// 配置接口地址
} 
// 体验环境
else if(process.env.NODE_ENV === 'staging'){
    console.log("体验环境----")
    axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
}
 // 开发环境
else if (process.env.NODE_ENV === 'development') {
    console.log("开发环境----")
    axios.defaults.baseURL = process.env.VUE_APP_BASE_API;//开发环境下使用代理：vue.config.js中配置
    
}

// 以下免登接口配置
const noAuthApis = [
    "/infant/app/child",
    "/auth/app/userInfo",
    "/cms/app/message/personal/getList",
    "/auth/app/getInfo",
    '/cms/app/message/personal/countUnRead',
]


//http request 拦截器  
axios.interceptors.request.use(config => {  
        var token;
        //#ifdef H5
        token = localStorage.getItem("token");
        //#endif
        //#ifndef H5
        uni.getStorage({
            key: 'token',
            success: function (res) {
                token = res.data
                console.log(res.data);
            }
        });
        //#endif

        if (token) {
            config.headers.Authorization = token;
        }

        if (isloading) {  
            uni.showLoading();  
            loading=true;  
        }  
        // var cookie = uni.getStorageSync('Authorization');  
        // config.headers['x-requested-width'] = 'XMLHttpRequest';  
        // config.headers['Authorization'] = cookie;  
        // config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';  

        if (!config.data) return config;  

        if (config.data.isUpload)  
            config.headers['Content-Type'] = 'multipart/form-data';  
        else  
            config.data = qs.stringify(config.data); //如果是非上传类型 则 将数据重新组装  

        return config;  
    },  
    error => {  
        console.log(error);  
        return Promise.reject(error);  
    });  

//http response 拦截器  
axios.interceptors.response.use(response => {  
        console.log("response", response)
        if (loading) {  
            uni.hideLoading();  
            loading=false;  
        }  
        var data = response.data;  

        if (data && data.hasOwnProperty('status')) {  
            // public enum EMessageBoxStatus  
            // {  
            //     接口授权码无效 = -3,  
            //     服务端异常 = -2,  
            //     自定义 = -1,  
            //     失败 = 0,  
            //     成功 = 1,  
            // }  

            if (data.status == -3) { //接口授权码无效global.$router.push("/Login")  
                // tools.alert(data.msg + '请重新登录!', () => uni.navigateTo({url:'../pages/Login'}));  
                return;  
            }  
            if (data.status == -2) { //服务端异常  
                // tools.alert(data.msg);  
                return;  
            }  
            if (data.status == 0) { //失败  
                // tools.msg(data.msg, '错误');  
                return;  
            }  
        }  
        if(data && data.code === 401  && !noAuthApis.includes(response.config.url)){
            // if(!window.location.href.includes('accountLogin')){
            //     window.location.replace('//' + window.location.host +'/#/login')
            // }
            uni.navigateTo({url:'/login'})
            
        }

        return response;  
    },  
    error => {  
        console.log(error);  
        uni.hideLoading();  
        if (error.response.status === 401) {  
            if (loading) {  
                loading=false;  
            }  
            // global.tools.notice("无权访问!", "错误");  
            return uni.navigateTo({url:'../pages/Login'}) //global.$router.push('/Login');  
        } else {  
            return Promise.reject(error)  
        }  
    });  

//真机获取  
axios.defaults.adapter = function (config) {  
    return new Promise((resolve, reject) => {  
        console.log("adapter", config)  
        var settle = require('axios/lib/core/settle');  
        var buildURL = require('axios/lib/helpers/buildURL');  
        uni.request({  
            method: config.method.toUpperCase(),  
            url: buildURL(config.baseURL + config.url, config.params, config.paramsSerializer),  
            header: config.headers,  
            data: config.data,  
            dataType: config.dataType,  
            responseType: config.responseType,  
            sslVerify: config.sslVerify,  
            complete:function complete(response){  
                response = {  
                  data: response.data,  
                  status: response.statusCode,  
                  errMsg: response.errMsg,  
                  header: response.header,  
                  config: config  
                };  

            settle(resolve, reject, response);  
            }  
        })  
    })  
}  


/**  
 * 封装get方法  
 * @param url  
 * @param data  
 * @param loading 是否有加载效果  
 * @param headers 头部信息  
 * @returns {Promise}  
 */  
export function get(url, data = {}, loading = true, config = {}) {  
    isloading = loading;  
    url =`${url}?${qs.stringify(data)}`;  
    return new Promise((resolve, reject) => {  
        axios.get(url, config)  
            .then(response => {  
                resolve(response.data);  
            })  
            .catch(err => {  
                reject(err)  
            })  
    })  
}  

/**  
 * 封装post请求  
 * @param url  
 * @param data  
 * @param loading 是否有加载效果  
 * @param config config信息  
 * @returns {Promise}  
 */  
export function post(url, data = {}, loading = true, config = {}) {  
    isloading = loading;  
    return new Promise((resolve, reject) => {  
        axios.post(url, data, config)  
            .then(response => {  
                if (response != undefined) {  
                    resolve(response.data);  
                }  
            }, err => {  
                reject(err)  
            })  
    })  
}  

/**  
 * 封装 post 请求 用于上传文件   
 * @param url  
 * @param data  
 * @param loading 是否有加载效果  
 * @param config config信息  
 * @returns {Promise}  
 */  
export function upload(url, data = {}, loading = true, config = {}) {  
    isloading = loading;  
    if (!data) data = {};  
    data.isUpload = true;  
    return new Promise((resolve, reject) => {  
        axios.post(url, data, config)  
            .then(response => {  
                if (response != undefined) {  
                    resolve(response.data);  
                }  
            }, err => {  
                reject(err)  
            })  
    })  
}  

/**  
 * 封装 get请求 用于下载文件  
 * @param url  
 * @param data  
 * @param loading 是否有加载效果  
 * @returns {Promise}  
 */  
function download(url, data = {}, loading = true) {  
    this.get(url, data, loading, {  
        // responseType: 'stream',  
        responseType: 'blob',  
        // responseType: 'arraybuffer',  
    }).then(res => {  
        var data = res.data;  
        var headers = res.headers;  
        //"attachment; filename=6a9c13bc-e214-44e4-8456-dbca9fcd2367.xls;filename*=UTF-8''6a9c13bc-e214-44e4-8456-dbca9fcd2367.xls"  
        var contentDisposition = headers['content-disposition'];  
        var contentType = headers['content-type'];  
        var attachmentInfoArrary = contentDisposition.split(';');  
        var fileName = '';  
        if (attachmentInfoArrary.length > 1) {  
            fileName = attachmentInfoArrary[1].split('=')[1];  
        }  
        var blob = new Blob([data], { type: contentType });  

        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE  
            window.navigator.msSaveOrOpenBlob(blob, fileName);  
        } else {  
            let url = (window.URL || window.webkitURL).createObjectURL(blob);  
            // window.open(url, "_blank"); //下载  
            // window.URL.revokeObjectURL(url) // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须小心撤销URL，释放掉blob对象。  

            let a = document.createElement('a');  
            a.style.display = 'none';  
            a.href = url;  
            a.setAttribute('download', fileName);  
            document.body.appendChild(a);  
            a.click()  
            document.body.removeChild(a); // 下载完成移除元素  
            // window.location.href = url  
            window.URL.revokeObjectURL(url); // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须小心撤销URL，释放掉blob对象。  

        }  
    });  
}  


/**  
 * 封装put请求  
 * @param url  
 * @param data  
 * @param loading 是否有加载效果  
 * @param config config信息  
 * @returns {Promise}  
 */  
function put(url, data = {}, loading = true, config = {}) {  
    isloading = loading;  
    return new Promise((resolve, reject) => {  
        axios.put(url, data, config)  
            .then(response => {  
                resolve(response.data);  
            }, err => {  
                reject(err)  
            })  
    })  
}

export default {
	get,
	post,
	put,
	upload,
	download
}