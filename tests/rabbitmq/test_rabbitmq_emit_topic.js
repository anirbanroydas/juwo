const bluebird = require('bluebird');
const amqp = require('amqplib');

const logger = require('../../koatest/src/lib/logger');
const Rabbitmq = require('../../koatest/src/lib/rabbitmq_pubsub');

const log = logger.log;

log.debug('will start rabbitmq_Generator now');
// log.debug('Rabbitmq : ', Rabbitmq);


let rabbitmq_Generator = function *() {
	log.debug('connecting to rabbitmq...');
	// let conn, ch;
	// try {
	// 	conn = yield amqp.connect('amqp://localhost');

	// 	// log.debug('conn : ', conn);

	// 	log.debug('connected to rabbitmq successfully');

	// 	ch = yield conn.createChannel();
	// 	// log.debug('channel created : ', ch);
	// 	log.debug('channel created successfully');

	// 	let ex = 'test_topic_exchange';

	// 	let ex_ok = yield ch.assertExchange(ex, 'topic', {durable: true});

	// 	log.debug('ex_ok : ', ex_ok);

	// 	log.debug('exhange created successfully');

	// 	let msg = process.argv.slice(2).join(' ') || 'Hellow World!';
	// 	let routine_key = 'test.emit_topic.*';
	    
	//     // Note: on Node 6 Buffer.from(msg) should be used
	//     ch.publish(ex, routine_key , Buffer.from(msg), {persistent: true});
	//     log.info(" [x] Sent msg: %s to exhange: %s with routine_key: %s", msg, ex, routine_key);

	//     log.info('disconnecting from rabbitmq');
	    
	//     yield ch.close();
	//     log.info('channeld closed');
	//     yield conn.close();
	//     log.info('connection closed');
	//     log.info('exiting proces...');
	//     process.exit(1);
	// }
	// catch (err) {
	// 	log.error('Error  : ', err);
	// 	if (ch) {
	// 	 	yield ch.close();
	// 	    log.info('channeld closed');
	// 	}
	// 	if (conn) {
	// 		yield conn.close();
	// 	    log.info('connection closed');
	// 	}
	// 	log.info('exiting proces...');
	// 	process.exit(1);
	// }
	// 
	
	try {
	
		let rmq_opts = {

	        host: 'localhost',
	        port: 5672,
	        vhost: '/',
	        username: 'guest',
	        password: 'guest',
	        
	        queue: 'test_topic_queue_2',
	        queue_opts: {
	        	durable: true
	        },
	        
	        exchange: 'test_topic_exchange_2',
	        exchange_type: 'topic',
	        exchange_opts: {
	        	durable: true
	        },
	        
	        binding_key_default: 'test.emit_topic.*',
	        binding_opts: {},

	        retry_attempts: 5,
	        reconnect: true,
	        
	        rechannel_attempts: 5,
	        rechannel: true,
	        
	        publisher_confirms: true,
	        prefetch: true,
	        prefetch_count: 1,
	        noack: false,
	        client_type: 'publisher',
	        
	        publish_opts_default: {
	        	persistent: true
	        },
	        
	        subscribe_opts_default: {
	        	noAck: false
	        },
		};

		// log.debug('ramq_opts : ', rmq_opts);

		let rmq = new Rabbitmq(rmq_opts);
		// log.debug('rmq : ', rmq);


		// log.debug('rmq : 1/0', 1/0);

		// let aerr = new Error('Artificial Error ');
		// log.debug('Artificial Error : ', aerr);
		// log.error('Artificial Error : ', aerr);
		// log.debug('Trhwoing artificail error ');

		// throw aerr;

		let isValidRmcInit = yield rmq.init();
		
		if (!isValidRmcInit) {
			let err = new Error('Unable to Initialize Rabbitmq');
			throw err;
		}

		let exchange = 'test_topic_exchange_2';
    	let routing_key = 'test.emit_topic.*';
    	let data = process.argv.slice(2).join(' ') || 'Hellow World!';

    	log.debug('Data to send : ', data);
		
		let hasPublished = yield rmq.publish(exchange, routing_key, data);
		if (!hasPublished) {
			log.info('Unable to publishe data');
		}
		else {
			log.info(" [x] Sent msg: %s to exhange: %s with routine_key: %s", data, exchange, routing_key);
		}

		log.info('Disconnecting from server now...');
		let hasDisconnected = yield rmq.disconnect();
		if (!hasDisconnected) {
			log.info('Unable to disconnect');
		}
		else {
			log.info("Disconnected from rabbtimq successfully");
		}

		


	}
	catch (err) {
		log.error('Error : ', err);
		log.info('exiting process');
		// process.exit(1);
		log.info('Disconnecting from server now...');
		let hasDisconnected = yield rmq.disconnect();
		if (!hasDisconnected) {
			log.info('Unable to disconnect');
		}
		else {
			log.info("Disconnected from rabbtimq successfully");
		}
	}
	

};


let rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// run the coroutine
rabbitmq_Coroutine();

