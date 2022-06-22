import Check from './min-check'

class MinRouter {
  constructor (args) {
    if (Check.isObject(args)) {
      this.routes = args.routes
    }
  }

  _push ({ type, path, paramsStr }) {
    return new Promise((resolve, reject) => {
      uni[type]({
        url: `/${path}?params=${paramsStr}`,
        success: resolve,
        fail: reject
      })
    })
  }

  _next (args) {
    return new Promise((resolve) => {
      if (Check.isFunction(this._beforeEach)) {
        const routers = getCurrentPages()
        let route
        if (routers.length > 0) {
          const router = routers[routers.length - 1]
          route = router.route
        }
        this._beforeEach(args.path, route, resolve)
      } else {
        resolve(args)
      }
    })
  }

  push (args) {
    let name; let params = {}; let paramsStr = null; let path; let type; let isPage = false
    switch (true) {
      case Check.isObject(args):
        ({ name, params = {} } = args)
        break
      case Check.isString(args):
        name = args
        break
      default:
        throw new Error('参数必须是对象或者字符串')
    }

    if (Check.isObject(params)) {
      paramsStr = JSON.stringify(params)
    } else {
      throw new Error('params数据必须是Object')
    }

    this.routes.forEach(item => {
      if (item.name === name) {
        path = item.path
        type = item.type || 'navigateTo'
        isPage = true
      }
    })

    if (!isPage) {
      throw new Error(`没有${name}页面`)
    }

    if (!['navigateTo', 'switchTab', 'reLaunch', 'redirectTo'].includes(type)) {
      throw new Error(`name:${name}里面的type必须是以下的值['navigateTo', 'switchTab', 'reLaunch', 'redirectTo']`)
    }

    const arg = {
      type,
      path,
      paramsStr
    }

    this._next(arg).then(res => {
      switch (true) {
        case Check.isUndefined(res):
          this._push(arg)
          break
        case Check.isFalse(res):
          break
        default:
          this._push(res)
          break
      }
    })
  }

  back (delta = 1) {
    uni.navigateBack({
      delta
    })
  }

}

function parseURL () {
  const query = this.$root.$mp.query.params
  if (query) {
    return JSON.parse(decodeURIComponent(query))
  } else {
    return {}
  }
}
MinRouter.install = function (Vue) {
  Vue.mixin({
    beforeCreate: function () {
      if (!Check.isUndefined(this.$options.minRouter)) {
        Vue._minRouter = this.$options.minRouter
      }
    }
  })
  Object.defineProperty(Vue.prototype, '$minRouter', {
    get: function () {
      return Vue._minRouter
    }
  })
  Object.defineProperty(Vue.prototype, '$parseURL', {
    get: function () {
      return parseURL
    }
  })
}

export default MinRouter