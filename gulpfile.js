'use strict';

var gulp = require('gulp'),
$ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/,
    lazy: true,
    camelize: true
}),
pngquant = require('imagemin-pngquant'),
rimraf = require('rimraf'),
browserSync = require("browser-sync"),
sass = require('gulp-sass'),
reload = browserSync.reload;

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/html/**/*.html', 
        jade: 'src/jade/**/*.jade', 
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 666,
    logPrefix: "Furo"
};



gulp.task('html:build', function () {
    gulp.src(path.src.jade) //Выберем файлы по нужному пути
        .pipe($.jade()) //Прогоним через jade
        .pipe($.rigger()) //Прогоним через rigger
        .pipe($.htmlPrettify({indent_char: '  ', indent_size: 1})) //Добавим красоты в html
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
    });

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe($.rigger()) //Прогоним через rigger
        .pipe($.sourcemaps.init()) //Инициализируем sourcemap
            .pipe($.uglify()) //Сожмем наш js
        .pipe($.sourcemaps.write('maps')) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe($.sourcemaps.init()) //То же самое что и с js
            .pipe(sass().on('error', sass.logError)) //Скомпилируем
            .pipe($.autoprefixer()) //Добавим вендорные префиксы
            .pipe($.minifyCss()) //Сожмем
        .pipe($.sourcemaps.write('maps'))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe($.imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    $.watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    $.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    $.watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    $.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    $.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);