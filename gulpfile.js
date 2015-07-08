var autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    minifyCss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    uglify = require('gulp-uglify')

gulp.task('styles', function() {
  return sass('public/stylesheets/sass/style.scss', {style: 'expanded', compass: true})
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/dist'))
    .pipe(notify({message: 'Styles task complete'}));
});

gulp.task('scripts', function() {
  return gulp.src('public/javascripts/*.js')
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist'))
    .pipe(notify({ message: 'Scripts task complete'}));
});

gulp.task('clean', function() {
  return gulp.src(['public/dist'], {read: false})
    .pipe(clean());
});

gulp.task('watch', function() {
  gulp.watch('public/stylesheets/sass/style.scss', ['styles']);
  gulp.watch('public/javascripts/*.js', ['scripts']);

  livereload.listen();

  gulp.watch(['public/dist/**']).on('change', livereload.changed);
});

gulp.task('default', ['clean', 'styles', 'scripts', 'watch']);
