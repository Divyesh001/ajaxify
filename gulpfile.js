var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require("gulp-rename");

gulp.task('compress', function() {
  return gulp.src('src/ajaxify.js')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(rename("ajaxify.min.js"))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['compress']);
