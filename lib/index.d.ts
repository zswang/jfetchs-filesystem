import { ICacheStore } from 'jfetchs-util';
/**
 * @file jfetchs-filesystem
 *
 * jfetchs filesystem store
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 0.0.2
 * @date 2018-09-15
 */
export interface IFileSystemStoreOptions {
    /**
     * 缓存目录 path of cache
     */
    path?: string;
    /**
     * 是否打印调试信息 The default value is false
     */
    debug?: boolean | string;
    /**
     * 文件系统 File System Object
     */
    fs?: any;
}
export declare class FileSystemStore<T> implements ICacheStore<T> {
//     private options;
    constructor(options: IFileSystemStoreOptions);
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
    load(key: string): Promise<T>;
    /**
     * 保存缓存数据 save data to cache
     * @param key 键值
     * @param data 保存的数据
     * @param expire 过期时间，单位秒
     * @return 返回保存是否成功
     */
    save(key: string, data: T, expire: number): Promise<boolean>;
    /**
     * 移除缓存数据 remove this cache data
     * @param key 键值
     * @return 返回移除是否成功
     */
    remove(key: string): Promise<boolean>;
    /**
     * 回收过期资源
     * @example store():gc
      ```js
      this.timeout(5000)
  var store5 = new jfetchs.FileSystemStore({
    debug: true,
    path: '.jfetchs_cache',
  })
  store5.save('key5-1', 'data5-1', 1)
  store5.save('key5-2', 'data5-2', 2)
  setTimeout(() => {
    store5.gc().then(reply => {
      console.log(JSON.stringify(reply))
      // > ["key5-1"]
      // * done
    })
  }, 1500)
      ```
     * @example store():gc
      ```js
      this.timeout(5000)
  var fs5 = {
    readFileSync: filename => {
      throw `#error readFileSync ${filename}`
    },
    writeFileSync: filename => {
      throw `#error writeFileSync ${filename}`
    },
    existsSync: filename => {
      throw `#error existsSync ${filename}`
    },
    readdirSync: path => {
      throw `#error readdirSync ${path}`
    },
  }
  var store5 = new jfetchs.FileSystemStore({
    debug: true,
    fs: fs5,
    path: '.jfetchs_cache',
  })
  store5.gc().catch(err => {
    console.error(err)
  })
  fs5.readdirSync = () => {
    return ['1.ttl']
  }
  store5.gc().catch(err => {
    console.error(err)
  })
  fs5.readdirSync = () => {
    return ['1.ttl']
  }
  fs5.readFileSync = filename => {
    return JSON.stringify(Date.now() - 10000)
  }
  store5.gc().catch(err => {
    console.error(err)
  })
      ```
     */
    gc(): Promise<string[]>;
}
//# sourceMappingURL=index.d.ts.map