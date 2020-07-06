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


// mongodb+srv://pinjas:<password>@cluster0-849zr.mongodb.net/<dbname>?retryWrites=true&w=majority
// mongoose.connect("mongodb://localhost:27017/yelp_camp_v13",{useNewUrlParser:true});
mongoose.connect("mongodb+srv://pinjas:ariel@cluster0.2hzvt.mongodb.net/yelpcamp_1?retryWrites=true&w=majority",{useNewUrlParser:true,
useCreateIndex:true}).then(()=>{
   console.log("CONNECTED TO DB");
   console.log("CONNECTED !!");
   console.log("===============");

}).catch((err) => {
        console.log("ERROR!!!"+err);

});

//PASSPORT CONFIGURATE
app.use(require('express-session')({
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


// app.listen(3000,"localhost",function(){
//     console.log("server of yelp camp is running !") ;
// });


