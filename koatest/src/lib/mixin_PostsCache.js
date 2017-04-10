const bluebird = require('bluebird');
const mixwith = require('mixwith');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const pubsub = require('./pubsub');
const redis = require('./redisclient');
const DB = require('./db');

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
// 




const PostsCacheBaseMixin = (superclass) => class PostsCache extends superclass { 



	static addPostToCache(post_id, post) {

		let addPostToCache_Generator = function *(post_id, post) {
			// Add data to cache in redis
			let result = false;
			
			try {

				if (typeof post !== 'object') {
					post = JSON.parse(post);
				}
				
				let key = 'koatest:post:' + post_id;


				let value = JSON.stringify(post);

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


		let addPostToCache_Coroutine = bluebird.coroutine(addPostToCache_Generator);
		
		// run the coroutine
		return addPostToCache_Coroutine(post_id, post);

	}






};






const PostsCacheMixin = mixwith.Mixin(PostsCacheBaseMixin);
	



module.exports = PostsCacheMixin;


