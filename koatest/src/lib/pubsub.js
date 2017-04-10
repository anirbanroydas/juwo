const bluebird = require('bluebird');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
// const utils = require('./utils');
// const redis = require('./redisclient');
// const DB = require('./db');
// const cache = require('./cache_handler');
// const redis = require('../../lib/redisclient');
const Rabbitmq = require('./rabbitmq_pubsub');


const log = logger.log;
// const db = new DB();


class Pubsub {
	
	
	static publish(exchange, routing_key, data, publish_opts) {
		
		let publish_Generator = function *(exchange, routing_key, data, publish_opts) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// validate the arguments
				if (!exchange || !routing_key || !data) {
					result = false;
				}
				else {

					publish_opts = publish_opts || {persistent: false};

					// create a new rabbitmq client, just for pubslishing
					// to specified exchange, routing_key. After publishing, close the channel/ stop consuming
					let rabbitmq_config_options = {
						
						host: CONFIG.rabbitmq.host,
				        port: CONFIG.rabbitmq.port,
				        vhost: CONFIG.rabbitmq.vhost,
				        username: CONFIG.rabbitmq.username,
				        password: CONFIG.rabbitmq.password,
				        
				        queue: null,
				        queue_opts: null,
				        
				        exchange: exchange,
				        exchange_type: 'topic' || CONFIG.rabbitmq.exchange_type,
				        exchange_opts: {
				        	durable: true
				        },
				        
				        binding_key_default: routing_key,
				        binding_opts: {},

				        retry_attempts: 10,
				        reconnect: true,
				        
				        rechannel_attempts: 10,
				        rechannel: true,
				        
				        publisher_confirms: false,
				        prefetch: true,
				        prefetch_count: 1,
				        noack: true,
				        
				        publish_opts_default: publish_opts,
				        
				        subscribe_opts_default: {
				        	noAck: true
				        }
					};

					// create the subscriber rabbitrmq client
					rabbitmq_config_options.client_type = 'publisher';
					let rabbitmq_pub = new Rabbitmq(rabbitmq_config_options);

					// initialize/start the rabbitmq client
					let isValidRmcInit, err;
				
					isValidRmcInit = yield rabbitmq_pub.init();
					if (!isValidRmcInit) {
						err = new Error('Unable to Initialize Rabbitmq Publisher client');
						throw err;
					}

					// try to publish the data
					let hasPublished = yield rabbitmq_pub.publish(exchange, routing_key, data, publish_opts);
					if (!hasPublished) {
						result = false;
						log.error('Unable to publish data to exchange: %s with routing_key: %s ', exchange, routing_key);
					}
					else {
						// now close the channel
						let hasStopped = yield rabbitmq_pub.stop();

						result = true;
					}

				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let publish_Coroutine = bluebird.coroutine(publish_Generator);
		
		// run the coroutine
		return publish_Coroutine(exchange, routing_key, data, publish_opts);
	}






}
	





module.exports = Pubsub;


