const bluebird = require('bluebird');

const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const error = require('../../lib/error_handler');




const log = logger.log;






// Handler/Controller to handle route GET requests to Error page
const ErrorGetHandler = function *(next) { 
	this.log.debug('Inside Error Get Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){

		this.log.debug('this.url : ', this.url);

		if (this.url === '/error' || this.url === '/error/') {
			// something is wrong
			errorhandler = true;
			let error_code;

			if (this.request.query) {
				this.log.debug('query : ', this.request.query);
			}

			if (this.request.query && this.request.query.server === 'true' || typeof this.request.query.server === 'boolean') {
				error_code = 500;
			}
			else {
				error_code = 404;
			}

			error.activate_error_middleware(this, error_code);		
		}
		else if (this.url === '/404' || this.url === '/404/') {
			// something is wrong
			errorhandler = true;

			error.activate_error_middleware(this, 404);	
		}

	  	// delete session since session to be there/persist for authenticated users
	  	// this.session = null;	
	  	sess.info = null;
  	}
  	else {
  		// something is wrong
		errorhandler = true;

		error.activate_error_middleware(this, 404);	
  	}


  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;

};








exports.ErrorGetHandler = ErrorGetHandler;






