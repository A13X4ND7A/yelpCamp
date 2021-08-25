const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//connecting to the database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

//opening the connection and addressing if the connection succeeds or fails
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
	console.log('Database Connected!');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); //SETS THE DEFAULT DIRECTORY FOR PAGES TO VIEWS

app.use(express.urlencoded({extended: true})); //ALLOWS US TO PARSE THE DATA FROM A POST REQUEST AND DISPLAY
app.use(methodOverride('_method')); // ALLOWS YOU TO USE EXTRA HTTP VERBS
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveuninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //allows cookie to expire a week from now. Needs to be written in milliseconds so the formula for working that out would be this: 1000 miliseconds multiplied by 60 seconds, multiplied by 60 minutes, multiplied by 24 hours, multiplied by 7 days.
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //telling passport how to serialize user
passport.deserializeUser(User.deserializeUser()); //telling passport how to deserialize user

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const {statusCode = 500} = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
	console.log('running on port 3000');
});
