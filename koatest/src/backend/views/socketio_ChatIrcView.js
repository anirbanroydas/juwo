// const merge = require('lodash').merge;
const bluebird = require('bluebird');

const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
// const DB = require('../../lib/db');
const socketioAuth = require('../../lib/socketio_auth');
// const redis = require('../../lib/redisclient');
// const auth_helpers = require('../../lib/auth_helpers');
const Rabbitmq = require('../../lib/rabbitmq_pubsub');
const activity = require('../../lib/activity_handler');
const cache = require('../../lib/cache_handler');
const CONFIG = require('../../lib/settings').CONFIG_DATA;


const log = logger.log;
// const db = new DB();




// Handler fro IRC Chats
class IrcChatHandler {
	
	constructor() {
		this.nsp = null;
		this.exchange = 'koatest_chat_irc_ex';
		this.exchange_type = 'topic';
		this.routing_key = 'irc.';
		this.publish_config_options = undefined;
	}






	socket_broadcast(socket, channel, event, data) {
		log.debug('socket will broadcast ', event);
		
		if (data) {
			if (typeof data === 'object') {
				data = JSON.stringify(data);
			}
			socket.to(channel).broadcast.emit(event, data);
		}
		else {
			socket.to(channel).broadcast.emit(event);
		}
		
		log.debug('socket successfully broadcasted ', event);
	}







	socket_emit(socket, channel, event, data) {
		log.debug('socket will emit ', event);
		
		if (data) {
			if (typeof data === 'object') {
				data = JSON.stringify(data);
			}
			socket.to(channel).emit(event, data);
		}
		else {
			socket.to(channel).emit(event);
		}
		
		log.debug('socket successfully emitted ', event);
	}







	new_message(socket) {
		let self = this;
		// when the client emits 'new_message', this listens and executes
		socket.on('new_message', function (data) {

			let new_message_Generator = function *(self, data) {
			    // we tell the client to execute 'new message'
			    let userinfo = socket.client.userinfo;
			   	let new_message = {
			      	username: userinfo.username,
			      	userid: userinfo.userid,
			      	name: userinfo.name,
					dp_thumbnail: userinfo.dp_thumbnail,
			      	message: data
			    };
			    
			    log.debug('new_message : ', new_message);
			
				// use the pub rabbitmq instance since publishing
				if (socket.client.rabbitmq_pub.channel) {
					new_message.status = 'new_message';
					new_message.time = new Date.toLocaleString();
					let msg = new_message;
					let routing_key = self.routing_key + userinfo.channel + '.*';

					let isPublish = yield socket.client.rabbitmq_pub.publish(self.exchange, routing_key, msg, self.publish_config_options);
					if (!isPublish) {
						self.socket_broadcast(socket, userinfo.channel, 'new_message', new_message);
					}
				}
				else {
					self.socket_broadcast(socket, userinfo.channel, 'new_message', new_message);
				}
			
			};

			let new_message_Coroutine = bluebird.coroutine(new_message_Generator);

			// run the coroutine
			new_message_Coroutine(self, data);

		});
	}







	

	typing(socket) {
		let self = this;
		
		// when the client emits 'typing', we broadcast it to others
		socket.on('typing', function () {
			
			let typing_Generator = function *(self) {
				let userinfo = socket.client.userinfo;
				let typing_message = {
			      	username: userinfo.username,
			      	userid: userinfo.userid,
			      	name: userinfo.name,
					dp_thumbnail: userinfo.dp_thumbnail,
			    };
				
				// use the pub rabbitmq instance since publishing
				if (socket.client.rabbitmq_pub.channel) {
					typing_message.status = 'typing';
					let msg = typing_message;
					let routing_key = self.routing_key + userinfo.channel + '.*';

					let isPublish = yield socket.client.rabbitmq_pub.publish(self.exchange, routing_key, msg, self.publish_config_options);
					if (!isPublish) {
						self.socket_broadcast(socket, userinfo.channel, 'typing', typing_message);
					}
				}
				else {
					self.socket_broadcast(socket, userinfo.channel, 'typing', typing_message);
				}
			
			};

			let typing_Coroutine = bluebird.coroutine(typing_Generator);

			// run the coroutine
			typing_Coroutine(self);

		});

	}








	stop_typing(socket) {
		let self = this;

		// when the client emits 'stop typing', we broadcast it to others
		socket.on('stop_typing', function () {

			let stop_typing_Generator = function *(self) {
				let userinfo = socket.client.userinfo;
				let stop_typing_message = {
			      	username: userinfo.username,
			      	userid: userinfo.userid,
			      	name: userinfo.name,
					dp_thumbnail: userinfo.dp_thumbnail,
			    };

				// use the pub rabbitmq instance since publishing
				if (socket.client.rabbitmq_pub.channel) {
					stop_typing_message.status = 'stop_typing';
					let msg = stop_typing_message;
					let routing_key = self.routing_key + userinfo.channel + '.*';

					let isPublish = yield socket.client.rabbitmq_pub.publish(self.exchange, routing_key, msg, self.publish_config_options);
					if (!isPublish) {
						self.socket_broadcast(socket, userinfo.channel, 'stop_typing', stop_typing_message);
					}
				}
				else {
					self.socket_broadcast(socket, userinfo.channel, 'stop_typing', stop_typing_message);
				}
			
			};

			let stop_typing_Coroutine = bluebird.coroutine(stop_typing_Generator);

			// run the coroutine
			stop_typing_Coroutine(self);

		});

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
						log.debug('userinfo to remove: ', userinfo);
						
						let user_to_remove = {
							name: userinfo.name,
							username: userinfo.username,
							userid: userinfo.userid,
							dp_thumbnail: userinfo.dp_thumbnail,
							channel: userinfo.channel
						};

						
						let new_NumUsers = yield cache.removeFromUserListIrcChat(user_to_remove, userinfo.channel);
						
						user_to_remove.numUsers = new_NumUsers;
						user_to_remove.lastSeen = new Date.toLocaleString();

						log.debug('user_to_remove : ', user_to_remove);					

				    	// echo globally that this client has left
				    	// use the pub rabbitmq instance since publishing
						if (socket.client.rabbitmq_pub.channel) {
							
							user_to_remove.status = 'user_left';
							let data = user_to_remove;
							let routing_key = self.routing_key + userinfo.channel + '.*';
							
							let isPublish = yield socket.client.rabbitmq_pub.publish(self.exchange, routing_key, data, self.publish_config_options);
							if (!isPublish) {
								self.socket_broadcast(socket, 'user_left', user_to_remove);
							}
						}
						else {
							// sicne no rabbitmq_pub channel present then try to broadcast it via socket.broadcast
							self.socket_broadcast(socket, userinfo.channel, 'user_left', user_to_remove);
						}									

						// now disconnect both the pub and sub socket for the corresponing client
						socket.client.rabbitmq_pub.socketio = null;
						socket.client.rabbitmq_sub.socketio = null;

						if (socket.client.rabbitmq_pub.channel) {
							let hasStopped = yield socket.client.rabbitmq_pub.stop();
							
							if (!hasStopped) {
								log.error('Unable to Stop Publisher Rabbitmq client');
							}
						}
						if (socket.client.rabbitmq_sub.channel) {
							let hasStopped = yield socket.client.rabbitmq_sub.stop();

							if (!hasStopped) {
								log.error('Unable to Stop Subscribing Rabbitmq client');
							}
						}

						// leave the channel
						try {
							socket.leave(userinfo.channel);
						}
						catch (err) {
							log.error('Socket Unable to leave the channel : ', userinfo.channel);
						}


						// create activity
						// log.debug('user_to_remove : ', user_to_remove);
						// delete user_to_remove.status;
						// delete user_to_remove.numUsers;
						
						let isActivityCreated = yield activity.create('stopped_irc_chat', user_to_remove.userid, userinfo.channel);

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

		log.debug('socketio_auth_config : ', socketio_auth_config);

		// initialize the socket io auth middleware
		socketioAuth.auth(this.nsp, socketio_auth_config);

	}








	postAuthenticate(socket, data) {

		let userGenerator = function *(socket, data, self) {
			try {
				
				let userid = data.userid;

				let userinfo = {
					userid: userid,
					username: data.username,
					name: data.name,
					dp_thumbnail: data.dp_thumbnail,
					channel: data.channel
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


				let user_joined = {
					userid: userid,
					username: data.username,
					name: data.name,
					dp_thumbnail: data.dp_thumbnail,
					channel: data.channel
				};


				// join the requested channel
				log.debug('channel to join : ', data.channel);
				socket.join(data.channel);

				// get userlist of public chat from redis cache
				let old_userlist = yield cache.getUserListIrcChat(channel);

				let new_NumUsers = yield cache.addToUserListIrcChat(user_joined, channel);

				user_joined.numUsers = new_NumUsers;


				// create two new rabbitmq client, one for publishing and one for subscribing
				// the reason for creating two clients, so that both of them use two different connections
				// to rabbitmq server instead of one, this for performance and for not blocking in any case as a bottleneck
				let rabbitmq_config_options = {

					host: CONFIG.rabbitmq.host,
			        port: CONFIG.rabbitmq.port,
			        vhost: CONFIG.rabbitmq.vhost,
			        username: CONFIG.rabbitmq.username,
			        password: CONFIG.rabbitmq.password,
			        
			        queue: null,
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
			        
			        binding_key_default: self.routing_key + data.channel + '.*',
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
				
				// create the publisher rabbitmq client
				rabbitmq_config_options.client_type = 'publisher';
				let rabbitmq_pub = new Rabbitmq(rabbitmq_config_options);

				// create the subscriber rabbitrmq client
				rabbitmq_config_options.client_type = 'subscriber';
				let rabbitmq_sub = new Rabbitmq(rabbitmq_config_options);

				// initialize/start the rabbitmq client
				let isValidRmcInit;

				isValidRmcInit = yield rabbitmq_pub.init();
				if (!isValidRmcInit) {
					let err = new Error('Unable to Initialize Rabbitmq publisher client');
					throw err;
				}

				isValidRmcInit = yield rabbitmq_sub.init();
				if (!isValidRmcInit) {
					let err = new Error('Unable to Initialize Rabbitmq subscriber client');
					throw err;
				}

				

				// // pub and sub rabbitmq client info in socket.client
				// socket.client.pub = true;
				// log.debug('socke.client.userinfo : ', socket.client.userinfo);

				// set the socketio instance to rabbitmq_pub and rabbitmq_sub
				rabbitmq_pub.socket = socket;
				rabbitmq_sub.socket = socket;

				// rabbitmq pub and sub clients as part of socket so that it can be used later
				socket.client.rabbitmq_pub = rabbitmq_pub;
				socket.client.rabbitmq_sub = rabbitmq_sub;

				// Initialize other events
				self.new_message(socket);
				self.typing(socket);
				self.stop_typing(socket);
				// self.disconnect_nsp(socket);
				self.disconnect(socket);


				// emit user joined event to source socket with additional userlist nad num of users data
				// Since data to be send to just the concerned user we will use directly the socketio instance
				// and not the rabbitmq instance
				self.socket_emit(socket, data.channel, 'user_added', {userList: old_userList, numUsers: new_NumUsers});
				
				// broadcast the new user details to all other sockets joined in the public namespace
				// Here broadcast is concerned, hence we will pass the work to rabbitmq, by publishing the msg
				user_joined.status = 'user_joined';
				user_joined.time = new Date.toLocaleString();
				let data = user_joined;
				let routing_key = self.routing_key + data.channel + '.*';

				// use the pub rabbitmq instance since publishing
				
				let isPublish = yield rabbitmq_pub.publish(self.exchange, routing_key, data, self.publish_config_options);
				if (!isPublish) {
					self.socket_broadcast(socket, data.channel, 'user_joined', user_joined);
				}


				// start subscribing
				// start subscribing after intilaizing other event handlers and publishing/broadcasting user joined to other
				// so that no messages are received before it is totally ready to take messages
				let hasSubsribed = yield rabbitmq_sub.start_subscribing();
				if (!hasSubsribed) {
					let err = new Error('Unable to Start Subscribing Rabbitmq');
					throw err;
				}


				// create activity
				// log.debug('user_joined : ', user_joined);
				// delete user_joined.status;
				// delete user_joined.numUsers;
				
				let isActivityCreated = yield activity.create('started_irc_chat', user_joined.userid, data.channel);
				
			}
			catch(err) {
				log.error('Error : ', err);

				log.info('disconnecting the socket');
				try {
					socket.leave(data.channel);
				}
				catch (errr) {
					log.error('Unable to leave channel: %s with Error : %s ', data.channel, errr);
				}

				let isDisconnect = true;
				try {
					self.disconnect(socket);
				}
				catch (errr) {
					log.error('Error in initializing disconnect event handler : ', errr);
					isDisconnect = false;
				}

				if (isDisconnect) {
					try {
						socket.disconnect();
					}
					catch (errr) {
						log.error('Error in disconnecting socket : ', errr);
					}
				}
				
			}

		};


		let userCoroutine = bluebird.coroutine(userGenerator);

		// run the coroutine
		userCoroutine(socket, data, this);		
		
	}


}








module.exports = IrcChatHandler;




