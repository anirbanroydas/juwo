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
		return;
	}

	log.debug('connected to rabbitmq successfully');

	const ch = yield conn.createChannel();
	// log.debug('channel created : ', ch);

	if (!ch) {
		log.error('Error in channel creteion : ');
		return;
	}
	log.debug('channel created successfully');

	let q = 'hello';

	let q_ok = yield ch.assertQueue(q, {durable: false});

	log.debug('q_ok : ', q_ok);
	if (!q_ok) {
		log.error('Error in asswertin Quereue');
		return;
	}

	log.debug('q created successfully');

    // Note: on Node 6 Buffer.from(msg) should be used
    log.info(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
	ch.consume(q, function(msg) {
	  log.info(" [x] Received %s", msg.content.toString());
	}, {noAck: true});

    log.debug('This is past the consume functions');
    
    // yield ch.close();
    // log.info('channeld closed');
    // yield conn.close();
    // log.info('connection closed');

};


let rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// run the coroutine
rabbitmq_Coroutine();

