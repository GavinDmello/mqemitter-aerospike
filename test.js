'use strict'

var aerospikeEmitter = require('./mqemitter-aerospike')
var test = require('tape').test
var abstractTests = require('mqemitter/abstractTest.js')

abstractTests({
  builder: function (opts) {
    opts = opts || {}
    opts.ns = 'test'
    opts.set = 'test'
    return aerospikeEmitter(opts)
  },
  test: test
})
