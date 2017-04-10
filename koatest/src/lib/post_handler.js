const bluebird = require('bluebird');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const utils = require('./utils');
// const redis = require('./redisclient');
const DB = require('./db');
const activity = require('./activity_handler');
const cache = require('./cache_handler');


const log = logger.log;


const db = new DB();



//
// Sample post document
// 
// PostsSchema = {
// 		post_id: 'string',
// 		source_id: 'string',
// 		post_type: 'string',
// 		post_item_id: 'string',
// 		content: 'string',
// 		post_time: 'datetime',
// 		mentions: {'mention_name': [exists<boolean>, 'userid', 'username', 'name', 'position']},
// 		hashtags: {
// 			'tagname': 'position<hashtag_position>'
// 		},
// 		likes: {
// 			count: 'integer'
// 		},
// 		shares: {
// 			count: 'integer'
// 		},
// 		comments: {
// 			count: 'integer'
// 		}
// };
// 
// 
// post = {
//     post_id: 853818343,
//     source_id: 13435343,
//     post_type: 'original/shared/comment',
//     post_item_id: 'null/83920348<shared_post_id>/9384934<comment_id>',
//     content: "What is your interest in @samuelackhtar's new business, why pry? @janedoes @ivirganner please note this. #nopry #getalife",
//     post_time: '12 November 2016 12.04 pm',
//     mentions: {
//     		samuelackhtar: [true, 2343234, 'samuelackhtar', 'Samuel Ackhtar', 6], 
//     		janedoes: [true, 3458392, 'janedoes', 'Jane Doesymal', 11],
//     		ivirganner: [false]
//     }
//     hastags: {
//     		nopry: 16,
//     		getalife: 17
//     },
//     likes: {
//     		count: 7	
//     }
//     shares: {
//     		count: 2	
//     }
//     comments: {
//     		count: 3	
//     }
// }
// 



class Post {
	
	
	static create(source_id, post) {
		
		let create_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let post_info = db.createPost(source_id, post);

				if (!post_info) {
					result = false;
				}
				else {				
					// Add the post to redis cache
					let post_cache = yield cache.addPostToCache(post_info);

					if (post_cache) {
						///////////////
						// NOTE : Don't add post to livestream or notification or timeline activity,
						// only activities go to livestream or notification or timeline activity.
						// Add post only to Feed or Timeline if you want.
						///////////////
						
						//  add post to Feed Home of source_id, source id's followers
						let post_to_feed_self = yield cache.addPostToFeed('self', source_id, post_info);
						let post_to_feed_followers = yield cache.addPostToFeed('followers', source_id, post_info);


						// add post to Timeline of source_id and mentioned_ids in the post
						let post_to_timeline_self = yield cache.addPostToTimeline('self', source_id, post_info);
						let post_to_timeline_mentioned_users = yield cache.addPostToTimeline('mentioned_users', source_id, post_info);
				
						//////////////////
						// NOTE: Create activity only if its a Positive Activity like
						// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
						// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
						// 
						// For negative activities, just do a plain log of data
						//////////////////

						// now since post creted, its a postive activity, hence create new activity
						let post_activity = yield activity.create('post_created', source_id, post);
								
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
		return create_Coroutine(source_id, post);

	}









	static delete(source_id, post) {
		
		let delete_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}


				let hadDeleted = yield db.deletePost(post.post_id);

				if (!hadDeleted) {

					result = false;
				}
				else {
					// Remove the post from redis cache
					let post_cache = yield cache.removePostFromCache(post);

					//////////////////
					// NOTE: Create activity only if its a Positive Activity like
					// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
					// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
					// 
					// For negative activities, just do a plain log of data
					//////////////////

					// now since post removed, its a negative activity, hence don't create new activity
					// log the activity
					log.info('activity: post_deleted, source_id: %s  post_id: %s', source_id, post.post_id);

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


		let delete_Coroutine = bluebird.coroutine(delete_Generator);
		
		// run the coroutine
		return delete_Coroutine(source_id, post);

	}









	static like(source_id, post) {
		
		let like_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// First add Like info in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let like_info = db.addLike(source_id, post);

				if (!like_info) {
					result = false;
				}
				else {	
					// update like count atomically in redis cache
					let like_count = cache.updatePostLikeCount('add', post.post_id);

					// update like count of post in database
					let like_count_post_db = db.updatePostByType('likes_count', post.post_id, like_count);

					// update post in redis cache by updating like count
					let like_count_post_cache = cache.updatePostByType('likes_count', post.post_id, like_count);			
					

					//////////////////
					// NOTE: Create activity only if its a Positive Activity like
					// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
					// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
					// 
					// For negative activities, just do a plain log of data
					//////////////////

					// now since post liked, its a postive activity, hence create new activity
					let post_like_activity = yield activity.create('post_liked', source_id, post, like_info.like_time);
							
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


		let like_Coroutine = bluebird.coroutine(like_Generator);
		
		// run the coroutine
		return like_Coroutine(source_id, post);

	}









	static unlike(source_id, post) {
		
		let unlike_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}


				let hadDeleted = yield db.removeLike(source_id, post);

				if (!hadDeleted) {

					result = false;
				}
				else {
					// update like count atomically in redis cache
					let like_count = cache.updatePostLikeCount('remove', post.post_id);

					// update like count of post in database
					let like_count_post_db = db.updatePostByType('likes_count', post.post_id, like_count);

					// update post in redis cache by updating like count
					let like_count_post_cache = cache.updatePostByType('likes_count', post.post_id, like_count);			
					

					//////////////////
					// NOTE: Create activity only if its a Positive Activity like
					// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
					// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
					// 
					// For negative activities, just do a plain log of data
					//////////////////

					// now since post unlike, its a negative activity, hence not creating any activity
					// log the ativity
					log.info('activity: post_unliked, source_id: %s  post_id: %s', source_id, post.post_id);

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


		let unlike_Coroutine = bluebird.coroutine(unlike_Generator);
		
		// run the coroutine
		return unlike_Coroutine(source_id, post);

	}








	static share(source_id, post) {
		
		let share_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {
				// First add Like info in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}

				let shared_post = db.createShare(source_id, post);

				if (!shared_post) {
					result = false;
				}
				else {	
					// Add the shared post to redis cache
					let shared_post_cache = yield cache.addPostToCache(shared_post);

					if (shared_post_cache) {
						// update share count atomically in redis cache of original post
						let share_count = cache.updatePostShareCount('add', post.post_id);

						// update share count of post in database of original post
						let share_count_post_db = db.updatePostByType('shares_count', post.post_id, share_count);

						// update post in redis cache by updating share count of original post
						let share_count_post_cache = cache.updatePostByType('shares_count', post.post_id, share_count);
						
						///////////////
						// NOTE : Don't add post to livestream or notification or timeline activity,
						// only activities go to livestream or notification or timeline activity.
						// Add post only to Feed or Timeline if you want.
						///////////////
						
						//  add post to Feed Home of source_id, source id's followers
						let shared_post_to_feed_self = yield cache.addPostToFeed('self', source_id, shared_post);
						let shared_post_to_feed_followers = yield cache.addPostToFeed('followers', source_id, shared_post);


						// add post to Timeline of source_id and mentioned_ids in the post
						let shared_post_to_timeline_self = yield cache.addPostToTimeline('self', source_id, shared_post);
						let shared_post_to_timeline_mentioned_users = yield cache.addPostToTimeline('mentioned_users', source_id, shared_post);
				
						//////////////////
						// NOTE: Create activity only if its a Positive Activity like
						// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
						// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
						// 
						// For negative activities, just do a plain log of data
						//////////////////

						// now since post shared, its a postive activity, hence create new activity
						let shared_post_activity = yield activity.create('post_shared', source_id, shared_post);
								
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


		let share_Coroutine = bluebird.coroutine(share_Generator);
		
		// run the coroutine
		return share_Coroutine(source_id, post);

	}









	static comment_add(source_id, post) {
		
		let comment_add_Generator = function *(source_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {

				// First add relationship in database
				if (!db.connected) {
					// db not connected yet to this databse, hence first connect
					let db_instance = yield db.connect();
				}


				let comment_info = db.addComment(source_id, post);

				if (!comment_info) {
					result = false;
				}
				else {	
					// update comment count atomically in redis cache
					let comment_count = cache.updatePostLikeCount('add', post.post_id);

					// update comment count of post in database
					let comment_count_post_db = db.updatePostByType('comments_count', post.post_id, comment_count);

					// update post in redis cache by updating comment count
					let comment_count_post_cache = cache.updatePostByType('comments_count', post.post_id, comment_count);			
					

					//////////////////
					// NOTE: Create activity only if its a Positive Activity like
					// post/create(positive), post/delete(negative), post/like(positive), post/unlike(negative), 
					// post/share(positive), post/comment/add(positive), post/comment/remove(negative)
					// 
					// For negative activities, just do a plain log of data
					//////////////////

					// now since post liked, its a postive activity, hence create new activity
					let post_like_activity = yield activity.create('post_liked', source_id, post, like_info.like_time);
							
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


		let comment_add_Coroutine = bluebird.coroutine(comment_add_Generator);
		
		// run the coroutine
		return comment_add_Coroutine(source_id, post);

	}







}
	





module.exports = Post;


