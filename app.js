require('dotenv').config();
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);

// app.use(session({
//     secret: 'foo',
//     store: new MongoStore(options)
// }));
var express              = require('express'), 
app                      = express(),
bodyParser               = require('body-parser'),
mongoose                 = require('mongoose'),
methodOverride           = require('method-override');
//MODELS
Campground               = require('./models/campgrounds'), 
Comment                  = require('./models/comment'), 
User                     = require('./models/user'), 
Order                     = require('./models/order'), 
//AUTHENTICATE
passport                 = require('passport'),
LocalStrategy            = require('passport-local'),
PassportLocalMongoose    = require('passport-local-mongoose'),
seeds                    = require('./seeds');


//ROUTES
var  indexRoute       = require('./routes/indexRoute'),
     commentsRoute    = require('./routes/commentsRoute'),
     campgroundsRoute = require('./routes/campgroundsRoute');
     orderRoute = require('./routes/orderRoute');
var  flash            = require('connect-flash')  

// seeds();
//======================================== midlle of the procces ================================
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static( __dirname+"/public"));
app.set("view engine","ejs");
console.log(process.env.GEOCODER_API_KEY);
console.log(process.env.DATABASEURL);
//set DATABASEURL=mongodb://localhost:27017/yelp_camp_v13
// mongoose.connect("mongodb://localhost:27017/yelp_camp_v13",{useNewUrlParser:true});
// mongoose.connect("mongodb+srv://pinjas:pinjas@cluster0-849zr.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,
// useCreateIndex:true}).then(()=>{
//    console.log("CONNECTED TO DB") 
// }).catch((err) => {
//         console.log("ERROR!!!"+err);

// });


mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
.then(() => console.log( 'Database Connected' ))
.catch(err => console.log( err ));


//PASSPORT CONFIGURATE
app.use(require('cookie-session')({
    secret:"Mendel chono is the best cuted in the worlld",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash())

app.use(function(req,res,next){
    res.locals.currentUser = req.user; 
    res.locals.campGround =req.campground;
    res.locals.error = req.flash('error'); 
    res.locals.success = req.flash('success'); 
    next();
})

app.use( indexRoute);
app.use("/campGround",orderRoute);
app.use("/campGround",campgroundsRoute);
app.use("/campGround/:id/comment",commentsRoute);



var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
