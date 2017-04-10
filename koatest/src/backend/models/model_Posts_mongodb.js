const bluebird = require('bluebird');
const mixwith = require('mixwith');

const schema = require('./schema_mongodb');
const logger = require('../../lib/logger');
const CONFIG = require('../../lib/settings').CONFIG_DATA;



const log = logger.log;


const COLLECTIONS = schema.Collections;



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





				


const PostsModelBaseMixin = (superclass) => class PostsModel extends superclass { 

	

	get_collection(name) {
		return COLLECTIONS[name];
	}




	createPost(source_id, post) {

		let createPost_Generator = function *(self, source_id, post) {

			let post_id = utils.gentid(32);

			let post_info = new self.get_collection('Posts')({
				post_id: post_id,
				source_id: userid,
				post_type: post.post_type,
				post_item_id: post.post_item_id,
				content: post.content,
				post_time: new Date.toLocaleString(),
				mentions: post.mentions,
				hashtags: post.hashtags,
				likes: {
					count: 0
				},
				shares: {
					count: 0
				},
				comments: {
					count: 0
				}

			});

			let save = yield post_info.save();

			if (!save) {

				result = false;
			}
			else {
				// Add the post to redis cache
				post_info = post_info.get();
				
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					resolve(post_info);
				}
				
			});

		};
		
		let createPost_Coroutine = bluebird.coroutine(createPost_Generator);

		// run the coroutine
		return createPost_Coroutine(this, source_id, post);
	
	}
	





	deletePost(post_id) {

		let deletePost_Generator = function *(self, post_id) {
			let result = false;

			let hasDeleted = yield self.get_collection('Posts').remove({post_id: post_id});

			if (!hasDeleted) {
				result = false;
			}
			else {	
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
				
			});

		};
		
		let deletePost_Coroutine = bluebird.coroutine(deletePost_Generator);

		// run the coroutine
		return deletePost_Coroutine(this, post_id);
	
	}







};







const PostsModelBase = mixwith.Mixin(PostsModelBaseMixin);
	



module.exports = PostsModelBase;






