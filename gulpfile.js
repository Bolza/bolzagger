var gulp = require('gulp');
var rename = require("gulp-rename");
var ts = require('gulp-typescript');
var tsConfigPath = 'tsconfig.json'

gulp.task('prebuild', function () {
	var tsProject = ts.createProject(tsConfigPath)
    var tsResult = tsProject.src() // instead of gulp.src(...)
    	.pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('bundle-commonjs', function () {
	var tsProject = ts.createProject(tsConfigPath, { "module": "commonjs" } )
    var bundle = tsProject.src()
    	.pipe(ts(tsProject));

    return bundle.js
    	.pipe(rename('bolzagger.common.js'))
    	.pipe(gulp.dest('dist'));
});

gulp.task('bundle-systemjs', function () {
	var tsProject = ts.createProject(tsConfigPath, { "module": "system" } )
    var bundle = tsProject.src()
    	.pipe(ts(tsProject));

    return bundle.js
    	.pipe(rename('bolzagger.system.js'))
    	.pipe(gulp.dest('dist'));
});

gulp.task('bundle-umd', function () {
	var tsProject = ts.createProject(tsConfigPath, { "module": "umd" } )
    var bundle = tsProject.src() 
    	.pipe(ts(tsProject));

    return bundle.js
    	.pipe(rename('bolzagger.umd.js'))
    	.pipe(gulp.dest('dist'));
});

gulp.task('bundle', ['bundle-commonjs', 'bundle-systemjs', 'bundle-umd']);