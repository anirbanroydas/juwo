const bluebird = require('bluebird');
const mixwith = require('mixwith');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const pubsub = require('./pubsub');
const redis = require('./redisclient');
const DB = require('./db');

const log = logger.log;


const db = new DB();





const FeedCacheBaseMixin = (superclass) => class FeedCache extends superclass { 
	


	static get_notification_count(userid) {

		let get_notification_count_Generator = function *(userid) {
			let result = false;
			let notification_count;
			
			try {

				let new_counter_key = 'koatest:notification:count:user' + userid;

				// first try to get the vlaues from redis cache
				log.debug('redis get Async called');
				notification_count = yield redis.getAsync(new_counter_key);
				
				if (!notification_count) {
					result = false;
				}
				else {
					result = true;
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(notification_count);
				}
				else {
					resolve(false);
				}				
			});

		};


		let get_notification_count_Coroutine = bluebird.coroutine(get_notification_count_Generator);
		
		// run the coroutine
		return get_notification_count_Coroutine(userid);
	}








	static get_notification_user(userid, cursor, count) {

		let get_notification_user_Generator = function *(userid, cursor, count) {
			let result = false;
			let notifications;
			
			try {

				let notification_key = 'koatest:notification:user' + userid;
				let new_counter_key = 'koatest:notification:user:new_counter' + userid;
				let notification_count_key = 'koatest:notification:count:user' + userid;
							
				let start, end;

				if (cursor === 0) {
					start = 0;
					end = count;

					// Also clear the new_counter key and notifcation count key
					log.debug('redis set Async called');
					let redisSet = yield redis.setAsync(new_counter_key, 0);

					log.debug('redis set Async called');
					let redisSet_2 = yield redis.setAsync(notification_count_key, 0);
				
				}
				else {
					log.debug('redis get Async called');
					let value = yield redis.getAsync(new_counter_key);

					if (!value) {
						start = 0;
						end = count;
					}
					else {
						start = cursor + parseInt(value);
						end = start + count;
					}
				}

				// first try to get the vlaues from redis cache
				log.debug('redis lrange Async called');
				let notification_ids = yield redis.lrangeAsync(notification_key, start, end);
				
				if (!notification_ids) {
					// get the value from db
					
						// To Be implemented
						
						// if (!db.connected) {
						// 	// db not connected yet to this databse, hence first connect
						// 	let db_instance = yield db.connect();
						// }
						
						// user = yield db.collection.where('userid').equals(userid).findOne();

						// log.debug('user : ', user);
						// user = user.get();

						// thumbnail = {
						// 	username: user.username,
						// 	dp_thumbnail: user.dp_thumbnail
						// };
						
						// thumbnails.push(thumbnail);

						// let usercache = yield FeedCache.addUserInfoCache(user);
						// log.debug('usercache added : ', usercache);
					
					// Show no posts to be shown
					result = false;

				}
				else {
					notifications = FeedCache.get_individual_feed(notification_ids);
					
					if (!notifications) {
						result = false;
					}
					else {
						notifications.cursor = cursor + count;
						notifications.count = count;
					}
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(notifications);
				}
				else {
					resolve(false);
				}				
			});

		};


		let get_notification_user_Coroutine = bluebird.coroutine(get_notification_user_Generator);
		
		// run the coroutine
		return get_notification_user_Coroutine(userid, cursor, count);
	}










	static get_livestream_user(userid, cursor, count) {

		let get_livestream_user_Generator = function *(userid, cursor, count) {
			let result = false;
			let livestream;
			
			try {

				let livestream_key = 'koatest:livestream:user' + userid;
				let new_counter_key = 'koatest:livestream:user:new_counter' + userid;
							
				let start, end;

				if (cursor === 0) {
					start = 0;
					end = count;

					// Also clear the new_counter key
					log.debug('redis set Async called');
					let redisSet = yield redis.setAsync(new_counter_key, 0);
				
				}
				else {
					log.debug('redis get Async called');
					let value = yield redis.getAsync(new_counter_key);

					if (!value) {
						start = 0;
						end = count;
					}
					else {
						start = cursor + parseInt(value);
						end = start + count;
					}
				}

				// first try to get the vlaues from redis cache
				log.debug('redis lrange Async called');
				let livestream_ids = yield redis.lrangeAsync(livestream_key, start, end);
				
				if (!livestream_ids) {
					// get the value from db
					
						// To Be implemented
						
						// if (!db.connected) {
						// 	// db not connected yet to this databse, hence first connect
						// 	let db_instance = yield db.connect();
						// }
						
						// user = yield db.collection.where('userid').equals(userid).findOne();

						// log.debug('user : ', user);
						// user = user.get();

						// thumbnail = {
						// 	username: user.username,
						// 	dp_thumbnail: user.dp_thumbnail
						// };
						
						// thumbnails.push(thumbnail);

						// let usercache = yield FeedCache.addUserInfoCache(user);
						// log.debug('usercache added : ', usercache);
					
					// Show no posts to be shown
					result = false;

				}
				else {
					livestream = FeedCache.get_individual_feed(livestream_ids);
					
					if (!livestream) {
						result = false;
					}
					else {
						livestream.cursor = cursor + count;
						livestream.count = count;
					}
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(livestream);
				}
				else {
					resolve(false);
				}				
			});

		};


		let get_livestream_user_Coroutine = bluebird.coroutine(get_livestream_user_Generator);
		
		// run the coroutine
		return get_livestream_user_Coroutine(userid, cursor, count);
	}








	static get_timeline_user(userid, cursor, count) {

		let get_timeline_user_Generator = function *(userid, cursor, count) {
			let result = false;
			let timeline;
			
			try {

				let timeline_key = 'koatest:timeline:user' + userid;
				let new_counter_key = 'koatest:timeline:user:new_counter' + userid;
							
				let start, end;

				if (cursor === 0) {
					start = 0;
					end = count;

					// Also clear the new_counter key
					log.debug('redis set Async called');
					let redisSet = yield redis.setAsync(new_counter_key, 0);
				
				}
				else {
					log.debug('redis get Async called');
					let value = yield redis.getAsync(new_counter_key);

					if (!value) {
						start = 0;
						end = count;
					}
					else {
						start = cursor + parseInt(value);
						end = start + count;
					}
				}

				// first try to get the vlaues from redis cache
				log.debug('redis lrange Async called');
				let timeline_ids = yield redis.lrangeAsync(timeline_key, start, end);
				
				if (!timeline_ids) {
					// get the value from db
					
						// To Be implemented
						
						// if (!db.connected) {
						// 	// db not connected yet to this databse, hence first connect
						// 	let db_instance = yield db.connect();
						// }
						
						// user = yield db.collection.where('userid').equals(userid).findOne();

						// log.debug('user : ', user);
						// user = user.get();

						// thumbnail = {
						// 	username: user.username,
						// 	dp_thumbnail: user.dp_thumbnail
						// };
						
						// thumbnails.push(thumbnail);

						// let usercache = yield FeedCache.addUserInfoCache(user);
						// log.debug('usercache added : ', usercache);
					
					// Show no posts to be shown
					result = false;

				}
				else {
					timeline = FeedCache.get_individual_feed(timeline_ids);
					
					if (!timeline) {
						result = false;
					}
					else {
						timeline.cursor = cursor + count;
						timeline.count = count;
					}
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(timeline);
				}
				else {
					resolve(false);
				}				
			});

		};


		let get_timeline_user_Coroutine = bluebird.coroutine(get_timeline_user_Generator);
		
		// run the coroutine
		return get_timeline_user_Coroutine(userid, cursor, count);
	}












	static get_feed_home(userid, cursor, count) {

		let get_feed_home_Generator = function *(userid, cursor, count) {
			// Add data to cache in redis
			let result = false;
			let feed;
			
			try {

				let feed_key = 'koatest:feed:home' + userid;
				let new_counter_key = 'koatest:feed:home:new_counter' + userid;
							
				let start, end;

				if (cursor === 0) {
					start = 0;
					end = count;

					// Also clear the new_counter key
					log.debug('redis set Async called');
					let redisSet = yield redis.setAsync(new_counter_key, 0);
				
				}
				else {
					log.debug('redis get Async called');
					let value = yield redis.getAsync(new_counter_key);

					if (!value) {
						start = 0;
						end = count;
					}
					else {
						start = cursor + parseInt(value);
						end = start + count;
					}
				}

				// first try to get the vlaues from redis cache
				log.debug('redis lrange Async called');
				let feed_ids = yield redis.lrangeAsync(feed_key, start, end);
				
				if (!feed_ids) {
					// get the value from db
					
						// To Be implemented
						
						// if (!db.connected) {
						// 	// db not connected yet to this databse, hence first connect
						// 	let db_instance = yield db.connect();
						// }
						
						// user = yield db.collection.where('userid').equals(userid).findOne();

						// log.debug('user : ', user);
						// user = user.get();

						// thumbnail = {
						// 	username: user.username,
						// 	dp_thumbnail: user.dp_thumbnail
						// };
						
						// thumbnails.push(thumbnail);

						// let usercache = yield FeedCache.addUserInfoCache(user);
						// log.debug('usercache added : ', usercache);
					
					// Show no posts to be shown
					result = false;

				}
				else {
					feed = FeedCache.get_individual_feed(feed_ids);
					if (!feed) {
						result = false;
					}
					else {
						feed.cursor = cursor + count;
						feed.count = count;
					}
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(feed);
				}
				else {
					resolve(false);
				}				
			});

		};


		let get_feed_home_Coroutine = bluebird.coroutine(get_feed_home_Generator);
		
		// run the coroutine
		return get_feed_home_Coroutine(userid, cursor, count);
	}








	static get_individual_feed(feed_ids) {

		let get_individual_feed_Generator = function *(feed_ids) {
			// Add data to cache in redis
			let result = false;
			let feed;
			
			if (Array.isArray(feed_ids)) {
				// It means the feed_ids is a list of feed ids, hence do fidn feed for all of them individually
				let feed_data = {};
				let count = 1;
				for (let feed_id of feed_ids) {
					feed_data[count++] = yield FeedCache.get_individual_feed(feed_id);
				}
				result = true;
				feed = feed_data;
			}
			else {

				let feed_id = feed_ids;
				let feed_type, id;
				
				try {

					if (feed_id.search('post') !== -1) {
						feed_type = 'post';
						let keylist = feed_id.split(':');
						id = keylist[keylist.length - 1];
					}
					else if (feed_id.search('activity') !== -1) {
						feed_type = 'activity';
						let keylist = feed_id.split(':');
						id = keylist[keylist.length - 1];
					}

					log.debug('feed type : ', feed_type);

					log.debug('redis get Async called');
					let data = yield redis.getAsync(feed_id);
					
					if (!data) {
						// get the value from db
						
						if (!db.connected) {
							// db not connected yet to this databse, hence first connect
							let db_instance = yield db.connect();
						}

						if (feed_type === 'post') {
							let data = yield db.get_collection('Posts').where('post_id').equals(id).findOne();
							result = true;
						}
						else if (feed_type === 'activity') {
							let data = yield db.get_collection('Activities').where('activity_id').equals(id).findOne();
							result = true;
						}
						else {
							result = false;
						}
						
						
						if (result) {

							log.debug('data : ', data);
							feed = data.get();

							// add feed to redis cache
							if (feed_type === 'post') {
								let post_cache = yield FeedCache.addPostToCache(feed.post_id, feed);
								log.debug('feed_cache added : ', post_cache);
							}
							else if (feed_type === 'activity') {
								let activity_cache = yield FeedCache.addActivityToCache(feed.activity_id, feed);
								log.debug('activity_cache added : ', activity_cache);
							}
						}

					}
					else {
						if (typeof data !== 'object') {
							data = JSON.parse(data);
						}

						feed = data;
						result = true;
					}



					// Now read data from insdie feed data like userids, tag ids
					
					if (feed.source_userid) {
						let userinfo = yield FeedCache.getUserInfoFromCacheById(feed.source_userid);
						
						if (!userinfo) {
							result = false;

						}
						else {
							result = true;

							feed.source_userinfo = {
								username: userinfo.username,
								name: userinfo.name,
								dp_thumbnail: userinfo.dp_thumbnail
							};
						}
					}


					if (feed.relationship) {
						if (feed.relationship.relationship_type === 'relationship') {
							
							let userinfo = yield FeedCache.getUserInfoFromCacheById(feed.relationship.relationship_id);
						
							if (!userinfo) {
								result = false;

							}
							else {
								result = true;
								feed.relationship.relationship_info = {
									username: userinfo.username,
									name: userinfo.name,
									dp_thumbnail: userinfo.dp_thumbnail
								};
							}
						}
						else if (feed.relationship.relationship_type === 'post') {
							
							// let post_info = yield FeedCache.getPostInfoFromCacheById(feed.relationship.relationship_id);
						
							// if (!post_info) {
							// 	result = false

							// }
							// else {
							// 	result = true;

							// 	feed.relationship.relationship_info = {
							// 		owner_username: post_info.owner_username,
							// 		owner_name: post_info.owner_name,
							// 		owner_userid: post_info.owner_userid,
							// 		owner_dp_thumbnail: post_info.owner_dp_thumbnail,
							// 		post_path: post_info.post_path
							// 	}
							// }
						}
						
					}

					if (feed.tagged_ids) {
						if (feed.tagged_ids.length > 0) {
							feed.tagged_users = {};
							
							for (let tagged_id of tagged_ids) {
								let userinfo = yield FeedCache.getUserInfoFromCacheById(tagged_id);
							
								if (userinfo) {

									feed.tagged_users[tagged_id] = {
										username: userinfo.username,
										name: userinfo.name,
										dp_thumbnail: userinfo.dp_thumbnail
									};
								}
							}
							
						}
					}
				
				}
				catch (err) {
					log.error('Error : ', err);
					result = false;
				}

			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(feed);
				}
				else {
					resolve(false);	
				}
				
			});

		};


		let get_individual_feed_Coroutine = bluebird.coroutine(get_individual_feed_Generator);
		
		// run the coroutine
		return get_individual_feed_Coroutine(feed_ids);
	}







};
	





const FeedCacheMixin = mixwith.Mixin(FeedCacheBaseMixin);



module.exports = FeedCacheMixin;


