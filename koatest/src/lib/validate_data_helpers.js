const bluebird = require('bluebird');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
// const utils = require('./utils');
// const redis = require('./redisclient');
const DB = require('./db');

const log = logger.log;


const db = new DB();


class Validator {
	
	
	static isValidBaseRequestData(self) {
		
		let isValidUserid = Validator.isValidUserid(self.request.body.userid);
		let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.userid);
		let isValidCursor = Validator.isValidCursor(self.request.body.cursor);
		let isValidCount = Validator.isValidCount(self.request.body.count);

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidSelfUserid.status && isValidCursor.status && isValidCount.status) {
			status = true;
			message = 'Valid Base Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidSelfUserid.status) {
				messages.push(isValidSelfUserid.message);
			}

			if (!isValidCursor.status) {
				messages.push(isValidCursor.message);
			}

			if (!isValidCount.status) {
				messages.push(isValidCount.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}




	static isValidFeedHomeRequestData(self) {
		
		let isValidBaseRequestData = Validator.isValidBaseRequestData(self);

		let status = true;
		let message = 'Valid Feed Home Request Data';
		
		if (!isValidBaseRequestData.status) {

			status = false;
			message = isValidBaseRequestData.message;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}







	static isValidTimelineUserRequestData(self) {
		
		let isValidBaseRequestData = Validator.isValidBaseRequestData(self);

		let status = true;
		let message = 'Valid Activity User Request Data';
		
		if (!isValidBaseRequestData.status) {

			status = false;
			message = isValidBaseRequestData.message;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}






	static isValidNotificationUserRequestData(self) {
		
		let isValidBaseRequestData = Validator.isValidBaseRequestData(self);

		let status = true;
		let message = 'Valid Feed Home Request Data';
		
		if (!isValidBaseRequestData.status) {

			status = false;
			message = isValidBaseRequestData.message;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}







	static isValidNotificationCountRequestData(self) {
		
		let isValidUserid = Validator.isValidUserid(self.request.body.userid);
		let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.userid);

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidSelfUserid.status) {
			status = true;
			message = 'Valid Base Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidSelfUserid.status) {
				messages.push(isValidSelfUserid.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}





	static isValidLivestreamUserRequestData(self) {
		
		let isValidBaseRequestData = Validator.isValidBaseRequestData(self);

		let status = true;
		let message = 'Valid Feed Home Request Data';
		
		if (!isValidBaseRequestData.status) {

			status = false;
			message = isValidBaseRequestData.message;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}








	static isValidFollowApisRequestData(self) {
		
		let isValidUserid = Validator.isValidUserid(self.request.body.source_id);
		let isValidCursor = Validator.isValidCursor(self.request.body.cursor);
		let isValidCount = Validator.isValidCount(self.request.body.count);

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidCursor.status && isValidCount.status) {
			status = true;
			message = 'Valid Base Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidCursor.status) {
				messages.push(isValidCursor.message);
			}

			if (!isValidCount.status) {
				messages.push(isValidCount.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}








	static isValidRelationshipRequestData(self) {
		
		let isValidUserid = Validator.isValidUserid(self.request.body.source_id);
		let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.source_id);
		let isValidRelationshipUserid = Validator.isValidUserid(self.request.body.relationship_userid);
		

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidSelfUserid.status && isValidRelationshipUserid.status) {
			status = true;
			message = 'Valid Relationship Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidSelfUserid.status) {
				messages.push(isValidSelfUserid.message);
			}

			if (!isValidRelationshipUserid.status) {
				messages.push(isValidRelationshipUserid.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}







	static isValidActivityRequestData(self) {
		
		let isValidUserid = Validator.isValidUserid(self.request.body.userid);
		let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.userid);
		let isValidPost = Validator.isValidPost(self.request.body.post);
		

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidSelfUserid.status && isValidPost.status) {
			status = true;
			message = 'Valid Relationship Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidSelfUserid.status) {
				messages.push(isValidSelfUserid.message);
			}

			if (!isValidPost.status) {
				messages.push(isValidPost.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	
	}








	static isValidPostCreateRequestData(self) {
		let isValidUserid = Validator.isValidUserid(self.request.body.userid);
		let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.userid);
		let isValidPost = Validator.isValidPostData(self.request.body.post);
		

		let status, message;
		let messages =[];

		if (isValidUserid.status && isValidSelfUserid.status && isValidPost.status) {
			status = true;
			message = 'Valid Relationship Request Data';
		}
		else {

			if (!isValidUserid.status) {
				messages.push(isValidUserid.message);
			}

			if (!isValidSelfUserid.status) {
				messages.push(isValidSelfUserid.message);
			}

			if (!isValidPost.status) {
				messages.push(isValidPost.message);
			}

			status = false;
			message = messages;
		
		}
	

		return {
			status: status,
			message: message
		};
	}







	static isValidUserid(userid) {
		
		log.debug('userid : ', userid);

		let isValid = userid.match(/^[a-zA-Z0-9_+]{8,}$/);
		
		let status = true;
		let message = 'Valid Userid';

		if (!isValid) {
			log.error('Invalied Userid Format');
			status = false;
			message = 'userid';
		}

		return {
			status: status,
			message: message
		};
	}





	static isValidSelfUserid(self, userid) {
		
		log.debug('userid : ', userid);

		let sess = self.session;

		let status = true;
		let message = 'Valid Self Userid';

		if (userid !== sess.info.userid) {
			log.error('Invalied Self Userid');
			status = false;
			message = 'selfuserid';
		}


		return {
			status: status,
			message: message
		};

	}






	static isValidCursor(cursor) {
		
		log.debug('cursor : ', cursor);

		let isValid = cursor.match(/^[0-9]+$/);
		
		let status = true;
		let message = 'Valid Cursor';

		if (!isValid) {
			log.error('Invalied Cursor Format');
			status = false;
			message = 'cursor';
		}

		return {
			status: status,
			message: message
		};
	}





	static isValidCount(count) {
		
		log.debug('count : ', count);

		let isValid = count.match(/^[0-9]+$/);
		
		let status = true;
		let message = 'Valid Count';

		if (!isValid) {
			log.error('Invalied Count Format');
			status = false;
			message = 'cursor';
		}

		return {
			status: status,
			message: message
		};
	}





	static isValidPost(post) {
		
		log.debug('post : ', post);

		let status = true;
		let message = 'Valid post';

		let post_type = post.type;

		if (typeof post !== 'object' || !post.post_id) {
			log.error('Invalied post format');
			status = false;
			message = 'post';
		}

		if (post_type !== 'post' || post_type !== 'comment' || post_type !== 'social') {
      		log.error('Invalied post format');
			status = false;
			message = 'post';
      	}

		return {
			status: status,
			message: message
		};
	}







	static isValidPostData(post) {
		
		log.debug('post : ', post);

		let status = true;
		let message = 'Valid post';

		if (typeof post !== 'object') {
			log.error('Invalied post format');
			status = false;
			message = 'post';
		}

		if (typeof post.content !== 'string') {
			log.error('Invalied post format');
			status = false;
			message = 'post';
		}

		if (!Array.isArray(post.hashtags)) {
			log.error('Invalied post format');
			status = false;
			message = 'post';
		}

		if (!Array.isArray(post.mentions)) {
			log.error('Invalied post format');
			status = false;
			message = 'post';
		}

		return {
			status: status,
			message: message
		};
	}













	static validate_channel(channel) {
		log.debug('channel : ', channel);

		let isValid = channel.match(/^[a-zA-Z_]{2,}$/);
		
		let status = true;
		let message = 'Valid Channel';

		if (!isValid) {
			log.error('Invalied Channel Format');
			status = false;
			message = 'channel';
		}

		return {
			status: status,
			message: message
		};
	}






	// helper functions
	static validate_login(self) {

		let isValidUname = Validator.isValidUname(self);
		let isValidPassword = Validator.isValidPassword(self);

		log.debug('isValidUname : ', isValidUname);
		log.debug('isValidPassword : ', isValidPassword);

		if (isValidUname.status && isValidPassword.status) {
			return {
				status: true,
				message: 'Valid Login Format'
			};
		}

		let status = false;
		let message = [];

		if (!isValidUname.status) {
			message.push(isValidUname.message);
		}
		if (!isValidPassword.status) {
			message.push(isValidPassword.message);
		}

		return {
			status: status,
			message: message
		};
	}









	static validate_signup(self) {

		let validate_signupGenerator = function *(self) {

			let isValidPassword = Validator.isValidPassword(self);
			let isValidName = Validator.isValidName(self);		
			let isValidGender = Validator.isValidGender(self);
			let isValidTos = Validator.isValidTos(self);
			let isValidEmail = yield Validator.isValidEmail(self);
			let isValidUsername = yield Validator.isValidUsername(self);

			log.debug('isValidPassword : ', isValidPassword);
			log.debug('isValidName : ', isValidName);
			log.debug('isValidGender : ', isValidGender);
			log.debug('isValidTos : ', isValidTos);
			log.debug('isValidEmail : ', isValidEmail);
			log.debug('isValidUsername : ', isValidUsername);


			let result;
			let message = [];

			if (isValidPassword.status && isValidName.status && isValidGender.status && 
			isValidTos.status && isValidEmail.status && isValidUsername.status) {

				result = {
					status: true,
					message: 'Valid Login Format'
				};
			}
			else {
	
				if (!isValidUsername.status) {
					message.push(isValidUsername.message);
				}
				if (!isValidPassword.status) {
					message.push(isValidPassword.message);
				}
				if (!isValidName.status) {
					message.push(isValidName.message);
				}
				if (!isValidEmail.status) {
					message.push(isValidEmail.message);
				}
				if (!isValidGender.status) {
					message.push(isValidGender.message);
				}
				if (!isValidTos.status) {
					message.push(isValidTos.message);
				}

				result = {
					status: false,
					message: message
				};
			}

			return new bluebird(function(resolve, reject) {				
				resolve(result);
			});

		};


		let validate_signupCoroutine = bluebird.coroutine(validate_signupGenerator);
		
		// run the coroutine
		return validate_signupCoroutine(self);

	}









	static validate_profile_settings(self) {

		let validate_profile_settings_Generator = function *(self) {

			let isValidUserid = Validator.isValidUserid(self.request.body.userid);
			let isValidSelfUserid = Validator.isValidSelfUserid(self, self.request.body.userid);
			let isValidName = Validator.isValidName(self);		
			let isValidGender = Validator.isValidGender(self);
			let isValidEmail = yield Validator.isValidEmail(self);
			let isValidUsername = yield Validator.isValidUsername(self);
			let isValidBio = yield Validator.isValidBio(self);

			log.debug('isValidName : ', isValidName);
			log.debug('isValidGender : ', isValidGender);
			log.debug('isValidEmail : ', isValidEmail);
			log.debug('isValidUsername : ', isValidUsername);
			log.debug('isValidBio : ', isValidBio);


			let result;
			let message = [];

			if (isValidUserid.status && isValidSelfUserid.status && isValidName.status && isValidGender.status && 
			isValidBio.status && isValidEmail.status && isValidUsername.status) {

				result = {
					status: true,
					message: 'Valid Login Format'
				};
			}
			else {
	
				if (!isValidUserid.status) {
					message.push(isValidUserid.message);
				}
				if (!isValidSelfUserid.status) {
					message.push(isValidSelfUserid.message);
				}
				if (!isValidUsername.status) {
					message.push(isValidUsername.message);
				}
				if (!isValidName.status) {
					message.push(isValidName.message);
				}
				if (!isValidEmail.status) {
					message.push(isValidEmail.message);
				}
				if (!isValidGender.status) {
					message.push(isValidGender.message);
				}
				if (!isValidBio.status) {
					message.push(isValidBio.message);
				}

				result = {
					status: false,
					message: message
				};
			}

			return new bluebird(function(resolve, reject) {				
				resolve(result);
			});

		};


		let validate_profile_settings_Coroutine = bluebird.coroutine(validate_profile_settings_Generator);
		
		// run the coroutine
		return validate_profile_settings_Coroutine(self);

	}









	static isValidUname(self) {
		log.debug('inside isValidUname');

		let uname = self.request.body.uname;

		log.debug('uname : ', uname);

		let isValid = uname.match(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

		let status = true;
		let message = 'Valid username';
		let username_type = 'username';

		if (!isValid || uname.length < 2 || uname.length > 20) {
			log.debug('uname not for username type');
			
			self.checkBody('uname').notEmpty().isEmail();
			
			if (self.errors) {
				log.debug('uname not of email type');
				log.error('Invalid Usernmae Format');
				
				status = false;
				message = 'uname';				
			}
			else {
				log.debug('uname is of email type');
				username_type = 'email';
			}	
		}
		else {
			log.debug('uname is of username type');
		}

		
		return {
			status: status,
			message: message,
			username_type: username_type
		};

	}





	static isValidUsername(self) {
		
		let isValidUsernameGenerator = function *(self) {
			log.debug('inside IsValidUsername');

			let username = self.request.body.uname;
			
			log.debug('username ; ', username);

			let isValid = username.match(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

			let status = true;
			let message = 'Valid username';
			

			if (!isValid || username.length < 2 || username.length > 20) {
				
				log.error('Invalied username Format');
				status = false;
				message = 'uname';
			}

			else if (username === 'login' || username === 'signup' || username === 'home' || 
			username === 'chat' || username === 'error' || username === 'profile' ||
			username === 'logout' || username === 'auth' || username === 'account' ||
			username === 'settings' || username === '404') {
				
				log.error('Reserved keyword used for username');
				status = false;
				message = 'unameexists';
			}

			else {
				// check username from database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				user = db.getUserByUsername(username);

				if(!!user) {
					log.error('Username already exists');
					status = false;
					message = 'unameexists';
				}
			}


			return new bluebird(function(resolve, reject) {
				let result = {
					status: status,
					message: message
				};
				resolve(result);
			});

		};

		let isValidUsernameCoroutine = bluebird.coroutine(isValidUsernameGenerator);
		
		// run the coroutine
		return isValidUsernameCoroutine(self);

	}





	static isValidPassword(self) {
		log.debug('Inside isValidPassword');

		let pwd = self.request.body.pwd;
		
		log.debug('password : ', pwd);

		let isValid = pwd.match(/^[a-zA-Z0-9~@#$%^&*_+]{6,20}$/);

		log.debug('isValid : ', isValid);
		
		let status = true;
		let message = 'Valid Password';

		if (!isValid) {
			log.error('Invalied Password Format');
			status = false;
			message = 'pwd';
		}

		return {
			status: status,
			message: message
		};
	}




	static isValidName(self) {
		log.debug('Inside isValidName');

		let name = self.request.body.name;
		
		log.debug('name : ', name);
		
		let isValid = name.match(/^[a-zA-Z][a-zA-Z\s.'`]{1,20}$/);

		let status = true;
		let message = 'Valid Name';

		if (!isValid) {
			log.error('Invalied Name Format');
			status = false;
			message = 'name';
		}

		return {
			status: status,
			message: message
		};
	}





	static isValidEmail(self) {

		let isValidEmailGenerator = function *(self) {
			log.debug('Inside isValidEmail');

			let email = self.request.body.email;
			
			log.debug('email : ', email);

			self.checkBody('email').notEmpty().isEmail();

			let status = true;
			let message = 'Valid Email';

			if (ctx.errors) {
				log.error('Invalied Email Format');
				status = false;
				message = 'email';
			}
			else {
				
				// check email from database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				user = db.getUserByEmail(email);

				if(!!user) {
					log.error('Email already exists');
					status = false;
					message = 'emailexists';
				}			
			}

			return new bluebird(function(resolve, reject) {
				let result = {
					status: status,
					message: message
				};
				resolve(result);
			});	

		};

		let isValidEmailCoroutine = bluebird.coroutine(isValidEmailGenerator);
		
		// run the coroutine
		return isValidEmailCoroutine(self);
	
	}





	static isValidGender(self) {
		log.debug('Inside isValidGender');
			
		let gender = self.request.body.gender;

		log.debug('gender : ', gender);
		

		let status = true;
		let message = 'Valid Gender';



		if (gender !== 'male' && gender !== 'female' && gender !== 'other') {
			log.error('Invalied Gender Format');
			status = false;
			message = 'gender';
		}

		return {
			status: status,
			message: message
		};
	}





	static isValidTos(self) {
		log.debug('Inside isValidTos');
		log.debug('tos : ', self.request.body.tos);

		let status = true;
		let message = 'Valid Tos';


		if (self.request.body.tos !== 'accepted') {
			log.error('Invalied Tos Format');
			status = false;
			message = 'tos';
		}

		return {
			status: status,
			message: message
		};
	}



	static isValidBio(self) {
		log.debug('Inside isValidBio');

		let bio = self.request.body.bio;
		
		log.debug('bio : ', bio);
		
		let isValid = bio.match(/^[a-zA-Z][a-zA-Z\s.'`]{0,200}$/);

		let status = true;
		let message = 'Valid Bio';

		if (!isValid) {
			log.error('Invalied Bio Format');
			status = false;
			message = 'bio';
		}

		return {
			status: status,
			message: message
		};
	}






}
	





module.exports = Validator;


