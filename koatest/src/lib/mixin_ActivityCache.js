const bluebird = require('bluebird');
const mixwith = require('mixwith');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const pubsub = require('./pubsub');
const relationship = require('./relationship_handler');
const redis = require('./redisclient');
const DB = require('./db');

const log = logger.log;


const db = new DB();



//
// Sample Activity document
// 
// ActivitiesSchema = {
// 
// 	activity_id: 'string',
// 	source_id: 'string',
// 	relationship: 'object',
// 	activity_time: 'datetime',
// 	type: 'string',
// 	value: 'string'
// 	
// };

// 
// 
// activity = {
// 
// 	activity_id: 13439343,
// 	source_id: 89274393,
// 	relationship: {
// 		relationship_type: 'relationship',
// 		relationship_id: 389348293
// 	},
// 	activity_time: '13 Nove 2016 12:43 pm',
// 	type: 'relationship',
// 	value: 'following'
// 	
// };
// 



const ActivityCacheBaseMixin = (superclass) => class ActivityCache extends superclass { 



	static addActivityToCache(activity) {

		let addActivityToCache_Generator = function *(activity) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (typeof activity !== 'object') {
					activity = JSON.parse(activity);
				}
				
				let key = 'koatest:activity:activity_id:' + activity.activity_id;


				let value = JSON.stringify(activity);

				log.debug('redis set Async called');
				let redisSet = yield redis.setAsync(key, value);
				
				log.debug('redis expire Async called');
				let expire = yield redis.expireAsync(key, 2592000); // 30 days

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


		let addActivityToCache_Coroutine = bluebird.coroutine(addActivityToCache_Generator);
		
		// run the coroutine
		return addActivityToCache_Coroutine(activity);

	}






	static addActivityToFeed(type, source_id, activity_id, activity_info) {

		let addActivityToFeed_Generator = function *(type, source_id, activity_id, activity_info) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (type === 'followers ') {
					// handle this in special way
					let user = yield ActivityCache.getUserInfoFromCacheById(source_id);
					
					if (user) {
						// first send the activity info to all subscribers, for faster response,
						// then add it to their respective cache for later access
						
						// now send the activity to rabbitmq feed exchange
						let exchange = 'koatest_feed_ex';
						let routing_key = 'feed.' + source_id + '.*';
						let data = activity_info;
						// let publish_opts = {};	

						let activity_to_feed_ex = yield pubsub.publish(exchange, routing_key, data);

						// get followers list
						let followers = user.followers;

						for  (let follower of followers) {
							let activitity_to_feed_follower = yield addActivityToFeed('follower-self', follower, activity_id, activity_info);
						}
					}
				}
				else if (type === 'self') {
					// first send the activity info to all subscribers, for faster response,
					// then add it to their respective cache for later access
					
					// now send the activity to rabbitmq feed exchange
					let exchange = 'koatest_feed_ex';
					let routing_key = 'feed.' + source_id + '.*';
					let data = activity_info;
					// let publish_opts = {};	

					let activity_to_feed_ex = yield pubsub.publish(exchange, routing_key, data);

					let key = 'koatest:feed:home:' + source_id;
					
					let value = 'koatest:activity:' + activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the feed to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry 
					let new_counter_key = 'koatest:feed:home:new_counter:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);

					

					result = true;
				}
				else if (type === 'follower-self') {
					let key = 'koatest:feed:home:' + source_id;
					
					let value = 'koatest:activity:' + activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the feed to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry 
					let new_counter_key = 'koatest:feed:home:new_counter:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);

					

					result = true;
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addActivityToFeed_Coroutine = bluebird.coroutine(addActivityToFeed_Generator);
		
		// run the coroutine
		return addActivityToFeed_Coroutine(type, source_id, activity_id, activity_info);

	}








	static addActivityToTimeline(type, source_id, activity_id, activity_info) {

		let addActivityToTimeline_Generator = function *(type, source_id, activity_id, activity_info) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (type === 'tagged_users') {
					// handle this in special way
					// get all tagged_users from source_id since source_id is a list in this form
					
					let tagged_ids = source_id;

					for (let tagged_id of tagged_ids) {
						let activity_to_timeline_self = yield addActivityToTimeline('self', tagged_id, activity_id, activity_info);	
					}
				}
				else if (type === 'self') {
					// first send the activity info to all subscribers, for faster response,
					// then add it to their respective cache for later access

					// now send the activity to rabbitmq timeline exchange
					let exchange = 'koatest_timeline_ex';
					let routing_key = 'timeline.' + source_id + '.*';
					let data = activity_info;
					// let publish_opts = {};	

					let activity_to_timeline_ex = yield pubsub.publish(exchange, routing_key, data);

					let key = 'koatest:timeline:user:' + source_id;
					let value = 'koatest:activity:' + activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the timeline to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry 
					let new_counter_key = 'koatest:timeline:user:new_counter:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);

					result = true;

				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addActivityToTimeline_Coroutine = bluebird.coroutine(addActivityToTimeline_Generator);
		
		// run the coroutine
		return addActivityToTimeline_Coroutine(type, source_id, activity_id, activity_info);

	}








	static addActivityToLivestream(type, source_id, activity) {

		let addActivityToLivestream_Generator = function *(type, source_id, activity) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (type === 'followers ') {
					// handle this in special way
					// let followers = yield cache.getUserFollowersListFromCacheById(source_id);
					let followers = true;

					if (followers) {
						// // first send the activity info to all subscribers, for faster response,
						// // then add it to their respective cache for later access
						
						// // now send the activity to rabbitmq timeline exchange
						// let exchange = 'koatest_livestream_ex';
						// let routing_key = 'livestream.' + source_id + '.*';
						// let data = activity;
						// // let publish_opts = {};	

						// let activity_to_livestream_ex = yield pubsub.publish(exchange, routing_key, data);

						// get followers list
						// now get entire followers list, you can limit this using cursor
						// and count liek relationship.getFollowersList(source_id, cursor, count)
						followers = relationship.getFollowersList(source_id);

						for  (let follower_id of followers) {
							let activitity_to_livestream_follower = yield ActivityCache.addActivityToLivestream('follower-self', follower_id, activity);
						}
					}
				}
				else if (type === 'self') {
					// first send the activity info to all subscribers, for faster response,
					// then add it to their respective cache for later access
					
					// now send the activity to rabbitmq timeline exchange
					let exchange = 'koatest_livestream_ex';
					let routing_key = 'livestream.' + source_id + '.*';
					let data = activity;

					let activity_to_livestream_ex = yield pubsub.publish(exchange, routing_key, data);
					
					// now add activity to redis cache
					let key = 'koatest:livestream:user:userid:' + source_id;
					let value = 'koatest:activity:activity_id:' + activity.activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the livestream to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry 
					let new_counter_key = 'koatest:livestream:user:new_counter:userid:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);

					result = true;
				}
				else if (type === 'follower-self') {
					let key = 'koatest:livestream:user:userid:' + source_id;
					let value = 'koatest:activity:activity_id:' + activity.activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the livestream to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry 
					let new_counter_key = 'koatest:livestream:user:new_counter:userid:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);

					result = true;
				}

			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addActivityToLivestream_Coroutine = bluebird.coroutine(addActivityToTimeline_Generator);
		
		// run the coroutine
		return addActivityToLivestream_Coroutine(type, source_id, activity);

	}








	static addActivityToNotification(type, source_id, activity) {

		let addActivityToNotification_Generator = function *(type, source_id, activity) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (type === 'tagged_users ') {
					// handle this in special way
					// get all tagged_users from source_id since source_id is a list in this form
					
					let tagged_ids = source_id;

					for (let tagged_id of tagged_ids) {
						let activity_to_notification_self = yield ActivityCache.addActivityToNotification('self', tagged_id, activity);	
					}
					
				}
				else if (type === 'self') {
					// first send the activity info to all subscribers, for faster response,
					// then add it to their respective cache for later access

					// now send the activity to rabbitmq notifiction exchange
					let exchange = 'koatest_notification_ex';
					let routing_key = 'notification.' + source_id + '.*';
					let data = activity;
					// let publish_opts = {};	

					let activity_to_notification_ex = yield pubsub.publish(exchange, routing_key, data);

					let key = 'koatest:notification:user:userid:' + source_id;
					let value = 'koatest:activity:activity_id:' + activity.activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the notification to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Now incr the new counter count as new entry also incr the notification count
					let new_counter_key = 'koatest:notification:user:new_counter:userid:' + source_id;
					let notification_count_key = 'koatest:notification:count:user:userid:' + source_id;

					log.debug('redis set Async called');
					let redisIncr = yield redis.incrAsync(new_counter_key);
					let redisIncr_2 = yield redis.incrAsync(notification_count_key);


					

					result = true;
				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addActivityToNotification_Coroutine = bluebird.coroutine(addActivityToNotification_Generator);
		
		// run the coroutine
		return addActivityToNotification_Coroutine(type, source_id, activity);

	}








	static addActivityToTimelineActivity(type, source_id, activity) {

		let addActivityToTimelineActivity_Generator = function *(type, source_id, activity) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (type === 'mentioned_users') {
					// handle this in special way
					// get all tagged_users from source_id since source_id is a list in this form
					
					let mentioned_ids = source_id;

					for (let mentioned_id of mentioned_ids) {
						let activity_to_timeline_self = yield ActivityCache.addActivityToTimelineActivity('self', mentioned_id, activity);	
					}
				}
				else if (type === 'self') {
					// first send the activity info to all subscribers, for faster response,
					// then add it to their respective cache for later access

					let key = 'koatest:timeline:user:activity:userid:' + source_id;
					let value = 'koatest:activity:activity_id:' + activity.activity_id;

					log.debug('redis lpush Async called');
					let redisLpush = yield redis.lpushAsync(key, value);

					// keep the size of the timeline to 1000 at the maximum
					log.debug('redis ltrim Async called');
					let redisLtrim = yield redis.ltrimAsync(key, 0, 1000);

					// Not adding counter key because activity for timeline activity is only generated by the user
					// who will be consuming this data, and hence when the user will be consuming this data, there will 
					// be no new data generation and hence no problem or inconsistency in reading data from the redis list

					result = true;

				}
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});

		};


		let addActivityToTimelineActivity_Coroutine = bluebird.coroutine(addActivityToTimelineActivity_Generator);
		
		// run the coroutine
		return addActivityToTimelineActivity_Coroutine(type, source_id, activity);

	}






};
	




const ActivityCacheMixin = mixwith.Mixin(ActivityCacheBaseMixin);



module.exports = ActivityCacheMixin;



