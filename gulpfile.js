var gulp = require('gulp'),
    runSequence = require('run-sequence'),
	rimraf = require('rimraf'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
    dynamicRouting = require('./bower_components/foundation/bin/gulp-dynamic-routing'),
	path = require('path')

gulp.task('clean', function(callback){
	rimraf('./public', callback);
});

gulp.task('copy', function(callback){
	var dirs = [
		''
	];
	return gulp.src('./source/img/**')
	.pipe(gulp.dest('./public/img/'));
});

gulp.task('sass', function(callback){
  return gulp.src('./source/scss/app.scss')
	.pipe(sass({
	  includePaths: ['bower_components/foundation/scss/', 'source/scss'],
	  style: 'nested',
	  sourceComments: true,
	  errLogToConsole: true
	}))
	.pipe(gulp.dest('./public/css/'));
});

// Process Foundation JS
gulp.task('uglify', ['uglify-angular'], function() {
  var libs = [
	'bower_components/jquery/dist/jquery.js',
	'bower_components/fastclick/lib/fastclick.js',
	'bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
	'bower_components/notify.js/notify.js',
	'bower_components/tether/tether.js',
	'bower_components/foundation/js/angular/common/**/*.js',
	'bower_components/foundation/js/angular/directives/**/*.js',
	'source/js/app.js'
  ];

  return gulp.src(libs)
	// .pipe(uglify({
	//   beautify: true,
	//   mangle: false
	// }).on('error', function(e) {
	//   console.log(e);
	// }))
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./public/js/'));
});

gulp.task('clean-partials', function(cb) {
	rimraf('./public/partials', cb);
});

gulp.task('copy-partials', ['clean-partials'], function() {
  return gulp.src(['bower_components/foundation/js/angular/partials/**'])
    .pipe(gulp.dest('./public/partials/'));
});

// Process Angular JS
gulp.task('uglify-angular', function() {
  var libs = [
	'bower_components/angular/angular.js',
	'bower_components/angular-animate/angular-animate.js',
	'bower_components/ui-router/release/angular-ui-router.js'
  ];

  return gulp.src(libs)
	// .pipe(uglify({
	//   beautify: true,
	//   mangle: false
	// }))
	.pipe(concat('angular-app.js'))
	.pipe(gulp.dest('./public/js/'));
});

gulp.task('copy-templates', ['copy'], function() {
  var config = [];

  return gulp.src('./docs/templates/**/*.html')
    .pipe(dynamicRouting({
      path: 'public/js/routes.js',
      root: 'docs'
    }))
    .pipe(markdown())
    .pipe(highlight())
    .pipe(gulp.dest('./build/templates'))
  ;
});

gulp.task('build', function(callback){
	runSequence('clean', ['copy', 'copy-partials', 'sass', 'uglify'], function(){
		console.log('Build finished');
		callback();
	});
});
gulp.task('default', ['build'], function(){
	// Watch Sass
	gulp.watch(['./source/scss/**', 'bower_components/foundation/scss/**'], ['sass']);
	// Watch static
	gulp.watch(['./source/img/**', './source/css/**'], ['copy']);
	
	// Watch JavaScript
	gulp.watch(['./source/js/**/*', 'bower_components/foundation/js/**'], ['uglify']);

	// Watch Angular partials
	gulp.watch(['bower_components/foundation/js/angular/partials/**.*'], ['copy-partials']);

});