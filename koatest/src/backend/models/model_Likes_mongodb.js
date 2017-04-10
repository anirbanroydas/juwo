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
// LikesSchema = {
// 
// 	// like_id: 'string',
// 	source_id: 'string',
// 	like_type: 'string',
// 	like_item_id: 'string',
// 	like_time: 'datetime'
// 	
// };
// 
// 
// like = {
// 
// 	// like_id: 13434343,
// 	source_id: 83493234,
// 	like_type: 'post',
// 	like_item_id: 3593434,
// 	like_time: '12 November 2016 12.04 pm'
// 	
// };
// 






				


const LikesModelBaseMixin = (superclass) => class LikesModel extends superclass { 

	

	get_collection(name) {
		return COLLECTIONS[name];
	}




	addLike(source_id, post) {

		let addLike_Generator = function *(self, source_id, post) {

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
		
		let addLike_Coroutine = bluebird.coroutine(addLike_Generator);

		// run the coroutine
		return addLike_Coroutine(this, source_id, post);
	
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







const LikesModelBase = mixwith.Mixin(LikesModelBaseMixin);
	



module.exports = LikesModelBase;






