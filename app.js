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
mongoose.set('useFindAndModify', false)
mongoose.set("useCreateIndex", true);



const itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    imgURL: String,
    brand: String,
    price: Number,
    category: String,
    quantity: Number,
    sizes: [String]

})
const Item = new mongoose.model("Item", itemSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
    number: Number,
    name: String,
    message: String,
    orders:[{
        item:{type: mongoose.Schema.Types.ObjectId, ref: 'Item'},
        qty:Number,
        recieved:Boolean,
        date:String,
        size:String
    }],
    address: {
        addrs: String,
        city: String,
        tel: Number,

    },
});






userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


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
    sizes:[ 200,300,500]


})
const item2 = new Item({

    title: "Hadi",
    description: "hahahhaahhahahha",
    imgURL: "deodorant.Jpeg",
    brand: "b@beyonce.com",
    price: 34,
    category: "Shampoo",
    quantity: 3,
    sizes: [200,600,900]


})

const item3 = new Item({

    title: "Sara",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [200,500,600]


})

const item4 = new Item({

    title: "Nivine",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    size: [100,700]


})
const item5 = new Item({

    title: "Tala",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    size: [300]


})

// Item.insertMany([item1, item2, item3,item4,item5], function(err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log([item1, item2, item3])
//     }
// })







app.get("/", function(req, res) {
    res.render("home", { req: req });
});
app.get("/home", function(req, res) {
    res.render("home", { req: req });
})

app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: "/signup" }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect("/");
    });
app.get("/card",function(req,res){

    
    // const items = User.findById(req.user.id,function(err,user){
    //     const orders = user.orders;
    
        
    // })
//   const usesr =  User.findOne({id:req.user.id}).populate('orders.item')
//     console.log(usesr)
    
    // res.render("place-order", { req: req ,orders:req.user.orders});
})

app.post("/card", function(req, res) {
   
    if (req.isAuthenticated()) {
        const created_at = new Date().toLocaleString();
        
        console.log("user is signed in")
        const box=req.body.box
        const id=req.body.id
        const size=req.body.size
      
        User.findByIdAndUpdate(req.user.id, {$push: {orders:{'item': id,'qty':box,'recieved':false,date:created_at}}}, function(err) {
            if(err){
                console.log(err)
            }
        });
    
        res.render("shipping-card", { req: req,address:req.user.address });
        
    } else {
        console.log("user is not signed in")
        res.render("card", { req: req });

    }
})

app.get("/shipping-card", function(req, res) {
    res.render("shipping-card", { req: req });
})

app.post("/payment-card", function(req, res) {
    res.render("place-order", { req: req,orders:req.user.orders});
})



app.post("/contact", function(req, res) {

    if (req.isAuthenticated()) {
        User.updateOne({ _id: req.user.id }, {
            message: newMessage
        }, function(err) {
            if (!err) {
                console.log("message received")
                    // alert("Thank you for your feedback")
                    // confirm("Message Received")
                res.redirect("/");
            } else {
                console.log(err);
            }
        })
    } else {
        const newUser = new User({
            name: req.body.txtName,
            email: req.body.txtEmail,
            number: req.body.Phone,
            message: req.body.txtMsg
        });

        newUser.save();

        res.redirect("/")

    }



})
app.post("/shipping-card", function(req, res) {
    const tel = req.body.number;
    const add = req.body.address;
    const city=req.body.city;
    const id = req.user.id;

    User.findByIdAndUpdate(id, {$set: {'address.addrs': add,'address.tel':tel,'address.city':city},}, function(err) {
        if(err){
            console.log(err)
        }
    });
   
    res.render("payment-card", { req: req });
})


    // Fruit.updateOne({ _id: "600c196dbbc9c90e3c9fef4d" }, { name: "Peach" }, function(err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("succesfully updated!");
    //     }
    // });

app.post("/payment.card", function(req, res) {
    console.log("payment success")
    res.render("place-order", { req: req });
})

app.post("/signin-card", function(req, res) {

    const user = new User({
        username: req.body.username,
    });


    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {

                res.render("shipping-card", { req: req });
            });

        }
    });
})

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
    Item.findOne({ title: custom }, function(err, foundItems) {
        if (!err) {
            if (!foundItems) {
                res.redirect("/" + custom);
            } else {
                console.log("item found: " + foundItems);
                res.render("product", { req: reqq, item: foundItems });
            }
        }

    })
})

app.post("/products", function(req, res) {

    const item = req.body.productlist;

    Item.find({ title: item }, function(err, found) {
        if (!err) {
            if (found.length != 0) {
                console.log(found)
                res.render("products", { items: found, req: req })
            } else {
                Item.find({ brand: item }, function(errr, foundb) {
                    if (!err) {
                        if (foundb) {
                            console.log(foundb)
                            res.render("products", { items: foundb, req: req })
                        }
                    }
                })
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