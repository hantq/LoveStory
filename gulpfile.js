var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    minifyCss = require('gulp-minify-css'),
    sass = require('gulp-ruby-sass'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    lr = require('tiny-lr'),
    server = lr();

gulp.task('styles', function() {
  return gulp.src('./public/stylesheets/style.css')
    .pipe(minifyCss())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(notify({ message: 'styles task complete.'}));
});

gulp.task('scripts', function() {
  return gulp.src('./public/javascripts/main.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('./public/javascripts'))
    .pipe(notify({ message: 'scripts task complete.'}));
});

gulp.task('clean', function() {
  gulp.src(['dist/styles', 'dist/scripts'], {read: false})
    .pipe(clean());
});

gulp.task('default', function() {
  gulp.run('styles', 'scripts');
});

gulp.task('watch', function() {
  server.listen(3000, function(err) {
    if (err) {
      return console.log(err);
    };

    // Watch .scss files
    gulp.watch('./public/stylesheets/*.scss', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('styles');
    });

    // Watch .js files
    gulp.watch('./public/javascripts/*.js', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
      gulp.run('scripts');
    });
  });
});
