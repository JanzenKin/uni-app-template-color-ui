const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin') //最新版本copy-webpack-plugin插件暂不兼容，推荐v5.0.0

module.exports = {
	configureWebpack: {
		plugins: [
			new CopyWebpackPlugin([
				{
					from: path.join(__dirname, 'src/assets'),
					to: path.join(__dirname, 'dist', process.env.NODE_ENV === 'production' ? 'build' : 'dev', process.env.UNI_PLATFORM, 'static')
				}
			])
		],
	},
    /* node服务运行起来才能代理，只有h5能代理，小程序都是编译后的文件 */
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        open: false,//不自启浏览器
        proxy: {//代理修改后需要重新启动项目生效
          // detail: https://cli.vuejs.org/config/#devserver-proxy
          [process.env.VUE_APP_BASE_API]: {
            target: 'http://192.168.1.91:8080',
            // target: 'http://skc-test.iktapp.com/apis/',
            changeOrigin: true,     // target是域名的话，需要这个参数，
            pathRewrite: {['^' + process.env.VUE_APP_BASE_API]: ''}
          },

        },
        
        disableHostCheck: true
      },

}