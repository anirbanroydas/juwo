// const merge = require('lodash').merge;

const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const socketioAuth = require('../../lib/socketio_auth');
const redis = require('../../lib/redisclient');
const cache = require('../../lib/cache_handler');
const Rabbitmq = require('../../lib/rabbitmq_pubsub');
const CONFIG = require('../../lib/settings').CONFIG_DATA;


const log = logger.log;



// Handler for Socketio Feed Api Handler
class FeedApiHandler {
	
	constructor() {
		this.nsp = null;
		this.exchange = 'koatest_feed_ex';
		this.exchange_type = 'topic';
		this.routing_key = 'feed.';
		this.publish_config_options = undefined;
	}








	socket_broadcast(socket, event, data) {
		log.debug('socket will broadcast ', event);
		
		if (data) {
			if (typeof data === 'object') {
				data = JSON.stringify(data);
			}
			socket.broadcast.emit(event, data);
		}
		else {
			socket.broadcast.emit(event);
		}
		
		log.debug('socket successfully broadcasted ', event);
	}







	socket_emit(socket, event, data) {
		log.debug('socket will emit ', event);
		
		if (data) {
			if (typeof data === 'object') {
				data = JSON.stringify(data);
			}
			socket.emit(event, data);
		}
		else {
			socket.emit(event);
		}
		
		log.debug('socket successfully emitted ', event);
	}



	




	ack_feed(socket) {
		let self = this;
		
		// when the client emits 'ack_feed'
		socket.on('ack_feed', function () {
			let userinfo = socket.client.userinfo;
			
			log.debug('user acked feed : ', userinfo.userid);
		
		});

	}










	on_rabbitmq_message(msg) {
		log.debug('[NotificationApiHandler] Received message : ');

        let body = msg.content.toString();
        log.debug('[x] msg received : ', body);

        // try {
        // 	body = JSON.stringify(body);
        // }
        // catch (err) {
        // 	log.debug('[x] msg received is not json serializable');
        // }


        if (typeof body === 'object') {
			body = JSON.stringify(body);
		}

        try {
	        
	        // now send the feed to socketio
	        if (this.socket) {
	        	// send the msg/feed via the corresponding socketio connection
	        	this.socketio.emit('feed', body);
	        } 	        
	    
	    }
	    catch (err) {
	    	log.error('Error : ', err);
	    }

	    // try to acknowledge consumed message
	    this.acknowledge_msg_consumed.call(this);

	}









	disconnect(socket) {
		let self = this;
		// when the user disconnects.. perform this
		socket.on('disconnect', function () {

			let disconnectGenerator = function *(socket, self) {
				if (socket && socket.client.userinfo) {
			    	// this means user already authenticated and added

			    	try {
						// update the redis userlist
						let userinfo = socket.client.userinfo;
						log.debug('userinfo', userinfo);
															

						// now disconnect the sub socket for the corresponing client
						socket.client.rabbitmq_sub.socket = null;

						if (socket.client.rabbitmq_sub.channel) {
							let hasStopped = yield socket.client.rabbitmq_sub.stop();

							if (!hasStopped) {
								log.error('Unable to Stop Subscribing Rabbitmq client');
							}
						}

				    }
				    catch (err) {
				    	log.error('Error in disconnecting socket cleanly : ', err);
				    }
			    }
			    // otherwise it means user has not been added yet, so no need to do any database ops

			};

			let disconnectCoroutine = bluebird.coroutine(disconnectGenerator);

			// run the coroutine
			disconnectCoroutine(socket, self);	

		});

	}










	init(nsp) {
		this.nsp = nsp;

		let socketio_auth_config = {
			authenticate: socketioAuth.authenticate,
			postAuthenticate: this.postAuthenticate,
		  	// disconnect: disconnect,
		 	timeout: 20000 	// 20 seconds
		};

		// initialize the socket io auth middleware
		socketioAuth.auth(this.nsp, socketio_auth_config);

	}









	postAuthenticate(socket, data) {

		let postAuthenticate_Generator = function *(socket, data, self) {
			
			try {
				let userid = data.userid;

				let userinfo = {
					userid: userid,
					username: data.username
				};

				// add userinof to socket.client
				socket.client = socket.client || {};
				socket.client.userinfo = userinfo;

				// find people user is following
				let user = yield cache.getUserInfoFromCacheById(userid);

				if (!user) {
					let err = new Error('Unable to Access user from cache by Id');
					throw err;
				}
				
				let following = user.following;
				let binding_keys = [];
				let binding_key;

				// first add the self routing key
				binding_key = self.routing_key + userid + '.*';
				binding_keys.push(binding_key);

				for (let following_id of following) {
					binding_key = self.routing_key + following_id + '.*';
					binding_keys.push(binding_key);
				}
				
				// create a new rabbitmq client, just for subscribing
				// to the notification exchange binding key to specific user/userid
				let rabbitmq_config_options = {
					
					host: CONFIG.rabbitmq.host,
			        port: CONFIG.rabbitmq.port,
			        vhost: CONFIG.rabbitmq.vhost,
			        username: CONFIG.rabbitmq.username,
			        password: CONFIG.rabbitmq.password,
			        
			        queue: 'koatest-queue-feed-' + userid + '-' + utils.genid(8),
			        queue_opts: {
			        	durable: false,
			        	autoDelete: true,
			        	exclusive: true
			        },
			        
			        exchange: self.exchange,
			        exchange_type: self.exchange_type,
			        exchange_opts: {
			        	durable: true
			        },
			        
			        binding_key_default: binding_keys,
			        binding_opts: {},

			        retry_attempts: 10,
			        reconnect: true,
			        
			        rechannel_attempts: 10,
			        rechannel: true,
			        
			        publisher_confirms: false,
			        prefetch: true,
			        prefetch_count: 1,
			        noack: true,
			        
			        publish_opts_default: {
			        	persistent: false
			        },
			        
			        subscribe_opts_default: {
			        	noAck: true
			        }
				};

				// create the subscriber rabbitrmq client
				rabbitmq_config_options.client_type = 'subscriber';
				let rabbitmq_sub = new Rabbitmq(rabbitmq_config_options);

				// initialize/start the rabbitmq client
				let isValidRmcInit, err;
			
				isValidRmcInit = yield rabbitmq_sub.init();
				if (!isValidRmcInit) {
					err = new Error('Unable to Initialize Rabbitmq subscriber client');
					throw err;
				}

				// start subscribing
				let hasSubsribed = yield rabbitmq_sub.start_subscribing(self.on_rabbitmq_message.bind(rabbitmq_sub));
				if (!hasSubsribed) {
					err = new Error('Unable to Start Subscribing Rabbitmq');
					throw err;
				}

				// // pub and sub rabbitmq client info in socket.client
				// socket.client.pub = true;
				// log.debug('socke.client.userinfo : ', socket.client.userinfo);

				// set the socketio instance to rabbitmq_sub
				rabbitmq_sub.socket = socket;

				// rabbitmq sub client as part of socket so that it can be used later
				socket.client.rabbitmq_sub = rabbitmq_sub;
				
				// Initialize other events
				self.ack_feed(socket);
				self.disconnect(socket);

				// emit socket_added event to source socket 
				// Since data to be send to just the concerned user we will use directly the socketio instance
				// and not the rabbitmq instance
				self.socket_emit(socket, 'socket_added');			
				
			}
			catch(err) {
				log.error('Error : ', err);

				log.info('disconnecting the socket');
				
				let isDisconnect = true;
				try {
					// self.disconnect_nsp(socket);
					self.disconnect(socket);
				}
				catch (errr) {
					log.error('Error in initializing disconnect event handler : ', errr);
					isDisconnect = false;
				}

				if (isDisconnect) {
					try {
						// socket.emit('disconnect_nsp');
						socket.disconnect();
					}
					catch (errr) {
						log.error('Error in disconnecting socket : '. errr);
					}
				}
			}

		};


		let postAuthenticate_Coroutine = bluebird.coroutine(postAuthenticate_Generator);

		// run the coroutine
		postAuthenticate_Coroutine(socket, data, this);				
	}



}







module.exports = FeedApiHandler;

