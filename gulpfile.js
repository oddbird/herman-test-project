/* eslint-disable no-console */

'use strict';

const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const prettier = require('gulp-prettier-plugin');
const webpack = require('webpack');

// Theme and project specific paths.
const paths = {
  DIST_DIR: 'dist/',
  SASS: 'sass/**/*.scss',
  JS: ['src/**/*.{js,vue}', '*.js', '.*.js'],
};

// Try to ensure that all processes are killed on exit
const spawned = [];
process.on('exit', () => {
  spawned.forEach(pcs => {
    pcs.kill();
  });
});

const onError = function(err) {
  console.error(err.message);
  this.emit('end');
};

const eslintTask = (src, failOnError, shouldLog) => {
  if (shouldLog) {
    const cmd = `eslint ${src}`;
    console.log('Running', `'${cmd}'...`);
  }
  const stream = gulp
    .src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  if (!failOnError) {
    stream.on('error', onError);
  }
  return stream;
};

const prettierTask = (src, shouldLog) => {
  if (shouldLog) {
    const cmd = `prettier ${src}`;
    console.log('Running', `'${cmd}'...`);
  }
  return gulp
    .src(src, { base: './' })
    .pipe(prettier({ singleQuote: true, trailingComma: 'all' }))
    .pipe(gulp.dest('./'))
    .on('error', onError);
};

gulp.task('prettier-js', () => prettierTask(paths.JS));
gulp.task('prettier-scss', () => prettierTask(paths.SASS));
gulp.task('prettier', gulp.parallel('prettier-js', 'prettier-scss'));

gulp.task(
  'eslint',
  gulp.series('prettier-js', () => eslintTask(paths.JS, true)),
);

gulp.task('eslint-nofail', () => eslintTask(paths.JS));

const webpackOnBuild = done => (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
  }

  console.log(
    stats.toString({
      colors: true,
      chunks: false,
    }),
  );

  if (done) {
    done(err);
  }
};

gulp.task('webpack', cb => {
  const webpackConfig = require('./webpack.config');
  webpack(webpackConfig).run(webpackOnBuild(cb));
});

gulp.task('webpack-watch', cb => {
  const webpackConfig = require('./webpack.config');
  webpack(webpackConfig).watch(300, webpackOnBuild(cb));
});

gulp.task(
  'watch',
  gulp.series('webpack-watch', cb => {
    // lint js on changes
    gulp.watch(paths.JS).on('all', (event, filepath) => {
      if (event === 'add' || event === 'change') {
        eslintTask(filepath, false, true);
      }
    });

    // lint all js when rules change
    gulp.watch('**/.eslintrc.yml', gulp.parallel('eslint-nofail'));

    // run webpack to compile static assets
    gulp.watch(['./index.html', './README.md'], gulp.parallel('webpack'));

    cb();
  }),
);

gulp.task('browser-sync', cb => {
  browserSync.init(
    {
      open: false,
      server: {
        baseDir: paths.DIST_DIR,
      },
      logLevel: 'info',
      logPrefix: 'herman-test',
      notify: false,
      ghostMode: false,
      files: [`${paths.DIST_DIR}**/*`],
      reloadDelay: 300,
      reloadThrottle: 500,
      // Because we're debouncing, we always want to reload the page to prevent
      // a case where the CSS change is detected first (and injected), and
      // subsequent JS/HTML changes are ignored.
      injectChanges: false,
    },
    cb,
  );
});

gulp.task('serve', gulp.parallel('watch', 'browser-sync'));

gulp.task('quick-serve', gulp.parallel('webpack', 'browser-sync'));

gulp.task('default', gulp.series('prettier', 'webpack'));
