const source = require('vinyl-source-stream');
const tsify = require('tsify');
const tsifyTransform = require("tsify-transform");
const browserify = require('browserify');
const browserifyIncremental = require('browserify-incremental')
const path = require('path');
const merge = require('merge2');
const plumber = require("plumber");
const _gulp = require('gulp');
const gulp = require('gulp-help')(_gulp);
const watchify = require('watchify');
const sourceStream = require('vinyl-source-stream');
const plugins = require('gulp-load-plugins')();
//const notify = require("gulp-notify");
const notifier = require('node-notifier');
const gutil = require('gulp-util');

console.log(plugins.util.colors.yellow('Plugins:') + ' ' + plugins.util.colors.green(Object.keys(plugins)));

var outDir = 'dist/';
var tsOptions = {
	declaration : true,
	lib : [ "es2015","DOM" ],
	target : "es6",
	module : "commonjs",
	moduleResolution : "node",
	sourceMap : true,
	typeRoots : [ "node_modules/@types" ],
	noImplicitAny : true,
	"experimentalDecorators": true
};
//"suppressImplicitAnyIndexErrors" : true,
//"noImplicitAny": false

const tsProject = plugins.typescript.createProject(tsOptions);

gulp.task('lint-ts', () => {
	return gulp
		.src('src/**/*.ts')
		.pipe(plugins.tslint({
			formatter : 'prose'
		}))
		.pipe(plugins.tslint.report());
});

gulp.task('build-server', 'typescript compile', function() {
	//var tsResult = gulp.src('src/server/**/*.ts','src/shared/**/*.ts','src/gameServer/**/*.ts' ])
	var tsResult = gulp.src('src/**/*.ts')
		.pipe(tsProject());

	return merge([
		tsResult.dts.pipe(gulp.dest(outDir+'definitions')),
		tsResult.js.pipe(gulp.dest(outDir+'src'))
	]);
});

gulp.task('compile-test', function() {
	gulp.src([ 'test/**/*.ts' ])
		.pipe(tsProject())
		.pipe(gulp.dest(outDir+'test/'))
});

gulp.task('develop', 'server developement tool', [  /*'build-clients',*/ 'configurations','build-server' ], function() {
	//gulp.watch([ 'src/gameServer/**/*.ts','src/server/**/*.ts', 'src/shared/**/*.ts' ], [ /*'lint-ts',*/ 'configurations','build-server' ]);
	//gulp.watch([ 'src/client/**/*.ts', 'src/shared/**/*.ts' ], [ 'build-clients' ]);
	var stream = plugins.nodemon({
		exec: 'node --inspect ',
		script : outDir+'src/server/index.js',
		//script : outDir+'src/gameServer/run.js',
		ext : 'ts json vert',
		ignore : [ 'ignored.js' ],
		watch : [ 'src/server/','src/shared/','src/gameServer/' ],
		env : {
			'NODE_ENV' : 'dev'
		},
		tasks : function(changedFiles) {
			var tasks = []
			if (!changedFiles) return tasks;
			if (!Array.isArray(changedFiles)) {
				return tasks;
			}
			changedFiles.forEach(function(file) {
				if (path.extname(file) === '.ts' && !~tasks.indexOf('build-server')) tasks.push('build-server')
				if (path.extname(file) === '.json' && !~tasks.indexOf('configurations')) tasks.push('configurations')
				//if (path.extname(file) === '.ts' && !~tasks.indexOf('lint-ts')) tasks.push('lint-ts')
				//if (path.extname(file) === '.css' && !~tasks.indexOf('cssmin')) tasks.push('cssmin')
			})
			console.log('Tasks to do', tasks);
			return tasks
		}
	})
	.once('start', () => {
		console.log('Server started');
		notifier.notify('Server started');
	})
	.on('restart', function() {
		console.log('Server re-started');
		notifier.notify('Server re-started');
	})
	.on('crash', function() {
		console.log('Application as crashed');
		notifier.notify('Application as crashed');
		//stream.emit('restart', 2)
		stream.emit('restart', 2) // restart the server in 10 seconds
	});

});

gulp.task('clean', '', function() {
	return gulp.src(outDir, {
		read : false
	})
		.pipe(plugins.rimraf());
});

gulp.task('configurations', 'copy configurations', (cb) => {
	return gulp.src("src/server/configurations/*.json")
		.pipe(gulp.dest('./dist/src/server/configurations'));
});

gulp.task('server-production', [ 'build' ], (cb) => {
	plugins.nodemon({
		script : outDir+'/src/server/index.js',
	})
	.once('start', () => {
		console.log('Server started');
		notifier.notify('Server started');
	})
	.on('restart', function() {
		console.log('Server re-started');
		notifier.notify('Server re-started');
	})
	.on('crash', function() {
		console.log('Application as crashed');
		notifier.notify('Application as crashed');
		//stream.emit('restart', 2)
	});
});

gulp.task('build', 'typescript compile and copy configurations', [ 'build-server'/*,'build-clients'*/, 'configurations' ], () => {
	console.log('Typescript Project transpiled ...');
});

gulp.task('procfile', [ 'server-production' ], () => {
	console.log('Starting for heroku procfile...');
});

gulp.task('test', 'launch tests', [ 'compile-test', 'configurations' ], (cb) => {
	const envs = plugins.env.set({
		NODE_ENV : 'test'
	});

	gulp.src([ outDir+'/test/**/*.js' ])
		.pipe(envs)
		.pipe(plugins.mocha())
		.once('error', (error) => {
			console.log(error);
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});


function handleErrors(a) {
	//console.log(a.message);
	/*
	var args = Array.prototype.slice.call(arguments);
	plugins.notify.onError({
		title : "Compile Error",
		message : "<%= error.message %>"
	}).apply(this, args);
	*/
	this.emit('end');
}

gulp.task('watch-server', [ /*'lint-ts',*/ 'build-server', 'configurations' ], function() {
	gulp.watch([ 'src/server/**/*.ts','src/shared/**/*.ts','src/gameServer/**/*.ts' ], [ /*'lint-ts',*/ 'build-server', 'configurations' ]);
});

gulp.task('default', [ 'develop' ]);


/*
function bundleClient(file){
	var d = Date.now() ;
	console.log(plugins.util.colors.yellow('Generating ')+plugins.util.colors.yellow(file));
	browserify()
		.add('src/client/'+file+'.ts')
		.plugin(tsify, {
			noImplicitAny: false,
			suppressImplicitAnyIndexErrors: true
		})
		.bundle()
		.on('error', function (error) {
			console.log(plugins.util.colors.red(error.toString()));
		})
		.pipe(sourceStream(file))
		.pipe(plugins.rename(function(path) {
			path.dirname = "client";
			path.basename = file;
			path.extname = ".js"
		}))
		.pipe(gulp.dest('public/'))
		.on('end', function() {
			var ti = ((Date.now() - d)/1000);
			console.log(plugins.util.colors.yellow('Generated ')+plugins.util.colors.yellow(file) +' '+plugins.util.colors.green(' in '+ ti + 's') );
			notifier.notify('Generated '+file+' in '+ ti + 's');
		});;
}

function bundleClient1(file,watch){
	var watchedBrowserify = watchify(
		browserify({
			basedir: '.',
			debug: true,
			entries: ['src/client/'+file+'.ts'],
			cache: {},
			packageCache: {}
		}).plugin(tsify)
	);

	function bundle() {
		var d = Date.now() ;
		console.log(plugins.util.colors.yellow('Generating ')+plugins.util.colors.yellow(file));
		return watchedBrowserify
			.bundle()
			.pipe(source(file + '.js'))
			.pipe(plugins.rename(function(path) {
				var ti = ((Date.now() - d)/1000);
				console.log(plugins.util.colors.yellow('Generate ')+plugins.util.colors.yellow(path.dirname+'/'+path.basename + path.extname) +' '+plugins.util.colors.green(' in '+ ti + 's') );
			}))
			.pipe(gulp.dest("public/client"))
			.on('end', function() {
				var ti = ((Date.now() - d)/1000);
				console.log(plugins.util.colors.yellow('Generate ')+plugins.util.colors.yellow(file) +' '+plugins.util.colors.green(' in '+ ti + 's') );
				notifier.notify('Generated '+file+' in '+ ti + 's');
			});;
	}
	watchedBrowserify.on("log", gutil.log);
	if(watch){
		watchedBrowserify.on("update", bundle);
	}
	bundle();
}

gulp.task('build-client', function() {
	return bundleClient('app',false);
});

gulp.task('build-client-worker', function() {
	//return bundleClient('client-worker',false);
});

gulp.task('build-clients', [ 'build-client', 'build-client-worker' ]);

gulp.task('watch-clients', [ 'build-clients' ], function() {
	//bundleClient('client',true);
	//bundleClient('client-worker',true);
	gulp.watch([
		'src/client/* * / *.ts',
		'src/client/* * / *.vert',
		'src/shared/* * / *.ts'
	], [ 'build-client' ]);
});
*/

/*function buildScript() {
//console.log(plugins.util.colors.yellow('Build script') + ' ' + plugins.util.colors.green(path + file + '.ts'));

plugins.webpackTypescriptPipeline.registerBuildGulpTasks(_gulp,{
	entryPoints: {
		'client' : process.cwd()+'/src/client/client.ts',
		'client-worker' : process.cwd()+'/src/client/client-worker.ts'
	},
	outputDir: process.cwd()+'/public/client'
});
}
buildScript();
*//*return gulp
.src(file)
.pipe(plugins.bro({
	transform : [
		tsifyTransform
	]
}))
.pipe(plugins.rename(function(path) {
	path.dirname = "client";
	console.log(path.dirname + '/' + path.basename + path.extname);
	console.log("Path " + plugins.util.colors.red("eeeee"));
}))
.pipe(gulp.dest('public/'))

//.plugin(tsify, tsOptions);
*/

/*function buildScript3(file) {
var _bundler = browserify({
	cache : '/tmp/cache.browserify.'+file,
})
.add('src/client/' + file + '.ts')
.plugin(tsify, tsOptions);

browserifyInc(_bundler, {
	cacheFile: '/tmp/cache.browserify.json'
});

_bundler.bundle()
	.on('error', function(error) {
		console.error(error.toString());
	})
	.pipe(source(file + '.js'))
	.pipe(plugins.rename(function(path) {
		path.dirname = "client";
		console.log(plugins.util.colors.red(path.dirname + '/' + path.basename + path.extname));
	}))
	.pipe(gulp.dest('public/'))
}
*/
/*function buildScript2() {
console.log('buildscript');
//var files=[ 'build/src/client/client.js','build/src/client/client-worker.js'];
var files = [ 'src/client/client.ts', 'src/client/client-worker.ts' ];
//.plugin(tsify, tsOptions/*{
//	noImplicitAny: true
//});

var tasks = files.map(function(entry) {
	var bundler = browserify({
		entries : [ entry ],
		cache : '/tmp/cache.browserify.' + entry,
		packageCache : {},
		debug : true
	});

	bundler.plugin(tsify, tsOptions);
	/*bundler.on('update', function() {
		rebundle();
		console.log('Rebundle...');
	//});*/
/*browserifyIncremental(bundler, {
cacheFile : '/tmp/cache.browserify.' + entry + '.json'
//})* /

return bundler
.bundle()
//.pipe(plumber({errorHandler: handleErrors}))
.on('error', handleErrors)
.pipe(source(entry))
.pipe(plugins.rename(function(path) {
	path.dirname = "client";
	console.log(path);
//path.basename += "-goodbye";
//path.extname = ".md"
}))
.pipe(gulp.dest('public/'))
.pipe(plugins.notify("Client build "));
});
return tasks;
}*/
/*
function buildScript() {
console.log('buildscript');
//var files=[ 'build/src/client/client.js','build/src/client/client-worker.js'];
var files = [ 'src/client/client.ts', 'src/client/client-worker.ts' ];

var tasks = files.map(function(entry) {
	var bundler = browserify({
		entries : [ entry ],
		cache : '/tmp/cache.browserify.' + entry,
		packageCache : {},
		debug : true
	})
	.plugin(tsify, tsOptions)
	/*.on('update', function() {
		rebundle();
		console.log('Rebundle...');
	})* /;
	///*browserifyIncremental(bundler, {
	//	cacheFile : '/tmp/cache.browserify.' + entry + '.json'
	//}) * /

	return bundler
		.bundle()
		//.pipe(plumber({errorHandler: handleErrors}))
		.on('error', handleErrors)
		.pipe(source(entry))
		.pipe(plugins.rename(function(path) {
			path.dirname = "client";
			console.log(path);
		//path.basename += "-goodbye";
		//path.extname = ".md"
		}))
		.pipe(gulp.dest('public/'))
		.pipe(plugins.notify("Client build "));
});
return tasks;
}s
*/
/*
var jsConfig = {
	entrypoint: './src/client/'+file+'.ts',
	bundleName: 'client.js',
	bundleDir: './public/client'
};

var b = browserify({
	cache: {},
	packageCache: {},
	debug: true,
	entries: jsConfig.entrypoint
});
console.log('browserifyIncremental');
browserifyIncremental(b, {
	//poll: true,
	cacheFile :'./browserify-cache.'+file+'json'// '/tmp/cache.browserify.' + file + '.json'
});

b
.plugin(tsify)
.on('update', function(){
	console.log('update bundle');
	bundle()	;
})
.on('log', function(data) {
	console.log(data);
});

function bundle() {
	console.log('Bundle '+file)
	return b.bundle()
		.on('error', handleErrors)
		.pipe(sourceStream(jsConfig.bundleName))
		.pipe(plugins.rename(function(path) {
			console.log(path);
		//path.basename += "-goodbye";
		//path.extname = ".md"
		}))
		.pipe(gulp.dest(jsConfig.bundleDir));
}
return bundle();
*/
