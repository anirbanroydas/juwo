const bluebird = require('bluebird');
const mixwith = require('mixwith');
const mongorito = require('mongorito');

const schema = require('./schema_mongodb');
const UsersModelMixin = require('./model_Users_mongodb');
const RelationshipsModelMixin = require('./model_Relationships_mongodb');
const ActivitiesModelMixin = require('./model_Activities_mongodb');
const logger = require('../../lib/logger');
const CONFIG = require('../../lib/settings').CONFIG_DATA;





const log = logger.log;




const COLLECTIONS = schema.Collections;
const mix = mixwith.mix;







class BaseDummySuperClass {
	// A dummy super class so that it can be used to mix with other mixins
}




class DB extends  mix(BaseDummySuperClass).with(UsersModelMixin, RelationshipsModelMixin, ActivitiesModelMixin) {
	

	constructor(dbname, username, password, base_collection, collections) {

		if (typeof dbname !== 'string' && !!dbname) {
			log.error('A database name can only be string');
			throw new Error('A database name can only be string');
		}
		
		this.dbname = dbname || CONFIG.db.mongodb.dbname;
		
		if (typeof username !== 'string' && !!username) {
			log.error('A database username can only be string');
			throw new Error('A database username can only be string');
		}

		this.username = username || CONFIG.db.mongodb.auth.username || '';

		if (typeof password !== 'string' && !!password) {
			log.error('A database password can only be string');
			throw new Error('A database password can only be string');
		}

		this.password = password || CONFIG.db.mongodb.auth.password || '';

		if (typeof base_collection !== 'string' && !!base_collection) {
			log.error('A database cannot be without atleast one Collection');
			throw new Error('A database cannot be without atleast one Collection');
		}

		this.base_collection = COLLECTIONS[base_collection] || CONFIG.db.mongodb.base_collection || COLLECTIONS.default ;	
		
		if (typeof collections !== 'object' && !!collections) {
			log.error('collections should of object type with key as collections name and value as collection which extends Module');
			throw new Error('collections should of object type with key as collections name and value as collection which extends Module');
		}

		this.COLLECTIONS = collections || COLLECTIONS;	
		
		DB._connected = DB._connected || {};
		DB._connected[this.dbname] = DB._connected[this.dbname] || false;	
				
	}



	

	connect() {
		if (!DB._connected[this.dbname]) {
			let connection_url;
		
			if (this.username && this.password) {
				connection_url = 'mongodb://' + this.username + ':' + this.password + '@localhost/' + this.dbname;
			}
			else {
				connection_url = 'mongodb://localhost/' + this.dbname;
			}
			
			log.debug('conencction_url : ', connection_url);

			DB._connected[this.dbname] = true;
			return mongorito.connect(connection_url);	
		}
		else {
			return new bluebird(function(resolve, reject) {
				resolve(true);
			});
		}
				
	}





	disconnect() {
		if (DB._connected[this.dbname]) {
			DB._connected[this.dbname] = false;
			return mongorito.disconnect();	
		}
		else {
			return new bluebird(function(resolve, reject) {
				resolve(true);
			});
		}
			
	}





	get connected() {
		return DB._connected[this.dbname];
	}


	get collection() {
		return this.base_collection;
	}


	get model() {
		return this.base_collection;
	}



	get_collection(name) {
		return this.COLLECTIONS[name];
	}





	create_index(collection, unique, ...fields) {
		let create_indexGenerator = function *(self, collection, unique, ...fields) {
			
			let result = false;

			if (DB._connected[self.dbname]) {
				result = true;
				
				try {
					if (!collection) {
						collection = self.collection;
					}
					log.debug('colletion : ', collection);
					
					// check if uniquer or not
					if (typeof unique === 'string') {
						fields.push(unique);
						unique = false;
					}
					log.debug('unique : ', unique);
					log.debug('fields : ', fields);
					
					for (let field of fields) {
						let setindex = yield collection.index(field, {unique: unique});
						log.debug('index ' + field + 'created -> index : '. setindex);
					}
					log.info('indexes created for fields : ', fields);
				}
				catch (err) {
					log.error('Error in creating indexes : ', err);
					result = false;
				}
			}
			

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});
			
		};

		let create_indexCoroutine = bluebird.coroutine(create_indexGenerator);

		// run the coroutine now;
		return create_indexCoroutine(this, collection, unique, ...fields);
	}







}





module.exports = DB;


