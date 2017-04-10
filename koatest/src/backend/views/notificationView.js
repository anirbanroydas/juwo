const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
// const DB = require('../../lib/db');
// const redis = require('../../lib/redisclient');
// const csrf_handler = require('../../lib/csrf_handler');
const cache = require('../../lib/cache_handler');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');


const log = logger.log
;

// Handler/Controller to handle route POST requests to Notiifcations User 
const NotificationUserPostHandler = function *(next) {
    this.log.debug('Inside User Notiifcation Post Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);

  	if (!this.state.isAuthenticated){
  		// Redirect to login page
  		this.log.info('Redirecting to login page');
  		
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;
  		sess.info = null;

  		let body = {
	    	status: 401,
	     	success: false,
	     	message: '/login'
	    };

	    body = JSON.stringify(body);

		this.status = 200;
	    this.body = body;	

	    return;
  	}
  	else {
  		// Validate the received data
      	let isValid = validator.isValidNotificationUserRequestData(this);

      	if (!isValid.status) {
			// throw new Error('Invalid form inputs');
			// error.badRequest(this, 'regsitration credentials not of correct form');
			this.log.error('Invalid request data');

			let body = {
		    	status: 400,
		     	success: false,
		     	message: isValid.message
		    };

		    body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;

		    return;
		}

		this.log.debug('valid request data');	
		
		// get feed from redis
		let data = yield cache.get_notification_user(sess.info.userid, this.request.body.cursor, this.request.body.count);
		
		let body = {
	    	status: 200,
	     	success: true,
	     	message: data
	    };

	    body = JSON.stringify(body);

		this.status = 200;
	    this.body = body;

	    return;
		  			
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};








// Handler/Controller to handle route POST requests to Notiifcations Count User 
const NotificationCountPostHandler = function *(next) {
    this.log.debug('Inside Notiifcation Count Post Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);

  	if (!this.state.isAuthenticated){
  		// Redirect to login page
  		this.log.info('Redirecting to login page');
  		
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;
  		sess.info = null;

  		let body = {
	    	status: 401,
	     	success: false,
	     	message: '/login'
	    };

	    body = JSON.stringify(body);

		this.status = 200;
	    this.body = body;	

	    return;	
  	}
  	else {
  		// Validate the received data
      	let isValid = validator.isValidNotificationCountRequestData(this);

      	if (!isValid.status) {
			// throw new Error('Invalid form inputs');
			// error.badRequest(this, 'regsitration credentials not of correct form');
			this.log.error('Invalid request data');

			let body = {
		    	status: 400,
		     	success: false,
		     	message: isValid.message
		    };

		    body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;

		    return;
		}

		this.log.debug('valid request data');	
		
		// get feed from redis
		let data = yield cache.get_notification_count(sess.info.userid);
		
		let body = {
	    	status: 200,
	     	success: true,
	     	message: data
	    };

	    body = JSON.stringify(body);

		this.status = 200;
	    this.body = body;

	    return;		  			
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};







exports.NotificationUserPostHandler = NotificationUserPostHandler;
exports.NotificationCountPostHandler = NotificationCountPostHandler;





