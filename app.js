//jshint esversion:6
require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
global.mongoose = mongoose;
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
mongoose.set("useFindAndModify", false);


const brandSchema = new mongoose.Schema({
    brand: String,
    categories: [String],
    img: String
})

const emailSchema = new mongoose.Schema({
    email: String
})

const categorySchema = new mongoose.Schema({
    category: String,
    brands: [String],
    img: String
})

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
const Email = new mongoose.model("Email", emailSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
    number: Number,
    name: String,
    message: String,
    orders: [{
        items: [{
            img: String,
            title: String,
            price: Number,
            qty: Number,
            size: String
        }],
        total: Number,
        recieved: { type: Boolean, default: false },
        checkout: { type: Boolean, default: false },
        date: String
    }],

    address: {
        addrs: String,
        city: String,
        tel: Number,

    },
});





userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Brand = new mongoose.model("Brand", brandSchema);
const User = new mongoose.model("User", userSchema);
const Category = new mongoose.model("Category", categorySchema);

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
    sizes: [200, 500, 100]


})
const item2 = new Item({

    title: "Hadi",
    description: "hahahhaahhahahha",
    imgURL: "deodorant.Jpeg",
    brand: "b@beyonce.com",
    price: 34,
    category: "Shampoo",
    quantity: 3,
    sizes: [200, 500, 100]


})

const item3 = new Item({

    title: "Sara",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [200, 500, 100]


})

const item4 = new Item({

    title: "Nivine",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [200, 500, 100]


})
const item5 = new Item({

    title: "Tala",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "b@beyonce.com",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [300]


})
const item6 = new Item({

    title: "Tala",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "Johnson",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [300]


})

const item7 = new Item({

    title: "Tala",
    description: "hahahhaahhahahha",
    imgURL: "teeth.jpg",
    brand: "Johnson",
    price: 35,
    category: "Shampoo",
    quantity: 3,
    sizes: [300]


})

const brand1 = new Brand({
    brand: "Johnson",
    categories: ["Shampoo", "body care", "deodorant"],
    img: "../images/Johnson.jpg"
})


const brand2 = new Brand({
    brand: "Colgate",
    categories: ["teeth"],
    img: "../images/teeth.jpg"
})

const brand3 = new Brand({
    brand: "vaseline",
    categories: ["body care"],
    img: "../images/bodycare.jpg"
})


const categ1 = new Category({
    category: "Shampoo",
    brands: ["Johnson", "dove"],
    img: "../images/Johnson.jpg"
})
const categ4 = new Category({
    category: "body care",
    brands: ["vaseline"],
    img: "../images/Johnson.jpg"
})
const categ2 = new Category({
    category: "deodorant",
    brands: ["axe", "dove", "adidas"],
    img: "../images/Johnson.jpg"
})
const categ3 = new Category({
    category: "teeth",
    brands: ["colgate"],
    img: "../images/Johnson.jpg"
})

// Category.insertMany([categ1, categ2, categ3, categ4], function(err) {
//     if (err) console.log(err);
//     else console.log([categ1, categ2, categ3]);
// })

// Brand.insertMany([brand1, brand2, brand3], function(err) {
//     if (err) console.log(err);
//     else console.log([brand1, brand2, brand3]);
// })

// Item.insertMany([item1,item2,item3,item4,item5,item6, item7], function(err) {
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


app.post("/stayConnected", function(req, res) {

    const email = new Email({
        email: req.body.email
    })
    console.log(email);
    Email.create(email, function(err) {
        if (err) console.log(err);
        else console.log("email added");
    });
    res.redirect("/")
})

app.post("/card", function(req, res) {
    if (req.isAuthenticated()) {
        const created_at = new Date().toLocaleString();

        console.log("user is signed in")
        const box = req.body.box
        const size = req.body.size
        const img = req.body.img
        const title = req.body.title
        const price = req.body.price

        let checked = false;
        if (req.user.orders.length > 0) {
            checked = req.user.orders[0].checkout;
        }


        if (checked) {
            User.findByIdAndUpdate(req.user.id, {
                $push: {
                    'orders': {
                        $each: [{
                            'items': {
                                'img': img,
                                'title': title,
                                'price': price,
                                'qty': box,
                                'size': size
                            }
                        }],
                        $position: 0

                    }

                }



            }, function(err) {
                if (err) {
                    console.log(err)
                }
            });

        } else {

            User.findByIdAndUpdate(req.user.id, {
                $push: {
                    'orders.0.items': {

                        'img': img,
                        'title': title,
                        'price': price,
                        'qty': box,
                        'size': size

                    }
                }


            }, function(err) {
                if (err) {
                    console.log(err)
                }
            });


        }


        res.render("shipping-card", { req: req, address: req.user.address });

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
    // app.get("/card", function(req, res) {


//     User.findById(req.user.id, function(err, user) {
//         user.orders.total = 0;

//         const orders = user.orders;
//         const order = orders[0]

//         res.render("place-order", { req: req, items: order.items, order: order, orders: orders });
//     })
// })


app.get("/card", function(req, res) {
    User.find({}, function(err, users) {
        res.render("admin", { req: req, users: users })
    })
})


app.post("/payment-card", function(req, res) {


    User.findById(req.user.id, function(err, user) {

        const orders = user.orders;
        const order = orders[0]

        res.render("place-order", { req: req, items: order.items, order: order, orders: orders });
    })



})


app.post("/checkout", function(req, res) {
    const date = new Date().toLocaleString()
    console.log("total order: " + req.body.orderTotal);
    req.user.orders[0].items.total = req.body.orderTotal;
    User.findByIdAndUpdate(req.user.id, { 'orders.0.checkout': true, 'orders.0.date': date }, function(err, user) {
        res.redirect('/card')
    })


})




app.post("/shipping-card", function(req, res) {
    const tel = req.body.number;
    const add = req.body.address;
    const city = req.body.city;
    const id = req.user.id;

    User.findByIdAndUpdate(id, { $set: { 'address.addrs': add, 'address.tel': tel, 'address.city': city }, }, function(err) {


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
            passport.authenticate("local", { failureRedirect: "/signinFail" })(req, res, function() {
                console.log("entered");
                res.redirect("/");
            });
        }
    });
});

app.get("/signinFail", function(req, res) {
    res.render("signinFail", { req: req });
})


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

app.get("/productsCat/:custom", function(req, res) {

    const custom = req.params.custom;
    Item.find({ category: custom }, function(err, foundItems) {
        if (!err) {
            if (foundItems) {
                console.log("filtering items");
                Category.find({}, function(err, foundCat) {
                    if (!err) {
                        console.log("ready to enter");
                        res.render("products", { items: foundItems, categories: foundCat, req: req })
                    }

                })
            }
        }
    })
})


app.get("/brand", function(req, res) {
    res.render("brand", { req: req, brands: brand })
})

// app.post("/brand", function(req, res) {
//     console.log(req.body.brandName);

//     const product = req.body.brandName;
//     Item.find({ brand: product }, function(err, found) {
//         if (!err) {
//             if (found.length != 0) {
//                 console.log(found);
//                 Category.find({}, function(err, foundCat) {
//                     if (!err) {
//                         res.render("products", { items: found, categories: foundCat, req: req })

//                     }

//                 })
//             } else {
//                 console.log("not found");
//             }
//         }
//     })
// })


app.post("/products", function(req, res) {

    category = req.body.category;
    item = req.body.item;
    brand = req.body.brand;
    which = req.body.which;
    categ = req.body.categ;
    bra = req.body.bra;
    console.log(category)
    console.log(item)
    console.log(brand)
    console.log(which)
    console.log(categ)
    console.log(bra)
    console.log(typeof which)
    console.log(typeof categ)
    console.log(typeof bra)








    if (category == null && item == null && which == null) {
        console.log("1a")
        Item.find({ brand: brand }, function(err, foundb) {
            if (!err) {
                if (foundb) {
                    console.log("foundb")
                    Brand.find({ brand: brand }, function(err, foundCat) {
                        if (!err) {
                            console.log("no error till now")
                            res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                        }
                    })


                } else {
                    res.render('')
                }
            }
        })

    } else
    if (item != null && which === "true") {
        console.log("2a")
        Item.find({ title: item, brand: brand }, function(err, foundb) {
            if (!err) {
                if (foundb) {

                    Category.find({}, function(err, foundCat) {
                        if (!err) {
                            res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                        }
                    })


                }
            }
        })

    } else
    if (categ != null && which === "true") {
        console.log("3a")
        Item.find({ category: categ, brand: brand }, function(err, foundb) {
            if (!err) {
                if (foundb) {

                    Category.find({}, function(err, foundCat) {
                        if (!err) {
                            res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                        }
                    })


                }
            }
        })
    } else if (brand == null && item == null && which == null) {
        console.log("1b")
        Item.find({ category: category }, function(err, foundb) {
            if (!err) {
                if (foundb) {

                    Brand.find({}, function(err, foundCat) {
                        if (!err) {
                            res.render("products", { items: foundb, brands: foundCat, req: req, brande: false })
                        }
                    })


                }
            }
        })

        if (item != null && which === "false") {
            console.log("2b")
            Item.find({ title: item, category: category }, function(err, foundb) {
                if (!err) {
                    if (foundb) {

                        Brand.find({}, function(err, foundCat) {
                            if (!err) {
                                res.render("products", { items: foundb, brands: foundCat, req: req, brande: false })
                            }
                        })


                    }
                }
            })

        } else
        if (bra != null && which === "false") {
            console.log("3b")
            Item.find({ category: category, brand: bra }, function(err, foundb) {
                if (!err) {
                    if (foundb) {

                        Brand.find({}, function(err, foundCat) {
                            if (!err) {
                                res.render("products", { items: foundb, brands: foundCat, req: req, brande: false })
                            }
                        })


                    }
                }
            })

        }
    }

    console.log("**************************")
})









app.get("/products", function(req, res) {
    Item.find({}, function(err, foundItems) {
        if (!err) {
            Category.find({}, function(err, foundCat) {
                if (!err) {
                    res.render("products", { items: foundItems, categories: foundCat, req: req })
                }
            })
        } else {
            console.log(err);
        }

    })
})




app.get("/category", function(req, res) {

    Category.find({}, function(err, found) {
        if (!err) {
            res.render("category.ejs", { categories: found, req: req });
        } else {
            console.log(err);
        }
    })
})



app.post("/category", function(req, res) {


    const category = req.body.categoryname;

    Category.find({ category: category }, function(err, found) {
        if (found != null) {
            const categories = found;
            console.log(categories)
            res.render("category", { categories: categories, req: req });
        } else {
            res.render("category", { categories: [], req: req });
        }
    })
})




app.get("/brands", function(req, res) {

    Brand.find({}, function(err, foundBrands) {
        if (!err) {
            res.render("brands.ejs", { brands: foundBrands, req: req });
        } else {
            console.log(err);
        }
    })
})

app.post('/brands', function(req, res) {

    const brand = req.body.brandname;
    console.log(brand)
    Brand.find({ brand: brand }, function(err, found) {
        if (found != null) {
            const brands = found;
            console.log(brands)
            res.render("brands.ejs", { brands: brands, req: req });
        } else {
            res.render("brands.ejs", { brands: [], req: req });
        }
    })

})


/* admin*/


app.get("/admin", function(req, res) {
    res.render("admin", { req: req, emails: req.emails });
})

app.get("/adminOrder", function(req, res) {

    res.render("adminOrder", { req: req });
})

app.post("/adminOrder", function(req, res) {
    // console.log("user id: " + req.body.userOrder);
    // console.log("order id: " + req.body.Order);
    console.log("this is the post adminOrder");
    User.find({}, function(err, users) {
        User.findById(req.body.userOrder, function(err, user) {

            user.orders.forEach(function(order) {
                if (order.id == req.body.Order) {
                    res.render("adminOrder", { req: req, order: order, userr: user, users: users });
                    console.log("found")
                }

            })
        })
    })

})



app.listen(3000, function() {
    console.log("Server started on port 3000");
})