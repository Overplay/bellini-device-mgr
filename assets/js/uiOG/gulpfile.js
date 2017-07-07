/**
 * Created by mkahn on 12/29/16.
 */
var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var replace = require('gulp-replace');
var rename = require('gulp-rename');

gulp.task('uibcache', function () {
    return gulp.src('*.html')
        .pipe(templateCache('templates.js', {
            templateHeader: '//Start of templates\n',
            templateFooter: '\n//End of templates\n'

        }))
        .pipe(gulp.dest('.'));

});

gulp.task('build', ['uibcache'], function () {

    var fs = require('fs');
    var templates = fs.readFileSync('./templates.js', "utf8");
    //console.log(templates);
    return gulp.src('uiOG.notemplates.js')
        .pipe(replace('//<templates>', templates))
        .pipe(rename('uiOG.tpls.js'))
        .pipe(gulp.dest('.'));

});