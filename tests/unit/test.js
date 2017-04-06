#!/usr/bin/env node 

// const argv = require('yargs')
//     .usage('Usage: $0 [options]')
//     .example('$0 -p 9091', 'start koatest app at port number 9091')
//     .alias('p', 'port')
//     .default('p', 9000)
//     .nargs('p', 1)
//     .describe('p', 'Port number to listen at')
//     //.demand(1, ['f'])
//     .help('h')
//     .alias('h', 'help')
//     .epilog('Anirban Roy Das, copyright 2016')
//     .argv;
// const koa = require('koa');
// const app = koa();
// const views = require('koa-views'); 
// const router = require('koa-router'); 
// const api = router();
// const bluebird = require('bluebird');
// const sodium = require("sodium");
// const _ = require('lodash');
// const URLSafeBase64 = require('urlsafe-base64');
// const redis = bluebird.promisifyAll(require('redis'));

// const copy = require('copy-to');
// const readDir = require('fs-readdir-recursive');
// const path = require('path');
// 
// 
// require('marko/node-require').install();

// const marko =  require('marko');

// let srcDir = path.join(__dirname, '../../', 'public/templates');

// let render_marko = function *(name) {
// 	let templatePath = path.join(srcDir, name + '.marko');
// 	let template = marko.load(templatePath, {writeToDisk: false});

// 	template.stream(option);
// };

// function marko_template(srcDir) {
// 	return function *(next) {
// 		if (this.render_marko) {
// 			yield next;
// 		}

// 		this.render_marko = function(name, opts) {
// 			let templatePath = path.join(srcDir, name + '.marko');
// 			let template = marko.load(templatePath, {writeToDisk: false});

// 			return template.stream(opts);
// 		};

// 		yield next;
// 	};
// }

// module.exports = marko_template;



// var koa = require('koa');
 
// var app = koa();
 
// app.use(function *(next) {
//     this.body = this.render_marko('home', {
//             name: 'Frank',
//             count: 30,
//             colors: ['red', 'green', 'blue']
//         });

//     yield next;
// });

// app.listen(8080);

// Must be used before any router is used
// app.use(views(__dirname + '/tests', { extension: 'html' })); 


// const indexApi = require('./src/backend/routes/indexRoute');
// const chatApi = require('./src/backend/routes/chatRoute');

// const indexView = require('./src/backend/views/indexView');
// const chatView = require('./src/backend/views/chatView');



// Middleware for rendering templates
// let render = views(__dirname + '/src/client/templates', {
// 	// map: {
//   	//   html: 'handlebars'
//   	// }, 
//   	extension: 'html'
// });


// Must be used before any router is used
// app.use(views(__dirname + '/src/client/templates', { extension: 'html' }));



// logger
// app.use(function *(next) {
//   	let start = new Date;
//   	console.log('the request started here...')
//   	try {
//   		yield next;
//   	}
//   	catch(err) {
//   		console.log('Unable to cascade to next middleware');
//   		process.exit(1);
//   	}
  	
//   	let ms = new Date - start;
//   	console.log(`${this.method}, ${this.url}, ${ms}`);
// });


// response
// app.use(function *(){
//   	this.body = 'Hello World';
// });

// let IndexHandler = function *(next) {
// 	console.log('Entered IndexHandler'); 
// 	this.state = {
//     	session: this.session,
//     	title: 'koatest index'
//   	};

//   	// yield this.render('index');
//   	this.body = 'Ths is indexHanler';
// }


// let ChatHandler = function *(next) {
// 	console.log('Entered ChatHandler'); 
// 	this.state = {
//     	session: this.session,
//     	title: 'koatest chat'
//   	};

//   	// yield this.render('user', {user: 'John'});
//   	this.body = 'this is ChatHandler';
// }

// app.use(function *(next){
// 	console.log('IndexHandler : ', indexView.IndexHandler); 
// 	console.log('type of IndexHandler : ', typeof(indexView.IndexHandler));
// 	console.log('ChatHandler : ', chatView.ChatHandler); 
// 	console.log('type of ChatHandler : ', typeof(chatView.ChatHandler)); 
// 	yield next;
// })


// api.get('/', IndexHandler); 
// api.get('/chat', ChatHandler);

// Use the routes 
// app.use(indexApi.routes());
// app.use(indexApi.allowedMethods()); 
// app.use(chatApi.routes());
// app.use(chatApi.allowedMethods()); 

// Must be used before any router is used
// app.use(views(__dirname + '/tests', {
//   extension: 'html'
// }));

// app.use(function* (next) {
//   this.state = {
//     session: this.session,
//     title: 'koatest testing app'
//   };

//   yield this.render('index');
// });


// // start server / start listening
// app.listen(argv.port, () =>{
// 	console.log(`App started at 127:0.0.1:${argv.port}`);
// });


// function genid(n) {
//     let buff = new Buffer(n);
//     console.log('buffer before : ', buff);
//     sodium.api.randombytes_buf(buff, n);
//     // return sodium.api.randombytes_random();
//     console.log('buffer after : ', buff);
//     // let buff_b64string = buff.toString('base64');
//     console.log('buff after b64 encoding default: ', buff.toString('base64'));
//     let buff_b64string = URLSafeBase64.encode(buff);
//     console.log('buff after url safe b64 encoding : ', buff_b64string);
//     // let urlsafe_id = base64.(buff_b64string, new RegExp())
//     // return b.toString('base64').replace(/=/g, 'q').replace(new RegEx, '-').replace('+', '_');
//     // if (this === undefined){
//     //   console.log('yes');
//     // }
//     // else{
//     //   console.log('no');
//     // }
//     return buff_b64string;
// }

// // let newgenid = genid.bind(undefined, 32);
// let newgenid = _.partial(genid, 32);

// console.log('calling genid ');
// let sid = newgenid();
// console.log('sid : ', sid);
// console.log('type of sid : ', typeof(sid));


// function retryStrategy(options) {
//     console.log('retryStrategy Called');
//     console.log('options.error : ', options.error);
//     console.log('options.total_retry_time : ', options.total_retry_time);
//     console.log('options.times_connected : ', options.times_connected);
//     console.log('options.attempt : ', options.attempt);
//     // if (options.error  && options.error.code === 'ECONNREFUSED') {
//     //     // End reconnecting on a specific error and flush all commands with a individual error
//     //     return new Error('The server refused the connection');
//     // }
//     if (options.total_retry_time > 1000 * 60 * 60) {
//         // End reconnecting after a specific timeout and flush all commands with a individual error
//         return new Error('Retry time exhausted');
//     }
//     if (options.times_connected > 10) {
//         // End reconnecting with built in error
//         return undefined;
//     }
//     if (options.attempt > 30) {
//         // End reconnecting with built in error
//         return undefined;
//     }
    
//     // reconnect after (Backoff mechanism)
//     return Math.max(options.attempt * 100, 3000);
// }


// // Options for redis clinet
// let redisClient_Options = {
//   host: '127.0.0.1',               // IP address of the Redis server 
//   port: 6379,                   // Port of the Redis server
//   // path: '/usr/loca/var/run/redis/redis.sock',   // The UNIX socket string of the Redis server
//   return_buffers: false,              // If set to true, then all replies will be sent to callbacks as 
//                                       // Buffers instead of Strings.
//   detect_buffers: false,              // If set to true, then replies will be sent to callbacks as Buffers. 
//                                     // This option lets you switch between Buffers and Strings on a per-command basis, 
//                                     // whereas return_buffers applies to every command on a client. Note: This 
//                                     // doesn't work properly with the pubsub mode. A subscriber has to either always 
//                                     // return Strings or Buffers.
//   socket_keepalive: true,             // If set to true, the keep-alive functionality is enabled on the underlying socket.
//   no_ready_check: false,              // When a connection is established to the Redis server, the server might still be 
//                                       // loading the database from disk. While loading, the server will not respond to 
//                                       // any commands. To work around this, node_redis has a "ready check" which sends 
//                                       // the INFO command to the server. The response from the INFO command indicates 
//                                       // whether the server is ready for more commands. When ready, node_redis emits a 
//                                       // ready event. Setting no_ready_check to true will inhibit this check.
//   enable_offline_queue: true,           // By default, if there is no active connection to the Redis server, commands are 
//                                         // added to a queue and are executed once the connection has been established. 
//                                         // Setting enable_offline_queue to false will disable this feature and the callback 
//                                         // will be executed immediately with an error, or an error will be emitted if no 
//                                         // callback is specified.
//   retry_unfulfilled_commands: false,        // If set to true, all commands that were unfulfilled while the connection is lost 
//                                             // will be retried after the connection has been reestablished. Use this with caution 
//                                             // if you use state altering commands (e.g. incr). This is especially useful if you 
//                                             // use blocking commands.
//   password: `2b1xwLp-Rzl8Xq4SgtznV5iSawLISzYczTTO40Dayio`,          // If set, client will run Redis auth command on connect. Alias auth_pass Note 
//                                         // node_redis < 2.5 must use auth_pass
//   db: 0,                      // If set, client will run Redis select command on connect.
//   disable_resubscribing: false,           // If set to true, a client won't resubscribe after disconnecting.
//   retry_strategy: retryStrategy         // A function that receives an options object as parameter including the retry attempt, 
//                                         // the total_retry_time indicating how much time passed since the last time connected, 
//                                         // the error why the connection was lost and the number of times_connected in total. 
//                                         // If you return a number from this function, the retry will happen exactly after that 
//                                         // time in milliseconds. If you return a non-number, no further retry will happen and 
//                                         // all offline commands are flushed with errors. Return an error to return that specific 
//                                         // error to all offline commands. Example below.
// };


// create redis client
// const redisClient = redis.createClient('/usr/loca/var/run/redis/redis.sock');
// const redisClient = redis.createClient(redisClient_Options);

// console.log('Client connected status : ', redisClient.connected);
// console.log('redisClient Created ');
// console.log('Client connected status again: ', redisClient.connected);

// redisClient.on("connect", function () {
//     console.log('Client connected status again connect 1: ', redisClient.connected);
//     console.log('redis client connect');
//     redisClient.setAsync("foo_rand000000000000_3", "some fantastic value 3").then(redis.print);
//     redisClient.getAsync("foo_rand000000000000_3").then(redis.print);
//     console.log('Client connected status again connect 2: ', redisClient.connected);

// }).on("ready", function () {
//     console.log('Client connected status again ready 1: ', redisClient.connected);
//     console.log('redis client ready');
//     console.log('Client connected status again ready 2: ', redisClient.connected);

// }).on("reconnect", function () {
//     console.log('Client connected status again reconnect 1: ', redisClient.connected);
//     console.log('redis client reconnect');
//     console.log('Client connected status again reconnect 2: ', redisClient.connected);

// }).on("error", function (err) {
//     console.log('Client connected status again error 1: ', redisClient.connected);
//     console.log('redis client Error');
//     console.log('error : ', err);
//     console.log('Client connected status again error 2: ', redisClient.connected);

// }).on("end", function () {
//     console.log('Client connected status again end 1: ', redisClient.connected);
//     console.log('redis client End');
//     console.log('Client connected status again end 2: ', redisClient.connected);

// });


// const defaultCookie = {
//   customeDC: 100,
//   httpOnly: false,
//   path: '/',
//   overwrite: true,
//   customDC2: 'bonjour',
//   signed: false,
//   maxAge: 24 * 60 * 60 * 1000 //one day in ms
// };

// console.log('defaultCookie : ', defaultCookie);

// newcookie = {
//   path: '/',
//       httpOnly: true,
//       maxAge: 2592000000,
//       overwrite: false,
//       customC1: 'hello',
//       signed: true,
//       secure: false,
//       customC2: 13
//     };


// console.log('\nnewcookie : ', newcookie);

// let cookie = newcookie || {};
// console.log('\ncookie : ', cookie);

// copy(defaultCookie).to(cookie);

// console.log('defaultCookie : ', defaultCookie);
// console.log('\nnewcookie : ', newcookie);
// console.log('\ncookie : ', cookie);

// let fileFilter = function () { return true; };
// let dir = path.join(__dirname, 'koatest/src/client');
// let prefix = 'static';
// let files = {};

// readDir(dir).filter(fileFilter).forEach(function (name) {
//       console.log(`name : ${name} \n dir: ${dir} \n files: `, files, `\n*****************************\n`);
//       console.log('new path : ', path.join(prefix, name));
//       files[name] = dir;
//   });


// console.log('\n\n*******************************************************************\n\nthis : \n\n', this);


// const mongorito = require('mongorito');
// const Model = mongorito.Model;
// const bluebird = require('bluebird');

// const logger = require('../koatest/src/lib/logger');
// const utils = require('../koatest/src/lib/utils');
// // const CONFIG = require('../koatest/src/lib/settings').CONFIG_DATA;



// const log = logger.log;


// // Sample collection in the database
// class Base extends Model {

// }


// class Users extends Model {

// }




// const COLLECTIONS = {
// 	default: Base,
// 	Users: Users
// };



// class DB {

// 	constructor(dbname, username, password, base_collection) {

// 		if (typeof dbname !== 'string' && !!dbname) {
// 			log.error('A database name can only be string');
// 			throw new Error('A database name can only be string');
// 		}
		
// 		this.dbname = dbname || 'koatest';
		
// 		if (typeof username !== 'string' && !!username) {
// 			log.error('A database username can only be string');
// 			throw new Error('A database username can only be string');
// 		}

// 		this.username = username || '';

// 		if (typeof password !== 'string' && !!password) {
// 			log.error('A database password can only be string');
// 			throw new Error('A database password can only be string');
// 		}

// 		this.password = password || '';

// 		if (typeof base_collection !== 'string' && !!base_collection) {
// 			log.error('A database cannot be without atleast one Collection');
// 			throw new Error('A database cannot be without atleast one Collection');
// 		}

// 		this.base_collection = COLLECTIONS[base_collection] || COLLECTIONS.default;		
// 		// this.base_collection = '';	
				
// 	}

	

// 	connect() {
// 		let connection_url;
		
// 		if (this.username && this.password) {
// 			connection_url = 'mongodb://' + this.username + ':' + this.password + '@localhost/' + this.dbname;
// 		}
// 		else {
// 			connection_url = 'mongodb://localhost/' + this.dbname;
// 		}
		
// 		console.log('conencction_url : ', connection_url);

// 		return mongorito.connect(connection_url);
			
// 	}


// 	disconnect() {
// 		return mongorito.disconnect();
		
// 	}


// 	get collection() {
// 		return this.base_collection;
// 	}


// 	get model() {
// 		return this.base_collection;
// 	}

	
// 	* insert(collection, data) {
// 		if (!collection) {
// 			collection = COLLECTIONS[this.collection[0]];
// 		}
// 		else {
// 			collection = typeof collection === 'string'? COLLECTIONS[collection] : null;
// 		}
		
// 		if (collection === null)
// 		{
// 			log.error('Colection should be a sting name');
// 			return -1;
// 		}

// 		let col = new collection(data);

// 		yield col.save();
// 	}


// }



// let db = new DB('koatest', 'koatestuser', 'koatestpass');



// let generator = function *(database) {
// 	console.log('database : ', database);

// 	yield database.connect();
	
// 	// let connection_url = 'mongodb://' + db.username + ':' + db.password + '@localhost/' + db.dbname;

// 	// console.log('conencction_url : ', connection_url);

// 	// yield mongorito.connect(connection_url);

// 	console.log('database connected now ');

// 	// let doc = new database.collection({
// 	// 	user: 'anirban 5',
// 	// 	email: 'anirbannick5@mgailc.om',
// 	// 	username: '34213_5',
// 	// 	userid: utils.genid(32)
// 	// });

// 	yield db.collection.remove();
// 	console.log('doc remobed');
// 	let d = yield database.collection.find();
// 	console.log('table : ', d);

// 	yield database.disconnect();

// };



// let coroutine = bluebird.coroutine(generator);

// //run the coroutine
// coroutine(db);




// var Promise = require("bluebird");

// function PingPong() {

// }

// PingPong.prototype.ping = Promise.coroutine(function* (val) {
//     console.log("Ping?", val);
//     yield Promise.delay(3000);
//     console.log('[ping] prmise delay complete - 3 secs');
//     if (val > 5) {
//     	console.log('[ping] val > 5, hence returning');
//     	return;
//     }
//     yield Promise.delay(5000);
//     console.log('[ping] prmise delay complete - 5 seconds');
//     // let self = this;
//     // console.log('returned from pong');
//     // return this.pong(val+1).then(ele => {
//     // 	return ele;
//     // });
    
//     console.log('yeildsing this.pong promise now'); 
//     var ele = yield this.pong(val+1);
//     console.log('thos.pong prmosed resolved and returned');
//     // return ele;
//     // 
//     ele = !ele;
//     yield Promise.delay(2000);
//     console.log('[ping] prmise delay complete - 2 secs');
//    	return new Promise(function(resolve, reject) {
//    		resolve(ele);
//    	});
// });

// PingPong.prototype.pong = Promise.coroutine(function* (val) {
//     console.log("Pong!", val);
//     // Promise.delay(3000).then(() => {
//     // 	console.log('[pong] prmise delay complete - 3 seconds');
//     // });
//     yield Promise.delay(3000);
//     console.log('[pong] prmise delay complete - 3 seconds');
    
//     if (val > 5) {
//     	console.log('[ping] val > 5, hence returning');
//     	return;
//     }
//     // yield* 5;
//     // Promise.delay(5000).then(() => {
//     // 	console.log('[pong] prmise delay complete - 5 seconds');
//     // });
//     yield Promise.delay(5000);

//     console.log('[pong] prmise delay complete - 5 seconds');
//     // this.ping(val+1);
//     console.log('pong complete');
//     // return new Promise(function(resolve, resject) {
//     // 	resolve('[pong]-promise-resolved');
//     // });
//     return Promise.resolve(true);
// });


// Promise.coroutine(function *() {
// 	var a = new PingPong();
// 	var e = yield a.ping(0);
// 	console.log('e : ', e);
// 	console.log('expectign to be printed at the end');
// 	let x = 6;
// 	for (let i=1; i<1000; i++) {
// 		x = x+i;
// 	}

// 	console.log('for loop complete, x : ', x);
// })();


const koa = require('koa');
const app = koa();
const Router = require('koa-router'); 

const CONFIG = require('../koatest/src/lib/settings').CONFIG_DATA;
const logger = require('../koatest/src/lib/logger');
const view_render = require('../koatest/src/lib/view_render');
const static_cache = require('../koatest/src/lib/static_cache');
const body_parser = require('../koatest/src/lib/body_parser');



const log = logger.log;



// Add Logger Middleware
app.use(logger.logger_Middleware);

// Add additional custom koa bunyan logger middlewares
// app.use(logger.koaBunyan_requestLogger_Middleware);
app.use(logger.koaBunyan_requestIdContext_Middleware);
app.use(logger.koaBunyan_timeContext_Middleware);



// Views/Render Middleware Must be used before any router is used
app.use(view_render.render_Middleware);


// Add Static Cache Middleware
app.use(static_cache.staticCache_Middleware);

// Add additional static sources -> adding bootstrap static files
static_cache.serve(static_cache.options.boostrap_static_path, static_cache.options.bootstrapOpts, static_cache.options.files);



// Add body parser middleware
app.use(body_parser.bodyparser_Middleware);



// Use the route middleware

let IndexGetHandler = function *(next) {
	this.log.debug('Inside Index Handler'); 

	yield this.render('test_index');

	this.log.debug('Test index page rendered');
};


let ChatGetHandler = function *(next) {
	this.log.debug('Inside Chat Handler'); 

	yield this.render('test_chat');

	this.log.debug('Test Chat page rendered');
};



const api = Router();

api.get('index', '/', IndexGetHandler); 
api.get('chat', '/chat', ChatGetHandler); 


// use the route in the app middleware
app.use(api.routes());
app.use(api.allowedMethods());


// Add Socket.IO / Websocket Server
const server = require('http').createServer(app.callback());
// const socketIO = require('socket.io');

// create the socket.io instance
const io = require('socket.io')(server);


const Pub = io.of('/Pub');
const Priv = io.of('/Priv');



const socketio_auth = require('socketio-auth');


const socketio_auth_options = {
	authenticate: authenticate,
  	postAuthenticate: postAuthenticate,
  	disconnect: disconnect,
 	timeout: 10000
};
 

const User = {
	'testuser': {
		name: 'Test User',
		gender: 'male',
		email: 'testuser@gmail.com',
		id: '1234'
	}
};


function authenticate(socket, data, callback) {
	log.debug('[SocketIO_Auth] inside authenticate');
	log.info('Socket: ' + socket.id + ' is authenticating...');

	let userid = data.userid;
	let token = data.token;
	
	log.debug('userid : ', userid);
	log.debug('token : ', token);

	let isValid;

	if (userid === 'testuser' && token === 'testtoken') {
		isValid = true;	
	}
	else if (userid !== 'testuser') {
		isValid = null;
	}
	else {
		isValid = false;
	}

	if (isValid === null) {
		return callback(new Error("User not found"));
	}
	else {
		return callback(null, isValid);
	}	
	
}



function disconnect(socket) {
  	log.info(socket.id + ' disconnected');
}



function postAuthenticate(socket, data) {
  	log.debug('[SocketIO_Auth] inside postAuthenticate');

	let userid = data.userid;
	let token = data.token;
	
	log.debug('userid : ', userid);
	log.debug('token : ', token);

	log.debug('socket.id : ', socket.id);

	// log.debug('socket.client : ', socket.client);
	socket.client.user = data.userid;

	// log.debug('io : ', io);
	// log.debug('io.sockets.sockets : ', io.sockets.sockets);
	// log.debug('io.nsps : ', io.nsps);

	// log.debug('socket.client : ', socket.client);

	log.debug('New socket connected After authentication');

	if (socket.auth) {
		log.debug('socket.auth is true, hence emmtint events');

		log.debug('emiting  hi event');
		socket.emit('hi', {msg: 'hi from server [Io]'});

		log.debug('emiting [Pub] hi-Pub event');
		socket.emit('hi-Pub', {msg: 'hi from server [Pub]'});

		log.debug('emiting [Priv] hi-Priv event');
		socket.emit('hi-Priv', {msg: 'hi from server [Priv]'});
	}
	else {
		log.debug('socke.auth is false, hence not sending events');
	}
	

	socket.on('hello-Pub', function(data){
		log.debug('[Pub] hello-Pub event triggered');
		log.debug('data : ', data.msg);
	});

	socket.on('hello-Priv', function(data){
		log.debug('[Priv] hello-Priv event triggered');
		log.debug('data : ', data.msg);
	});

	socket.on('namaste-Pub', function(data){
		log.debug('[Pub] namaste-Pub event triggered');
		log.debug('data : ', data.msg);
	});

	socket.on('namaste-Priv', function(data){
		log.debug('[Priv] namaste-Priv event triggered');
		log.debug('data : ', data.msg);
	});
	

	socket.on('hello', function(data){
		log.debug('[Io] hello event triggered');
		log.debug('data : ', data.msg);
	});

	socket.on('disconnect', function() {
		log.debug('[server] [Io] socket disconnected');
	});

	socket.on('disconnect_nsp', function(data) {
		log.debug('[server] [Io] diconnect_nsp event triggered');
		log.debug('[server] [Io] data : ', data);
		log.debug('intellignetly closing the corresponing nsp : ', socket.id);

		const MyNamespace = io.nsps[data.nsp]; // Get Namespace
		const connectedNameSpaceSockets = Object.keys(MyNamespace.connected); // Get Object with Connected SocketIds as properties
		
		log.debug('connectedNameSpaceSockets : ', connectedNameSpaceSockets);
		
		// connectedNameSpaceSockets.forEach(socketId => {
		// 	log.debug('socketid : ', socketId);
		// 	let s = MyNamespace.connected[socketId];
		// 	log.debug('MyNamespace.connected[socketId]] : ', s);
		// 	log.debug('will disconnetc the above socket now');
  		//  s.disconnect(); // Disconnect Each socket
		// });	
		
		log.debug('socketid : ', socket.id);
		let s = MyNamespace.connected[socket.id];
		log.debug('MyNamespace.connected[socket.id]] : ', s);
		log.debug('will disconnetc the above socket now');
		s.disconnect(); // Disconnect Each socket
		                
		// MyNamespace.removeAllListeners(); // Remove all Listeners for the event emitter
		
		log.debug('before deleting, io.nsps : ', io.nsps);
		// delete io.nsps[data.nsp];
		// log.debug('after delteing, io.nsps : ', io.nsps);
	});


}



// socketio_auth(io, socketio_auth_options);

socketio_auth(Pub, socketio_auth_options);

socketio_auth(Priv, socketio_auth_options);




// io.on('connection', function(socket) {
// 	log.debug('New [Io] socket connected');

// 	log.debug('emiting [Io] hi event');
// 	socket.emit('hi', {msg: 'hi from server [Io]'});

// 	socket.on('hello', function(data){
// 		log.debug('[Io] hello event triggered');
// 		log.debug('data : ', data.msg);
// 	});

// 	socket.on('disconnect', function() {
// 		log.debug('[server] [Io] socket disconnected');
// 	});

// });



// Pub.on('connect', function(socket) {
// 	log.debug('New [Pub] socket connected');

// 	if (socket.auth) {
// 		log.debug('socket.auth is true, hence emmtint events');
// 		log.debug('emiting [Pub] hi-Pub event');
// 		socket.emit('hi-Pub', {msg: 'hi from server [Pub]'});
// 	}
// 	else {
// 		log.debug('socke.auth is false, hence not sending events');
// 	}
	

// 	socket.on('hello-Pub', function(data){
// 		log.debug('[Pub] hello-Pub event triggered');
// 		log.debug('data : ', data.msg);
// 	});

// 	socket.on('disconnect', function() {
// 		log.debug('[server] [Pub] socket disconnected');
// 	});
// });


// Priv.on('connect', function(socket) {
// 	log.debug('New [Priv] socket connected');

// 	if (socket.auth) {
// 		log.debug('socket.auth is true, hence emmtint events');
// 		log.debug('emiting [Priv] hi-Priv event');
// 		socket.emit('hi-Priv', {msg: 'hi from server [Priv]'});

// 		socket.on('hello-Priv', function(data){
// 			log.debug('[Priv] hello-Priv event triggered');
// 			log.debug('data : ', data.msg);
// 		});
// 	}
// 	else {
// 		log.debug('socke.auth is false, hence not sending events');
// 	}
	

	

// 	socket.on('disconnect', function() {
// 		log.debug('[server] [Priv] socket disconnected');
// 	});
// });



// start server / start listening
server.listen(9091, () =>{
    log.info(`App started at 127:0.0.1:9091`);
});
 


// const bluebird = require('bluebird');
// const amqp = require('amqplib');

// const logger = require('../koatest/src/lib/logger');

// const log = logger.log;



// let rabbitmq_Generator = function *() {
// 	log.debug('connecting to rabbitmq...');
	
// 	const conn = yield amqp.connect('amqp://localhost');

// 	log.debug('conn : ', conn);
	
// 	if (!conn) {
// 		log.error('Error in amqp connection');
// 		return;
// 	}

// 	log.debug('connected to rabbitmq successfully');

// 	const ch = yield conn.createChannel();
// 	log.debug('channel created : ', ch);

// 	if (!ch) {
// 		log.error('Error in channel creteion : ');
// 		return;
// 	}

// 	let q = 'hello';

// 	let q_ok = ch.assertQueue(q, {durable: false});

// 	log.debug('q_ok : ', q_ok);
// 	if (!q_ok) {
// 		log.error('Error in asswertin Quereue');
// 		return;
// 	}

// 	log.debug('q created successfully');

//     // Note: on Node 6 Buffer.from(msg) should be used
//     ch.sendToQueue(q, Buffer.from('[hello] Hello World!'));
//     log.info(" [x] Sent 'Hello World!'");


// };


// let rabbitmq_Coroutine = bluebird.coroutine(rabbitmq_Generator);

// // run the coroutine
// rabbitmq_Coroutine();
















 

