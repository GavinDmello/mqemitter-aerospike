'use strict'

var mqemitter = require('../')
var instance = mqemitter({
	hosts:'localhost:3000'
    ns: 'test',
    set: 'demo'
})

instance.on('hello', function (data, cb) {
  console.log(data)
  cb()
})
