var gulp = require('gulp');
var runSequence = require('run-sequence');

var less = require('gulp-less');					// 编译css
var minifyCSS = require('gulp-cssnano');			// 压缩css
var minifyImage = require('gulp-imagemin');			// 压缩图片
var pngquant = require('imagemin-pngquant'); 		// png图片压缩插件
var htmlmin = require('gulp-htmlmin');				// 压缩html

var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var concat = require('gulp-concat');				// 合并文件
var rename = require('gulp-rename');				// 重新命名文件
var uglify = require('gulp-uglify');				// js代码压缩
var jshint = require("gulp-jshint");				// js语法检测
var browserSync = require('browser-sync').create();	// 自动刷新
var reload = browserSync.reload;


var del = require('del');							// 删除文件

var modulesPath = 'modules/',
	componentsPath = 'components/',
	scriptsDestPath = 'public/assets/js',
	componentsDestPath = 'public/components',
	htmlDestPath = 'public/modules';

gulp.task('default',function(){
	runSequence(['ejs','css','scripts','jsLint','components','vendor','watch','json_datas']);
});

/**
 * 将images下面的所有图片都放在public/assets/images下面
 * @param  {[type]} ){	gulp.src('images*')		.pipe(gulp.dest('public/assets/images'));} [description]
 * @return {[type]}                                                                      [description]
 */
gulp.task('images',function(){
	return gulp.src('images/**/*')
		.pipe(minifyImage({
			progressive: true,
			use:[pngquant()]
		}))
		.pipe(gulp.dest('public/assets/images'));
});

/**
 * 对ejs进行处理
 * @param  {[type]} ){	var folders       [description]
 * @return {[type]}         [description]
 */
gulp.task('ejs',function(){
	var folders = getFolders(modulesPath);
	var tasks = folders.map(function(folder) {
		return gulp.src(path.join(modulesPath, folder, 'views/*.ejs'))
			.pipe(htmlmin({collapseWhitespace: true}))
			.pipe(gulp.dest(htmlDestPath+'/'+folder));
	});
	tasks = folders.map(function(folder) {
		return gulp.src(path.join(modulesPath, folder, 'views/*.tpl.ejs'))
			.pipe(gulp.dest(htmlDestPath+'/'+folder));
	});
	return tasks;
});



/**
 * 对css进行处理
 * @param  {[type]} ){	gulp.src('less*')	.pipe(minifyCSS())	.pipe(gulp.dest('public/assets/css'));} [description]
 * @return {[type]}                                                                                   [description]
 */
gulp.task('css',function(){
	return gulp.src('less/main.less')
	.pipe(less())
	.pipe(minifyCSS())
	.pipe(gulp.dest('public/assets/css'))
	.pipe(reload({ stream:true }));
});

/**
 * 配置json_datas
 * @param  {[type]} ){	return gulp.src('json_datas*.json')	.pipe(gulp.dest('public/json_datas'));} [description]
 * @return {[type]}            [description]
 */
gulp.task('json_datas',function(){
	return gulp.src('json_datas/**/*.json')
	.pipe(gulp.dest('public/json_datas'));
});


/**
 * 对所有的js文件进行打包处理
 * @param  {[type]} ) {	var        folders [description]
 * @return {[type]}   [description]
 */
gulp.task('scripts', function() {
	var folders = getFolders(modulesPath);

	var tasks = folders.map(function(folder) {
		// 拼接成 foldername.js
		// 写入输出
		// 压缩
		// 重命名为 folder.min.js
		// 再一次写入输出
		return gulp.src([
			path.join(modulesPath, folder, '/js/'+folder+'.js'),
			path.join(modulesPath, folder, '/js/!('+folder+').js')
		])
			.pipe(concat(folder + '.js'))
			.pipe(uglify())
			.pipe(rename(folder + '.js'))
			.pipe(gulp.dest(scriptsDestPath));
	});
	return merge(tasks);
});

/**
 * 对组件Js的处理
 * @param  {[type]} ){	var folders       [description]
 * @return {[type]}         [description]
 */
gulp.task('components',function(){
	var folders = getFolders(componentsPath);
	var tasks = folders.map(function(folder){
		return gulp.src(path.join(componentsPath, folder, '/**/*.js'))
			.pipe(uglify())
			.pipe(gulp.dest(componentsDestPath));
	});
	return tasks;
});


/**
 * 对js语法进行检查
 * @param  {[type]} ){	var folders       [description]
 * @return {[type]}         [description]
 */
gulp.task('jsLint',function(){
	var folders = getFolders(modulesPath);
	var tasks = folders.map(function(folder) {
		return gulp.src(path.join(modulesPath, folder, '/**/*.js'))
			.pipe(jshint())
			.pipe(jshint.reporter());
	});
	return tasks;
});


/**
 * 共有插件的调用
 * @param  {[type]} ){	return gulp.src('vendor*')	.pipe(gulp.dest('public/vendor'));} [description]
 * @return {[type]}            [description]
 */
gulp.task('vendor',function(){
	return gulp.src('vendor/**/*')
	.pipe(gulp.dest('public/vendor'));
});

/**
 * 删除public目录
 * @param  {[type]} cb){	del(['public'],cb);} [description]
 * @return {[type]}                             [description]
 */
gulp.task('clean',function(cb){
	del(['public'],cb);
});


/**
 * 对各个部分的内容进行监视
 * @param  {[type]} ){	gulp.watch([modulesPath+'*.html'],['html']);	gulp.watch(['less/main.less'],['css']);	gulp.watch([modulesPath+'*.js'],['scripts']);	gulp.watch(['vendor*.js'],['vendor']);} [description]
 * @return {[type]}                                                                                                                                                                                 [description]
 */
gulp.task('watch',function(){

	/*browserSync({
		server : {
			baseDir : modulesPath
		}
	});*/
	browserSync.init({
        proxy   : "127.0.0.1:3000/user",
        port    : 8802
    });

	gulp.watch([modulesPath+'/**/*.ejs'],['ejs']);
	gulp.watch(['less/**/*.less'],['css'],{ cwd:modulesPath },reload);
	gulp.watch([componentsPath+'/**/*.js'],['components']);
	gulp.watch([modulesPath+'/**/*.js'],['scripts']);
	gulp.watch([modulesPath+'/**/*.js'],['jsLint']);
	gulp.watch(['vendor/**/*.js'],['vendor']);
	gulp.watch(['json_datas/**/*.json'],['json_datas']);
});


/**
 * 获取文件夹
 * @param  {[type]} dir [description]
 * @return {[type]}     [description]
 */
function getFolders(dir){
	return fs.readdirSync(dir)
	.filter(function(file){
		return fs.statSync(path.join(dir,file)).isDirectory();
	});
}
