var express = require('express'),
	app = express(),
	path = require('path'),
	ejs = require('ejs');

// 视图访问路径
app.set('views', path.join(__dirname, 'client/public/modules/'));
app.set('view engine', 'ejs');


// 静态资源访问路径
app.use(express.static(path.join(__dirname,'client/public/')));

// 路由配置
var routers = require('./routes');
app.use('/',routers);


// 处理404 以及 一些其他的异常处理
app.use(function(req,res,next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// 错误处理
app.use(function(err, req,res, next){
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});


var server = app.listen(3000,function(){
	var host = server.address().address,
		port = server.address().port;

	console.log('app listening at http://0.0.0.0:%s',port);
});