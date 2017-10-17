'use strict';

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const sass = require('gulp-sass');
const sassdoc = require('sassdoc');
const sourcemaps = require('gulp-sourcemaps');

// Theme and project specific paths.
const paths = {
  DIST_DIR: 'dist/',
  SASS_DIR: 'sass/',
  DOCS_DIR: 'docs/',
  IGNORE: ['!**/.#*', '!**/flycheck_*'],
  init() {
    this.SASS = [`${this.SASS_DIR}**/*.scss`].concat(this.IGNORE);
    return this;
  },
}.init();

// Try to ensure that all processes are killed on exit
const spawned = [];
process.on('exit', () => {
  spawned.forEach(pcs => {
    pcs.kill();
  });
});

gulp.task('sass', () =>
  gulp
    .src(paths.SASS)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${paths.DIST_DIR}css/`))
);

// SassDoc compilation.
// See: http://sassdoc.com/customising-the-view/
gulp.task('compile', ['sass'], () => {
  const config = {
    verbose: true,
    dest: paths.DOCS_DIR,
    theme: 'herman',
    herman: {
      subprojects: [
        'accoutrement-color',
        'accoutrement-scale',
        'accoutrement-type',
      ],
      sass: {
        jsonfile: `${paths.DIST_DIR}css/json.css`,
      },
      customCSS: `${paths.DIST_DIR}css/main.css`,
      customHead:
        '<link href="https://fonts.googleapis.com/css?family=Modak" rel="stylesheet">' +
        '<script src="https://use.typekit.net/slx1xnq.js"></script>' +
        '<script>try{Typekit.load({ async: true });}catch(e){}</script>',
    },
    display: {
      alias: true,
    },
  };

  return gulp
    .src(`${paths.SASS_DIR}**/*.scss`)
    .pipe(sassdoc(config));
});

gulp.task('browser-sync', ['compile'], cb => {
  browserSync.init(
    {
      open: false,
      server: {
        baseDir: paths.DOCS_DIR,
      },
      logLevel: 'info',
      logPrefix: 'herman-test',
      notify: false,
      ghostMode: false,
      files: [`${paths.DOCS_DIR}**/*`],
      reloadDelay: 300,
      reloadThrottle: 500,
      // Because we're debouncing, we always want to reload the page to prevent
      // a case where the CSS change is detected first (and injected), and
      // subsequent JS/HTML changes are ignored.
      injectChanges: false,
    },
    cb
  );
});

gulp.task('default', ['compile']);
gulp.task('serve', ['browser-sync']);
