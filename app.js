var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    Post                  = require("./models/post"),
    Comment               = require("./models/comment"),
    countries             = require("./public/countries"),
    LocalStrategy         = require("passport-local"),
    methodOverride = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose");
    
mongoose.connect("mongodb://localhost/photoVault");
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
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

//============
// ROUTES
//============

app.get("/", function(req, res){
    res.render("index.ejs");
});

app.get("/login", function(req, res){
    res.redirect("/");
});

app.get("/home",isLoggedIn, function(req, res){
    Post.find({}, function(err, posts){
        if (err) {
            console.log(err);
        }
        else {
            res.render("home.ejs", {posts: posts});
        }
    })
});

app.get("/home/:id", function(req, res){
    Post.findById(req.params.id).populate("comments").exec(function(err, post){
        if (err) {
            console.log(err);
        } else {
            res.render("post.ejs", {post: post});
        }
    })
});

app.get("/account", function(req, res){
    res.render("account.ejs", {countries: countries});
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.get("/home/:id/edit", function(req, res){
    Post.findById(req.params.id, function(err, foundPost){
        res.render("edit.ejs", {post: foundPost, countries: countries});
    });
});

app.post("/", function(req, res){
    User.register(new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email
    }), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('index.ejs');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/home");
        });
    });
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/"
    }) ,function(req, res){
});

app.post("/home", function(req, res){
    Post.create(req.body.post, function(err, newPost){
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/home");
        }
    })
});

app.post("/home/:id", function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
            res.redirect("/home/" + req.params.id);
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/home/" + post._id);
                }
            });
        }
    });
});

app.put("/home/:id", function(req, res){
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    });
});

app.put("/home/:id/comment/:commentId", function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

app.delete("/home/:id", function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home");
        }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

app.listen(3000, function(){
    console.log("server started.......");
});