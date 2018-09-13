import { ICacheStore } from 'jfetchs-util'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

/*<jdists encoding="ejs" data="../package.json">*/
/**
 * @file <%- name %>
 *
 * <%- description %>
 * @author
     <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
 *   <%- item.name %> (<%- item.url %>)
     <% }); %>
 * @version <%- version %>
     <% var now = new Date() %>
 * @date <%- [
      now.getFullYear(),
      now.getMonth() + 101,
      now.getDate() + 100
    ].join('-').replace(/-1/g, '-') %>
 */
/*</jdists>*/

export interface IFileSystemStoreOptions {
  /**
   * 缓存目录 path of cache
   */
  path?: string
  /**
   * 是否打印调试信息 The default value is false
   */
  debug?: boolean | string
  /**
   * 文件系统 File System Object
   */
  fs?: any
}

export class FileSystemStore<T> implements ICacheStore<T> {
  private options: IFileSystemStoreOptions
  constructor(options: IFileSystemStoreOptions) {
    this.options = {
      path: '.jfetchs_cache',
      debug: false,
      fs: fs,
      ...options,
    }
    mkdirp.sync(this.options.path)
  }

  /**
   * 加载缓存数据 load data from cache
   * @param key 键值
   * @return 返回获取到的数据
   * @example store():base
    ```js
    (*<jdists import="?debug[desc='base']" />*)
    ```
   * @example store():expire
    ```js
    (*<jdists import="?debug[desc='expire']" />*)
    ```
   * @example store():coverage
    ```js
    (*<jdists import="?debug[desc='coverage']" />*)
    ```
   * @example store():coverage2
    ```js
    (*<jdists import="?debug[desc='coverage2']" />*)
    ```
   */
  load(key: string): Promise<T> {
    const prefix =
      typeof this.options.debug === 'string'
        ? ` ${JSON.stringify(this.options.debug)}${
            key === '' ? '' : `(${key})`
          }`
        : ''

    return new Promise((resolve, reject) => {
      let result
      try {
        const ttlFilename = path.join(this.options.path, `${key}.ttl`)
        if (!this.options.fs.existsSync(ttlFilename)) {
          resolve(undefined)
          return
        }

        const ttl = JSON.parse(
          String(this.options.fs.readFileSync(ttlFilename))
        )
        if (ttl < Date.now()) {
          this.remove(key)
            .then(() => {
              resolve(undefined)
            })
            .catch(err => {
              reject(err)
            })
          return
        }

        const datFilename = path.join(this.options.path, `${key}.dat`)
        if (!this.options.fs.existsSync(datFilename)) {
          resolve(undefined)
          return
        }
        result = JSON.parse(String(this.options.fs.readFileSync(datFilename)))
      } catch (err) {
        if (this.options.debug) {
          console.log(`^linenum${prefix} error`, err)
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
  save(key: string, data: T, expire: number): Promise<boolean> {
    const prefix =
      typeof this.options.debug === 'string'
        ? ` ${JSON.stringify(this.options.debug)}${
            key === '' ? '' : `(${key})`
          }`
        : ''

    try {
      const ttlFilename = path.join(this.options.path, `${key}.ttl`)
      const datFilename = path.join(this.options.path, `${key}.dat`)
      this.options.fs.writeFileSync(
        ttlFilename,
        JSON.stringify(Math.floor(Date.now() + expire * 1000))
      )
      this.options.fs.writeFileSync(datFilename, JSON.stringify(data))
    } catch (err) {
      if (this.options.debug) {
        console.log(`^linenum${prefix} error`, err)
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
  remove(key: string): Promise<boolean> {
    const prefix =
      typeof this.options.debug === 'string'
        ? ` ${JSON.stringify(this.options.debug)}${
            key === '' ? '' : `(${key})`
          }`
        : ''
    let result = false
    try {
      const ttlFilename = path.join(this.options.path, `${key}.ttl`)
      if (this.options.fs.existsSync(ttlFilename)) {
        this.options.fs.unlinkSync(ttlFilename)
        result = true
      }
      const datFilename = path.join(this.options.path, `${key}.dat`)
      if (this.options.fs.existsSync(datFilename)) {
        this.options.fs.unlinkSync(datFilename)
        result = true
      }
    } catch (err) {
      if (this.options.debug) {
        console.log(`^linenum${prefix} error`, err)
      }
      return Promise.reject(err)
    }
    return Promise.resolve(result)
  }
}

/*<remove>*/
const jfetchs = {
  FileSystemStore,
}

/*<debug desc="base">*/
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

/*</debug>*/

/*<debug desc="expire">*/
/*<jdists>this.timeout(5000)</jdists>*/
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
/*</debug>*/

/*<debug desc="coverage">*/
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
} /*<remove>*/ as any /*</remove>*/
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
/*</debug>*/

/*<debug desc="coverage2">*/
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
} /*<remove>*/ as any /*</remove>*/
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
/*</debug>*/
/*</remove>*/
