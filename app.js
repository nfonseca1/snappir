var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    methodOverride        = require("method-override");

var postRoutes = require("./routes/posts"),
    commentRoutes = require("./routes/comments"),
    accountRoutes = require("./routes/account"),
    apiRoutes = require("./routes/api"),
    indexRoutes = require("./routes/index");

require('dotenv').config();
//mongoose.connect("mongodb://localhost/photoVault");
mongoose.connect("mongodb://nfonseca1:" + process.env.MONGO_PASS + "@ds261332.mlab.com:61332/snappir");
var app = express();

app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require("express-session")({
    secret: "If you only knew the power of the dark side.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/", indexRoutes);
app.use("/home", postRoutes);
app.use("/account", accountRoutes);
app.use("/api", apiRoutes);
app.get("/*", function(req, res){
    res.send("You've arrived");
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started.......");
});

