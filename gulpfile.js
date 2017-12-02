var source = require('vinyl-source-stream');
var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var browserify = require('browserify');
var tsify = require('tsify');
var browserifyInc = require('browserify-incremental')
var notify = require("gulp-notify");
var path = require('path');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var merge = require('merge2');
const rimraf = require('gulp-rimraf');
const tslint = require('gulp-tslint');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');
const env = require('gulp-env');
var connect = require('gulp-connect');

var outDir='build';
var tsOptions = {
	declaration : true,
	lib : [ "es2015" ],
	target : "es6",
	module : "commonjs",
	moduleResolution : "node",
	sourceMap : true,
	typeRoots : [ "node_modules/@types" ],
};
const tsProject = ts.createProject(tsOptions);

gulp.task('lint-ts', () => {
	return gulp.src('src/**/*.ts')
		.pipe(tslint({
			formatter : 'prose'
		}))
		.pipe(tslint.report());
});

gulp.task('compile-ts','typescript compile', function() {
	var tsResult = gulp.src([ 'src/**/*.ts' ])
		.pipe(tsProject());

	return merge([
		tsResult.dts.pipe(gulp.dest('build/definitions')),
		tsResult.js.pipe(gulp.dest('build/src'))
	]);
});

gulp.task('compile-test', function() {
	gulp.src([ 'test/**/*.ts' ])
		.pipe(tsProject())
		.pipe(gulp.dest('build/test/'))
});

gulp.task('develop','server developement tool', [ 'configs','compile-ts' ], function() {
	gulp.watch('src/**/*.ts', [ /*'lint-ts',*/'compile-ts', 'configs' ]);
	gulp.watch(['build/src/client/**/*.js','build/src/shared/**/*.js'], [ 'build-client' ,'build-client-worker' ]);
	var stream = nodemon({
		script : 'build/src/server/index.js',
		ext : 'ts json',
		ignore : [ 'ignored.js' ],
		watch : [ 'src' ],
		env: {
			'NODE_ENV': 'dev'
		},
		tasks : function(changedFiles) {
			var tasks = []
			if (!changedFiles) return tasks;
			if (!Array.isArray(changedFiles)){
				return tasks;
			}
			changedFiles.forEach(function(file) {
				if (path.extname(file) === '.ts' && !~tasks.indexOf('compile-ts')) tasks.push('compile-ts')
				if (path.extname(file) === '.json' && !~tasks.indexOf('configs')) tasks.push('configs')
				//if (path.extname(file) === '.ts' && !~tasks.indexOf('lint-ts')) tasks.push('lint-ts')
				//if (path.extname(file) === '.css' && !~tasks.indexOf('cssmin')) tasks.push('cssmin')
			})
			console.log('tasks to do',tasks);
			return tasks
		}
	})
	.once('start', () => {
		console.log('start')
	})
	.on('restart', function() {
		console.log('Restarted!')
	})
	.on('crash', function() {
		console.error('Application has crashed!\n')
		stream.emit('restart', 2) // restart the server in 10 seconds
	});

});

gulp.task('clean','', function() {
	return gulp.src(outDir, {
		read : false
	})
		.pipe(rimraf());
});

gulp.task('configs', 'copy configs', (cb) => {
	return gulp.src("src/server/configurations/*.json")
		.pipe(gulp.dest('./build/src/server/configurations'));
});

gulp.task('server-production',['build'], (cb) => {
	nodemon({
		script : 'build/src/index.js',
	})
	.once('start', () => {
		console.log('start')
	})
	.on('restart', function() {
		console.log('Restarted!')
	})
	.on('crash', function() {
		console.error('Application has crashed!\n')
		stream.emit('restart', 2)
	});
});

gulp.task('build', 'typescript compile and copy configs', [ 'compile-ts', 'configs' ], () => {
	console.log('Typescript Project transpiled ...');
});

gulp.task('procfile', ['server-production' ], () => {
	console.log('Starting for heroku procfile...');
});

gulp.task('test', 'launch tests', [ 'compile-test','configs' ], (cb) => {
	const envs = env.set({
		NODE_ENV : 'test'
	});

	gulp.src([ 'build/test/**/*.js' ])
		.pipe(envs)
		.pipe(mocha())
		.once('error', (error) => {
			console.log(error);
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});


function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
	notify.onError({
		title : "Compile Error",
		message : "<%= error.message %>"
	}).apply(this, args);
	this.emit('end');
}

function buildScript(file, watch) {
	var bundler =  browserify({
		entries : [ 'build/src/' + file ],
		cache : '/tmp/cache.browserify',
		packageCache : {},
	})
	.plugin(tsify, tsOptions/*{
		noImplicitAny: true
	}*/);

	browserifyInc(bundler, {
		cacheFile: '/tmp/cache.browserify.json'
	})

	function rebundle() {
		return bundler
			.bundle()
			.on('error', handleErrors)
			.pipe(source(file))
			.pipe(gulp.dest('public/'))
			.pipe(notify("Client build "));
	}
	bundler.on('update', function() {
		rebundle();
		console.log('Rebundle...');
	});
	return rebundle();
}

gulp.task('build-client', function() {
	return buildScript('client/client.js', false);
});

gulp.task('build-client-worker', function() {
	return buildScript('client/client-worker.js', false);
});

gulp.task('watch-clients', [ 'build-client','build-client-worker' ], function() {
	gulp.watch(['build/src/client/**/*.js','build/src/shared/**/*.js'], [ 'build-client' ,'build-client-worker' ]);
})

gulp.task('watch-ts', [ /*'lint-ts',*/'compile-ts', 'configs' ], function() {
	gulp.watch('src/**/*.ts', [ /*'lint-ts',*/'compile-ts', 'configs' ]);
});

gulp.task('default', [ 'develop' ]);
