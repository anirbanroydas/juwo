const bluebird = require('bluebird');
const mixwith = require('mixwith');

const schema = require('./schema_mongodb');
const logger = require('../../lib/logger');
const CONFIG = require('../../lib/settings').CONFIG_DATA;



const log = logger.log;


const COLLECTIONS = schema.Collections;



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




const RelationshipsModelBaseMixin = (superclass) => class RelationshipsModel extends superclass { 

	

	get_collection(name) {
		return COLLECTIONS[name];
	}

	



	getUserRelationshipsListByType(type, userid, cursor, count) {

		let getUserRelationshipsListByType_Generator = function *(self, type, userid, cursor, count) {

			let result = false;
			let relationshipsList = [];
			let users, key;
			
			if (type === 'following') {
				key = 'following_id';
				query = self.get_collection('Relationships').include('following_id').exclude('_id').where('follower_id').equals(userid);
			}
			else if (type === 'followers') {
				key = 'follower_id';
				query = self.get_collection('Relationships').include('follower_id').exclude('_id').where('following_id').equals(userid);
			}

			if (cursor) {
				query = query.skip(cursor);
			}
			if (count) {
				query = query.limit(count);
			}

			users = yield query.find();
			

			if (!users) {
				result = false;
			}
			else {
				for (let user of users) {
					user = user.get();
					relationshipsList.push(user.key);
				}
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					resolve(relationshipsList);
				}
				
			});

		};
		
		let getUserRelationshipsListByType_Coroutine = bluebird.coroutine(getUserRelationshipsListByType_Generator);

		// run the coroutine
		return getUserRelationshipsListByType_Coroutine(this, type, userid, cursor, count);
	
	}






	getUserFollowingList(userid, cursor, count) {

		return this.getUserRelationshipsListByType('following', userid, cursor, count);
	
	}



	getUserFollowersList(userid, cursor, count) {

		return this.getUserRelationshipsListByType('followers', userid, cursor, count);
	
	}







	addRelationshipBetween(follower_id, following_id) {

		let addRelationshipBetween_Generator = function *(self, follower_id, following_id) {

			let result = false;

			let relationship = new self.get_collection('Relationships')({
				follower_id: source_id,
				following_id: relationship_id
			});

			let save = yield relationship.save();
			

			if (!save) {
				result = false;
			}
			else {
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
				
			});

		};
		
		let addRelationshipBetween_Coroutine = bluebird.coroutine(addRelationshipBetween_Generator);

		// run the coroutine
		return addRelationshipBetween_Coroutine(this, follower_id, following_id);
	
	}



	


	removeRelationshipBetween(follower_id, following_id) {

		let removeRelationshipBetween_Generator = function *(self, follower_id, following_id) {

			let result = false;

			let hasRemoved = yield self.get_collection('Relationships').remove({follower_id: follower_id, following_id: following_id});
			

			if (!hasRemoved) {
				result = false;
			}
			else {
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
				
			});

		};
		
		let removeRelationshipBetween_Coroutine = bluebird.coroutine(removeRelationshipBetween_Generator);

		// run the coroutine
		return removeRelationshipBetween_Coroutine(this, follower_id, following_id);
	
	}





};







const RelationshipsModelMixin = mixwith.Mixin(RelationshipsModelBaseMixin);
	



module.exports = RelationshipsModelMixin;






