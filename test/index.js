const jfetchs = require('../')

describe('src/index.ts', function() {
  var assert = require('should')
  var util = require('util')
  var examplejs_printLines
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments))
  }

  it('store():base', function() {
    examplejs_printLines = []
    var store = new jfetchs.FileSystemStore({
      debug: true,
      path: '.jfetchs_cache',
    })
    Promise.resolve()
      .then(() => {
        return store.save('k1', 'data1', 1).then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'true')
          examplejs_printLines = []
        })
      })
      .then(() => {
        return store.load('k1').then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'data1')
          examplejs_printLines = []
        })
      })
      .then(() => {
        return store.remove('k1').then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'true')
          examplejs_printLines = []
        })
      })
      .then(() => {
        return store.remove('k1').then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'false')
          examplejs_printLines = []
        })
      })
      .then(() => {
        return store.load('k1').then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'undefined')
          examplejs_printLines = []
        })
      })
  })

  it('store():expire', function(done) {
    examplejs_printLines = []
    this.timeout(5000)
    var store2 = new jfetchs.FileSystemStore({
      debug: false,
      path: '.jfetchs_cache',
    })
    Promise.resolve()
      .then(() => {
        return store2.save('k2', 'data2', 1).then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'true')
          examplejs_printLines = []
        })
      })
      .then(() => {
        return store2.load('k2').then(reply => {
          examplejs_print(reply)
          assert.equal(examplejs_printLines.join('\n'), 'data2')
          examplejs_printLines = []
        })
      })
    setTimeout(() => {
      store2.load('k2').then(reply => {
        examplejs_print(reply)
        assert.equal(examplejs_printLines.join('\n'), 'undefined')
        examplejs_printLines = []
        done()
      })
    }, 1500)
  })

  it('store():coverage', function() {
    examplejs_printLines = []
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
  })

  it('store():coverage2', function() {
    examplejs_printLines = []
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
  })

  it('store():gc', function(done) {
    examplejs_printLines = []
    this.timeout(5000)
    var store5 = new jfetchs.FileSystemStore({
      debug: true,
      path: '.jfetchs_cache',
    })
    store5.save('key5-1', 'data5-1', 1)
    store5.save('key5-2', 'data5-2', 2)
    setTimeout(() => {
      store5.gc().then(reply => {
        examplejs_print(JSON.stringify(reply))
        assert.equal(examplejs_printLines.join('\n'), '["key5-1"]')
        examplejs_printLines = []
        done()
      })
    }, 1500)
  })

  it('store():gc', function() {
    examplejs_printLines = []
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
  })
})
