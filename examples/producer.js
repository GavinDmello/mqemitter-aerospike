'use strict'

var mqemitter = require('../')
var instance = mqemitter({
	hosts:'localhost:3000'
    ns: 'test',
    set: 'demo'
})

setInterval(function () {
  instance.emit({ topic: 'hello', payload: 'world' })
}, 1000)
