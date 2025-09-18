require('dotenv').config();
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const njk = require('gulp-nunjucks-render');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const fs = require('fs').promises;
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulpIf = require('gulp-if');
const listing = require('is-pagelist');
const typograf = require('gulp-typograf');
const babel = require('gulp-babel');
const vinylFTP = require('vinyl-ftp');
const log = require('fancy-log');

const isProd = process.env.NODE_ENV === 'production';

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  parallel: 5,
  log: log,
};

const deploy = () => {
  const conn = vinylFTP.create(ftpConfig);

  return src('app/**/*', { base: 'app', buffer: false })
    .pipe(conn.dest(process.env.FTP_REMOTE_PATH))
    .on('end', () => {
      log(`🚀 Деплой завершен! Сайт доступен по ссылке: ${process.env.SITE_URL}`);
    });
};

// Очищаем папку `app`
const clean = () => fs.rm('app', { recursive: true, force: true });

// Компиляция HTML
const html = () => {
  return src(['src/**/*.html', '!src/components/**/*.html'])
    .pipe(njk({ path: 'src/' }))
    .pipe(replace('?cb', '?cb=' + new Date().getTime()))
    .pipe(typograf({ locale: ['ru', 'en-US'], htmlEntity: { type: 'digit' } }))
    .pipe(gulpIf(isProd, replace('libs.css', 'libs.min.css')))
    .pipe(gulpIf(isProd, replace('main.css', 'main.min.css')))
    .pipe(gulpIf(isProd, replace('libs.js', 'libs.min.js')))
    .pipe(gulpIf(isProd, replace('main.js', 'main.min.js')))
    .pipe(dest('app'))
    .pipe(browserSync.stream());
};

// Компиляция SASS -> CSS
const style = () => {
  return src(['src/sass/**/*.sass', '!src/sass/libs.sass'])
    .pipe(
      plumber({
        errorHandler: notify.onError((error) => ({
          title: 'SASS',
          message: error.message,
        })),
      })
    )
    .pipe(sass())
    .pipe(gulpIf(isProd, cleanCSS({ level: 2 })))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpIf(isProd, concat('main.min.css'), concat('main.css')))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream());
};

// Компиляция SASS для библиотек
const libs_style = () => {
  return src('src/sass/libs.sass')
    .pipe(sass())
    .pipe(gulpIf(isProd, cleanCSS({ level: 2 })))
    .pipe(gulpIf(isProd, concat('libs.min.css'), concat('libs.css')))
    .pipe(dest('app/css/'));
};

// Сборка JavaScript
const js = () => {
  return src('src/js/main.js')
    .pipe(
      plumber({
        errorHandler: notify.onError((error) => ({
          title: 'JavaScript',
          message: error.message,
        })),
      })
    )
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(gulpIf(isProd, terser()))
    .pipe(gulpIf(isProd, concat('main.min.js'), concat('main.js')))
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream());
};

// Сборка JS-библиотек
const libs_js = () => {
  return src([
    'src/js/vendor/fancybox.umd.js',
    'src/js/vendor/swiper-bundle.min.js',
    // 'src/js/vendor/gsap.min.js',
    // 'src/js/vendor/ScrollTrigger.min.js',
    'src/js/vendor/scroller.browser.js',
  ])
    .pipe(gulpIf(isProd, terser()))
    .pipe(gulpIf(isProd, concat('libs.min.js'), concat('libs.js')))
    .pipe(dest('app/js/'));
};

// Копирование изображений
const img = () => {
  return src('src/img/**/*').pipe(dest('app/img'));
};

// Копирование ресурсов
const resources = () => {
  return src('src/resources/**').pipe(dest('app'));
};

// Список страниц
const pageList = () => {
  return src('app/*.html').pipe(listing('page-list.html')).pipe(dest('app/'));
};

// Сервер и слежение за файлами
const watching = () => {
  browserSync.init({
    server: {
      baseDir: 'app',
    },
    online: true,
  });

  watch(['src/**/*.html', 'src/components/**/*.html'], series(html));
  watch('src/sass/**/*.sass', series(style));
  watch('src/sass/libs.sass', series(libs_style));
  watch('src/js/**/*.js', series(js));
  watch('src/js/vendor/**/*.js', series(libs_js));
  watch('src/img/**/*', series(img));
  watch('src/resources/**/*', series(resources));
};

// Экспорт тасков
exports.clean = clean;
exports.html = html;
exports.style = style;
exports.libs_style = libs_style;
exports.js = js;
exports.libs_js = libs_js;
exports.img = img;
exports.resources = resources;
exports.watching = watching;
exports.pageList = pageList;

// **Основной сценарий разработки**
exports.default = series(clean, parallel(libs_js, js, libs_style, style, html, img, resources), watching);

// **Сборка проекта**
exports.build = series(clean, parallel(libs_js, js, libs_style, style, html, img, resources), pageList);

// **Деплой проекта**
exports.deploy = series(deploy);
