//jshint esversion:6
require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/M2HDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

const itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    imgURL: String,
    brand: String,
    price: Number,
    category: String,
    quantity: Number,
    size: Number

})


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Item = new mongoose.model("Item", itemSchema);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);

        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));

const item1 = new Item({

    title: "Beyonce",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 33,
    category: "Shampoo",
    quantity: 3,
    size: 200


})
const item2 = new Item({

    title: "Hadi",
    description: "hahahhaahhahahha",
    imgURL: "deodorant.Jpeg",
    brand: "b@beyonce.com",
    price: 34,
    category: "Shampoo",
    quantity: 3,
    size: 200


})

const item3 = new Item({

    title: "Sara",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    size: 200


})

// Item.insertMany([item1, item2, item3], function(err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log([item1, item2, item3])
//     }
// })







app.get("/", function(req, res) {
    res.render("home", { req: req });
});


app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: "/signup" }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect("/");
    });





app.get("/signup", function(req, res) {
    res.render("signup", { req: req });
})
app.post("/signup", function(req, res) {

    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            });

        }
    });

});



app.post("/signin", function(req, res) {

    const user = new User({
        username: req.body.username,
    });


    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {

                res.redirect("/");
            });

        }
    });

});


app.get("/signout", function(req, res) {
    req.logout();
    res.redirect("/");
});



app.get("/about", function(req, res) {
    res.render("about.ejs", { req: req });
})

app.get("/feedback", function(req, res) {
    res.render("feedback.ejs", { req: req });
})

// app.get("/product", function(req, res) {
//     // console.log(res.body.titlee)
//     res.render("product", { req: req });
// })

app.get("/products/:custom", function(reqq, res) {
    const custom = reqq.params.custom
    Item.findOne({ title: custom}, function(err, foundItems) {
        if (!err) {
            if(!foundItems){
                res.redirect("/"+custom);
            }else{
            console.log("item found: " + foundItems);
            res.render("product", {req:reqq, item:foundItems });
            }
        }

    })
})


app.get("/products", function(req, res) {
    Item.find({}, function(err, foundItems) {
        if (!err) {
            res.render("products", { req: req, items: foundItems });
        } else {
            console.log(err);
        }

    })
})

app.get("/brands", function(req, res) {
    res.render("brands.ejs", { req: req });
})



app.listen(3000, function() {
    console.log("Server started on port 3000");
})