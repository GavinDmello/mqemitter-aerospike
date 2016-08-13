'use strict'

var aerospikeEmitter = require('./mqemitter-aerospike')
var test = require('tape').test
var aerospikeTest = require('./aerospikeTest.js')

aerospikeTest({
  builder: function (opts) {
    opts = opts || {}
    opts.ns = 'test'
    opts.set = 'test'
    return aerospikeEmitter(opts)
  },
  test: test
})
