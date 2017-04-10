const bluebird = require('bluebird');
const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const Auth = require('../../lib/auth');
const csrf_handler = require('../../lib/csrf_handler');
// const socketio_auth = require('../../lib/socketio_auth');
const redis = require('../../lib/redisClient');
// const auth_helpers = require('../../lib/auth_helpers');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');




const log = logger.log;


// Add auth middleware
const auth = new Auth();


let auth_Generator = function *(auth) {
	

	let isAuthInit = yield auth.init();
	
	if (!isAuthInit) {
		log.error('auth not initiated properly');
		log.info('exiting program...');
		process.exit(1);
	}
};

let auth_Coroutine = bluebird.coroutine(auth_Generator);

// run the coroutine
auth_Coroutine(auth);

const passport = auth.passport;









// Handler/Controller to handle route requests to login page
const LoginGetHandler = function *(next) { 
	this.log.debug('Inside Login Get Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){
  		// Render login page
  		this.time('render_login_page');

  		sess.secret = csrf_handler.tokens.secretSync();

  		let csrf = this.csrf;

		let query = this.request.query;

		this.log.debug('querystring : ', this.request.querystring);
		this.log.debug('query : ', query);

		let login_info;

		if (!!this.request.querystring) {
			let errorObj = {
				error: query.error,
				uname: query.uname_error,
				pwd: query.pwd_error,
				server: query.server
			};

			login_info = {
	  			csrf: csrf,
	  			error: errorObj
	  		};
		}
		else {
			login_info = {
	  			csrf: csrf,
	  			error: false
	  		};
		}

		this.log.debug('login_info : ', login_info);

  		utils.debug_csrf(this, csrf); 
  		utils.debug_sess(this, sess);

	  	this.set('X-Request-Id', this.reqId);
	  	this.render_marko('login', login_info);	  	
	  	this.timeEnd('render_login_page');
	  	
	  	this.log.debug('login page rendered');

	  	// delete session since session to be there/persist for authenticated users
	  	// this.session = null;	
	  	sess.info = null;

	  	utils.debug_csrf(this, csrf); 
  		utils.debug_sess(this, sess);
  	}
  	else {
  		// Redirect to home page since already registered
  		this.redirect('/');
  	}


  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;

};









// Handler/Controller to handle route requests to login page
const LoginPostHandler = function *(next) { 
	this.log.debug('Inside login post Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){
  		// validate username and password
  		
  		// trim all inputs first
		utils.trim_form_inputs(this.request.body);
  		this.log.debug('body : ', this.request.body);
  		
		let isValid = validator.validate_login(this);

		if (!isValid.status) {
			// throw new Error('Invalid form inputs');
			// error.badRequest(this, 'login credentials not of correct form');
			// this.throw(400, 'login credentials not of correct form');
			this.log.error('Invalid Credentials Format');
			
			if (this.request.query.source && this.request.query.source === 'index') {
				// this.redirect('/login?error=Invalid+Credentials+Format');
				let uname_error = false;
				let pwd_error = false;

				for (let msg of isValid.message) {
					if (msg === 'uname') {
						uname_error = true;
					}
					else if (msg === 'pwd') {
						pwd_error = true;
					}
				}
				let errorMsg = '/login?error=false&server=false&uname_error=' + uname_error.toString() + '&pwd_error=' + pwd_error.toString();
				
				let body = {
			    	status: 302,
			     	success: false,
			     	message: errorMsg	     	 
			    };

			    body = JSON.stringify(body);

				this.status = 200;
			    this.body = body;

			}
			else {

				let body = {
			    	status: 400,
			     	success: false,
			     	message: isValid.message	     	 
			    };

			    body = JSON.stringify(body);

				this.status = 200;
			    this.body = body;
			}

		    return;
		}
		
		this.log.debug('valid form inputs');
	  	
	  	// authenticate user now by calling passports authenticate method
	  	auth.authenticate(this);

	  	return;  	
  	}
  	else {
  		// Redirect to home page since already registered
  		let body = {
	    	status: 200,
	     	success: true,
	     	message: '/'
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









// Handler/Controller to handle route requests to logout page
const LogoutPostHandler = function *(next) { 
	this.log.debug('Inside logout post Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;	
  		sess.info = null;
  		
  		// send logout success message
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
  		this.log.debug('logout user now');

  		let userid = sess.info.userid;

  		// Logout User			
  		this.logout();

  		utils.debug_sess(this, sess);

  		sess.info = null;

  		utils.debug_sess(this, sess);

  		// delete the this.state info and release the memory
  		this.state = null;

  		// delete session since session to be there/persist for authenticated users
	  	this.session = null;

	  	utils.debug_sess(this, sess);

  		// close all socketio connections
  		// once redirect message '/' is sent to client, all the current socketio 
  		// connections will be closed automatically, which will in effect
  		// close all the rabbitmq connections associated with it

  		// send logout success message
  		let body = {
	    	status: 200,
	     	success: true,
	     	message: '/'
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










// Handler/Controller to handle route requests to signpu page
const SignupGetHandler = function *(next) { 
	this.log.debug('Inside Signup Get Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated){
  		// Render login page
  		this.time('render_signup_page');

  		sess.secret = csrf_handler.tokens.secretSync();
  		
  		let csrf = this.csrf;
  		
  		utils.debug_csrf(this, csrf); 
  		utils.debug_sess(this, sess);
	  	
	  	this.set('X-Request-Id', this.reqId);
	  	this.render_marko('signup', {csrf: csrf});	  	
	  	this.timeEnd('render_signup_page');
	  	
	  	this.log.debug('signup page rendered');


	  	// delete session since session to be there/persist for authenticated users
	  	// this.session = null;	
	  	sess.info = null;

	  	utils.debug_csrf(this, csrf); 
  		utils.debug_sess(this, sess);
  	}
  	else {
  		// Redirect to home page since already registered
  		this.redirect('/');
  	}


  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};









// Handler/Controller to handle route requests to signup page
const SignupPostHandler = function *(next) { 
	this.log.debug('Inside signup post Handler'); 

	let sess = this.session;
	let errorhandler = false;

  	utils.debug_log_req(this, sess);
  	
  	if (!this.state.isAuthenticated) {
  		// validate username and password
		
		// trim all inputs first
		utils.trim_form_inputs(this.request.body);
  		this.log.debug('body : ', this.request.body);

		let isValid = yield validator.validate_signup(this);

		if (!isValid.status) {
			// throw new Error('Invalid form inputs');
			// error.badRequest(this, 'regsitration credentials not of correct form');
			this.log.error('Invalid Credentials Format');

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

		this.log.debug('valid form inputs');

		let registration = yield auth.register_user(this.request.body.name, this.request.body.email, this.request.body.uname, this.request.body.pwd, this.request.body.gender);

		this.log.debug('regsitration completed : registartion : ', registration);

	  	// authenticate user now by calling passports authenticate method
	  	auth.authenticate(this);

	  	return;	
  	}
  	else {
  		// Redirect to home page since already registered
  		let body = {
	    	status: 200,
	     	success: true,
	     	message: '/'
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










exports.LoginGetHandler = LoginGetHandler;
exports.LoginPostHandler = LoginPostHandler;
exports.LogoutPostHandler = LogoutPostHandler;
exports.SignupGetHandler = SignupGetHandler;
exports.SignupPostHandler = SignupPostHandler;



