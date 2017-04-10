const bluebird = require('bluebird');
const mixwith = require('mixwith');

const schema = require('./schema_mongodb');
const logger = require('../../lib/logger');
const CONFIG = require('../../lib/settings').CONFIG_DATA;



const log = logger.log;


const COLLECTIONS = schema.Collections;




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





const ActivitiesModelBaseMixin = (superclass) => class ActivitiesModel extends superclass { 

	

	get_collection(name) {
		return COLLECTIONS[name];
	}

	

	createActivityByType(type, source_id, relationship_id) {

		let createActivityByType_Generator = function *(self, type, source_id, relationship_id) {

			// gen activity id
			let activity_id = utils.genid(32);
			
			let activity_value, activity_info;
			
			if (type === 'follow') {
				activity_value = 'following';
			}
			else if (type === 'unfollow') {
				activity_value = 'unfollowing';
			}

			let activity = new self.get_collection('Activities')({
				activity_id: activity_id,
				source_id: source_id,
				relationship: {
					relationship_id: relationship_id,
					relationship_type: 'relationship'
				},
				activity_time: new Date.toLocaleString(),
				activity_value: activity_value,
				activity_type: 'relationship'
			});
			

			let save = yield activity.save();

		
			if (!save) {
				result = false;
			}
			else {
				// Add the activity to redis cache
				activity_info = activity.get();
				
				result = true;
			}

			return new bluebird(function(resolve, reject) {
				if (!result) {
					resolve(false);
				}
				else {
					resolve(activity_info);
				}
				
			});

		};
		
		let createActivityByType_Coroutine = bluebird.coroutine(createActivityByType_Generator);

		// run the coroutine
		return createActivityByType_Coroutine(this, type, source_id, relationship_id);
	
	}






};







const ActivitiesModelMixin = mixwith.Mixin(ActivitiesModelBaseMixin);
	



module.exports = ActivitiesModelMixin;






