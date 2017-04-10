const bluebird = require('bluebird');
const mixwith = require('mixwith');

const schema = require('./schema_mongodb');
const logger = require('../../lib/logger');
const CONFIG = require('../../lib/settings').CONFIG_DATA;



const log = logger.log;




const COLLECTIONS = schema.Collections;




const UsersModelBaseMixin = (superclass) => class UsersModel extends superclass { 


	
	get_collection(name) {
		return COLLECTIONS[name];
	}

	



	getUserByType(type, field) {

		let getUserByType_Generator = function *(self, type, field) {

			let result = false;
			let user;
			
			if (type === 'id') {
				let userid = field;
				user = yield self.get_collection('Users').where('userid').equals(userid).findOne();
			}
			else if (type === 'username') {
				let username = field;
				user = yield self.get_collection('Users').where('username').equals(username).findOne();
			}
			else if (type === 'email') {
				let email = field;
				user = yield self.get_collection('Users').where('email').equals(email).findOne();
			}
			

			if (!user) {
				result = false;
			}
			else {
				user = user.get();
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					resolve(user);
				}
				
			});

		};
		
		let getUserByType_Coroutine = bluebird.coroutine(getUserByType_Generator);

		// run the coroutine
		return getUserByType_Coroutine(this, type, field);
	
	}






	getUserById(userid) {

		return this.getUserByType('id', userid);
	
	}



	getUserByUsername(username) {

		return this.getUserByType('username', username);
	
	}



	getUserByEmail(email) {

		return this.getUserByType('email', email);
	
	}






	getUserInstanceByType(type, field) {

		let getUserInstanceByType_Generator = function *(self, type, field) {

			let result = false;
			let user;
			
			if (type === 'id') {
				let userid = field;
				user = yield self.get_collection('Users').where('userid').equals(userid).findOne();
			}
			else if (type === 'username') {
				let username = field;
				user = yield self.get_collection('Users').where('username').equals(username).findOne();
			}
			else if (type === 'email') {
				let email = field;
				user = yield self.get_collection('Users').where('email').equals(email).findOne();
			}
			

			if (!user) {
				result = false;
			}
			else {
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					resolve(user);
				}
				
			});

		};
		
		let getUserInstanceByType_Coroutine = bluebird.coroutine(getUserInstanceByType_Generator);

		// run the coroutine
		return getUserInstanceByType_Coroutine(this, type, field);
	
	}






	getUserInstanceById(userid) {

		return this.getUserInstanceByType('id', userid);
	
	}



	getUserInstanceByUsername(username) {

		return this.getUserInstanceByType('username', username);
	
	}



	getUserInstanceByEmail(email) {

		return this.getUserInstanceByType('email', email);
	
	}





};







const UsersModelMixin = mixwith.Mixin(UsersModelBaseMixin);
	



module.exports = UsersModelMixin;






