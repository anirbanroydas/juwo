const bluebird = require('bluebird');
const amqp = require('amqplib');

const logger = require('../../koatest/src/lib/logger');
const Rabbitmq = require('../../koatest/src/lib/rabbitmq_pubsub');

const log = logger.log;

log.debug('will start rabbitmq_Generator now');




const rabbitmq_Generator = function *() {
	log.debug('connecting to rabbitmq...');
	
	// let conn, ch;
	// try {
	// 	conn = yield amqp.connect('amqp://localhost');

	// 	// log.debug('conn : ', conn);

	// 	log.debug('connected to rabbitmq successfully');

	// 	ch = yield conn.createChannel();
	// 	// log.debug('channel created : ', ch);
	// 	log.debug('channel created successfully');

	// 	let ex = 'test_topic_exchange_2';

	// 	let ex_ok = yield ch.assertExchange(ex, 'topic', {durable: true});

	// 	log.debug('ex_ok : ', ex_ok);

	// 	log.debug('exhange created successfully');

	// 	let q = 'test_topic_queue_2';

	// 	let q_ok = yield ch.assertQueue(q, {durable: true});

	// 	log.debug('q_ok : ', q_ok);

	// 	log.debug('q created successfully');

	// 	let routing_key = 'test.emit_topic.*';

	// 	let bind_ok = yield ch.bindQueue(q, ex, routing_key);

	// 	log.debug('bind_ok : ', bind_ok);

	// 	log.debug('q binded successfully');

	// 	// let msg = process.argv.slice(2).join(' ') || 'Hellow World!';

	// 	// ch.prefetch(1);
	// 	// log.debug('prefetched 1');


	// 	let isValidConsume = yield s_consume(ch, q, onMsg.bind(this), {noAck: false}, true);
	    
	//     // Note: on Node 6 Buffer.from(msg) should be used
	//     // let consume_ok = yield ch.consume(q, onMsg, {noAck: false});
	//     // log.debug('consuming started : ', consume_ok);
	    
	//     // log.info(" [*] Waiting for messages. To exit press CTRL+C");

	//     function onMsg(msg) {
	// 	    let body = msg.content.toString();
	// 	    log.info(" [x] Received '%s' from exchange: %s with routing_key: %s in queue: %s", body, ex, routing_key, q);
	// 	    let secs = body.split('.').length - 1;
	// 	    log.debug(" [x] Task takes %d seconds", secs);
		    
	// 	    bluebird.coroutine(function *() {
	// 	    	let d = yield bluebird.delay(secs*1000);
	// 	    	log.info(' [x] Done');
	// 	    	ch.ack(msg);
	// 	    })();
		    
	// 	}

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




	// function s_consume(ch, queue, on_message, consume_opts, prefetch) {
	// 	let start_consuming_Generator = function *(ch, queue, on_message, consume_opts, prefetch) {   
    	
 //        	queue = queue ;
 //        	on_message = on_message;
	//     	consume_opts = consume_opts;
	//     	prefetch = prefetch ;

 //            log.debug('consume_opts : ', consume_opts);

 //        	log.debug('[RabbitMqClient] Started Consuming with queue %s for channel ', queue)

 //        	let result = true;

 //        	try {
 //        		if (prefetch) {
 //        			if (typeof prefetch === 'boolean') {
 //        				prefetch = 1;
 //        			}
 //        			ch.prefetch(prefetch);
 //                    log.debug('Channel prefethed to count : ', prefetch);
 //        		}
        		
 //                let consume_ok = yield ch.consume(queue, on_message, consume_opts);
 //        		log.debug('consuming started : ', consume_ok);

 //                // log.debug('consuming started : ');
 //        	}
 //        	catch (err) {
 //        		log.error('Error Consuming with queue %s within channel with Error : ', queue, err);
 //        		result = false;
	//     	}

	//     	// let m = {'msg_type': 'rabbitmqOK'};
	//     	// this.socketio.emit('start', JSON.stringify(m));

	//         return new bluebird(function(resolve, reject) {
 //        		resolve(result);
 //        	});

 //        };

 //        let start_consuming_Coroutine = bluebird.coroutine(start_consuming_Generator);

 //        // run the coroutine
 //        return start_consuming_Coroutine(ch, queue, on_message, consume_opts, prefetch);
	// }




	let rmq;

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
	        client_type: 'subscriber',
	        
	        publish_opts_default: {
	        	persistent: true
	        },
	        
	        subscribe_opts_default: {
	        	noAck: false
	        },
		};

		// log.debug('ramq_opts : ', rmq_opts);

		rmq = new Rabbitmq(rmq_opts);
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

		
		let hasSubsribed = yield rmq.start_subscribing();
		if (!hasSubsribed) {
			log.info('Unable to start subsribing');
			let err = new Error('Unable to Start Subscribing Rabbitmq');
			throw err;
		}
		else {
			log.info(" [*] Waiting for messages. To exit press CTRL+C");
		}


	}
	catch (err) {
		log.error('Error : ', err);
		log.info('Disconnecting from server now...');
		let hasDisconnected = yield rmq.disconnect();
		if (!hasDisconnected) {
			log.info('Unable to disconnect');
		}
		else {
			log.info("Disconnected from rabbtimq successfully");
		}
		log.info('exiting process');
		// process.exit(1);
	}



    

};


const rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// run the coroutine
rabbitmq_Coroutine();











