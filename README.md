# uni-app-template-color-ui

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).



## 生命周期
- 页面启动顺序：
    - created 
    - onload
        > 监听页面加载，其参数为上个页面传递的数据，参数类型为 Object（用于页面传参）
    - onShow
        > 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面
    - mounted
    - onReady
        > 监听页面初次渲染完成。注意如果渲染速度快，会在页面进入动画完成前触发
    - updated
- 页面销毁顺序：
    - onUnload
      > 监听页面卸载
    - beforeDestroy
    - destroyed


## 图片功能类别：
   - mod_：是否公共，可选
   - icon：模块类固化的图标
   - logo：LOGO类
   - spr：单页面各种元素合并集合
   - btn：按钮
   - bg：可平铺或者大背景
   - pic: 装饰图片