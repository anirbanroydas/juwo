const bluebird = require('bluebird');
const amqp = require('amqplib');

const logger = require('./logger');
const utils = require('./utils');
const CONFIG = require('./settings').CONFIG_DATA;




const log = logger.log;



class RabbitMqClient {
    
    constructor(options) {
    	
    	options = options || {};

        this._connected = false;
        this._connection = null;
        this._channel = null;
        this._closing = false;
        this._closed = false;
        this._consumer_tag = null;
        this._deliveries = [];
        this._acked = 0;
        this._nacked = 0;
        this._message_number = 0;
        this._status = 0;
        this._userinfo = null;
        
        this._host = options.host || CONFIG.rabbitmq.host || 'localhost';
        this._port = parseInt(options.port) || parseInt(CONFIG.rabbitmq.port) || 5672;
        this._vhost = options.vhost || CONFIG.rabbitmq.vhost || '/';
        this._username = options.username || CONFIG.rabbitmq.username || 'guest';
        this._password = options.password || CONFIG.rabbitmq.password || 'guest';
        
        let temp_queue;
        if (CONFIG.rabbitmq.queue_default === 'null' || !CONFIG.rabbitmq.queue_default) {
            temp_queue = options.queue || 'koatest-queue-' + utils.genid(32);
        }
        else {
            temp_queue = options.queue || CONFIG.rabbitmq.queue_default || 'koatest-queue-' + utils.genid(32);
        }

        this._queue = temp_queue;
        
        this._queue = options.queue || CONFIG.rabbitmq.queue_default || 'koatest-queue-' + utils.genid(32);
        this._queue_opts = options.queue_opts ||CONFIG.rabbitmq.queue_opts || {};
        
        this._exchange = options.exchange || CONFIG.rabbitmq.exchange || 'chatexchange';
        this._exchange_type = options.exchange_type || CONFIG.rabbitmq.exchange_type || 'topic';
        this._exchange_opts = options.exchange_opts || CONFIG.rabbitmq.exchange_opts || {};

        this._binding_key_default = options.binding_key_default || CONFIG.rabbitmq.binding_key_default || 'public.*';
        this._binding_opts = options.binding_opts || CONFIG.rabbitmq.binding_opts || {};

        this._retry_attempts = parseInt(options.retry_attempts) || parseInt(CONFIG.rabbitmq.retry_attempts) || 10;
        this._reconnect = options.reconnect || CONFIG.rabbitmq.reconnect || true;
        
        this._rechannel_attempts = parseInt(options.rechannel_attempts) || parseInt(CONFIG.rabbitmq.rechannel_attempts) || 10;
        this._rechannel = options.rechannel || CONFIG.rabbitmq.rechannel || true;
        
        this._publisher_confirms = options.publisher_confirms || CONFIG.rabbitmq.publisher_confirms || false;
        this._prefetch = options.prefetch || CONFIG.rabbitmq.prefetch || false;
        this._prefetch_count = parseInt(options.prefetch_count) || parseInt(CONFIG.rabbitmq.prefetch_count) || 1;
        this._noack = options.noack || CONFIG.rabbitmq.noack || false;
        this._client_type = options.client_type || CONFIG.rabbitmq.client_type || 'multi';
        
        this._publish_opts_default = options.publish_opts_default || CONFIG.rabbitmq.publish_opts_default || {};
        this._subscribe_opts_default = options.subscribe_opts_default || CONFIG.rabbitmq.subscribe_opts_default || {};
        
        this._allow_publish = false;
        this._allow_subcribe = false;
        this._retry_counts = 0;
        this._rechannel_counts = 0;
        

        this.socketio = null;

        let isValidOptions = this.validate_options();

        if(!isValidOptions.status) {
            let err = new Error('Invalidated Options');
            err.message = isValidOptions.message;
            throw err;
        }
        
        else {
            this.url = 'amqp://' + this._username + ':' + this._password + '@' + this._host + ':' + this._port + this._vhost + '?heartbeat=60';
            
            RabbitMqClient._connected = RabbitMqClient._connected || {};
            RabbitMqClient._connected[this.url] = RabbitMqClient._connected[this.url] || {};
            RabbitMqClient._connected[this.url][this._client_type] = RabbitMqClient._connected[this.url][this._client_type] || false;

            RabbitMqClient._connection = RabbitMqClient._connection || {};
            RabbitMqClient._connection[this.url] = RabbitMqClient._connection[this.url] || {};
            RabbitMqClient._connection[this.url][this._client_type] = RabbitMqClient._connection[this.url][this._client_type] || null;
        }

    }







    validate_options() {
        log.debug('validating options ');
        
        let status = true;
        let messages = [];
        
        if (typeof this._host !== 'string' ) {
            status = false;
            messages.push('host');
        }
        if (isNaN(this._port) || typeof this._port !== 'number' ) {
            status = false;
            messages.push('port');
        }
        if (typeof this._vhost !== 'string' || !this._vhost.startsWith('/') ) {
            status = false;
            messages.push('vhost');
        }
        

        if (typeof this._username !== 'string') {
            status = false;
            messages.push('username');
        }
        if (typeof this._password !== 'string') {
            status = false;
            messages.push('password');
        }

        
        if (typeof this._queue !== 'string') {
            status = false;
            messages.push('queue');
        }
        if (typeof this._queue_opts !== 'object') {
            status = false;
            messages.push('queue_opts');
        }


        if (typeof this._exchange !== 'string') {
            status = false;
            messages.push('exchange');
        }
        if (typeof this._exchange_type !== 'string') {
            status = false;
            messages.push('exchange_type');
        }
        if (typeof this._exchange_opts !== 'object') {
            status = false;
            messages.push('exchange_opts');
        }


        if (typeof this._binding_key_default !== 'string' || !Array.isArray(this._binding_key_default)) {
            status = false;
            messages.push('binding_key_default');
        }
        if (typeof this._binding_opts !== 'object') {
            status = false;
            messages.push('binding_opts');
        }


        if (isNaN(this._retry_attempts) || typeof this._retry_attempts !== 'number') {
            status = false;
            messages.push('retry_attempts');
        }
        if (typeof this._reconnect !== 'boolean') {
            status = false;
            messages.push('reconnect');
        }


        if (isNaN(this._rechannel_attempts) || typeof this._rechannel_attempts !== 'number') {
            status = false;
            messages.push('rechannel_attempts');
        }
        if (typeof this._rechannel !== 'boolean') {
            status = false;
            messages.push('rechannel');
        }


        if (typeof this._publisher_confirms !== 'boolean') {
            status = false;
            messages.push('publisher_confirms');
        }
        

        if (typeof this._prefetch !== 'boolean') {
            status = false;
            messages.push('prefetch');
        }
        else if (this._prefetch === true) {
            
            if (isNaN(this._prefetch_count) || typeof this._prefetch_count !== 'number') {
                status = false;
                messages.push('prefetch_count');
            }
        }
        else if (this._prefetch === false) {
            this._prefetch_count = 1;
        }
        
        
        if (typeof this._noack !== 'boolean') {
            status = false;
            messages.push('noack');
        }
        if (typeof this._client_type !== 'string' || (this._client_type !=='publisher' && this._client_type !=='subscriber' && this._client_type !=='multi')) {
            status = false;
            messages.push('client_type');
        }


        if (typeof this._publish_opts_default !== 'object') {
            status = false;
            messages.push('publish_opts_default');
        }
        if (typeof this._subscribe_opts_default !== 'object') {
            status = false;
            messages.push('subscribe_opts_default');
        }



        return {
            status: status,
            message: messages
        };
        
    }









    init() {

    	let init_Generator = function *(self) {

	    	log.debug('[RabbitMqClient] Rabbitmq init called');	 
            let result = true;
	    	
            let conn = yield self.connect();
	    	if (!conn) {
	    		result = false;
	    	}
            else {
	    	  self._connection = RabbitMqClient._connection[self.url][self._client_type];


    	    	// call on_connection_opened
    	    	let isValidConn = yield self.on_connection_opened();
                if (!isValidConn) {
                    result = false;
                }
            }

	    	return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});
	    };

	    let init_Coroutine = bluebird.coroutine(init_Generator);

	    // call the coroutine
	    return init_Coroutine(this);
    }







    get connected() {
    	this._connected = RabbitMqClient._connected[this.url][this._client_type];
    	return this._connected;
    }


    get channel() {
    	return this._channel;
    }


    get socket() {
        return this.socketio;
    }

    set socket(socket) {
    	this.socketio = socket;
    }










    connect() {
        
        let connect_Generator = function *(self) {
        	
        	log.debug('[RabbitMqClient] Rabbitmq connect called');       	
        	if (RabbitMqClient._connected[self.url][self._client_type]) {       	
	        	log.info('[RabbitMqClient] Already connected to RabbitMQ');
	        	self._connected = true;
	        }
	        else {
	        	log.info('[RabbitMqClient] Connecting to RabbitMQ on localhost:5672');
	        	try {
	        		RabbitMqClient._connection[self.url][self._client_type] = yield amqp.connect(self.url);
		        	self._connected = true;
		        	RabbitMqClient._connected[self.url][self._client_type] = true;
	        	}
	        	catch (err) {
	        		log.error('Error connecting to Rabbitmq: Error : ', err);
	        		self._connected = false;
	        	}
	        } 
	        return new bluebird(function(resolve, reject) {
        		resolve(self._connected);
        	});
        };

        let connect_Coroutine = bluebird.coroutine(connect_Generator);

        // run the coroutine
        return connect_Coroutine(this);
              
    }









    disconnect() {
      	log.debug('[RabbitMqClient] disconnecting rabbitmq');
    	
    	let disconnect_Generator = function *(self) {
    		let result = true;
	    	if (self._connection || self._connected) {
	    		try {

                    if (self._publisher_confirms) {  
                        try {
                            if (self._channel) {
                                let hasPusblished = yield self._channel.waitForConfirms();
                                log.debug('hasPusblished : ', hasPusblished);
                            }
                        }
                        catch (err) {
                            log.error('WairForConfirms Error : ', err);
                        }
                    }


	    			self._rechannel = false;
                    self._reconnect = false;
		    		yield self._connection.close();
		    		log.info('[RabbitMqClient] Connection closed Successfully');
		    	}
		    	catch (err) {
		    		log.error('Error in disconnecting the connection : ', err);
		    		result = false;
		    	}
	    	}
	        else {
	        	self._connected = false;
		        RabbitMqClient._connected[self.url][self._client_type] = false;
		        self._connection = null;
		        RabbitMqClient._connection[self.url][self._client_type] = null;

			    if (self._channel) {
			    	self._rechannel = false;
			    	let isChannelClosed = yield self.close_channel();
			        
			        if (!isChannelClosed) {
			        	result = false;
			        }
			        else {
			        	log.debug('Channle Closed successfully : ', isChannelClosed);
			        }
		        }
		        if (self._queue) {
		            self._queue = null;
		        }
		        if (self.socket) {
		        	self.socketio.disconnect();
		            self.socketio = null;
		        }
	        }

	        return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

	    };

	    let disconnect_Coroutine = bluebird.coroutine(disconnect_Generator);

	    // run the coroutine
	    return disconnect_Coroutine(this);

    }









    on_connection_opened() {
        log.debug('[RabbitMqClient] Rabbitmq connection opened');

        this._reconnect = false;
        
        this.add_on_connection_close_callback();
        this.add_on_connection_error_callback();
        this.add_on_connection_blocked_callback();
        this.add_on_connection_unblocked_callback();
        
        let on_connection_opened_Generator = function *(self) {
        	log.debug('inside on_connection_opened Generator');

        	let isValid = yield self.open_channel();

        	return new bluebird(function(resolve, reject) {
        		resolve(isValid);
        	});
        };

        let on_connection_opened_Coroutine = bluebird.coroutine(on_connection_opened_Generator);

        // run the coroutine
        return on_connection_opened_Coroutine(this);
           
    }








    




    add_on_connection_close_callback() {
    	this._connection.on('close', this.on_connection_closed);   
    }




    on_connection_closed() {

        if (!this._reconnect) {
	        log.info('[RabbitMqClient] Rabbitmq connection closed ');
	        
	        this._connected = false;
	        RabbitMqClient._connected[this.url][this._client_type] = false;
	        this._connection = null;
	        RabbitMqClient._connection[this.url][this._client_type] = null;

		    if (this._channel) {
		    	let close_channel_Generator = function *(self) {
		    		this._rechannel = false;
		    		let isChannelClosed = yield self.close_channel();
		    		if (!isChannelClosed) {
		    			log.debug('Error in closing the channel');
		    		}
		    	};

		    	let close_channel_Coroutine = bluebird.coroutine(close_channel_Generator);

		    	// run the coroutine
		    	close_channel_Coroutine(this);
	            
	        }
	        if (this._queue) {
	            this._queue = null;
	        }
	        if (this.socket) {
	        	this.socketio.disconnect();
	            this.socketio = null;
	        }
	    }
	    else {
	    	let err = new Error('Connection Closed abruptly');
	    	log.debug('sending on_connection_error error to try to reconnect if possible');
	    	this.on_connection_error(err);
	    }
    }


    





    add_on_connection_error_callback() {
    	this._connection.on('error', this.on_connection_error);   
    }




    on_connection_error(err) {
        log.error('[RabbitMqClient] Rabbitmq connection errored : ', err);
        
        if (this._retry_attempts > 0) {

        	let reconnectTimeout = utils.backoff(++this._retry_counts);        	
        	this._retry_attempts--;        	
        	this._reconnect = true;

        	log.info(`Connection errored, reconnecting in  ${reconnectTimeout} seconds`);
        	this.reconnect(reconnectTimeout*1000);
        }
        else {
        	// disconnect the connection since reconnecting is unsuccessful after maximum retry attempts
        	this._reconnect = false;
        	let close_connection_Generator = function *(self) {
	    		let isDisonnected = yield self.disconnect();;
	    		if (!isDisonnected) {
	    			log.info('Error in closing the connection');
	    		}
	    	};

	    	let close_connection_Coroutine = bluebird.coroutine(close_connection_Generator);

	    	// run the coroutine
	    	close_connection_Coroutine(this);
        	
        }             
    }





    reconnect(reconnectTimeout) {
        log.debug('[RabbitMqClient] Reconnecting to rabbitmq');

        let reconnect_function = function() {
        	let self = this;

        	let reconnect_Generator = function *(self) {
        		let isInit = yield self.init();
        		if (!isInit) {
        			let err = new Error('Unable to initialise open connection');
        			log.debug('sending connection error, and trying to reconnect');
        			self.on_connection_error(err);
        		}
        		else {
        			log.debug('Init Successfully Called from Reconect : ', isInit);
        		}
        	};

        	let reconnect_Coroutine = bluebird.coroutine(reconnect_Generator);

        	// run the coroutine
        	reconnect_Coroutine(self);
        }
        
        setTimeout(reconnect_function.bind(this), reconnectTimeout);

    }







    add_on_connection_blocked_callback() {

        this._connection.on('blocked', this.on_connection_blocked);
    }



    on_connection_blocked(reason) {

        log.info('Connection was blocked for : ',  reason);
    }






    add_on_connection_unblocked_callback() {

        this._connection.on('unblocked', this.on_connection_unblocked);
    }



    on_connection_unblocked() {

        log.info('Connection was unblocked ');
    }







 

    open_channel() {        
        log.debug('[RabbitMqClient] Creating a new channel for connection ');

        let open_channel_Generator = function *(self) {
        	let result = true;
        	try {
	        	if (self._publisher_confirms) {
	        		self._channel = yield self._connection.createConfirmChannel();
	        	}
	        	else {
	        		self._channel = yield self._connection.createChannel();
	        	}
	        	
	        	// call channel open callback
	        	let isChannelOpenSetup = yield self.on_channel_open();
	        	if (!isChannelOpenSetup) {
	        		result = false;
	        	}
	      	
	      	}
	      	catch (err) {
	      		log.error('Error while creating channel : ', err);

	      		result = false;
	      	}

	      	return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});
        };

        let open_channel_Coroutine = bluebird.coroutine(open_channel_Generator);

	    // call the coroutine
	    return open_channel_Coroutine(this);
        
    }









    close_channel() {

    	let close_channel_Generator = function *(self) {
	        log.info('[RabbitMqClient] Closing the channel... ');
	        let result = true;
	        try {
		        // // Now try to close the correspongin socket if open
		        // if (self.socket && self.socketio.client.userinfo) {
		        // 	self.socketio.disconnect();
		        // 	self.socketio = null;
		        // }
                
                if (self._publisher_confirms) {  
                    try {
                        if (self._channel) {
                            let hasPusblished = yield self._channel.waitForConfirms();
                            log.debug('hasPusblished : ', hasPusblished);
                        }
                    }
                    catch (err) {
                        log.error('WairForConfirms Error : ', err);
                    }
                }

                if (self._channel) {
                    self._rechannel = false;
                    let isChannelClosed = yield self._channel.close();
                    if (isChannelClosed) {
                        self._channel = null;
                        log.info('[RabbitMqClient] Channel closed');
                    } 
                }
		        
		    }
		    catch (err) {
		    	log.error('Error in clsoing the channel : ', err);
		    	result = false;
		    }

		    return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});	        
	    };

	    let close_channel_Coroutine = bluebird.coroutine(close_channel_Generator);

        // run the coroutine
        return close_channel_Coroutine(this);

    }









    on_channel_open() {

        log.debug('[RabbitMqClient] Channel opened : ');
        
        this.add_on_channel_close_callback();
        this.add_on_channel_error_callback();
        this.add_on_channel_return_callback();

        let setup_rabbitmq_Generator = function *(self) {
        	let result = true;
        	let isValidExchange = yield self.setup_exchange();

        	  

        	let isValidPublish = true; 
        	let isValidSubscribe = true;
        	let isValidQueue = true;
        	let isValidBinding = true;
            log.debug('self._client_type : ', self._client_type);

        	if (self._client_type === 'multi') {
        		log.debug('client type is multi : hecne will setup queue, bind qeue and setup publis and start consuming');
        		
                isValidQueue = yield self.setup_queue();  
        		isValidBinding = yield self.bind_queue(); 
        		
        		isValidPublish = self.setup_publishing();
				// isValidConsume = yield self.start_consuming();
                isValidSubscribe = self.setup_subscribing(); 
        		
        	}
        	else if (self._client_type === 'publisher') {
                log.debug('client type is publisher_confirms : hecne will only setup publish');
        		
                isValidPublish = self.setup_publishing();
        		
        	}
        	else if (self._client_type === 'subscriber') {
        		log.debug('client type is subcriber : hecne will setup queue, bind qeue and start consuming');
        		
                isValidQueue = yield self.setup_queue();  
        		isValidBinding = yield self.bind_queue(); 
        		isValidSubscribe = self.setup_subscribing();	
        	}

        	if (!isValidExchange || !isValidQueue || !isValidBinding || !isValidPublish || !isValidSubscribe) {
        		log.info('[RabbitMqClient] Something is wrong with rabbitmq setup generator. Closing Channel...');
        		
        		let isChannelClosed = yield self.close_channel();
        		result = false;
        	}

        	return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

        	 	
        };

        let setup_rabbitmq_Coroutine = bluebird.coroutine(setup_rabbitmq_Generator);

        // run the coroutine
        return setup_rabbitmq_Coroutine(this);
        
    }










    add_on_channel_close_callback() {

        this._channel.on('close', this.on_channel_closed);
    }



    on_channel_closed() {

        if (!this._rechannel) {
	        log.info('[RabbitMqClient] Rabbitmq channle closed ');
	        
	        if (this._queue) {
	            this._queue = null;
	        }
	        if (this.socket) {
	            this.socketio.disconnect();
	            this.socketio = null;
	        }
	    }
	    else {
	    	let err = new Error('Channel Disconnected abruptly');
			log.debug('sending channel error, and trying to rechannel');
			self.on_channel_error(err);
	    }
    }







    add_on_channel_error_callback() {

        this._channel.on('error', this.on_channel_error);
    }



    on_channel_error(err) {

        log.info('Channel was errored : ', err);
        log.debug('REchannle : ', this._rechannel);

        // try to recreate the channel or close the channel and recreate it
        // or just close the channel
        // Also close the associated socketion conneciton if closing the channel
       	if (this._rechannel_attempts > 0) {
            log.debug('Now will try to rechannel');
        	let rechannelTimeout = utils.backoff(++this._rechannel_counts);        	
        	this._rechannel_attempts--;        	
        	this._rechannel = true;

        	log.info(`Channel errored, rechanneling in  ${rechannelTimeout} seconds`);
        	this.rechannel(rechannelTimeout*1000);
        }
        else {
            log.debug('Now will try to close the channel');
        	// disconnect the connection since rechanneling is unsuccessful after maximum rechannel attempts
        	this._rechannel = false;
        	let close_channel_Generator = function *(self) {
	    		let isChannelClosed = yield self.close_channel();
	    		if (!isChannelClosed) {
	    			log.info('Error in closing the channel');
	    			// Atleast disconnect the socketio connection
	    			if (self.socket) {
	    				self.socketio.disconnect();
	    				self.socketio = null;
	    			}
	    		}
	    	};

	    	let close_channel_Coroutine = bluebird.coroutine(close_channel_Generator);

	    	// run the coroutine
	    	close_channel_Coroutine(this);
        	
        } 
        
    }





    rechannel() {
    	log.debug('[RabbitMqClient] Rechanneling to rabbitmq');

        let rechannel_function = function() {
        	let self = this;

        	let rechannel_Generator = function *(self) {
        		let isChannelOpened = yield self.open_channel();
        		if (!isChannelOpened) {
        			let err = new Error('Unable to open Channel');
        			log.debug('sending channel error, and trying to rechannel');
        			self.on_channel_error(err);
        		}
        		else {
        			log.debug('Channel Open Successfully Called from Rechannel : ');
        		}
        	};

        	let rechannel_Coroutine = bluebird.coroutine(rechannel_Generator);

        	// run the coroutine
        	rechannel_Coroutine(self);
        }
        
        setTimeout(rechannel_function.bind(this), reconnectTimeout);	
    }





    add_on_channel_return_callback() {

        this._channel.on('return', this.on_channel_return);
    }



    on_channel_return(msg) {

        log.info('Chanel returned msg : ', msg);
    }








    setup_exchange(exchange, exchange_type, exchange_opts) {

        let setup_exchange_Generator = function *(self, exchange, exchange_type, exchange_opts) {        	
        	log.debug('[RabbitMqClient] Rabbitmq setup exchange called');
    	
        	exchange = exchange || self._exchange;
        	exchange_type = exchange_type || self._exchange_type;
        	exchange_opts = exchange_opts || self._exchange_opts;

        	let result = true;

        	try {
        		let ex = yield self._channel.assertExchange(exchange, exchange_type, exchange_opts);
        		log.debug('exchange created : ', ex);
        	}
        	catch (err) {
        		log.error('Error setting up exchange %s with exchange_type : %s with Error : ', exchange, exchange_type, err);
        		result = false;
	    	}

	        return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

        };

        let setup_exchange_Coroutine = bluebird.coroutine(setup_exchange_Generator);

        // run the coroutine
        return setup_exchange_Coroutine(this, exchange, exchange_type, exchange_opts);
    }







    on_exchange_declare_ok() {

        log.debug('[RabbitMqClient] Exchange declared');
    }



    
    


    setup_queue(queue, queue_opts) {

        let setup_queue_Generator = function *(self, queue, queue_opts) {   
    	
        	queue = queue || self._queue;
        	queue_opts = queue_opts || self._queue_opts;

        	log.debug('[RabbitMqClient] setting up queuue %s for channel ', queue)

        	let result = true;

        	try {
        		let q_ok = yield self._channel.assertQueue(queue, queue_opts);
        		log.debug('queue created : ', q_ok);
        	}
        	catch (err) {
        		log.error('Error setting up queue %s withing channel with Error : ', queue, err);
        		result = false;
	    	}

	        return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

        };

        let setup_queue_Coroutine = bluebird.coroutine(setup_queue_Generator);

        // run the coroutine
        return setup_queue_Coroutine(this, queue, queue_opts);
    }




    


    on_queue_declare_ok() {

        log.debug('[RabbitMqClient] Queue declared');
        return this.bind_queue();   	
    }






    

    bind_queue(queue, exchange, binding_key, binding_opts) {

    	let bind_queue_Generator = function *(self, queue, exchange, binding_key, binding_opts) {   
    	
        	queue = queue || self._queue;
        	exchange = exchange || self._exchange;
        	binding_key = binding_key || self._binding_key_default;
        	binding_opts = binding_opts || self._binding_opts;

        	log.debug('[RabbitMqClient] binding queue: %s with exchange %s with binding_key \
        		: %s for channel', queue, exchange, binding_key)

        	let result = true;

        	try {
                let bind_ok;
                if (Array.isArray(binding_key)) {
                    // bind queue with all the keys
                    for (let key of binding_key) {
                        bind_ok = yield self._channel.bindQueue(queue, exchange, key, binding_opts);
                        log.debug('queue binded : ', bind_ok);
                    }
                }
                else  {
                    bind_ok = yield self._channel.bindQueue(queue, exchange, binding_key, binding_opts);
                    log.debug('queue binded : ', bind_ok);
                }
        		
        	}
        	catch (err) {
        		log.error('Error binding queue %s with exchange %s with binding_key : %s \
        			within channel  with Error : ', queue, exchange, binding_key, err);
        		result = false;
	    	}

	        return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

        };

        let bind_queue_Coroutine = bluebird.coroutine(bind_queue_Generator);

        // run the coroutine
        return bind_queue_Coroutine(this, queue, exchange, binding_key, binding_opts);	
    }









    on_bind_ok() {

    	log.debug('[RabbitMqClient] Queue declared');
        return this.bind_queue(); 
    }



    


    setup_publishing() {
    	this._allow_publish = true;
    	return true;
    }


    


    on_publish_confirmation(err, publish_ok) {

        log.debug('[RabbitMqClient] Msg published confirmed');

        if (err) {
        	log.error('Error in publishing : ', err);
        }
        else {
        	log.debug('Successfully publisehd : ', publish_ok);
        }
        
        // if confirmation_type == 'ack':
        //     this._acked += 1
        // elif confirmation_type == 'nack':
        //     this._nacked += 1

        // this._deliveries.remove(method_frame.method.delivery_tag)

        // log.info('[RabbitMqClient] Published %i messages, %i have yet to be confirmed, %i were acked and %i were nacked ' % (
        //     this._message_number, len(this._deliveries), this._acked, this._nacked))
    }

    




    publish(exchange, routing_key, data, publish_opts) {

        let publish_Generator = function *(self, exchange, routing_key, data, publish_opts) { 
            
            let result = true;
            
            if (!self._allow_publish) {
            	log.error('This RabbitMQ Client is not set for publishing, client type was set as : ', self._client_type);
            	result = false;
            }
            else {

                log.debug('[RabbitMqClient] Publishing message..');

            	exchange = exchange || self._exchange;
            	routing_key = routing_key || self._binding_key_default;
            	data = data || 'Default Data';
            	publish_opts = publish_opts || self._publish_opts_default;

                if (typeof data === 'object') {
                	data = JSON.stringify(data);
                }

                try {
        	        if (self._publisher_confirms) {
        	        	
        	        	self._channel.publish(exchange, routing_key, Buffer.from(data), publish_opts, self.on_publish_confirmation);
        	               
                        try {
                            let hasPusblished = yield self._channel.waitForConfirms();
                            log.debug('hasPusblished : ', hasPusblished);
                        }
                        catch (err) {
                            log.error('WairForConfirms Error : ', err);
                        }

                    }
        	        else {
        	        	
        	        	self._channel.publish(exchange, routing_key, Buffer.from(data), publish_opts);
        	        }

                    // this._message_number += 1
                    // this._deliveries.push(this._message_number)
                    

                    
        	    
                }
        	    catch (err) {
        	    	log.error('Error in Publishing to exchange : %s, routing_key : %s with Error : ', exchange, routing_key, err);
        	    	result =  false;
        	    }
            
            }
            

            return new bluebird(function(resolve, reject) {
                resolve(result);
            });

        };
        
        let publish_Coroutine = bluebird.coroutine(publish_Generator);

        // run the coroutine
        return publish_Coroutine(this, exchange, routing_key, data, publish_opts);
    }


    



    setup_subscribing() {

        if (this._prefetch) {
            
            this._channel.prefetch(this._prefetch_count);
            log.debug('Channel prefethed to count : ', this._prefetch_count);
        }

        this._allow_subcribe = true;
        return true;
    }






    start_subscribing(queue, on_message, subscribe_opts) {

    	let start_consuming_Generator = function *(self, queue, on_message, subscribe_opts) {   
    	
            let result = true;

            if (!self._allow_subcribe) {
                log.error('This RabbitMQ Client is not set for subscribing, client type was set as ', self._client_type);
                result = false;
            }
            else {
                if (typeof queue === 'function') {
                    on_message = queue;
                    queue = self._queue;
                }
                else {
                    queue = queue || self._queue;
                    on_message = on_message || self.on_message.bind(self);
                }
            	
    	    	subscribe_opts = subscribe_opts || self._subscribe_opts_default;

                log.debug('subscribe_opts : ', subscribe_opts);

            	try {
                    let consume_ok = yield self._channel.consume(queue, on_message, subscribe_opts);
            		
                    log.debug('consuming started : ', consume_ok);
                    log.debug('[RabbitMqClient] Started subscribing with queue %s for channel ', queue)
            	}
            	catch (err) {
            		log.error('Error subscribing with queue %s within channel with Error : ', queue, err);
            		result = false;
    	    	}

            }

	    	// let m = {'msg_type': 'rabbitmqOK'};
	    	// this.socketio.emit('start', JSON.stringify(m));

	        return new bluebird(function(resolve, reject) {
        		resolve(result);
        	});

        };

        let start_consuming_Coroutine = bluebird.coroutine(start_consuming_Generator);

        // run the coroutine
        return start_consuming_Coroutine(this, queue, on_message, subscribe_opts);	

    }


        







    on_message(msg) {

        log.debug('[RabbitMqClient] Received message : ', msg);

        let body = msg.content.toString();
        log.debug('[x] msg received : ', body);
        try {
        	body = JSON.parse(body);
        }
        catch (err) {
        	log.debug('[x] msg received is not json serialized');
        }  
        // log.debug('[x] msg received : ', body);      

        // if stage == 'stop' and this._person == json_decoded_body['name']:
        //     LOGGER.warning(
        //         '[RabbitMqClient] skipping sending message to websocket since webscoket is closed.')
        //     LOGGER.info('[RabbitMqClient] initating closing of rabbitmq Client Connection.....')

        //     this.stop()

        // else:
        //     LOGGER.info(
        //         '[RabbitMqClient] sending the message to corresponsding websoket: %s ' % this.websocket)

        //     this.websocket.send(body)


        // tyr to acknowlydge msg
        this.acknowledge_msg_consumed();
        
    }






    acknowledge_msg_consumed() {
        log.debug('Acknowledgin the consumed msg only if noAck is false')
        // acknowledge the messge received
        if (!this._noack || (this._subscribe_opts_default.noAck !== undefined && !this._subscribe_opts_default.noAck)) {
            
            // let secs = body.split('.').length - 1;
            // log.debug(" [x] Task takes %d seconds", secs);

            // bluebird.coroutine(function *(self) {
            //     log.info(' [x] Processing message');
            //     let d = yield bluebird.delay(secs*1000);
            //     log.info(' [x] Done ');
            //     self._channel.ack(msg);
            // })(this);
            
            this._channel.ack(msg);
        }
    }






    stop_subscribing() {
        log.info('[RabbitMqClient] stopping subscribing....');

      //   if (this._channel) {
      //   	log.debug('[RabbitMqClient] Sending a channel close command');

      //   	let close_channel_Generator = function *(self) {
	    	// 	let isChannelClosed = yield self.close_channel();
	    	// 	if (!isChannelClosed) {
	    	// 		log.debug('Error in closing the channel');
	    	// 	}
	    	// };

	    	// let close_channel_Coroutine = bluebird.coroutine(close_channel_Generator);

	    	// // run the coroutine
	    	// close_channel_Coroutine(this);
      //   }
     
        return this.close_channel();

    }




    



    stop() {
        log.info('[RabbitMqClient] Stopping RabbitMQClient object... ');

        return this.stop_subscribing();
        // log.info('[RabbitMqClient] RabbitMQClient Stopped');
    }




}
















module.exports = RabbitMqClient;



