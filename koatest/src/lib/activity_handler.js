const bluebird = require('bluebird');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const utils = require('./utils');
// const redis = require('./redisclient');
const DB = require('./db');
const cache = require('./cache_handler');


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




class Activity {
	
	
	static create(activity, source_id, ...args) {
		
		let create_Generator = function *(activity, source_id, args) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (activity === 'follow') {
					let relationship_id = args[0];
					
					let activity_follow = yield Activity.create_relationship('follow', source_id, relationship_id);

					if (!activity_follow) {
						result = false;
					}
					else {
						result = true;
					}
				}

				else if (activity === 'unfollow') {
					let relationship_id = args[0];

					let activity_unfollow = yield Activity.create_relationship('unfollow', source_id, relationship_id);

					if (!activity_unfollow) {
						result = false;
					}
					else {
						result = true;
					}
				}

				else if (activity === 'like') {
					let post = args[0];

					// let activity_like = yield Activity.create_like(source_id, post);

					// if (!activity_like) {
					// 	result = false;
					// }
					// else {
					// 	result = true;
					// }
				}

				else if (activity === 'unlike') {

					let post = args[0];


				}

				else if (activity === 'share') {

					let post = args[0];


				}

				else if (activity === 'comment') {

					let post = args[0];


				}

				else if (activity === 'profile_updated') {

					let old_userinfo = args[0];
					let new_user_info = args[1];

					let activity_profile_updated = yield Activity.create_profile_updated(source_id, old_userinfo, new_user_info);

					if (!activity_profile_updated) {
						result = false;
					}
					else {
						result = true;
					}

				}


				else if (activity === 'started_public_chat') {

					let activity_started_public_chat = yield Activity.create_chat_activity('started_public_chat', source_id);

					if (!activity_started_public_chat) {
						result = false;
					}
					else {
						result = true;
					}

				}


				else if (activity === 'stopped_public_chat') {

					let activity_stopped_public_chat = yield Activity.create_chat_activity('stopped_public_chat', source_id);

					if (!activity_stopped_public_chat) {
						result = false;
					}
					else {
						result = true;
					}

				}

				else if (activity === 'started_irc_chat') {
					
					let channel = args[0];

					let activity_started_irc_chat = yield Activity.create_chat_activity('started_irc_chat', source_id, channel);

					if (!activity_started_irc_chat) {
						result = false;
					}
					else {
						result = true;
					}

				}


				else if (activity === 'stopped_irc_chat') {

					let channel = args[0];

					let activity_stopped_irc_chat = yield Activity.create_chat_activity('stopped_irc_chat', source_id, channel);

					if (!activity_stopped_irc_chat) {
						result = false;
					}
					else {
						result = true;
					}
				}

				else if (activity === 'started_private_chat') {

					let activity_started_private_chat = yield Activity.create_chat_activity('started_private_chat', source_id);

					if (!activity_started_private_chat) {
						result = false;
					}
					else {
						result = true;
					}
				}


				else if (activity === 'stopped_private_chat') {

					let activity_stopped_private_chat = yield Activity.create_chat_activity('stopped_private_chat', source_id);

					if (!activity_stopped_private_chat) {
						result = false;
					}
					else {
						result = true;
					}
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


		let create_Coroutine = bluebird.coroutine(create_Generator);
		
		// run the coroutine
		return create_Coroutine(activity, source_id, args);
	}








	static create_relationship(type, source_id, relationship_id) {
		
		let create_relationship_Generator = function *(type, source_id, relationship_id) {
			// Add data to cache in redis
			let result = false;
			
			try {
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				// Add the activity to Database
				let activity_info = yield db.createActivityByType(type, source_id, relationship_id);
				
				if (!activity_info) {
					result = false;
				}
				else {
					// Add the activity to redis cache
					let activity_cache = yield cache.addActivityToCache(activity_info);

					if (activity_cache) {
						///////////////
						// NOTE : Don't add activity to feed or timeline of source or followers,
						// only posts go to feed and timeline.
						// Add activity to livestream, notifications and timeline_activity if you want
						///////////////

						// add activity to Timeline Activity secion of source_id
						let activity_to_timeline_activity_self = yield cache.addActivityToTimelineActivity('self', source_id, activity_info);
						// let activity_to_timeline_mentioned_users = yield cache.addActivityToTimeline('mentioned_users', source_id, activity_info);



						//////////////////
						// NOTE: Add activity to livestream and notification only if its a Positive Activity like
						// relationship/follow(positive), relationship/unfollow(negative)
						// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
						// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
						//////////////////
						
						if (type === 'follow') {
							// follow is a postive activity
							
							// add activity to Livestream of source_id and source's followers and relationship_id 
							let activity_to_livestream_self = yield cache.addActivityToLivestream('self', source_id, activity_info);
							let activity_to_livestream_followers = yield cache.addActivityToLivestream('followers', source_id, activity_info);
							// let activity_to_livestream_realtionshipid_self = yield cache.addActivityToLivestream('self', relationship_id, activity_info);
							
							
							// add activity to Notification of relationship_id
							let activity_to_notification_self = yield cache.addActivityToNotification('self', relationship_id, activity_info);					
							//let activity_to_timeline_notification_tagged = yield cache.addActivityToNotification('tagged_users', activity_info.tagged_ids, activity_id, activity_info);
						}
							
						result = true;

					}
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


		let create_relationship_Coroutine = bluebird.coroutine(create_relationship_Generator);
		
		// run the coroutine
		return create_relationship_Coroutine(type, source_id, relationship_id);
	}









	static create_profile_updated(source_id, old_userinfo, new_user_info) {
		
		let create_profile_updated_Generator = function *(source_id, old_userinfo, new_user_info) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// gen activity id
				let activity_id = utils.genid(32);

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let relationship = {};
				relationship.type = 'profile_updated'

				if (old_userinfo.name !== new_user_info.name) {
					relationship.name = {
						from: old_userinfo.name,
						to: new_user_info.name
					};
				}
				if (old_userinfo.username !== new_user_info.username) {
					relationship.username = {
						from: old_userinfo.username,
						to: new_user_info.username
					};
				}
				if (old_userinfo.bio !== new_user_info.bio) {
					relationship.bio = {
						updated: new_user_info.bio
					};
				}


				let activity = new db.get_collection('Activities')({
					activity_id: activity_id,
					source_userid: source_id,
					relationship: relationship,
					creation_time: new Date.toLocaleString(),
					value: 'profile_updated',
					type: 'activity'
				});

				let save = yield activity.save();

				// Add the activity to redis cache
				let activity_info = activity.get();
				
				let activity_cache = yield cache.addActivityToCache(activity_id, activity_info);

				if (activity_cache) {
					///////////////
					// NOTE : Generally don't add activity to feed of source and followers,
					// only posts go to feed list. but for now even add activities to feed list
					///////////////
					
					//  add activity to Feed Home of source_id, source id's followers
					// let activity_to_feed_self = yield cache.addActivityToFeed('self', source_id, activity_id, activity_info);
					let activity_to_feed_followers = yield cache.addActivityToFeed('followers', source_id, activity_id, activity_info);

					///////////////
					// NOTE : Generally don't add activity to timeline, 
					// only posts go to timeline list. but for now even add activities to timeline list
					///////////////

					// add activity to Timeline of source_id and taged_users
					// let activity_to_timeline_self = yield cache.addActivityToTimeline('self', source_id, activity_id, activity_info);
					// let activity_to_timeline_self = yield cache.addActivityToTimeline('tagged_users', activity_info.tagged_ids,, activity_id, activity_info);

					
					// add activity to Livestream of source_id and source's followers
					let activity_to_livestream_self = yield cache.addActivityToLivestream('self', source_id, activity_id, activity_info);
					let activity_to_livestream_followers = yield cache.addActivityToLivestream('followers', source_id, activity_id, activity_info);
					
					
					// add activity to Notification of relationship_id
					// let activity_to_notification_self = yield cache.addActivityToNotification('self', relationship_id, activity_id, activity_info);					
					//let activity_to_timeline_notification_tagged = yield cache.addActivityToNotification('tagged_users', activity_info.tagged_ids, activity_id, activity_info);
				
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


		let create_profile_updated_Coroutine = bluebird.coroutine(create_profile_updated_Generator);
		
		// run the coroutine
		return create_profile_updated_Coroutine(source_id, old_userinfo, new_user_info);
	}










	static create_chat_activity(type, source_id, channel) {
		
		let create_chat_activity_Generator = function *(type, source_id, user, channel) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// gen activity id
				let activity_id = utils.genid(32);

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let activity_value, relationship;
				
				if (type === 'started_public_chat') {
					activity_value = 'started_public_chat';
					relationship = {
						relationship_type: 'chat_public_activity',
					};
				}
				else if (type === 'stopped_public_chat') {
					activity_value = 'stopped_public_chat';
					relationship = {
						relationship_type: 'chat_public_activity',
					};
				}
				else if (type === 'started_irc_chat') {
					activity_value = 'started_irc_chat';
					relationship = {
						relationship_type: 'chat_irc_activity',
						channel: channel
					};
				}
				else if (type === 'stopped_irc_chat') {
					activity_value = 'stopped_irc_chat';
					relationship = {
						relationship_type: 'chat_irc_activity',
						channel: channel
					};
				}
				else if (type === 'started_private_chat') {
					activity_value = 'started_private_chat';
					relationship = {
						relationship_type: 'chat_private_activity',
					};
				}
				else if (type === 'stopped_private_chat') {
					activity_value = 'stopped_private_chat';
					relationship = {
						relationship_type: 'chat_private_activity',
					};
				}

				let activity = new db.get_collection('Activities')({
					activity_id: activity_id,
					source_userid: source_id,
					relationship: relationship,
					creation_time: new Date.toLocaleString(),
					value: activity_value,
					type: 'activity'
				});

				let save = yield activity.save();

				// Add the activity to redis cache
				let activity_info = activity.get();
				
				let activity_cache = yield cache.addActivityToCache(activity_id, activity_info);

				if (activity_cache) {
					///////////////
					// NOTE : Generally don't add activity to feed of source and followers,
					// only posts go to feed list. but for now even add activities to feed list
					///////////////
					
					//  add activity to Feed Home of source_id, source id's followers
					// let activity_to_feed_self = yield cache.addActivityToFeed('self', source_id, activity_id, activity_info);
					let activity_to_feed_followers = yield cache.addActivityToFeed('followers', source_id, activity_id, activity_info);

					///////////////
					// NOTE : Generally don't add activity to timeline, 
					// only posts go to timeline list. but for now even add activities to timeline list
					///////////////

					// add activity to Timeline of source_id and taged_users
					// let activity_to_timeline_self = yield cache.addActivityToTimeline('self', source_id, activity_id, activity_info);
					// let activity_to_timeline_self = yield cache.addActivityToTimeline('tagged_users', activity_info.tagged_ids,, activity_id, activity_info);

					
					// add activity to Livestream of source_id and source's followers
					let activity_to_livestream_self = yield cache.addActivityToLivestream('self', source_id, activity_id, activity_info);
					let activity_to_livestream_followers = yield cache.addActivityToLivestream('followers', source_id, activity_id, activity_info);
					
					
					// add activity to Notification of relationship_id
					// let activity_to_notification_self = yield cache.addActivityToNotification('self', relationship_id, activity_id, activity_info);					
					//let activity_to_timeline_notification_tagged = yield cache.addActivityToNotification('tagged_users', activity_info.tagged_ids, activity_id, activity_info);
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


		let create_chat_activity_Coroutine = bluebird.coroutine(create_chat_activity_Generator);
		
		// run the coroutine
		return create_chat_activity_Coroutine(type, source_id, user, channel);
	}





}
	





module.exports = Activity;


