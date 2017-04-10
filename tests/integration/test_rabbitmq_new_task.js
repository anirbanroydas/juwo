const bluebird = require('bluebird');
const amqp = require('amqplib');

const logger = require('../../koatest/src/lib/logger');

const log = logger.log;



let rabbitmq_Generator = function *() {
	log.debug('connecting to rabbitmq...');
	
	const conn = yield amqp.connect('amqp://localhost');

	// log.debug('conn : ', conn);
	
	if (!conn) {
		log.error('Error in amqp connection');
		process.exit(1);
	}

	log.debug('connected to rabbitmq successfully');

	const ch = yield conn.createChannel();
	// log.debug('channel created : ', ch);

	if (!ch) {
		log.error('Error in channel creteion : ');
		yield conn.close();
		log.info('connection closed');
		process.exit(1);
	}
	log.debug('channel created successfully');

	let q = 'tasks';

	let q_ok = yield ch.assertQueue(q, {durable: true});

	log.debug('q_ok : ', q_ok);
	if (!q_ok) {
		log.error('Error in asswertin Quereue');
		yield ch.close();
	    log.info('channeld closed');
	    yield conn.close();
	    log.info('connection closed');
	    process.exit(1);
	}

	log.debug('q created successfully');

	let msg = process.argv.slice(2).join(' ') || 'Hellow World!';

    // Note: on Node 6 Buffer.from(msg) should be used
    ch.sendToQueue(q, Buffer.from(msg), {persistent: true});
    log.info(" [x] Sent ", msg);

    log.info('disconnecting from rabbitmq');
    
    yield ch.close();
    log.info('channeld closed');
    yield conn.close();
    log.info('connection closed');

};


let rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// run the coroutine
rabbitmq_Coroutine();

