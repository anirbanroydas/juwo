const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const csrf_handler = require('../../lib/csrf_handler');
const auth_helpers = require('../../lib/auth_helpers');
const cache = require('../../lib/cache_handler');
const error = require('../../lib/error_handler');



const log = logger.log;



// Handler/Controller to handle route requests to index page
const IndexGetHandler = function *(next) { 
    this.log.debug('Inside Index Get Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){
  		// Render plain index page
  		this.time('render_index_page');

  		sess.secret = csrf_handler.tokens.secretSync();
  		
  		let csrf = this.csrf;

  		utils.debug_csrf(this, csrf); 		
  		utils.debug_sess(this, sess);
	  	
	  	this.set('X-Request-Id', this.reqId);	  	
	  	this.render_marko('index', {csrf: csrf});	  	
	  	this.timeEnd('render_index_page');
	  	
	  	this.log.debug('index page rendered');

	  	// delete session since session to be there/persist for authenticated users
	  	// this.session = null;	
	  	sess.info = null;

	  	utils.debug_sess(this, sess);
  	
  	}
  	else {

  		this.time('render_home_page');

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
	  		
	  		
	  		this.set('X-Request-Id', this.reqId);
		  	this.render_marko('home', user_info);		  	
		  	this.timeEnd('render_home_page');
		  	
		  	this.log.debug('home page rendered');

		  	sess.stats.home_count++;
		}
  	
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;

};







exports.IndexGetHandler = IndexGetHandler;



