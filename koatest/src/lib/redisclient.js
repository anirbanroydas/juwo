const bluebird = require('bluebird');
const redis = require('redis');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;


const log = logger.log;

bluebird.promisifyAll(redis);


function retryStrategy(options) {
    log.debug('retryStrategy Called');
    log.debug('options.error : ', options.error);
    log.debug('options.total_retry_time : ', options.total_retry_time);
    log.debug('options.times_connected : ', options.times_connected);
    log.debug('options.attempt : ', options.attempt);
    // if (options.error  && options.error.code === 'ECONNREFUSED') {
    //     // End reconnecting on a specific error and flush all commands with a individual error
    //     return new Error('The server refused the connection');
    // }
    if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands with a individual error
        return new Error('Retry time exhausted');
    }
    if (options.times_connected > 10) {
        // End reconnecting with built in error
        return undefined;
    }
    if (options.attempt > 30) {
        // End reconnecting with built in error
        return undefined;
    }
    
    // reconnect after (Backoff mechanism)
    return Math.max(options.attempt * 100, 3000);
}




// Options for redis clinet
let redisClient_Options = {
  	host: CONFIG.redis.host,               						// IP address of the Redis server 
  	port: CONFIG.redis.port,                   					// Port of the Redis server
  	// path: '/usr/local/var/run/redis/redis.sock',   			// The UNIX socket string of the Redis server
  	return_buffers: false,              						// If set to true, then all replies will be sent to callbacks as 
    	                                  						// Buffers instead of Strings.
  	detect_buffers: false,              						// If set to true, then replies will be sent to callbacks as Buffers. 
							                                    // This option lets you switch between Buffers and Strings on a per-command basis, 
							                                    // whereas return_buffers applies to every command on a client. Note: This 
							                                    // doesn't work properly with the pubsub mode. A subscriber has to either always 
							                                    // return Strings or Buffers.
  	socket_keepalive: true,             						// If set to true, the keep-alive functionality is enabled on the underlying socket.
  	no_ready_check: false,              						// When a connection is established to the Redis server, the server might still be 
						                                      	// loading the database from disk. While loading, the server will not respond to 
						                                      	// any commands. To work around this, node_redis has a "ready check" which sends 
						                                      	// the INFO command to the server. The response from the INFO command indicates 
						                                      	// whether the server is ready for more commands. When ready, node_redis emits a 
						                                      	// ready event. Setting no_ready_check to true will inhibit this check.
  	enable_offline_queue: true,           						// By default, if there is no active connection to the Redis server, commands are 
						                                        // added to a queue and are executed once the connection has been established. 
						                                        // Setting enable_offline_queue to false will disable this feature and the callback 
						                                        // will be executed immediately with an error, or an error will be emitted if no 
						                                        // callback is specified.
  	retry_unfulfilled_commands: false,        					// If set to true, all commands that were unfulfilled while the connection is lost 
                                            					// will be retried after the connection has been reestablished. Use this with caution 
                                            					// if you use state altering commands (e.g. incr). This is especially useful if you 
                                            					// use blocking commands.
  	password: CONFIG.redis.auth,    	                 		// If set, client will run Redis auth command on connect. Alias auth_pass Note 
                                        						// node_redis < 2.5 must use auth_pass
  	db: 0,                      								// If set, client will run Redis select command on connect.
  	disable_resubscribing: false,           					// If set to true, a client won't resubscribe after disconnecting.
  	retry_strategy: retryStrategy         						// A function that receives an options object as parameter including the retry attempt, 
					                                        	// the total_retry_time indicating how much time passed since the last time connected, 
					                                        	// the error why the connection was lost and the number of times_connected in total. 
						                                        // If you return a number from this function, the retry will happen exactly after that 
						                                        // time in milliseconds. If you return a non-number, no further retry will happen and 
						                                        // all offline commands are flushed with errors. Return an error to return that specific 
						                                        // error to all offline commands. Example below.
};




// create redis client
// const redisClient = redis.createClient('/usr/loca/var/run/redis/redis.sock');
const redisClient = redis.createClient(redisClient_Options);


// Log evemts for debug purposes
redisClient.on("connect", function () {
    log.info('redis client connect');

})
.on("ready", function () {
    log.info('redis client ready');

    let thumbCountGenerator = function *() {
    	try {
    		log.debug('redis client set async called');
      		// add a thumbnail count key
      		yield redisClient.setnxAsync('koatest:dp_thumbnail:count', 0);
      		yield redisClient.setnxAsync('koatest:chat:public:numUsers', 0);
      		log.debug('redis set async finished');
      	}
      	catch (err) {
      		log.error('Error : ', err);
      		throw err;
      	}
    };

    let thumbCountCoroutine = bluebird.coroutine(thumbCountGenerator);

    // run the coroutine now
    thumbCountCoroutine();

})
.on("reconnect", function () {
    log.info('redis client reconnect');

})
.on("error", function (err) {
    log.error('redis client Error');
    log.error('error :\n', err);

})
.on("end", function () {
    log.info('redis client End');

});




module.exports = redisClient;


