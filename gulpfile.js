const lazyreq = require('lazyreq').default;

const gulp = require('gulp');

const $ = lazyreq(require, { // pass the "require" function to lazyreq 
                                 
	watchify: 'watchify',
	browserify: 'browserify',
	babelify: 'babelify',
 	babel: 'gulp-babel',
	source: 'vinyl-source-stream',
	buffer: 'vinyl-buffer',
	sourcemaps: 'gulp-sourcemaps',
	gutil: 'gulp-util',
	uglify: 'gulp-uglify',
	rename: 'gulp-rename', 
	duration: 'gulp-duration',
	minify: 'gulp-clean-css',
	clean: 'gulp-clean',
	changed: 'gulp-changed',
	newer: 'gulp-newer',
	concat: 'gulp-concat',
	gulpif: 'gulp-if',
	plumber: 'gulp-plumber',
	// uncss: 'gulp-uncss',
	autoprefixer: 'gulp-autoprefixer',
	imagemin: 'gulp-imagemin',
	watch: 'gulp-watch',
	cache: 'gulp-cached',
	remember: 'gulp-remember',
	filter: 'gulp-filter',
	flatmap: 'gulp-flatmap',
	glob: 'glob',
	es: 'event-stream',
	del: 'del',
	delempty: 'delete-empty',
	vinylpath: 'vinyl-paths',
	// browserSync: 'browser-sync').create(, 

	assign: 'lodash.assign',
	path: 'path'

});

 


const chalk = $.gutil.colors;		// define the chalk instance by using gutil's color instance
let isProduction;


// Check production environment 
// gulp should be called like this :
// $ gulp --type production
if ($.gutil.env.type){
	isProduction = $.gutil.env.type === 'production';
}
else{
	isProduction = process.env.NODE_ENV === 'production';
}







// Demo testing task before actual task functions
function demoTestingTask(){
	let baseDir = $.path.join(__dirname, '/koatest/src/client/js');
	let outputDir = $.path.join(__dirname, '/koatest/public/js');
	// let stream = gulp.src(baseDir + '/*.js');	
	
	let browserifyOpts = {
		entries: [baseDir + '/chat2.js'],
        extensions: ['.js'],
        debug: !isProduction,
        fullPaths: true
	};

	    	
	bundler = $.browserify(browserifyOpts);
	$.gutil.log(chalk.magenta("browserify bundler created "));

	let browserify_duration = $.duration('browserify bundling');

	bundler.transform($.babelify);
	$.gutil.log(chalk.magenta("babelify done"));

	let stream = bundler.bundle();
	$.gutil.log(chalk.magenta("browserify bundler stream created "));

	return stream.pipe($.source('first.js'))
	.pipe($.buffer())
	.pipe($.plumber({errorHandler: mapError}))
	.pipe(browserify_duration)  
	// .pipe($.cache('demo-scripts'))  
	// .pipe($.babel())
	// .pipe(sourcemaps.init({loadMaps: true}))
	.pipe($.uglify())	
	.pipe($.rename({extname: '.bundle.js'}))
	// .pipe(sourcemaps.write(outputDir))
	.pipe(gulp.dest(outputDir));

}






// define the sourcemaps directory
let mapsDir = $.path.join(__dirname, 'koatest/public/maps');

// Config for gulp
const config = {
	baseDir: process.cwd(),
	mapsDir: mapsDir,
	publicDir: $.path.join(__dirname, 'koatest/public'),
	buildDir: $.path.join(__dirname, 'koatest/build'),
    
    client: {
        js: {
        	srcDir: $.path.join(__dirname, 'koatest/src/client/js'), 					// Source directory for js
        	outputDir: $.path.join(__dirname, 'koatest/public/js'),  					// Directory to save bundle to
        	mapDir: $.path.join(mapsDir, 'js'),      									// Subdirectory to save maps to
        	outputFileBundleExt: '.bundle.js', 										// Extension to use for bundle 
        	outputFileMinExt: '.min.js' 											// Extension to use for min
        }, 

        css: {
        	srcDir: $.path.join(__dirname, 'koatest/src/client/css'), 				// Source directory for css
        	outputDir: $.path.join(__dirname, 'koatest/public/css'),  					// Directory to save bundle to
        	mapDir: $.path.join(mapsDir, 'css'),      								// Subdirectory to save maps to
        	outputFileBundleExt: '.bundle.css', 											// Extension to use for bundle
        	outputFileMinExt: '.min.css' 											// Extension to use for min
        }, 

        templates: {
        	srcDir: $.path.join(__dirname, 'koatest/src/client/templates'), 			// Source directory for tmeplates
        	outputDir: $.path.join(__dirname, 'koatest/public/templates'),  			// Directory to save bundle to
        	mapDir: $.path.join(mapsDir, 'templates'),      							// Subdirectory to save maps to
        	outputFileExt: '.html' 											// Extension to use for bundle
        }, 

        media: {
        	srcDir: $.path.join(__dirname, 'koatest/src/client/media'), 				// Source directory for media
        	outputDir: $.path.join(__dirname, 'koatest/public/media'),  				// Directory to save processed media to
        	outputFileExt: '.jpg' 													// Extension to use for final media files
        }
    },

    
};


// console.log('config : \n', config);



// Error reporting function
function mapError(err) {
	$.gutil.beep();

  	if (err.fileName) {
	    // Regular error
	    let filename, line, column, msg, cause;

	    if (err instanceof $.uglify.GulpUglifyError) {
	    	filename = err.fileName;
	    	line = err.line;
	    	msg = err.message || err.msg;
	    	cause = err.cause;
	    }
	    else {
	    	filename = err.fileName;
	    	line = err.lineNumber;
	    	column = err.columnNumber || err.column;
	    	msg = err.msg || err.message || err.description;
	    	cause = err.cause || undefined;
	    }
	    $.gutil.log(chalk.red(err.name)
      		+ ': ' + chalk.yellow(filename.replace(__dirname + '/src/js/', ''))
      		+ ': ' + 'Line ' + chalk.magenta(line)
      		+ ' & ' + 'Column ' + chalk.magenta(column)
      		+ ': ' + chalk.blue(msg)
	    	+ ': ' + chalk.green(cause));
  	} 
  	else {
    	// Browserify error..
   		$.gutil.log(chalk.red(err.name)
      		+ ': '
      		+ chalk.yellow(err.message));
  	}

  	this.emit('end');
}






// Browerify Function along with watchify
function scripts(watch) {
	if (watch) {
		$.gutil.log(chalk.green("Inside scripts - js-watchify"));
	}
	else {
		$.gutil.log(chalk.green("Inside scripts - js-browserify"));
	}
	

	$.glob(config.client.js.srcDir + '/**/*.js', {ignore: config.client.js.srcDir + '/assets/**/*.*'}, function (err, files) {    
	    if (err) {
	    	let errmsg = err.msg || err.message;
			$.gutil.log(chalk.red("Error : ") + chalk.blue(errmsg));
	    }

	    $.gutil.log(chalk.magenta("files list : ") + chalk.green(files));

	    let tasks = files.map(entry => {
	    	$.gutil.log(chalk.magenta("entry file : ") + chalk.green(entry));

	    	let filePathFromSrc = $.path.relative(config.client.js.srcDir, entry);
	    	let outputDir = $.path.resolve(config.client.js.outputDir, $.path.dirname(filePathFromSrc));

	    	let browserifyOpts = {
	    		entries: [entry],
		        extensions: ['.js'],
		        debug: !isProduction,
		        fullPaths: watch
	    	};

	    	let browserifyOpts_w_watchify = {
	    		entries: [entry],
		        extensions: ['.js'],
		        cache: {},
		        packageCache: {},
		        debug: !isProduction,
		        fullPaths: watch
	    	};

	    	let bundler;
	      	
	      	if(watch) {
	      		let opts = $.assign({}, $.watchify.args, browserifyOpts_w_watchify);
	      		$.gutil.log(chalk.magenta("opts : ") + chalk.green(opts));
	      		
	      		bundler = $.browserify(opts);
	    		$.gutil.log(chalk.magenta("browserify bundler created "));

	    		bundler = $.watchify(bundler);
	    		$.gutil.log(chalk.magenta("watchify instance started"));
	  		}
	  		else {
	  			bundler = $.browserify(browserifyOpts);
	  			$.gutil.log(chalk.magenta("browserify bundler created "));
	  		}

	  		bundler.transform($.babelify);
	  		$.gutil.log(chalk.magenta("babelify transform done.."));

	      	let bundle = function() {

	      		$.gutil.log(chalk.magenta("Inside bundle funtion"));

	      		let stream = bundler.bundle();

	      		$.gutil.log(chalk.magenta("stream bundle creted"));
				
				return stream.pipe($.source($.path.basename(entry)))
				.pipe($.buffer())
				.pipe($.plumber({
					errorHandler: mapError
				})) 
				.pipe($.duration('browserify bundling'))  
				.pipe($.cache('scripts'))  
				// .pipe($.changed(config.client.js.outputDir, {extension: '.bundle.js', hasChanged: $.changed.compareSha1Digest}))				
				.pipe($.rename({																	// Rename output from to '.bundle.js'
					extname: config.client.js.outputFileBundleExt
				})) 
				.pipe(gulp.dest(outputDir))										// Save 'bundle.js' to output directory				
			    // .pipe($.gulpif(isProduction, $.sourcemaps.init({									// loads map from browserify file
			    // 	loadMaps: true
			    // }), $.gutil.noop())) 				
			    // Add transformation tasks to the pipeline here.
		    	// .pipe($.gulpif(isProduction, $.uglify(), $.gutil.noop()))							// uglify only whene production environment
		    	// .pipe($.gulpif(isProduction, $.rename({ extname: config.client.js.outputFileMinExt}), $.gutil.noop()))
		    	.pipe($.uglify())																	// always uglify regardless of production or development environment
		    	.pipe($.rename({
		    		extname: config.client.js.outputFileMinExt
		    	}))
			    // Transformtions ended here
			    // .pipe($.gulpif(isProduction, $.sourcemaps.write({destPath: config.client.js.mapDir}), $.gutil.noop())) 		// writes .map file			                                                 	
			    .pipe(gulp.dest(outputDir));																	// Save 'bundle.min.js' to output directory
			};


	      	if (watch) {																	// Add event handlers to watchify bundler
		      	bundler.on('update', bundle);
		      	bundler.on('log', $.gutil.log.bind($.gutil)); 								// output build logs to terminal
		    		
		    }  	                                              					
	      	
	      	$.gutil.log(chalk.magenta("returning bundle"));
	      	return bundle();
	    
	    });

	    // Call tasks as a merged array stream
	    $.gutil.log(chalk.magenta("calling es.merge"));
	    
	    $.es.merge(tasks).on('end', $.gutil.log.bind($.gutil));
	});
}






// *********** Media related gulp Handlers **************


// Individual Image processing handler
function imagesType(typ) {
	let imageGlob;
	let baseDir = config.client.media.srcDir;
	let cacheType = 'cache-' + typ;
	let durationMsg = 'Image [' + typ.toUpperCase() + '] processing';

	if (typ === 'png') {
		imageGlob = [baseDir + '/**/*.png', baseDir + '/**/*.PNG'];
	}
	else if (typ === 'jpg') {
		imageGlob = [baseDir + '/**/*.jpg', baseDir + '/**/*.JPG'];
	}
	else if (typ === 'jpeg') {
		imageGlob = [baseDir + '/**/*.jpeg', baseDir + '/**/*.JPEG'];
	}
	else if (typ === 'gif') {
		imageGlob = [baseDir + '/**/*.gif', baseDir + '/**/*.GIF'];
	}
	else if (typ === 'svg') {
		imageGlob = [baseDir + '/**/*.svg', baseDir + '/**/*.SVG'];
	}
	else {
		$.gutil.log(chalk.red('Type of image should be png, jpg, jpeg, gif or svg.'));
		return;
	}

	

  	let stream = gulp.src(imageGlob, {base: baseDir});
    
    return stream.pipe($.plumber({errorHandler: mapError}))
    .pipe($.duration(durationMsg))
    // .pipe($.changed(config.client.media.outputDir, {hasChanged: $.changed.compareSha1Digest}))    
    .pipe($.cache(cacheType))
    .pipe($.imagemin())
    .pipe(gulp.dest(config.client.media.outputDir));
}




// Full together image processing handler
function imagesFull() {
	let imageGlobs = ['/**/*.png', '/**/*.jpg', '/**/*.jpeg', '/**/*.gif', '/**/*.svg'];
	let baseDir = config.client.media.srcDir;
	let baseDirArray = [];

	for (let ext of imageGlobs) {
		baseDirArray.push(baseDir + ext);
	}
	
  	let stream = gulp.src(baseDirArray, {base: baseDir});
    
    return stream.pipe($.plumber({errorHandler: mapError}))
    .pipe($.duration('image processing'))
    // .pipe($.changed(config.client.media.outputDir, {hasChanged: $.changed.compareSha1Digest}))    
    .pipe($.cache('images'))
    .pipe($.imagemin())    
    .pipe(gulp.dest(config.client.media.outputDir));
}






// ************ Stylesheets processing hanlders ***************


// Stylesheets Minfying handler
function stylesheets_minify() {
	let stream = gulp.src([config.client.css.srcDir + '/**/*.css']);
	
	// let minifyDurationStream = $.duration('minifying stylesheets');
 	// let autoprefixerDurationStream = $.duration('autoprefixing stylesheets');
	
	return stream.pipe($.plumber({errorHandler: mapError}))
	.pipe($.duration('minifying stylesheets'))
	// .pipe($.changed(config.client.css.outputDir, {extension: '.css', hasChanged: $.changed.compareSha1Digest}))
	.pipe($.cache('css-minify'))
	// .pipe($.gulpif(isProduction, $.sourcemaps.init({									// loads map from browserify file
	// 	loadMaps: true
	// }), $.gutil.noop())) 
	.pipe($.duration('autoprefixing stylesheets'))	
	.pipe($.autoprefixer({
            browsers: ['> 5%'],										// also 'last 2 versions' -> taken from browserlist github.com/ai/browserlist
            cascade: false
    }))
    .pipe(gulp.dest(config.client.css.srcDir))					// save the prefixed added files in src itself before minifying
	.pipe($.minify({compatibility: 'ie8', debug: true}))
	.pipe($.rename({													// Rename output from to '.min.js'
		extname: config.client.css.outputFileMinExt
	})) 	
	// .pipe($.gulpif(isProduction, $.sourcemaps.write({destPath: config.client.js.mapDir}), $.gutil.noop())) 		// writes .map file	
	.pipe(gulp.dest(config.client.css.outputDir));

}




// Stylesheets bundling/concatinating handler
function stylesheets_bundle() {

	$.glob(config.client.css.outputDir + '/**/*.min.css', {ignore: config.client.css.outputDir + '/assets/**/*.*'}, function(err, files){
		if (err){
			let errmsg = err.msg || err.message;
			$.gutil.log(chalk.red('[Error]: ') + chalk.blue(errmsg));
		}

		let tasks = files.map(entry =>  {
			let stream = gulp.src([entry, config.client.css.outputDir + '/assets/*.min.css']);
			let bundleSuffixArray = $.path.relative(config.client.css.outputDir, entry).split('/');
			let bundleSuffix;
			if (bundleSuffixArray.length === 1) {
				bundleSuffix = bundleSuffixArray[0].slice(0, bundleSuffixArray[0].indexOf('.'));
			}
			else {
				let basename = bundleSuffixArray.pop();
				bundleSuffix = basename.slice(0, basename.indexOf('.'));
				bundleSuffixArray.push(bundleSuffix);
				bundleSuffix = bundleSuffixArray.join('-');
			}
			
			
			let bundleCacheName = 'css-bundle-' + bundleSuffix;
			let tmpConcatName = 'tmp-concat-' + $.path.relative(config.client.css.outputDir, entry);

			$.gutil.log(chalk.magenta('bundle Cache Name : ') + chalk.blue(bundleCacheName));

			return stream.pipe($.plumber({errorHandler: mapError}))
			.pipe($.duration('concatinating/bundling stylesheets'))
			// .pipe($.newer($.path.dirname(entry) +'/' + $.path.basename(entry, '.js') + '.min.bundle.js'))
			.pipe($.cache(bundleCacheName))
			// .pipe($.gulpif(isProduction, $.sourcemaps.init({												// loads map from browserify file
			// 	loadMaps: true
			// }), $.gutil.noop())) 
			.pipe($.remember(bundleCacheName))
			.pipe($.concat(tmpConcatName))
			.pipe($.rename({
				// dirname: $.path.dirname(entry),
    			basename: $.path.basename(entry, '.css'),
			    // prefix: '',
			    // suffix: '',
			    extname: config.client.css.outputFileBundleExt
			}))
			// .pipe($.gulpif(isProduction, $.sourcemaps.write({destPath: config.client.js.mapDir}), $.gutil.noop())) 		// writes .map file			
			.pipe(gulp.dest(config.client.css.outputDir));

		});

		// Call tasks as a merged array stream
	    $.es.merge(tasks).on('end', $.gutil.log.bind($.gutil));

	});

}





// ***************** Templates processing handler **********************


// Move Html from src to build/public directory handler
function move_templatest_type(typ) {

	let stream = gulp.src(config.client.templates.srcDir + '/**/*.' + typ, {base: config.client.templates.srcDir});

	let durationMsg, cacheType;
	
	if (typ === 'html') {
		durationMsg = 'moving html';
		cacheType = 'move-html';
	}
	else if (typ === 'marko') {
		durationMsg = 'moving marko';
		cacheType = 'move-marko';
	}
	else {
		durationMsg = 'moving templates';
		cacheType = 'move-template';
	}

	return stream.pipe($.plumber({errorHandler: mapError}))
	.pipe($.duration(durationMsg))
	// .pipe($.changed(config.client.templates.outputDir, {extension: '.html', hasChanged: $.changed.compareSha1Digest}))
	.pipe($.cache(cacheType))
	.pipe(gulp.dest(config.client.templates.outputDir));
}





// ******************* Cleaning Handlers  ******************


// Cleaning individual type hanlder
function cleanType(typ) {
	let outputDir, ext, deleted_paths, len, deleted_empty_dirs, len_e;
	
	let msg = typ + 'processing';
	let durationStream = $.duration(msg);

	if (typ === 'js') {
		ext = 'js';
	}
	else if (typ === 'css') {
		ext = 'css';
	}
	else if (typ === 'templates') {
		ext = 'html';
	}
	else if(typ === 'media') {
		ext = '*';
	}
	else if(typ === 'maps') {
		ext = '*';
		outputDir = config.mapsDir;
	}
	else {
		$.gutil.log(chalk.red('Type of clean command should be js, css, templates or media.'));
		return;
	}
	
	if(typ === 'maps') {		
   		deleted_paths = $.del.sync([outputDir + '/js/*.' + ext, '!' + outputDir + '/js'], {force: true});
   		len = deleted_paths.length;
   		deleted_empty_dirs = $.delempty.sync([outputDir + '/js/*', '!' + outputDir + '/js'], {force: true});
   		len_e = len_e + deleted_empty_dirs.length;
   		
   		deleted_paths = $.del.sync([outputDir + '/css/*.' + ext, '!' + outputDir + '/css'], {force: true});
   		len = len + deleted_paths.length;
   		deleted_empty_dirs = $.delempty.sync([outputDir + '/css/*', '!' + outputDir + '/css'], {force: true});
   		len_e = len_e + deleted_empty_dirs.length;
   		
   		deleted_paths = $.del.sync([outputDir + '/templates/*.' + ext, '!' + outputDir + '/templates'], {force: true});
   		len = len + deleted_paths.length;
   		deleted_empty_dirs = $.delempty.sync([outputDir + '/templates/*', '!' + outputDir + '/templates'], {force: true});
   		len_e = len_e + deleted_empty_dirs.length;
	}	
	else {
		outputDir = config.client[typ].outputDir;
	    
	    deleted_paths = $.del.sync([outputDir + '/**/*.' + ext, '!' + outputDir], {force: true});
	    len = deleted_paths.length;

	    deleted_empty_dirs = $.delempty.sync([outputDir + '/*', '!' + outputDir], {force: true});
   		len_e = len_e + deleted_empty_dirs.length;
	}
    
    // let deleted_empty_dirs = $.delempty.sync(outputDir + '/');
    
    $.gutil.log(chalk.red('Files Deleted : ') + chalk.blue(len));
    $.gutil.log(chalk.red('Directories Deleted : ') + chalk.blue(len_e));
    
    durationStream.emit('end');

    return;
}



// ****************** Moving final k to public folder **************


// Move all sources from build to public directory handler
function move_build_to_public(typ) {
	let outputDir;
	if (typ === 'maps') {
		outputDir = config.mapsDir;
	}
	else {
		outputDir = config.client[typ].outputDir;
	}

	let stream = gulp.src(outputDir + '/**/*.*', {base: outputDir});

	let durationMsg = 'moving build' + typ +  ' files to public\'s ' + typ;
	let cacheTyp = 'move-build-' + typ;

	return stream.pipe($.plumber({errorHandler: mapError}))
	.pipe($.duration(durationMsg))
	// .pipe($.changed(config.client.templates.outputDir, {extension: '.html', hasChanged: $.changed.compareSha1Digest}))
	.pipe($.cache(cacheTyp))
	.pipe(gulp.dest(config.publicDir + '/' + typ));
}
 








// ***************** Unused Handler for furthere procesing 


//
//
// // uncss task
// 
// gulp.task('uncss', function () {
//     return gulp.src(config.client.css.src, {base: config.baseDir})
//         .pipe($.concat(config.client.css.outputFile))
//         .pipe($.uncss({
//             html: [config.client.html.src]
//         }))
//         .pipe(gulp.dest('./out'));
// });
//
//





// ***************** Add the gulp tasks ********************



// demo task 
gulp.task('demo', function() {
	return demoTestingTask();
});




// ***********  Clean Tasks *******************

// clean js task
gulp.task('clean-js', function() {
	return cleanType('js');
});



// clean css task
gulp.task('clean-css', function() {
	return cleanType('css');
});



// clean media task
gulp.task('clean-media', function() {
	return cleanType('media');
});



// clean templates task
gulp.task('clean-templates', function() {
	return cleanType('templates');
});



// clean maps task
gulp.task('clean-maps', function() {
	return cleanType('maps');
});


// main clean task
gulp.task('clean', ['clean-js', 'clean-css', 'clean-media', 'clean-templates', 'clean-maps'], function() {
	$.gutil.log(chalk.green('gulp clean completed successfully'));
});






// ************** Templates related tasks **************


// move html task 
gulp.task('move-html', function() {
	return move_templatest_type('html');
});


gulp.task('move-marko', function() {
	return move_templatest_type('marko');
});


gulp.task('move-templates', ['move-html', 'move-marko'], function() {
	$.gutil.log(chalk.green('gulp move-templates completed successfully'));
});


// watch html task
gulp.task('watch-html', ['move-html'], function() {
	let html_watcher = gulp.watch('templates/**/*.html', {cwd: $.path.join(config.client.templates.srcDir, '..')}, ['move-html']);

	html_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.templates.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePath = $.path.resolve(config.client.templates.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, $.path.extname(filePathFromSrc)) + '.*');

	      	let deleted_files = $.del.sync([destFilePath, '!' + config.client.templates.outputDir], {force: true});

	      	delete $.cache.caches['move-html'][event.path];
      		$.remember.forget('move-html', event.path);

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});
});




gulp.task('watch-marko', ['move-marko'], function() {
	let html_watcher = gulp.watch('templates/**/*.marko', {cwd: $.path.join(config.client.templates.srcDir, '..')}, ['move-marko']);

	html_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.templates.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePath = $.path.resolve(config.client.templates.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, $.path.extname(filePathFromSrc)) + '.*');

	      	let deleted_files = $.del.sync([destFilePath, '!' + config.client.templates.outputDir], {force: true});

	      	delete $.cache.caches['move-marko'][event.path];
      		$.remember.forget('move-marko', event.path);

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});
});





// templates processing task
gulp.task('templates', ['move-templates'], function() {
	$.gutil.log(chalk.green('gulp templates completed successfully'));
});



// watch templates task
gulp.task('watch-templates', ['templates'], function() {
	let templates_watcher = gulp.watch('templates/**/*.*', {cwd: $.path.join(config.client.templates.srcDir, '..')}, ['templates']);

	templates_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.templates.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePath = $.path.resolve(config.client.templates.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, $.path.extname(filePathFromSrc)) + '.*');

	      	let deleted_files = $.del.sync([destFilePath, '!' + config.client.templates.outputDir], {force: true});

	      	let ext = $.path.extname(event.path);
	      	let cacheType;
	      	
	      	if (ext.search('html') !== -1){
	      		cacheType = 'move-html';
	      	}
	      	else if (ext.search('marko') !== -1) {
	      		cacheType = 'move-marko';
	      	}

	      	delete $.cache.caches[cacheType][event.path];
      		$.remember.forget(cacheType, event.path);

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});
});







// ************* Stylesheets related tasks *****************


// minify stylesheets task
gulp.task('minify-css', function() {
	return stylesheets_minify();
});



// concat and bundle stylesheets task
gulp.task('bundle-css', ['minify-css'], function() {
	return stylesheets_bundle();
});



gulp.task('css', ['bundle-css'], function() {
	$.gutil.log(chalk.green('gulp css completed successfully'));
});



// watch-css task
gulp.task('watch-css', ['css'], function() {
	let css_watcher = gulp.watch('css/**/*.css', {cwd: $.path.join(config.client.css.srcDir, '..')}, ['css']);

	css_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.css.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePathPattern = $.path.resolve(config.client.css.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, '.css') + '.*');

	      	let deleted_files = $.del.sync([destFilePathPattern, '!' + config.client.css.outputDir], {force: true});

	      	$.gutil.log(chalk.magenta('event.path : ') + chalk.green(event.path));

	      	delete $.cache.caches['css-minify'][event.path];
      		$.remember.forget('css-minify', event.path);

      		// Fincd cache name for css bundle whow pathname is output dir which is different from event.path
      		// Also if a file from assets/ folder is deleted, no bundle cache was actually created, hence do nothing in that case 
      		// to delete cache, otherwise delete the appropriate bundle cache
      		if (event.path.search('/assets/') === -1) {
      			// the file concerned is not an asset file, hence delete corresponding bundle cache
      			
      			let bundleSuffixArray = filePathFromSrc.split('/');
				let bundleSuffix;
				if (bundleSuffixArray.length === 1) {
					bundleSuffix = bundleSuffixArray[0].slice(0, bundleSuffixArray[0].indexOf('.'));
				}
				else {
					let basename = bundleSuffixArray.pop();
					bundleSuffix = basename.slice(0, basename.indexOf('.'));
					bundleSuffixArray.push(bundleSuffix);
					bundleSuffix = bundleSuffixArray.join('-');
				}
				
				
				let bundleCacheName = 'css-bundle-' + bundleSuffix;

				$.gutil.log(chalk.magenta('bundleCacheName : ') + chalk.green(bundleCacheName));

      			// let cachePath = $.path.join(config.client.css.outputDir , $.path.basename(event.path, '.css'));
      			let cachePath = $.path.resolve(config.client.css.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, '.css') + '.min.css');				

				$.gutil.log(chalk.magenta('cachePath : ') + chalk.green(cachePath));

      			delete $.cache.caches[bundleCacheName][cachePath];
      			$.remember.forget(bundleCacheName, cachePath);
      		}

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});

});






// ************ Scripts related tasks ***************


// browserify bundle scripts task with watchify
gulp.task('js-watchify', function() {
	return scripts(true);
});


// browserify bundle scripts task without watchify
gulp.task('js-browserify', function() {
	return scripts(false);
});




// watch-js task
gulp.task('watch-js', ['js-watchify'], function() {
	let css_watcher = gulp.watch('js/**/*.js', {cwd: $.path.join(config.client.css.srcDir, '..')});

	css_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.css.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePathPattern = $.path.resolve(config.client.css.outputDir, $.path.dirname(filePathFromSrc), $.path.basename(filePathFromSrc, '.js') + '.*');

	      	let deleted_files = $.del.sync([destFilePathPattern, '!' + config.client.css.outputDir], {force: true});

	      	$.gutil.log(chalk.magenta('event.path : ') + chalk.green(event.path));

	      	delete $.cache.caches['scripts'][event.path];
      		$.remember.forget('scripts', event.path);

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});

});





// ******** Images Related Tasks *************

// image png task
gulp.task('images-png', function() {
	return imagesType('png');
});



// image png task
gulp.task('images-jpg', function() {
	return imagesType('jpg');
});


// image png task
gulp.task('images-jpeg', function() {
	return imagesType('jpeg');
});


// image png task
gulp.task('images-gif', function() {
	return imagesType('gif');
});



// image png task
gulp.task('images-svg', function() {
	return imagesType('svg');
});


// images task
gulp.task('images', ['images-png', 'images-jpg', 'images-jpeg', 'images-gif', 'images-svg'], function() {
	$.gutil.log(chalk.green('gulp images completed successfully'));
});


// all media task
gulp.task('media', ['images'], function() {
	$.gutil.log(chalk.green('gulp media completed successfully'));
});


// watch media/images task
gulp.task('watch-media', ['media'], function() {
	let media_watcher = gulp.watch('media/**/*.*', {cwd: $.path.join(config.client.media.srcDir, '..')}, ['media']);

	media_watcher.on('change', function (event) {
	    if (event.type === 'deleted') {
	    	// Simulating the {base: 'src'} used with gulp.src in the scripts task
	    	let filePathFromSrc = $.path.relative($.path.resolve(config.client.css.srcDir), event.path);

	    	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	      	let destFilePath = $.path.resolve(config.client.templates.outputDir, filePathFromSrc);

	      	let deleted_files = $.del.sync([destFilePath, '!' + config.client.templates.outputDir], {force: true});

	      	let cacheType = 'cache-' + $.path.extname(event.path).slice(1).toLowerCase();
	      	
	      	$.gutil.log(chalk.magenta('event.path : ') + chalk.green(event.path));
	      	$.gutil.log(chalk.magenta('cacheType : ') + chalk.green(cacheType));

	      	delete $.cache.caches[cacheType][event.path];
      		$.remember.forget(cacheType, event.path);

	      	$.gutil.log(chalk.red('Deleted File : ') + chalk.blue(deleted_files.length));
	    }
	});
});







// ************** Moving build to public gulp task  ******************


gulp.task('move-build-css', function() {
	return move_build_to_public('css');
});


gulp.task('move-build-js', function() {
	return move_build_to_public('js');
});


gulp.task('move-build-media', function() {
	return move_build_to_public('media');
});

gulp.task('move-build-templates', function() {
	return move_build_to_public('templates');
});


gulp.task('move-build-maps', function() {
	return move_build_to_public('maps');
});




gulp.task('move-build', ['move-build-css', 'move-build-js', 'move-build-templates', 'move-build-media', 'move-build-maps'], function() {
	$.gutil.log(chalk.green('gulp move-build completed successfully'));
});





// ***********  final main tasks ****************



// gulp.task('build-clean', ['clean', 'move-html', 'css', 'js-browserify', 'media'], function() {
// 	$.gutil.log(chalk.green('gulp build completed successfully'));
// });


gulp.task('build', ['templates', 'css', 'js-browserify', 'media'], function() {
	$.gutil.log(chalk.green('gulp build completed successfully'));
});




gulp.task('watch', ['watch-templates', 'watch-css', 'watch-media', 'watch-js'], function() {
	$.gutil.log(chalk.green('gulp watch completed successfully'));
});


gulp.task('develop', ['watch'], function() {
	$.gutil.log(chalk.green('gulp develop completed successfully'));
});




gulp.task('start', ['build'], function() {
	$.gutil.log(chalk.green('gulp start completed successfully'));
});



gulp.task('production', ['build'], function() {
	$.gutil.log(chalk.green('gulp production completed successfully'));
});



gulp.task('default', ['start'], function() {
	$.gutil.log(chalk.green('gulp task completed successfully'));
});

