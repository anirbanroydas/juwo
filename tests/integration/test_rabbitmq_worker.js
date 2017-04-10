const bluebird = require('bluebird');
const amqp = require('amqplib');

const logger = require('../../koatest/src/lib/logger');

const log = logger.log;




const rabbitmq_Generator = function *() {
	log.debug('connecting to rabbitmq...');
	
	let conn;
	try {
		conn = yield amqp.connect('amqp://localhost');
	}
	catch (err) {
		log.error('Error in amqp connection : ', err);
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

	yield ch.prefetch(1);
	log.debug('prefetched 1');


    // Note: on Node 6 Buffer.from(msg) should be used
    ch.consume(q, onMsg, {noAck: false});
    log.info(" [*] Waiting for messages. To exit press CTRL+C");

    log.info('this is executed after consume block');

    function onMsg(msg) {
	    let body = msg.content.toString();
	    log.info(" [x] Received '%s'", body);
	    let secs = body.split('.').length - 1;
	    log.debug(" [x] Task takes %d seconds", secs);
	    
	    bluebird.coroutine(function *() {
	    	let d = yield bluebird.delay(secs*1000);
	    	log.info(' [x] Done');
	    	ch.ack(msg);
	    })();
	    
	}

};


const rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// run the coroutine
rabbitmq_Coroutine();











