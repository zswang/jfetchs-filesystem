'use strict'
/* istanbul ignore next */
var __assign =
  (this && this.__assign) ||
  Object.assign ||
  function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i]
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
    }
    return t
  }
Object.defineProperty(exports, '__esModule', { value: true })
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var FileSystemStore = /** @class */ (function() {
  function FileSystemStore(options) {
    this.options = __assign(
      { path: '.jfetchs_cache', debug: false, fs: fs },
      options
    )
    mkdirp.sync(this.options.path)
  }
  /**
     * 加载缓存数据 load data from cache
     * @param key 键值
     * @return 返回获取到的数据
     * @example store():base
      ```js
      var store = new jfetchs.FileSystemStore({
    debug: true,
    path: '.jfetchs_cache',
  })
  Promise.resolve()
    .then(() => {
      return store.save('k1', 'data1', 1).then(reply => {
        console.log(reply)
        // > true
      })
    })
    .then(() => {
      return store.load('k1').then(reply => {
        console.log(reply)
        // > data1
      })
    })
    .then(() => {
      return store.remove('k1').then(reply => {
        console.log(reply)
        // > true
      })
    })
    .then(() => {
      return store.remove('k1').then(reply => {
        console.log(reply)
        // > false
      })
    })
    .then(() => {
      return store.load('k1').then(reply => {
        console.log(reply)
        // > undefined
      })
    })
      ```
     * @example store():expire
      ```js
      this.timeout(5000)
  var store2 = new jfetchs.FileSystemStore({
    debug: false,
    path: '.jfetchs_cache',
  })
  Promise.resolve()
    .then(() => {
      return store2.save('k2', 'data2', 1).then(reply => {
        console.log(reply)
        // > true
      })
    })
    .then(() => {
      return store2.load('k2').then(reply => {
        console.log(reply)
        // > data2
      })
    })
  setTimeout(() => {
    store2.load('k2').then(reply => {
      console.log(reply)
      // > undefined
      // * done
    })
  }, 1500)
      ```
     * @example store():coverage
      ```js
      var fs3 = {
    readFileSync: filename => {
      throw `#error readFileSync ${filename}`
    },
    writeFileSync: filename => {
      throw `#error writeFileSync ${filename}`
    },
    existsSync: filename => {
      throw `#error existsSync ${filename}`
    },
  }
  var store3 = new jfetchs.FileSystemStore({
    debug: 'store3',
    fs: fs3,
    path: '.jfetchs_cache',
  })
  store3.save('key3', 'data3', 3).catch(err => {
    console.error(err)
  })
  store3.save('', 'data3', 3).catch(err => {
    console.error(err)
  })
  store3.load('key3').catch(err => {
    console.error(err)
  })
  store3.load('').catch(err => {
    console.error(err)
  })
  store3.remove('key3').catch(err => {
    console.error(err)
  })
  store3.remove('').catch(err => {
    console.error(err)
  })
  fs3.existsSync = filename => {
    return true
  }
  fs3.readFileSync = filename => {
    return '#error'
  }
  store3.load('key3').catch(err => {
    console.error(err)
  })
      ```
     * @example store():coverage2
      ```js
      var fs4 = {
    readFileSync: filename => {
      throw `#error readFileSync ${filename}`
    },
    writeFileSync: filename => {
      throw `#error writeFileSync ${filename}`
    },
    existsSync: filename => {
      throw `#error existsSync ${filename}`
    },
  }
  var store4 = new jfetchs.FileSystemStore({
    fs: fs4,
    path: '.jfetchs_cache',
  })
  store4.save('key4', 'data4', 3).catch(err => {
    console.error(err)
  })
  store4.save('', 'data4', 3).catch(err => {
    console.error(err)
  })
  store4.load('key4').catch(err => {
    console.error(err)
  })
  store4.load('').catch(err => {
    console.error(err)
  })
  store4.remove('key4').catch(err => {
    console.error(err)
  })
  store4.remove('').catch(err => {
    console.error(err)
  })
  fs4.existsSync = filename => {
    return true
  }
  fs4.readFileSync = filename => {
    return '#error'
  }
  store4.load('key4').catch(err => {
    console.error(err)
  })
  fs4.existsSync = filename => {
    return /\.ttl$/.test(filename)
  }
  fs4.readFileSync = filename => {
    return JSON.stringify(Date.now() + 10000)
  }
  store4.load('key4').catch(err => {
    console.error(err)
  })
  fs4.existsSync = filename => {
    return /\.ttl$/.test(filename)
  }
  fs4.readFileSync = filename => {
    return JSON.stringify(Date.now() - 10000)
  }
  store4.load('key4').catch(err => {
    console.error(err)
  })
      ```
     */
  FileSystemStore.prototype.load = function(key) {
    var _this = this
    var prefix =
      typeof this.options.debug === 'string'
        ? ' ' +
          JSON.stringify(this.options.debug) +
          (key === '' ? '' : '(' + key + ')')
        : ''
    return new Promise(function(resolve, reject) {
      var result
      try {
        var ttlFilename = path.join(_this.options.path, key + '.ttl')
        if (!_this.options.fs.existsSync(ttlFilename)) {
          resolve(undefined)
          return
        }
        var ttl = JSON.parse(String(_this.options.fs.readFileSync(ttlFilename)))
        if (ttl < Date.now()) {
          _this
            .remove(key)
            .then(function() {
              resolve(undefined)
            })
            .catch(function(err) {
              reject(err)
            })
          return
        }
        var datFilename = path.join(_this.options.path, key + '.dat')
        if (!_this.options.fs.existsSync(datFilename)) {
          resolve(undefined)
          return
        }
        result = JSON.parse(String(_this.options.fs.readFileSync(datFilename)))
      } catch (err) {
        if (_this.options.debug) {
          console.log(
            'jfetchs-filesystem/src/index.ts:112' + prefix + ' error',
            err
          )
        }
        reject(err)
        return
      }
      resolve(result)
    })
  }
  /**
   * 保存缓存数据 save data to cache
   * @param key 键值
   * @param data 保存的数据
   * @param expire 过期时间，单位秒
   * @return 返回保存是否成功
   */
  FileSystemStore.prototype.save = function(key, data, expire) {
    var prefix =
      typeof this.options.debug === 'string'
        ? ' ' +
          JSON.stringify(this.options.debug) +
          (key === '' ? '' : '(' + key + ')')
        : ''
    try {
      var ttlFilename = path.join(this.options.path, key + '.ttl')
      var datFilename = path.join(this.options.path, key + '.dat')
      this.options.fs.writeFileSync(
        ttlFilename,
        JSON.stringify(Math.floor(Date.now() + expire * 1000))
      )
      this.options.fs.writeFileSync(datFilename, JSON.stringify(data))
    } catch (err) {
      if (this.options.debug) {
        console.log(
          'jfetchs-filesystem/src/index.ts:145' + prefix + ' error',
          err
        )
      }
      return Promise.reject(err)
    }
    return Promise.resolve(true)
  }
  /**
   * 移除缓存数据 remove this cache data
   * @param key 键值
   * @return 返回移除是否成功
   */
  FileSystemStore.prototype.remove = function(key) {
    var prefix =
      typeof this.options.debug === 'string'
        ? ' ' +
          JSON.stringify(this.options.debug) +
          (key === '' ? '' : '(' + key + ')')
        : ''
    var result = false
    try {
      var ttlFilename = path.join(this.options.path, key + '.ttl')
      if (this.options.fs.existsSync(ttlFilename)) {
        this.options.fs.unlinkSync(ttlFilename)
        result = true
      }
      var datFilename = path.join(this.options.path, key + '.dat')
      if (this.options.fs.existsSync(datFilename)) {
        this.options.fs.unlinkSync(datFilename)
        result = true
      }
    } catch (err) {
      if (this.options.debug) {
        console.log(
          'jfetchs-filesystem/src/index.ts:177' + prefix + ' error',
          err
        )
      }
      return Promise.reject(err)
    }
    return Promise.resolve(result)
  }
  return FileSystemStore
})()
exports.FileSystemStore = FileSystemStore
