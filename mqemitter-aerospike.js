'use strict'

var aerospike = require('aerospike')
var status = aerospike.status
var key = aerospike.key
var inherits = require('inherits')
var MQEmitter = require('mqemitter')
var nextTick = process.nextTick
var EE = require('events').EventEmitter

function MQEmitterAerospike (opts) {
  if (!(this instanceof MQEmitterAerospike)) {
    return new MQEmitterAerospike(opts)
  }

  opts = opts || {}
  opts.set = opts.set || 'pubsub'
  opts.ns = opts.ns || 'test'

  var config = {
    hosts: opts.hosts,
    connTimeoutMs: 3000,
    policies: {
      timeout: 10000
    },
    tenderInterval: 100
  }

  this._opts = opts

  var that = this

  this._db = null

  if (opts.db) {
    that._db = opts.db
    start()
  } else {
    aerospike.connect(config, function (error, client) {
      if (error) {
        return
      } else {
        that._db = client
        start()
      }
    })
  }

  this.closedServer = false
  this._started = false
  this._emitOnGoing = false
  this.status = new EE()

  this.status.on('closeCalled', function () {
    that.closedStream = true
  })

  var oldEmit = MQEmitter.prototype.emit
  that._mutex = false

  this._waiting = {}
  this._streamedCount = 0
  this.streamOnce = 0
  this._lastId = 0

  function start () {
    if (that.closedStream) {
      if (that._emitOnGoing) {
        setTimeout(start, 100)
      }
      that.status.emit('closedAck')
      return
    }

    var recordsLength = 0
    that._streamData = {}
    that._temp = 0
    var statement = {}
    statement.select = ['recordId', 'data']
    var query = that._db.query(that._opts.ns, that._opts.set, statement)

    that._stream = query.execute() // returns a stream object.
    that._stream.on('data', function (data) {
      that._temp++
      recordsLength++
      that._streamData[data.recordId] = data
      if (that._temp > that._lastId) {
        that._lastId = that._temp
      }
      if (that.streamOnce === 0) {
        that._streamedCount = that._temp
      }
    })
    that._stream.on('error', function () {
      setTimeout(start, 100)
      that.streamOnce = 1
      that.status.emit('stream')
    })
    that._stream.on('end', function () {
      if (that.streamOnce !== 0) {
        if (recordsLength > that._streamedCount) {
          process(that._streamData[that._streamedCount], noop)
        }
      }
      that.streamOnce = 1
      setTimeout(start, 100)
      that.status.emit('stream')
    })

    function process (obj, cb) {
      if (that.closedServer) {
        return cb()
      }

      that._started = true
      console.log('++++++++', obj)
      oldEmit.call(that, obj.data, cb)

      var id = that._streamedCount.toString()
      if (that._waiting[id]) {
        nextTick(that._waiting[id])
        delete that._waiting[id]
      }
      that._streamedCount++
    }
  }
  MQEmitter.call(this, opts)
}

inherits(MQEmitterAerospike, MQEmitter)

MQEmitterAerospike.prototype.emit = function (obj, cb) {
  this._emitOnGoing = true
  var that = this
  var err
  if (!this.closedServer && !this.streamOnce) {
    // actively poll if stream is available
    this.status.once('stream', this.emit.bind(this, obj, cb))
    return this
  } else if (this.closedServer) {
    err = new Error('MQEmitterAerospike is closed')
    if (cb) {
      cb(err)
    } else {
      throw err
    }
  } else {
    console.log('==============', this._lastId)
    this._db.put(key(this._opts.ns, this._opts.set, this._lastId), { recordId: this._lastId, data: obj }, function (error, key) {
      if (error && error.code !== status.AEROSPIKE_OK) {
        cb(error)
        return
      } else {
        if (that._lastId > that._streamedCount) {
          that._waiting[that._lastId] = cb
        } else if (cb) {
          cb()
        }
      }
    })
    this._lastId++
  }
  that._emitOnGoing = false
  return this
}

MQEmitterAerospike.prototype.close = function (cb) {
  cb = cb || noop

  if (this.closedServer) {
    return cb()
  }

  if (!this._stream) {
    this.status.once('stream', this.close.bind(this, cb))
    return
  }

  this._stream = null
  var that = this
  MQEmitter.prototype.close.call(this, function () {
    if (that._opts.db) {
      cb()
    } else {
      that.status.on('closedAck', function () {
        that._db.close(false)
        that.closedServer = true
        if (cb) {
          cb()
        }
      })
    }
  })
  that.status.emit('closeCalled')
  return this
}

function noop () {}

module.exports = MQEmitterAerospike
