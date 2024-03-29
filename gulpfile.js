'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var run = require('run-sequence');
var del = require('del');
var uglify = require('gulp-uglify');
var pump = require('pump');


gulp.task('style', function () {
  gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('compress', function (cb) {
  pump([
      gulp.src('source/js/*.js'),
      uglify(),
      gulp.dest('source/js')
    ],
    cb
  );
});

gulp.task('images', function () {
  return gulp.src('build/images/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/images'));
});

gulp.task('webp', function () {
  return gulp.src('build/images/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/images'));
});

gulp.task('sprite', function () {
  return gulp.src('build/images/icon-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/images'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'));
});

gulp.task('serve', function () {
  server.init({
    server: 'build/'
  });

  gulp.watch('source/less/**/*.less', ['style']);
  gulp.watch('source/*.html', ['html']);
});

gulp.task('copy', function () {
  return gulp.src([
    'source/images/**',
    'source/js/**'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task('build', function (done) {
  run(
    'clean',
    'copy',
    'style',
    'compress',
    'images',
    'webp',
    'sprite',
    'html',
    done
  );
});
