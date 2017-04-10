const bluebird = require('bluebird');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
// const utils = require('./utils');
// const redis = require('./redisclient');
const DB = require('./db');
const activity = require('./activity_handler');
const cache = require('./cache_handler');


const log = logger.log;


const db = new DB();


//
// Sample Relationship document
// 
// RelationshipsSchema = {
// 		follower_id: 'string',
// 		following_id: 'string',
// };
// 
// 
// relationship = {
//     follower_id: 853818343,
//     following_id: 13435343,
// }
//





class Relationship {
	
	
	static follow(source_id, relationship_id) {
		
		let follow_Generator = function *(source_id, relationship_id) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}


				let isRelationshipAdded = yield db.addRelationshipBetween(source_id, relationship_id);

				if (!isRelationshipAdded) {

					result = false;
				}
				else {
					// now first atomically increment the followers and following count of source_id and relationshi_id users
					
					// update the following, followers count in redis cache					
					let relationships_count = yield cache.updateRelationshipsFollowCount(source_id, relationship_id);

					let source_user = yield db.getUserInstanceById(source_id);
					let relationship_user = yield db.getUserInstanceById(relationship_id);

					if (!source_user || !relationship_user) {
						result = false;
					}
					else {
						result = true;
						// increase the following count
						source_user.set('following.count', relationships_counts.following_count);						
						relationship_user.set('followers.count', relationships_counts.followers_count);
						
						let source_save = yield source_user.save();
						let relationship_save = yield relationship_user.save();

						if (!source_save || !relationship_save) {
							// even if info not save, not to worry since it is a normalized count, it will get
							// reflected once user gets followed/ or follows anybody again or by anyone
							result = true;
						}
						else {
							//////////////////
							// NOTE: Create activity only if its a Positive Activity like
							// relationship/follow(positive), relationship/unfollow(negative)
							// 
							// For negative activities, just do a plain log of data
							//////////////////
										
							// now since relationship created, its a postivite activity, hence create new activity
							let follow_activity = yield activity.create('follow', source_id, relationship_id);

							result = true;
						}

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


		let follow_Coroutine = bluebird.coroutine(follow_Generator);
		
		// run the coroutine
		return follow_Coroutine(source_id, relationship_id);
	}









	static unfollow(source_id, relationship_id) {
		
		let unfollow_Generator = function *(source_id, relationship_id) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// First Remove relationship from database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let isRelationshipRemoved = yield db.removeRelationshipBetween(source_id, relationship_id);


				if (!isRelationshipRemoved) {

					result = false;
				}
				else {
					// now first atomically decrement the followers and following count of source_id and relationshi_id users

					// update the following, followers count in redis cache					
					let relationships_count = yield cache.updateRelationshipsUnfollowCount(source_id, relationship_id);

					let source_user = yield db.getUserInstanceById(source_id);
					let relationship_user = yield db.getUserInstanceById(relationship_id);

					if (!source_user || !relationship_user) {
						result = false;
					}
					else {
						result = true;
						// decrease the following count
						source_user.set('following.count', relationships_counts.following_count);						
						relationship_user.set('followers.count', relationships_counts.followers_count);
						
						let source_save = yield source_user.save();
						let relationship_save = yield relationship_user.save();

						if (!source_save || !relationship_save) {
							// even if info not save, not to worry since it is a normalized count, it will get
							// reflected once user gets followed/ or follows anybody again or by anyone
							result = true;

						}
						else {
							//////////////////
							// NOTE: Create activity only if its a Positive Activity like
							// relationship/follow(positive), relationship/unfollow(negative)
							// 
							// For negative activities, just do a plain log of data
							//////////////////
							
							// now since relationship unfollow, and its a negative one hence not creating any activity
							// logging negative activity
							log.info('activity: unfollow, source_id: %s  relationship_id: %s', source_id, relationship_id);

							result = true;
						}

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


		let unfollow_Coroutine = bluebird.coroutine(unfollow_Generator);
		
		// run the coroutine
		return unfollow_Coroutine(source_id, relationship_id);
	}









	static getFollowingList(userid, cursor, count) {
		
		let getFollowingList_Generator = function *(userid, cursor, count) {
			let result = false;
			let following = [];
			
			try {
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				// get list of following from database
				users_following = yield db.getUserFollowingList(userid, cursor, count);

				for (let following_id of users_following) {
					let following_user = yield cache.getUserInfoFromCacheById(following_id);
					let following_u = {
						userid: following_user.userid,
						username: following_user.username,
						name: following_user.name,
						dp_thumbnail: following_user.dp_thumbnail
					}; 

					following.push(following_u);
				}

				result = true;	
				// following.cursor = cursor + count;					
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(following);
				}
				else {
					resolve(false);
				}				
			});

		};


		let getFollowingList_Coroutine = bluebird.coroutine(getFollowingList_Generator);
		
		// run the coroutine
		return getFollowingList_Coroutine(userid, cursor, count);
	}









	static getFollowersList(userid, cursor, count) {
		
		let getFollowersList_Generator = function *(userid, cursor, count) {
			let result = false;
			let followers = [];
			
			try {
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				// get list of following from database
				user_followers = yield db.getUserFollowersList(userid, cursor, count);

				for (let follower_id of user_followers) {
					let follower_user = yield cache.getUserInfoFromCacheById(user.follower_id);
					let follower_u = {
						userid: follower_user.userid,
						username: follower_user.username,
						name: follower_user.name,
						dp_thumbnail: follower_user.dp_thumbnail
					}; 

					followers.push(follower_u);
				}

				result = true;	
				// follower.cursor = cursor + count;					
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}


			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(followers);
				}
				else {
					resolve(false);
				}				
			});

		};


		let getFollowersList_Coroutine = bluebird.coroutine(getFollowersList_Generator);
		
		// run the coroutine
		return getFollowersList_Coroutine(userid, cursor, count);
	}







}
	





module.exports = Relationship;


