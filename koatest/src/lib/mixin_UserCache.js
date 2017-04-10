const bluebird = require('bluebird');
const mixwith = require('mixwith');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const pubsub = require('./pubsub');
const redis = require('./redisclient');
const DB = require('./db');

const log = logger.log;


const db = new DB();




const UserCacheBaseMixin = (superclass) => class UserCache extends superclass { 
	



	static getDpThumbnails(userids) {

		let getDpThumbnailsGenerator = function *(userids) {
			log.debug('inside getDpThumbnail function');
			log.debug('userids : ', userids);
			
			let key, value, userinfo, thumbnail;
			let result = true;
			let thumbnails = [];
			let error_count = 0;

			for (let userid of userids) {
				thumbnail = {};
			
				try {

					// first try to get the vlaues from redis cache
					userinfo = yield UserCache.getUserInfoFromCacheById(userid);
					
					if (userinfo) {	

						thumbnail = {
							userid: userinfo.userid,
							username: userinfo.username,
							dp_thumbnail: userinfo.dp_thumbnail
						};

						thumbnails.push(thumbnail);
					}
					else {
						error_count++;
					}
				}
				catch (err){
					log.error('Error: ', err);
					error_count++;
				}

			}
			
			if (error_count === userids.length) {
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(thumbnails);
				}
				else {
					resolve(false);
				}
			});
		
		};
	
		
		let getDpThumbnailsCoroutine = bluebird.coroutine(getDpThumbnailsGenerator);
		
		// run the coroutine
		return getDpThumbnailsCoroutine(userids);
	}








	static addUserOnlineStatus(user, status, lastseen) {
		
		let addUserOnlineStatus_Generator = function *(user, status, lastseen) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (typeof user !== 'object') {
					user = JSON.parse(user);
				}
				
				let key = 'koatest:user:online_status:userid:' + user.userid;

				if(lastseen === 'new') {
					lastseen = 'Yet to start chat';
				}
				else if(!lastseen) {
					lastseen = false;
				}
				else if (lastseen !== true) {
					lastseen = lastseen || new Date.toLocaleString();
				}
				else {
					lastseen = new Date.toLocaleString();
				}	

				if (!status) {
					status = false;
				}
				else {
					status = true;
				}	

				if (status) {
					lastseen = false;
				}
				else if (!!lastseen) {
					status = false;
				}						

				let value = {
					status: status,
					lastseen: lastseen
				};


				value = JSON.stringify(value);

				log.debug('redis set Async called');
				let redisSet = yield redis.setAsync(key, value);

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addUserOnlineStatus_Coroutine = bluebird.coroutine(addUserOnlineStatus_Generator);
		
		// run the coroutine
		return addUserOnlineStatus_Coroutine(user, status, lastseen);
	}







	static updateUserOnlineStatusCache(user, old_username) {
		
		let updateUserOnlineStatus_Generator = function *(user, old_username) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// only update if old username and new username differs			
				if (user.username !== old_username) {

					if (typeof user !== 'object') {
						user = JSON.parse(user);
					}
					
					let key = 'koatest:user:online_status:userid:' + user.userid;

					log.debug('redis get Async called');
					let online_status = yield redis.getAsync(key);

					let secondary_key = 'koatest:user:online_status:username:' + old_username;

					log.debug('redis del Async called');
					let redisDel = yield redis.delAsync(secondary_key);

					// add the online status for the new username
					let new_key = 'koatest:user:online_status:username:' + user.username;

					log.debug('redis set Async called');
					let redisSet = yield redis.setAsync(new_key, online_status);
				
				}

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let updateUserOnlineStatus_Coroutine = bluebird.coroutine(updateUserOnlineStatus_Generator);
		
		// run the coroutine
		return updateUserOnlineStatus_Coroutine(user, old_username);
	}









	static getUserOnlineStatusById(userid) {

		let getUserOnlineStatusById_Generator = function *(userid) {
			// Add data to cache in redis
			let result = false;
			let online_status;

			try {
				
				let key = 'koatest:user:online_status:userid:' + userid;

				log.debug('redis get Async called');
				let value = yield redis.getAsync(key);

				if (!value) {
					
					result = false;

				}
				else {
					if (typeof value !== 'object') {
						value = JSON.parse(value);
					}
					online_status = value;
					result = true;
				}
				
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(online_status);
				}
				else {
					resolve(false);
				}
			});

		};


		let getUserOnlineStatusById_Coroutine = bluebird.coroutine(getUserOnlineStatusById_Generator);
		
		// run the coroutine
		return getUserOnlineStatusById_Coroutine(userid);

	}







	static addUserInfoCache(user) {

		let addUserInfoCache_Generator = function *(user) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (typeof user === 'string') {
					user = JSON.parse(user);
				}
				
				let key = 'koatest:user:userid:' + user.userid;
							
				let value = {
					name: user.name,
					username: user.username,
					userid: user.userid,
					email: user.email,
					gender: user.gender,
					dp_thumbnail: user.dp_thumbnail,
					followers: user.followers,
					following: user.following,
					bio: user.bio
				};


				value = JSON.stringify(value);

				log.debug('redis set Async called');
				let redisSet = yield redis.setAsync(key, value);
				
				log.debug('redis expire Async called');
				let expire = yield redis.expireAsync(key, 2592000); // 30 days

				let secondary_key = 'koatest:user:username' + user.username;

				log.debug('redis set Async called');
				let redisSet_2 = yield redis.setAsync(secondary_key, value);
				
				log.debug('redis expire Async called');
				let expire_2 = yield redis.expireAsync(secondary_key, 2592000); // 30 days

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addUserInfoCache_Coroutine = bluebird.coroutine(addUserInfoCache_Generator);
		
		// run the coroutine
		return addUserInfoCache_Coroutine(user);

	}









	static updateUserInfoCache(user, old_username) {

		let updateUserInfoCache_Generator = function *(user, old_username) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (typeof user === 'string') {
					user = JSON.parse(user);
				}
				
				let key = 'koatest:user:userid:' + user.userid;
							
				let value = {
					name: user.name,
					username: user.username,
					userid: user.userid,
					email: user.email,
					gender: user.gender,
					dp_thumbnail: user.dp_thumbnail,
					followers: user.followers,
					following: user.following,
					bio: user.bio
				};


				value = JSON.stringify(value);

				log.debug('redis set Async called');
				let redisSet = yield redis.setAsync(key, value);
				
				log.debug('redis expire Async called');
				let expire = yield redis.expireAsync(key, 2592000); // 30 days

				let secondary_key = 'koatest:user:username' + user.username;

				log.debug('redis set Async called');
				let redisSet_2 = yield redis.setAsync(secondary_key, value);
				
				log.debug('redis expire Async called');
				let expire_2 = yield redis.expireAsync(secondary_key, 2592000); // 30 days
				                                                               
				// now delete the userInfoCache associated with old_username only if it is different from the
				// new username, otherwise it already must have got updated by above commands
				if (user.username !== old_username) {

					let new_key = 'koatest:user:username' + old_username;

					log.debug('redis del Async called');
					let redisDel = yield redis.delAsync(new_key);

				}                                                 

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let updateUserInfoCache_Coroutine = bluebird.coroutine(updateUserInfoCache_Generator);
		
		// run the coroutine
		return updateUserInfoCache_Coroutine(user, old_username);

	}











	static getUserInfoFromCacheByType(type, id) {

		let getUserInfoFromCacheByType_Generator = function *(type, id) {
			// Add data to cache in redis
			let result = false;
			let user;

			try {
				let key, userid, username;

				if (type === 'userid') {
					userid = id;
					log.debug('userid : ', userid);
					
					key = 'koatest:user:userid' + userid;
				}
				else if (type === 'username') {
					username = id;
					log.debug('username : ', username);
					
					key = 'koatest:user:username' + username;
				}

				log.debug('redis get Async called');
				let value = yield redis.getAsync(key);

				if (!value) {
					// get value from db
					if (!db.connected) {
						// db not connected yet to this databse, hence first connect
						let db_instance = yield db.connect();
					}

					if (type === 'userid') {
						user = db.getUserById(userid);
					}
					else if (type === 'username') {
						user = db.getUserByUsername(username);
					}
					
					if (!user) {
						result = false;
					}
					else {
						let userinfocache = yield UserCache.addUserInfoCache(user);
					}	

				}
				else {
					if (typeof value !== 'object') {
						value = JSON.parse(value);
					}
					user = value;
					result = true;
				}
				
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(user);
				}
				else {
					resolve(false);
				}
			});

		};


		let getUserInfoFromCacheByType_Coroutine = bluebird.coroutine(getUserInfoFromCacheByType_Generator);
		
		// run the coroutine
		return getUserInfoFromCacheByType_Coroutine(type, id);

	}









	static getUserInfoFromCacheById(userid) {

		return UserCache.getUserInfoFromCacheByType('userid', userid);

	}







	static getUserInfoFromCacheByUsername(username) {

		return UserCache.getUserInfoFromCacheByType('username', username);

	}








	static getUserListChatType(type, channel) {

		let getUserListChatType_Generator = function *(type, channel) {
			// get data to from cache in redis
			let result = false;
			let user_list;

			try {
				let key;

				if (type === 'public') {

					key = 'koatest:chat:public:userList';
				}
				else if (type === 'irc') {

					key = 'koatest:chat:irc:userList:channel:' + channel;
				}
					

				let value = yield redis.smembersAsync(key);
				log.debug('value : ', value);


				if (!value) {
					
					result = false;
				}
				else {
					
					if (typeof value !== 'object') {
						value = JSON.parse(value);
					}
					
					user_list = value;
					result = true;
				}
				
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(user_list);
				}
				else {
					resolve(false);
				}
			});

		};


		let getUserListChatType_Coroutine = bluebird.coroutine(getUserListChatType_Generator);
		
		// run the coroutine
		return getUserListChatType_Coroutine(type, channel);

	}







	static getUserListPublicChat() {

		return UserCache.getUserListChatType('public');

	}




	static getUserListIrcChat(channel) {

		return UserCache.getUserListChatType('irc', channel);

	}







	static addToUserListChatType(type, user, channel) {

		let addToUserListChatType_Generator = function *(type, user, channel) {
			// Add data to cache in redis
			let result = false;
			let numUsers;
			
			try {

				let key, numUsers_count_key;

				if (type === 'public') {

					key = 'koatest:chat:public:userList';
					numUsers_count_key = 'koatest:chat:public:numUsers';
				}
				else if (type === 'irc') {

					key = 'koatest:chat:irc:userList:channel:' + channel;
					numUsers_count_key = 'koatest:chat:irc:numUsers:channel:' + channel;
				}
				
				// add the new user joined in the public chat set in redis
				let new_userList = yield redis.saddAsync(key, user);
				log.debug('new_userList : ', new_userList);


				// increase the new num of users in public chat in redis
				numUsers = yield redis.incrAsync(numUsers_count_key);
				log.debug('newNumUers : ', numUsers);                                                

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(numUsers);
				}
				else {
					resolve(false);
				}
				
			});

		};


		let addToUserListChatType_Coroutine = bluebird.coroutine(addToUserListChatType_Generator);
		
		// run the coroutine
		return addToUserListChatType_Coroutine(type, user, channel);

	}





	static addToUserListPublicChat(user) {

		return UserCache.addToUserListChatType('public', user);

	}




	static addToUserListIrcChat(user, channel) {

		return UserCache.addToUserListChatType('irc', user, channel);

	}








	static removeFromUserListChatType(type, user, channel) {

		let removeFromUserListChatType_Generator = function *(type, user, channel) {
			// Add data to cache in redis
			let result = false;
			let numUsers;
			
			try {

				let key, numUsers_count_key;

				if (type === 'public') {

					key = 'koatest:chat:public:userList';
					numUsers_count_key = 'koatest:chat:public:numUsers';
				}
				else if (type === 'irc') {

					key = 'koatest:chat:irc:userList:channel:' + channel;
					numUsers_count_key = 'koatest:chat:irc:numUsers:channel:' + channel;
				}
				
				// add the new user joined in the public chat set in redis
				let new_userList = yield redis.sremAsync(key, user);
				log.debug('new_userList : ', new_userList);

				// decrease the new num of users in public chat in redis
				numUsers = yield redis.decrAsync(numUsers_count_key);
				log.debug('newNumUers : ', numUsers);                                                

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(numUsers);
				}
				else {
					resolve(false);
				}
				
			});

		};


		let removeFromUserListChatType_Coroutine = bluebird.coroutine(removeFromUserListChatType_Generator);
		
		// run the coroutine
		return removeFromUserListChatType_Coroutine(type, user, channel);

	}








	static removeFromUserListPublicChat(user) {

		return UserCache.removeFromUserListChatType('public', user);

	}




	static removeFromUserListIrcChat(user, channel) {

		return UserCache.removeFromUserListChatType('irc', user, channel);

	}




};







const UserCacheMixin = mixwith.Mixin(UserCacheBaseMixin);
	



module.exports = UserCacheMixin;


