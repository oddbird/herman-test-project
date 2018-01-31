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
  FONTS_DIR: 'fonts/',
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
gulp.task('sassdoc', () => {
  const config = {
    verbose: true,
    dest: paths.DOCS_DIR,
    theme: 'herman',
    herman: {
      extraLinks: [
        {
          name: 'Accoutrement-Color',
          url: 'http://oddbird.net/accoutrement-color/',
        },
        {
          name: 'Accoutrement-Scale',
          url: 'http://oddbird.net/accoutrement-scale/',
        },
        {
          name: 'Accoutrement-Type',
          url: 'http://oddbird.net/accoutrement-type/',
        },
      ],
      sass: {
        jsonfile: `${paths.DIST_DIR}css/json.css`,
      },
      customCSS: `${paths.DIST_DIR}css/main.css`,
      fontpath: paths.FONTS_DIR,
    },
    display: {
      alias: true,
    },
  };

  const stream = sassdoc(config);

  gulp
    .src(`${paths.SASS_DIR}**/*.scss`)
    .pipe(stream);

  return stream.promise;
});

gulp.task('compile', gulp.series('sass', 'sassdoc'));

gulp.task('serve', gulp.series('compile', cb => {
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
}));

gulp.task('default', gulp.parallel('compile'));
