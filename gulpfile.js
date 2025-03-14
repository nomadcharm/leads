// consider gulp-plumber, gulp-replace, gulp-rename

const { src, dest, series, watch, parallel } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const cheerio = require('gulp-cheerio');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const fileInclude = require('gulp-file-include');
const gulpIf = require('gulp-if');
const htmlMin = require('gulp-htmlmin');
const imageMin = require('gulp-imagemin');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const svgMin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff2 = require('gulp-ttf2woff2');
const typograf = require('gulp-typograf');
const uglify = require('gulp-uglify-es').default;
const webp = require('gulp-webp');
const webpackStream = require('webpack-stream');

gulp.task('deploy', function() {
  return ghPages.publish('dist');
});

let prodBuild = false;

const isProd = (done) => {
  prodBuild = true;
  done();
};

const clean = () => {
  return del(['dist'])
};

const resources = () => {
  return src('src/assets/**')
    .pipe(dest('dist/assets'));
};

const htmlBuild = () => {
  return src('src/*.html')
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
};

const htmlMinify = () => {
  return src('dist/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'));
}

const styles = () => {
  return src('src/scss/**/*.scss')
    .pipe(sass.sync().on('error', notify.onError()))
    .pipe(gulpIf(!prodBuild, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
    }))
    .pipe(gulpIf(prodBuild, cleanCSS({
      level: 2
    })))
    .pipe(sourcemaps.write())
    .pipe(gulpIf(prodBuild, rename({
      suffix: '.min'
    })))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
    .pipe(gulpIf(!prodBuild, sourcemaps.init()))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(webpackStream({
      mode: isProd ? 'production' : 'development',
      output: {
        filename: 'app.js',
      },
      module: {
        rules: [{
          test: /\.(js)$/,
          exclude: /node_modules/,
        }]
      },
    }))
    .pipe(gulpIf(prodBuild, uglify({
      toplevel: true,
    })).on('error', notify.onError()))
    .pipe(gulpIf(prodBuild, rename({
      suffix: '.min'
    })))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
};

const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.jpeg',
    'src/img/**/*.png',
    'src/img/*.svg',
  ])
    .pipe(gulpIf(prodBuild, imageMin()))
    .pipe(dest('dist/img'))
};

const toWebp = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.jpeg',
    'src/img/**/*.png',
  ])
    .pipe(webp())
    .pipe(dest('dist/img'))
};

const svgSprites = () => {
  return src('src/img/svg/**/*.svg')
    .pipe(
      svgMin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true
        },
      })
    )
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/img'))
};

const fonts = () => {
  return src('src/fonts/**.ttf')
  .pipe(ttf2woff2())
  .pipe(dest('./dist/fonts'))
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
};

watch(`src/partials/*.html`, htmlBuild);
watch('src/**/*.html', htmlBuild);
watch('src/scss/**/*.scss', styles);
watch('src/js/**/*.js', scripts);
watch(['src/img/**/*.jpg', 'src/img/**/*.jpeg', 'src/img/**/*.png', 'src/img/*.svg'], images);
watch(['src/img/**/*.jpg', 'src/img/**/*.jpeg', 'src/img/**/*.png'], toWebp);
watch('src/img/svg/**/*.svg', svgSprites);
watch('src/assets/**', resources);
watch('src/fonts', fonts)

exports.default = series(clean, resources, htmlBuild, styles, scripts, images, toWebp, svgSprites, fonts, watchFiles);
exports.build = series(isProd, clean, resources, htmlBuild, htmlMinify, styles, scripts, images, toWebp, fonts, svgSprites);
