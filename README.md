mqemitter-aerospike&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/mqemitter-mongodb.png)](https://travis-ci.org/mcollina/mqemitter-mongodb)
=================

Aerospike powered [MQEmitter](http://github.com/mcollina/mqemitter).
MQEmitter is a special event emitter based which  has support for mqtt wildcards like `topic/+ & topic/#`. This however works well for a single process.

MQEmitter Aerospike is a multi process emitter. You can easily have multiple processes interacting with each other using a pub/sub.
MQEmitter Aerospike also has backpressure support in which it respects the processing abilty of the client and publishes the messages accordingly. Aerospike's Enterprise version also has cross data center replication so you easily transmit messages cross DC with some delay. 

You can the use this to transmit messages between two processes. It can also be used a mechanism to transmit hearbeats.

See [MQEmitter](http://github.com/mcollina/mqemitter) for the base
API.


Installation
------------
`npm i mqemitter-aerospike`

Example
-------

```js
var aerospikedb = require('mqemitter-aerospike')
var mq = aerospikedb({
	hosts:'localhost:3000'
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

*  `mq = aerospikedb(opts)` - This is to instantiate the emitter. The opts provided include all the options which have to provided to instantiate an aerospike client and should also include the namespace and set name.

* `mq.emit(msg,cb)` - This method emits a message. The message parameter is a object which should contains the topic. cb is optional

*  `mq.close(releaseEventLoop, cb)` - The releasedEventLoop is a booleam which tells the Aerospike client to release the event loop after closing the connection. Ideally this should be made false if mqemitter-aerospike will not be instantiated again during the process lifetime.  Callback is optional.

The rest of the API is similar to the base MQemitter model


License
-------

MIT
