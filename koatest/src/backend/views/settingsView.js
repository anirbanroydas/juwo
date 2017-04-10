const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const auth_helpers = require('../../lib/auth_helpers');
const DB = require('../../lib/db');
const redis = require('../../lib/redisclient');
const csrf_handler = require('../../lib/csrf_handler');
const cache = require('../../lib/cache_handler');
const validator = require('../../lib/validate_data_helpers');
const error = require('../../lib/error_handler');


const log = logger.log;
const db = new DB();


// Handler/Controller to handle route GET requests to Profile Settings page
const ProfileSettingsGetHandler = function *(next) {
    this.log.debug('Inside Profile Settings Get Handler'); 

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
  		// Render Profile Settings page
  		this.time('render_profile_settings_page');

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
  		
	  		sess.secret = csrf_handler.tokens.secretSync();

	      	let csrf = this.csrf;
	  		  		
	  			
			let user_info = {
	      		name: sess.info.name,
	      		username: sess.info.username,
	      		userid: sess.info.userid,
				email: sess.info.email,
				gender: sess.info.gender,
				dp_thumbnail: sess.info.dp_thumbnail,
				bio: sess.info.bio,
				csrf: csrf,
				token: token,
				notification_count: notification_count
	      	};

	      	utils.debug_csrf(this, csrf); 	
	  		
		  	this.set('X-Request-Id', this.reqId);
		  	this.render_marko('profile_settings', user_info);		  	
		  	this.timeEnd('render_profile_settings_page');		  	
		  	
		  	this.log.debug('profile_settings page rendered');

		  	sess.stats.chat_count++;
  			
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};









// Handler/Controller to handle route POST requests to profile settings page
const ProfileSettingsPostHandler = function *(next) {
    this.log.debug('Inside Profile Settings Post Handler'); 

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
  		// Update user profile info

  		try {
	  		let data = this.request.body;

	  		// trim all inputs first
			utils.trim_form_inputs(data);
	  		this.log.debug('body : ', data);

	  		// first validate data
	  		let isValid = yield validator.validate_profile_settings(this);

	  		if (!isValid.status) {
				// throw new Error('Invalid form inputs');
				// error.badRequest(this, 'regsitration credentials not of correct form');
				this.log.error('Invalid Profile Credentials Format');

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

			this.log.debug('valid profile credentials update inputs');

			// first update uesr in db
			if (!db.connected) {
				// db not connected yet to this databse, hence first connect
				let db_instance = yield db.connect();
			}

			let user = db.getUserInstanceById(data.userid);

			if (!user) {
				this.log.error('Error: User Does not exist');

				let body = {
			    	status: 404,
			     	success: false,
			     	message: 'Something is wrong, try again later'
			    };

			    body = JSON.stringify(body);

				this.status = 200;
			    this.body = body; 

			    return;
			}
			else {
				// update the new info
				let old_userinfo = {
					name: sess.info.name,
					username: sess.info.username,
					email: sess.info.email,
					gender: sess.info.gender,
					bio: sess.info.bio
				}
				
				let new_user_info = {
		      		name: data.name,
		      		username: data.uname,
					email: data.email,
					gender: data.gender,
					bio: data.bio
		      	};

				
				user.set(new_user_info);

				// save the updates
				let save = yield user.save();;

				if (!save) {
					this.log.error('Error: Unagle to save user instance to dabase');

					let body = {
				    	status: 404,
				     	success: false,
				     	message: 'Something is wrong, try again later'
				    };

				    body = JSON.stringify(body);

					this.status = 200;
				    this.body = body; 

				    return;
				}
				else {
					user = user.get();
					
					// update session info
			      	sess.info.name = user.name;
			      	sess.info.username = user.username;
			      	sess.info.gender = user.gender;
			      	sess.info.email = user.email;
			      	sess.info.dp_thumbnail = user.dp_thumbnail;
			      	sess.info.bio = user.bio;

			      	// send the success info back
			      	let body = {
						status: 200,
						message: 'updated',
						data: {
							name: user.name,
							gender: user.gender,
							email: user.email,
							username: user.username,
							dp_thumbnail: user.dp_thumbnail,
							bio: user.bio
						}
					};

					body = JSON.stringify(body);

					this.status = 200;
					this.body = body;


					// add the new userinfo in cache
					let updatedUserCache = yield cache.updateUserInfoCache(user, old_userinfo.username);
					this.log.debug('user cache updated : ', updatedUserCache);
					

					// now since user updated profile, create new activity
					let activity = yield activity.create('profile_updated', user.userid, old_userinfo, new_user_info);
				}

			}			
		
		}
		catch (err) {
			this.log.error('Error: ', err);

			let body = {
		    	status: 500,
		     	success: false,
		     	message: 'Something is wrong, try again later'
		    };

		    body = JSON.stringify(body);

			this.status = 200;
		    this.body = body; 

		    return;
		}

  		
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};








exports.ProfileSettingsGetHandler = ProfileSettingsGetHandler;
exports.ProfileSettingsPostHandler = ProfileSettingsPostHandler;



