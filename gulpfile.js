'use strict';

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const webpack = require('webpack');

// Theme and project specific paths.
const paths = {
  DIST_DIR: 'dist/',
  SASS_DIR: 'sass/',
};

// Try to ensure that all processes are killed on exit
const spawned = [];
process.on('exit', () => {
  spawned.forEach(pcs => {
    pcs.kill();
  });
});

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

gulp.task(
  'webpack',
  gulp.parallel(cb => {
    const webpackConfig = require('./webpack.config');
    webpack(webpackConfig).run(webpackOnBuild(cb));
  }),
);

gulp.task('serve', gulp.series('webpack', cb => {
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
    cb
  );
}));

gulp.task('default', gulp.parallel('webpack'));
