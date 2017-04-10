const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
// const DB = require('../../lib/db');
// const redis = require('../../lib/redisclient');
// const csrf_handler = require('../../lib/csrf_handler');
const relationship = require('../../lib/relationship_handler');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');


const log = logger.log;





// Handler/Controller to handle route POST requests to Follow Api
const FollowPostHandler = function *(next) {
    this.log.debug('Inside Follow Post Handler'); 

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
      	let isValid = validator.isValidRelationshipRequestData(this);

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
		let data = yield relationship.follow(this.request.body.source_id, this.request.body.relationship_id);

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








// Handler/Controller to handle route POST requests to Unfollow Api
const UnfollowPostHandler = function *(next) {
    this.log.debug('Inside Unfollow Post Handler'); 

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
      	let isValid = validator.isValidRelationshipRequestData(this);

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
		let data = yield relationship.unfollow(this.request.body.source_id, this.request.body.relationship_id);

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








// Handler/Controller to handle route POST requests to GetFollowing User Api
const GetUserFollowingPostHandler = function *(next) {
    this.log.debug('Inside Get User following Post Handler'); 

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
      	let isValid = validator.isValidFollowApisRequestData(this);

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
		let data = yield relationship.getFollowingList(this.request.body.source_id, this.request.body.cursor, this.request.body.count);

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









// Handler/Controller to handle route POST requests to GetFollowers User Api
const GetUserFollowersPostHandler = function *(next) {
    this.log.debug('Inside Get User followers Post Handler'); 

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
      	let isValid = validator.isValidFollowApisRequestData(this);

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
		let data = yield relationship.getFollowersList(this.request.body.source_id, this.request.body.cursor, this.request.body.count);

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







exports.FollowPostHandler = FollowPostHandler;
exports.UnfollowPostHandler = UnfollowPostHandler;
exports.GetUserFollowingPostHandler = GetUserFollowingPostHandler;
exports.GetUserFollowersPostHandler = GetUserFollowersPostHandler;


