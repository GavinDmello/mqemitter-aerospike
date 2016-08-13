mqemitter-aerospike&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/mqemitter-mongodb.png)](https://travis-ci.org/mcollina/mqemitter-mongodb)
=================

Aerospike powered [MQEmitter](http://github.com/mcollina/mqemitter).

See [MQEmitter](http://github.com/mcollina/mqemitter) for the actual
API.

Example
-------

```js
var aerospikedb = require('./mqemitter-aerospike')
var mq = aerospikedb({
    ns: 'test',
    set: 'demo'
})
var msg  = {
  topic: 'hello/world',
  payload: 'or any other fields'
}

mq.on('hello/+', function (message,cb) {
	console.log(message)
})

mq.emit(msg, function () {
	mq.close(false,function(){
		console.log('called')
	})
})


```
API
---------

*  `mq.close(releaseEventLoop, cb)` - The releasedEventLoop is a booleam which tells the Aerospike client to release the event loop after closing the connection. Ideally this should be made false if mqemitter-aerospike will not be instantiated again during the process lifetime.  Callback is optional.

The rest of the API is similar to the base MQemitter model


License
-------

MIT
