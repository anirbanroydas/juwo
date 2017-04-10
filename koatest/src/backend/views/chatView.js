const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const auth_helpers = require('../../lib/auth_helpers');
const cache = require('../../lib/cache_handler');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');



const log = logger.log;



// Handler/Controller to handle route GET requests to chat page
const ChatGetHandler = function *(next) {
    this.log.debug('Inside Chat Get Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);

  	if (!this.state.isAuthenticated){
  		// Redirect to login page
  		this.log.info('Redirecting to login page');
  		
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;
  		sess.info = null;

  		this.redirect('/login');	
  	}
  	else {
  		// Render Chat page accordingly
  		this.time('render_chat_page');
  		
  		// generate the token
  		let token = yield auth_helpers.genSocketioToken(sess.info.userid);
  		
  		if (!token) {
  			// make errorhandle true, so that status doesn't change and errohandler middleware is triggered
  			errorhandler = true;

  			error.activate_error_middleware(this, 500);
  		}
  		else {

  			// find notification count
  			let notification_count = yield cache.get_notification_count(sess.info.userid);

	  		// Render home page
	  		let user_info = {
	      		name: sess.info.name,
	      		username: sess.info.username,
	      		userid: sess.info.userid,
	      		dp_thumbnail: sess.info.dp_thumbnail,
	      		token: token,
	      		notification_count: notification_count
	      	};

	      	this.log.debug('this.url : ', this.url);

	  		if (this.url.search('/chat/irc') !== -1) {
	  			let channel = this.params.channel;
	  			
	  			let isValid = validator.validate_channel(channel);

	  			if (!isValid.status) {
	  				// make errorhandle true, so that status doesn't change and errohandler middleware is triggered
		  			errorhandler = true;

		  			error.activate_error_middleware(this, 422);
	  			
	  			}
	  			else {
	  				user_info.channel = channel;
	  			}		  		
	  		}
	  		
	  		if (!errorhandler) {

		  		

		  		utils.debug_sess(this, sess);

			  	this.set('X-Request-Id', this.reqId);
			  	this.render_marko('chat', user_info);			  	
			  	this.timeEnd('render_chat_page');
			  	
			  	this.log.debug('chat page rendered');

			  	sess.stats.chat_count++;
	  	
	  		}
	  	}

  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};





// Handler/Controller to handle route POST requests to chat page
const ChatPostHandler = function *(next) {
    this.log.debug('Inside Chat Post Handler'); 

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
  		// Render home page
  		let chatType = this.request.body.chat;
  		this.log.debug('chatType : ', chatType);

  		if (!!chatType) {
  			this.log.debug('sending redirect request to ajax request');
  			
  			let body = {
  				status: 301,
  				success: false,
  				message: '/chat'
  			};

			body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;
  		}

  		else {

	      	this.log.debug('sending redirect requet to ajax request');
  			
  			let body = {
  				status: 301,
  				success: false,
  				message: '/'
  			};

			body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;
		}

		return;
  	}


  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};




exports.ChatGetHandler = ChatGetHandler;
exports.ChatPostHandler = ChatPostHandler;

