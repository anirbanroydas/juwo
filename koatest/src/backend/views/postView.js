const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
// const DB = require('../../lib/db');
// const redis = require('../../lib/redisclient');
// const csrf_handler = require('../../lib/csrf_handler');
const post = require('../../lib/post_handler');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');


const log = logger.log;





// Handler/Controller to handle rpost oute requests to Post  CreateApi
const PostCreatePostHandler = function *(next) {
    this.log.debug('Inside Post Create Handler'); 

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
      	let isValid = validator.isValidPostCreateRequestData(this);

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

		// create the post
		let hasCreated = yield post.create(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasCreated) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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










// Handler/Controller to handle rpost oute requests to Post Delete Api
const PostDeletePostHandler = function *(next) {
    this.log.debug('Inside Post Delelte Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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

		// delete the post
		let hasDeleted = yield post.delete(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasDeleted) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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












// Handler/Controller to handle route requests to Post Like Api
const PostLikePostHandler = function *(next) {
    this.log.debug('Inside Post Like Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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
		let hasLiked = yield post.like(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasLiked) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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








// Handler/Controller to handle route requests to Unlike Api
const PostUnlikePostHandler = function *(next) {
    this.log.debug('Inside Unlike Post Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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
		let hasUnliked = yield post.unlike(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasUnliked) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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







// Handler/Controller to handle route requests to Share Api
const PostSharePostHandler = function *(next) {
    this.log.debug('Inside Share Post Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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
		let hasShared = yield post.share(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasShared) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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






const PostCommentAddPostHandler = function *(next) {
    this.log.debug('Inside Comment Post Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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
		let hasCommentAdded = yield post.comment_add(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasCommentAdded) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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













const PostCommentRemovePostHandler = function *(next) {
    this.log.debug('Inside Comment Post Handler'); 

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
      	let isValid = validator.isValidActivityRequestData(this);

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
		let hasCommentRemoved = yield post.comment_remove(this.request.body.userid, this.request.body.post);

		let body;
		
		if (!hasCommentRemoved) {
			body = {
		    	status: 500,
		     	success: false
		    };
		}
		else {
			body = {
		    	status: 200,
		     	success: true
		    };
		}
		

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










exports.PostCreatePostHandler = PostCreatePostHandler;
exports.PostDeletePostHandler = PostDeletePostHandler;
exports.PostLikePostHandler = PostLikePostHandler;
exports.PostUnlikePostHandler = PostUnlikePostHandler;
exports.PostSharePostHandler = PostSharePostHandler;
exports.PostCommentAddPostHandler = PostCommentAddPostHandler;
exports.PostCommentRemovePostHandler = PostCommentRemovePostHandler;


