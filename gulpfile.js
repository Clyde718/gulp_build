const { src, dest, parallel, series, watch } = require('gulp'); // Определяем константы Gulp
const browserSync = require('browser-sync').create();          	// Подключаем Browsersync
const concat = require('gulp-concat');                         	// Подключаем gulp-concat
const uglify = require('gulp-uglify-es').default;               // Подключаем gulp-uglify-es
const sass = require('gulp-sass');                              // gulp-sass
const autoprefixer = require('gulp-autoprefixer');              // gulp-autoprefixer
const cleancss = require('gulp-clean-css');                     // gulp-clean-css
const imagemin = require('gulp-imagemin');                      // Подключаем gulp-imagemin для работы с изображениями
const newer = require('gulp-newer');                            // Подключаем модуль gulp-newer
const del = require('del');                                     // Подключаем модуль del
const sourcemaps = require('gulp-sourcemaps');                  // gulp-sourcemaps

// Определяем логику работы Browsersync
function browsersync() {
  browserSync.init({
    // Инициализация Browsersync
    server: { baseDir: 'app/' },
    // Указываем папку сервера  
    notify: false,
    // Отключаем уведомления
    online: true
    // Режим работы: true или false
  })
}


function styles() {
  return src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // сама компиляция
    .pipe(concat('style.min.css')) // Конкатенируем в файл app.min.js
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true,
      cascade: false
    })) // Создадим префиксы с помощью Autoprefixer
    .pipe(cleancss({
      level:
      {
        1: { specialComments: 0 }
      } /* , format: 'beautify' */  // Минифицируем стили
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
    .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}


function scripts() {
  return src([ // Берём файлы из источников
    'app/js/components/**/*.js',    // Пример подключения библиотеки
    'app/js/app.js'                // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
  ])
    .pipe(concat('app.min.js')) // Конкатенируем в один файл
    .pipe(uglify()) // Сжимаем JavaScript
    .pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
    .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}


function images() {
  return src('app/img/src/**/*') // Берём все изображения из папки источника
    .pipe(newer('app/img/dest/')) // Проверяем, было ли изменено (сжато) изображение ранее
    .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
    .pipe(dest('app/img/dest/')) // Выгружаем оптимизированные изображения в папку назначения
}

// Вспомогательный таск
function clean_img() {
  return del('app/img/dest/**/*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}


function libs_js() {  // Сбока всех библиотек Java Script
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/slick-carousel/slick/slick.min.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(dest('app/js/libs'))
    .pipe(browserSync.stream())
}


function libs_css() {
  return src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.css'
  ])
    .pipe(concat('_libs.scss'))
    .pipe(dest('app/sass/libs'))
    .pipe(browserSync.stream())
}


function cleandist() {
  return del('dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}


function buildcopy() {
  return src([ // Выбираем нужные файлы
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/images/dest/**/*',
    'app/**/*.html',
    'app/fonts/*',
    'app/icons/**/*'
  ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
    .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}


function startwatch() {
  // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts); // тригер
  // Мониторим файлы препроцессора на изменения
  watch(['app/sass/**/*.sass', 'app/sass/**/*.scss'], styles);
  // Мониторим файлы HTML на изменения
  watch('app/**/*.html').on('change', browserSync.reload);
  // Мониторим папку-источник изображений и выполняем images(), если есть изменения
  watch('app/img/src/**/*', images);
}


exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.clean_img = clean_img; // Удаляет всё содержимое папки dest c картинками
exports.libs_js = libs_js;
exports.libs_css = libs_css;
exports.cleandist = cleandist;
exports.buildcopy = buildcopy;
exports.startwatch = startwatch;


// Создаём новый таск "build", который последовательно выполняет нужные операции
// Таск служит уже для сборки готового проекта
exports.build = series(cleandist, styles, scripts, images, buildcopy);


exports.default = parallel(styles, scripts, browsersync, startwatch);
// параллельное выполнение всех перечисленных в скобках функций. В нашем случае,
// параллельно будут собраны скрипты (scripts), стили (styles), запущен сервер (browsersync) и запущен вотчер (startwatch).














































