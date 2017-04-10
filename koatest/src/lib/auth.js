const bluebird = require('bluebird');
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-auth').Strategy;

const utils = require('./utils');
const DB = require('./db');
const auth_helpers = require('./auth_helpers');
const cache = require('./cache_handler');
const logger = require('./logger');
const redis = require('./redisclient');
const settings = require('./settings');



const log = logger.log;

const CONFIG = settings.CONFIG_DATA;
const AVATARS = settings.AVATARS;

const authOpts = {};



class Auth {
	
	constructor(options) {
		log.debug('auth constructor called');
		this.options = options || authOpts || {};
		this.db = new DB('koatest', 'koatestuser', 'koatestpass', 'Users');
		this.Users = this.db.collection;

	}



	get passport() {
		return passport;
	}



	// get db() {
	// 	return this.db;
	// }



	// get Users() {
	// 	return this.Users;
	// }




	init() {
		let initGenerator = function *(ctx) {

			let result = true;
			
			try {
				let isDb = yield ctx.connect_DB();
				log.debug('db connection yielded : ', isDb);
				
				log.debug('creating unique indexes on collection Users, fields=[username, userid, email] now');
				let indexes = yield ctx.db.create_index(ctx.Users, true, 'username', 'userid', 'email');
				log.debug('Users indexes : ', indexes);

				log.debug('creating unique indexes on collection Activities, fields=[activity_id, source_id] now');
				let Activities = ctx.db.get_collection('Activities');
				let indexes_2 = yield ctx.db.create_index(Activities, true, 'activity_id', 'source_id');
				log.debug('Activities indexes : ', indexes_2);

				log.debug('creating unique indexes on collection Relatiosnhip, fields=[follower_id, following_id] now');
				let Relatiosnhips = ctx.db.get_collection('Relatiosnhips');
				let indexes_3 = yield ctx.db.create_index(Relatiosnhips, true, 'follower_id', 'following_id');
				log.debug('Relatiosnhips indexes : ', indexes_3);

				log.debug('creating unique indexes on collection Posts, fields=[post_id, source_id] now');
				let Posts = ctx.db.get_collection('Posts');
				let indexes_4 = yield ctx.db.create_index(Posts, true, 'post_id', 'source_id');
				log.debug('Posts indexes : ', indexes_4);


				log.debug('creating unique indexes on collection Likes, fields=[like_item_id] now');
				let Likes = ctx.db.get_collection('Likes');
				let indexes_5 = yield ctx.db.create_index(Likes, true, 'like_item_id');
				log.debug('indexes : ', indexes_5);


				log.debug('creating unique indexes on collection Shares, fields=[share_item_id] now');
				let Shares = ctx.db.get_collection('Shares');
				let indexes_6 = yield ctx.db.create_index(Shares, true, 'share_item_id');
				log.debug('Shares indexes : ', indexes_6);


				log.debug('creating unique indexes on collection Comments, fields=[comment_origin_id] now');
				let Comments = ctx.db.get_collection('Comments');
				let indexes_7 = yield ctx.db.create_index(Comments, true, 'comment_origin_id');
				log.debug('Comments indexes : ', indexes_7);


				log.debug('creating unique indexes on collection Hashtags, fields=[content] now');
				let Hashtags = ctx.db.get_collection('Hashtags');
				let indexes_8 = yield ctx.db.create_index(Hashtags, true, 'content');
				log.debug('Hashtags indexes : ', indexes_8);
				
				let serialization = yield ctx.serialize_user_session();
				log.debug('serialzation  yielded : ', serialization);
				
				let deserialization = yield ctx.deserialize_user_session();
				log.debug('Deserialzation  yielded : ', deserialization);
				
				let local_auth_options = {
					usernameField: 'uname',
		    		passwordField: 'pwd'
				};
				let local_auth = yield ctx.local_auth(local_auth_options);
				log.debug('local_auth  yielded : ', local_auth);

				// this.facebook_auth(options);
				// this.google_auth(options);
				
				if (!isDb || !indexes || !indexes_2 || !indexes_3 || !serialization || !deserialization || !local_auth) {
					result = false;
				}
				
			}
			catch (err) {
				log.error('Error in initializing auth : ', err);
				result = false;
			}
			

			return new bluebird(function(resolve, reject) {
				resolve(result);
			}); 
						
		};

		let initCoroutine = bluebird.coroutine(initGenerator);

		// run the coroutine now;
		return initCoroutine(this);
	}






	
	connect_DB() {
		let dbConnectGenerator = function *(ctx) {
			log.debug('db : ', ctx.db);
			
			let result = true;
			
			if (!ctx.db.connected) {

				try {
					// connect only when db is already not connected
					let db = yield ctx.db.connect();			
					log.info('db connected now ');
				}
				catch (err) {
					log.error('Error in connecting to database : ', err);
					result = false;
				}
			}
			
			return new bluebird(function(resolve, reject) {
				resolve(result);
			});
		};

		let dbConnectCoroutine = bluebird.coroutine(dbConnectGenerator);

		// run the coroutine now;
		return dbConnectCoroutine(this);
	}



	



	disconnect_DB() {
		let dbDisconnectGenerator = function *(ctx) {
			let db = yield ctx.db.disconnect();
			log.info('db disconnected now');

			return new bluebird(function(resolve, reject) {
				resolve(true);
			});
		};

		let dbDisconnectCoroutine = bluebird.coroutine(dbDisconnectGenerator);

		// run the coroutine now;
		return dbDisconnectCoroutine(this);
	}





	register_user(name, email, username, password, gender) {

		let registerHandlerGenerator = function *(ctx, name, email, username, password, gender) {
			log.debug('registerHanlderGenerator called ');
			log.debug('password : ', password);
			log.debug('gender : ', gender);
			
			let names = ctx.get_names(name);
			log.debug('names : ', names);

			let hash = yield auth_helpers.createPassword(password);
			log.debug('hash sent by createpaswoerd : ', hash);

			let dp_thumbnail = yield ctx.get_dp_thumbnail(gender);
			log.debug('dp_thumbnail : ', dp_thumbnail);

			log.debug('ctx.Users : ', ctx.Users);

			let userid = utils.genid(32);

			let user = new ctx.Users({
				name: names,
				username: username,
				email: email,
				userid: userid,
				password_hash: hash,
				gender: gender,
				dp_thumbnail: dp_thumbnail,
				followers: {
					count: 0
				},
				following: {
					count: 0
				},
				bio: 'I am new here, and I am yet to surprise you with my bio, may be next time!'
			});

			let save = yield user.save();	

			// Add online status of user for the first time to redis
			let onlinestatus = yield cache.addUserOnlineStatus(user.get(), false, 'new');	
			log.debug('First online status added to redis : ', onlinestatus);

			return new bluebird(function(resolve, reject) {
				resolve(true);
			});
		};


		let registerHandlerCoroutine = bluebird.coroutine(registerHandlerGenerator);
		
		// run the coroutine
		return registerHandlerCoroutine(this, name, email, username, password, gender);
	
	}





	get_names(name) {
		let names = name.split(/\s+/g);
		
		let middlename, lastname, filteredname;

		let firstname = names[0];

		filteredname = firstname;
		
		if (names.length > 2) {
			middlename = names[1];
			filteredname = filteredname + ' ' + middlename;
		}
		else {
			middlename = '';
		}

		if (names.length > 1) {
			lastname = names[names.length -1];
			filteredname = filteredname + ' ' + lastname;
		}
		else {
			lastname = '';
		}


		
		return {
			fullname: name,
			firstname: firstname,
			middlename: middlename,
			lastname: lastname,
			filteredname: filteredname
		};

	}





	get_dp_thumbnail(gender) {
		
		let getThumbnailGenerator = function *(ctx, gender) {
			log.debug('inside get_dp_thumbnail -> generator function');
			log.debug('gender : ', gender);

			let thumb_count, total_dp_thumb_count, filename, index;

			try {
				log.debug('redis get Asunc called');
				
				log.debug('redis incr command called');
				let thumb_count = yield redis.incrAsync('koatest:dp_thumbnail:count');
				log.debug('redis incr command successful');
				log.debug('thumb count : ', thumb_count);

				if (gender === 'male') {
					total_dp_thumb_count = CONFIG.images.avatars.thumbnail.count.male;
					index = thumb_count % parseInt(total_dp_thumb_count);
					log.debug('index : ', index);

					filename = CONFIG.images.avatars.thumbnail.path + AVATARS[gender][index];
				}
				else if (gender === 'female') {
					total_dp_thumb_count = CONFIG.images.avatars.thumbnail.count.female;
					index = thumb_count % parseInt(total_dp_thumb_count);
					log.debug('index : ', index);

					filename = CONFIG.images.avatars.thumbnail.path + AVATARS[gender][index];
				}
				else {
					filename = CONFIG.images.avatars.thumbnail.path + CONFIG.images.avatars.thumbnail.other.name;
				}

			}
			catch (err){
				log.error('Error: ', err);
				filename = CONFIG.images.avatars.thumbnail.path + CONFIG.images.avatars.thumbnail.other.name;
			}
						
			log.debug('filename : ', filename);

			return new bluebird(function(resolve, reject) {
				resolve(filename);
			});
		};
	
		let getThumbnailCoroutine = bluebird.coroutine(getThumbnailGenerator);
		
		// run the coroutine
		return getThumbnailCoroutine(this, gender);

	}






	serialize_user_session() {
		
		let result = true;
		
		try {
			passport.serializeUser(function (user, done) {
				log.debug('serializeUser called');
				log.debug('user : ', user);

			    done(null, user.userid);
			});
		}
		catch (err) {
			log.error('Error in serializeing user : ', err);
			result = false;
		}

		return new bluebird(function(resolve, reject) {
			resolve(result);
		});
	}






	deserialize_user_session() {
		let ctx = this;
		let result = true;
		
		try {
			passport.deserializeUser(function (id, done) {
				log.debug('DeserializeUser called');
				log.debug(`id : ${id}`);
				
				let deserializeGenerator = function *(ctx, id, done) {
					try {
						let user = yield ctx.db.getUserById(id);

						log.debug('user : ', user);
						// user = user.get();

				    	return done(null, user);
					}
					catch(err) {
						log.error('Error : ', err);
						return done(err, null); 
					}
				};

				let deserializeCoroutine = bluebird.coroutine(deserializeGenerator);

				// call the coroutine now
				return deserializeCoroutine(ctx, id, done);
			});
		}
		catch (err) {
			log.error('Error in deserializeing user : ', err);
			result = false;
		}

		return new bluebird(function(resolve, reject) {
			resolve(result);
		});
	}

 






	local_auth(options) {
		options = options || this.options;
		
		let ctx = this;
		let result = true;

		try {
			passport.use(new LocalStrategy(options, function (username, password, done) {
				
				log.debug('calling the local Strategy ');
				log.debug(`username : ${username} | password : ${password}`);

				let dbQueryGenerator = function *(ctx, username, password, done) {
					try {
						// check to see if the username exists
						let user;

						// try to get user by email
						
						// user = yield ctx.Users.where('email').equals(username).findOne(); 
						user = yield ctx.db.getUserByEmail(username);
						
						// log.debug('user : ', user);				
						
						if (!user) {
							// try to get user by username
							
							// user = yield ctx.Users.where('username').equals(username).findOne(); 
							user = yield ctx.db.getUserByUsername(username);
							
							// log.debug('user : ', user);
						}
				  
					  	if (!user) {
					  		log.debug('!user passsed');
					  		return done(null, false);
					    }
					    else {
						    // user = user.get();

							log.debug('user : ', user);
						}

					    let comparePass = yield auth_helpers.comparePass(password, user.password_hash);

					    if (!comparePass) {
					    	log.debug('!comparePass passsed');
					    	return done(null, false);
					    }
					    else {
					    	log.debug('user passsed');
					    	return done(null, user);
					    }
					}
				  	catch(err) { 
				  		log.error('Error : ', err);
				  		return done(err); 
				  	}
				};

				let dbQueryCoroutine = bluebird.coroutine(dbQueryGenerator);

				// run the coroutine now;
				return dbQueryCoroutine(ctx, username, password, done);
			
			}));
		}
		catch (err) {
			log.error('Error in passport.user LocalStrategy : ', err);
			result = false;
		}

		return new bluebird(function(resolve, reject) {
			resolve(result);
		});
	}








	authenticate(ctx) {
		
		let authenticate_Generator = function *(ctx) {
			yield passport.authenticate('local', function *(err, user, info) {
		  		ctx.log.debug('callback for local athentcaiton called');
		  		ctx.log.debug('err : ', err);
		  		ctx.log.debug('user : ', user);
		  		ctx.log.debug('info : ', info);

			    if (err) {
			    	// throw err;
			    	ctx.log.error('Error: ', err);

					let body = {
				    	status: 500,
				     	success: false,
				     	message: 'Oops! Something is not right, Please come back later or try again!'
				    };

				    body = JSON.stringify(body);

					this.status = 200;
				    this.body = body;

				    return;

			    }
			    else if (!user) {
			    	let body = {
			     		status: 401,
			     	 	success: false,
			     	 	message: 'Username or Password Invalid'
			     	};
			    	
			    	body = JSON.stringify(body);
			    	
			    	ctx.status = 200;
			     	ctx.body = body;
			      	
			      	return;
			    }
			    else if (user) {
			      	yield ctx.logIn(user);
			      	
			      	// Add session info
			      	sess.info = sess.info || {};
			      	sess.info.isValid = true;
			      	sess.info.name = user.name;
			      	sess.info.username = user.username;
			      	sess.info.userid = user.userid;
			      	sess.info.gender = user.gender;
			      	sess.info.email = user.email;
			      	sess.info.dp_thumbnail = user.dp_thumbnail;
			      	sess.info.bio = user.bio;
			      	sess.info.followers = user.followers;
			      	sess.info.following = user.following;

			      	// Add data to cache in redis
					let usercache = yield cache.addUserInfoCache(user);
					log.debug('usercache added : ', usercache);

					let body = {
			     		status: 200,
			     	 	success: true,
			     	 	message: '/'
			     	};

			     	body = JSON.stringify(body);

			      	ctx.status = 200;
			     	ctx.body = body;

			     	return;
			    }
		  	})
		  	.call(ctx, next);

		};

		let authenticate_Coroutine = bluebird.coroutine(authenticate_Generator);

		// run the coroutine
		authenticate_Coroutine(ctx);
	
	}



	// facebook_auth(options) {
	// 	options = options || this.options;

	// 	passport.use(new FacebookStrategy({
	// 	    	clientID: 'your-client-id',
	// 	    	clientSecret: 'your-secret',
	// 	    	callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
	// 		},
	// 	  	function *(token, tokenSecret, profile, done) {
	// 	  		try {
	// 	    		// retrieve user
	// 	    		let user = yield this.Users.where('google_id').equals(profile.id).find();

	// 	    		done(null, user);
	// 	    	}
	// 	    	catch(err) {
	// 	    		done(err);
	// 	    	}
	// 	  	}
	// 	));
	// }



	// google_auth(options) {
	// 	options = options || this.options;

	// 	passport.use(new GoogleStrategy({
	// 	    	clientId: 'your-client-id',
	// 	    	clientSecret: 'your-secret',
	// 	    	callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback'
	// 	  	},
	// 	  	function(token, tokenSecret, profile, done) {
	// 	  		try {
	// 	  			// retrieve user
	// 	    		let user = yield this.Users.where('google_id').equals(profile.id).find();

	// 	    		done(null, user);
	// 	    	}
	// 	    	catch(err) {
	// 	    		done(err);
	// 	    	}
	// 	  	}
	// 	));
	// }







}







module.exports = Auth;






