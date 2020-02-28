/**========================================================
 * 
 * Dévéloppé par Ja'Ch Technologies, Décembre 2019
 * 
 ===========================================================*/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db = require("./models/db");

//mongodb+srv://frdrcpeter:mongodbpasswordmerdique@frdrcpetercluster-hiqa9.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost/Beniragi
var string_con = 'mongodb+srv://frdrcpeter:mongodbpasswordmerdique@frdrcpetercluster-hiqa9.mongodb.net/test?retryWrites=true&w=majority';

db.connect(string_con, (isConnected, resultConnect) => {
	console.log(resultConnect);
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/Users');
var typeUsersRouter = require('./routes/TypeUsers');
var codeRouter = require('./routes/Code');
var jobsRouter = require('./routes/Jobs');
var offerRouter = require('./routes/Offer');
var evaluationRouter = require('./routes/Evaluation');
var townRouter = require('./routes/Town');
var viewRouter = require('./routes/View');
var favorisRouter = require('./routes/Favoris');
var skillsRouter = require('./routes/Skills');
var notificationRouter = require('./routes/Notification');
var vipRouter = require('./routes/Vip');

//For admin
var AdminRouter = require("./routes/admin/Admin");
var jobsAdminRouter = require("./routes/admin/Jobs");
var typeUsersAdminRouter = require("./routes/admin/TypeUsers");
var usersAdminRouter = require("./routes/admin/Users");
var vipAdminRouter = require("./routes/admin/Vip");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/type_users', typeUsersRouter);
app.use('/code', codeRouter);
app.use('/jobs', jobsRouter);
app.use('/offer', offerRouter);
app.use('/evaluation', evaluationRouter);
app.use('/notification', notificationRouter);
app.use('/town', townRouter);
app.use('/view', viewRouter);
app.use('/favoris', favorisRouter);
app.use('/skills', skillsRouter);
app.use('/vip', vipRouter);

//For admin
app.use('/admin', AdminRouter);
app.use('/admin/jobs', jobsAdminRouter);
app.use('/admin/type_users', typeUsersAdminRouter);
app.use('/admin/users', usersAdminRouter);
app.use('/admin/vip', vipAdminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
