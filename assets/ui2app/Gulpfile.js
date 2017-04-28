/**
 * Created by mkahn on 4/22/17.
 */

var gulp = require( 'gulp' );
var sass = require( 'gulp-sass' );

var inputScss = './assets/css/**/*.scss';
var outputScss = './assets/css';

gulp.task( 'sass', function () {
    return gulp
    // Find all `.scss` files from the `stylesheets/` folder
        .src( inputScss )
        // Run Sass on those files
        .pipe( sass() )
        // Write the resulting CSS in the output folder
        .pipe( gulp.dest( outputScss ) );
} );