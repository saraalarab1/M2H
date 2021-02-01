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
mongoose.set("useFindAndModify", false);


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
    number: Number,
    name: String,
    message: String,
    orders:[{
        items:[{
                img:String,
                title:String,
                price:Number,
                qty:Number,
                size:String }],
                recieved:{type:Boolean,default :false},
                checkout:{type:Boolean,default :false},
                date:String
            }],
           
    address: {
        addrs: String,
        city: String,
        number: Number,

    },
});

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
    sizes: [200,500,100]


})
const item2 = new Item({

    title: "Hadi",
    description: "hahahhaahhahahha",
    imgURL: "deodorant.Jpeg",
    brand: "b@beyonce.com",
    price: 34,
    category: "Shampoo",
    quantity: 3,
    sizes: [200,500,100]


})

const item3 = new Item({

    title: "Sara",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [200,500,100]


})

const item4 = new Item({

    title: "Nivine",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes:[200,500,100]


})
const item5 = new Item({

    title: "Tala",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [200,500,100]


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


app.post("/card", function(req, res) {
    if (req.isAuthenticated()) {
        console.log("user is signed in")
        const box=req.body.box
        const size=req.body.size
        const img=req.body.img
        const title=req.body.title
        const price = req.body.price

        let checked=false;
        if(req.user.orders.length>0){
         checked = req.user.orders[0].checkout;
        }
        
        
      if(checked){
        User.findByIdAndUpdate(req.user.id,
            {$push:{'orders':{  $each:[{
                                        'items':{
                                        'img':img,
                                        'title':title,
                                        'price':price,
                                        'qty':box,
                                        'size':size}
                                        }],
                                $position:0
                                
                             }
                           
                }
        
               
                     
            }, function(err) {
            if(err){
                console.log(err)
            }
        });

        }else{

            User.findByIdAndUpdate(req.user.id,
                {$push:{'orders.0.items':{
    
                                'img':img,
                                'title':title,
                                'price':price,
                                'qty':box,
                                'size':size
               
                                }
                        }
                   
                         
                }, function(err) {
                if(err){
                    console.log(err)
                }
            });
    

        }
    
    
        res.render("shipping-card", { req: req,address:req.user.address });
        
    } else {
        console.log("user is not signed in")
        res.render("card", { req: req });

    }
})

app.get("/shipping-card", function(req, res) {
    res.render("shipping-card", { req: req });
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
app.get("/card",function(req,res){

    
    User.findById(req.user.id,function(err,user){

        const orders = user.orders;
        const order = orders[0]
        
    res.render("place-order", { req:req,items:order.items,order:order,orders:orders});
})
})

app.post("/payment-card", function(req, res) {


    User.findById(req.user.id,function(err,user){

        const orders = user.orders;
        const order = orders[0]
        
    res.render("place-order", { req: req,items:order.items,order:order,orders:orders});
    })
    

    
})


app.post("/checkout", function(req,res){
    const date = new Date().toLocaleString()

    User.findByIdAndUpdate(req.user.id,{'orders.0.checkout':true,'orders.0.date':date},function(err,user){
            res.redirect('/card')
    })
 

})


app.post("/shipping-card", function(req, res) {
        console.log(req.body.address);
        console.log(req.body.city);
        console.log(req.body.number);
        console.log(req.user.id);
        var newAddress = {
            addrs: req.body.address,
            city: req.body.city,
            number: req.body.number
        }
        User.updateOne({ _id: req.user.id }, {
            address: newAddress

        }, function(err) {
            if (!err) {
                console.log("No error: " + req.user.address);
            } else {
                console.log(err)
            }
        })
        res.render("payment-card", { req: req });
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