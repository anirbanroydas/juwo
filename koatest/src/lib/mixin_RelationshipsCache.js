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




const RelationshipsCacheBaseMixin = (superclass) => class RelationshipsCache extends superclass { 



	static updateRelationhipsCountByType(type, source_id, relationship_id) {

		let updateRelationhipsCountByType_Generator = function *(type, source_id, relationship_id) {
			// Add data to cache in redis
			let result = false;
			let followers_count, following_count;
			
			try {
				// update the following, followers count in redis cache
					
				following_count_key = 'koatest:user:following:count:source_id:' + source_id;
				followers_count_key = 'koatest:user:followers:count:source_id:' + relationship_id;
				

				if (type === 'follow') {
					following_count = yield redis.incr(following_count_key);
					followers_count = yield redis.incr(followers_count_key);
				}
				else if (kind === 'unfollow') {
					following_count = yield redis.decr(following_count_key);
					followers_count = yield redis.decr(followers_count_key);
				}

				result = true;
			
			}
			catch (err) {
				log.error('Error : ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					let res = {
						following_count: following_count,
						followers_count: followers_count
					};
					
					resolve(res);
				}
				
			});

		};


		let updateRelationhipsCountByType_Coroutine = bluebird.coroutine(updateRelationhipsCountByType_Generator);
		
		// run the coroutine
		return updateRelationhipsCountByType_Coroutine(type, source_id, relationship_id);

	}







	static updateRelationhipsFollowCount(source_id, relationship_id) {

		return RelationshipsCache.updateRelationhipCountByType('follow', source_id, relationship_id);

	}


	static updateRelationhipsUnfollowCount(source_id, relationship_id) {

		return RelationshipsCache.updateRelationhipCountByType('unfollow', source_id, relationship_id);

	}





};






const RelationshipsCacheMixin = mixwith.Mixin(RelationshipsCacheBaseMixin);
	



module.exports = RelationshipsCacheMixin;


