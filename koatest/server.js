#!/usr/bin/env node 

const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .example('$0 -p 9091', 'start koatest app at port number 9091')
    .alias('p', 'port')
    .default('p', 9091)
    .nargs('p', 1)
    .describe('p', 'Port number to listen at')
    //.demand(1, ['f'])
    .help('h')
    .alias('h', 'help')
    .epilog('Anirban Roy Das, copyright 2016')
    .argv;
const http = require('http');
const koa = require('koa');
const app = koa();
const validate = require('koa-validate');
const x_response_time = require('koa-response-time');
const helmet = require('koa-helmet');
const passport = require('koa-passport');



// const utils = require('./src/lib/utils');
const CONFIG = require('./src/lib/settings').CONFIG_DATA;
const logger = require('./src/lib/logger');
const sessions = require('./src/lib/sessions');
const view_render = require('./src/lib/view_render');
const static_cache = require('./src/lib/static_cache');
const body_parser = require('./src/lib/body_parser');
const csrf_handler = require('./src/lib/csrf_handler');
const marko = require('./src/lib/marko_template_handler');
const error = require('./src/lib/error_handler');
const Auth = require('./src/lib/auth');

const auth_API = require('./src/backend/routes/authRoute');
const index_API = require('./src/backend/routes/indexRoute');
const chat_API = require('./src/backend/routes/chatRoute');



const log = logger.log;


// Add Logger Middleware
app.use(logger.logger_Middleware);

// Add additional custom koa bunyan logger middlewares
// app.use(logger.koaBunyan_requestLogger_Middleware);
app.use(logger.koaBunyan_requestIdContext_Middleware);
app.use(logger.koaBunyan_timeContext_Middleware);



// Add Response time middlware - should be at the top
app.use(x_response_time());



// Add Session Middleware 
// create the secre keys
// app.keys = ['t8Hh0jztaePsju280lRobJRZapBszUR4McFGoe9MeGff', 'wM5vPFfEPu5Sfua9qiTlGD4XbhLQJMdWnfIQxrGk8O4e'];
app.keys = CONFIG.koa.keys;

// use the session middleware
app.use(sessions.session_Middleware);



// Add helmet middlware - to add protection for varios security issues - actually adds related headers
app.use(helmet({
    hsts: false                 // Default : true, But setting it to false, since right now serving data in http and not https
}));

// exclusively add referrerPolicy securtiy header since its not added by default by helmet
// app.use(helmet.referrerPolicy({ policy: 'same-origin' }));



// Views/Render Middleware Must be used before any router is used
app.use(view_render.render_Middleware);



// Marko Template Rendered Middlware , since view_randerer doesn't render marko templates
app.use(marko.middleware);



// Add Static Cache Middleware
app.use(static_cache.staticCache_Middleware);

// Add additional static sources -> adding bootstrap static files
static_cache.serve(static_cache.options.boostrap_static_path, static_cache.options.bootstrapOpts, static_cache.options.files);



// Add body parser middleware
app.use(body_parser.bodyparser_Middleware);



// Add csrf token middleware
// create csrf middlware
csrf_handler.csrf(app, csrf_handler.options);

// use the middlware
// app.use(csrf_handler.csrf.custom_middleware);
app.use(csrf_handler.middleware);

// Add request, body, query validator middleware -> a little different than the other middleware
// Actualluy we pass the app instance to the validator instance
validate(app);



// Add passport/auth middleware 
app.use(passport.initialize());
app.use(passport.session());


// Initialize auth middleware
// const auth = new Auth(app);
// auth.init();


// Use the routes 
app.use(auth_API.routes());
app.use(auth_API.allowedMethods());
app.use(index_API.routes());
app.use(index_API.allowedMethods());  
app.use(chat_API.routes());
app.use(chat_API.allowedMethods()); 


// Add Error Handler route
app.use(error.middleware);


// Add Socket.IO / Websocket Server
const server = http.createServer(app.callback());
const socketIO = require('socket.io');

// create the socket.io instance
const io = socketIO(server);

// add io instance to app context globally
app.context.io = io;

// Add socket.io API hanlders and routes
const socketio_main_API = require('./src/backend/routes/socketioApiRoute');

// instantiate/use the API/middleware
socketio_main_API.feed(io);
socketio_main_API.timeline(io);
socketio_main_API.notification(io);
socketio_main_API.livestream(io);


// Add socket.io Chat API hanlder and routes
const socketio_chat_API = require('./src/backend/routes/socketioChatRoute');

// instantiate/use the API/middleware
socketio_chat_API.public(io);
socketio_chat_API.irc(io);
socketio_chat_API.private(io);



// start server / start listening
server.listen(argv.port, () =>{
    log.info(`App started at 127:0.0.1:${argv.port}`);
});

