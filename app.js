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


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
// mongoose.connect("mongodb://localhost:27017/M2HDB", { useNewUrlParser: true });
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
    size: String


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
        recieved: { type: Boolean, default: false },
        checkout: { type: Boolean, default: false },
        items: [{
            img: String,
            title: String,
            price: Number,
            qty: Number,
            size: String
        }],
        total: String,
        date: String
    }],

    address: {
        addrs: String,
        city: String,
        tel: Number,

    },
});
const bestSellerSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
    },
    name: String,
    img: String

});

const BestSeller = new mongoose.model("BestSeller", bestSellerSchema)



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
const b1 = new BestSeller({
    name: "Johnson",
    image: "../images/Johnson.jpg"
})
const b2 = new BestSeller({
    name: "Colgate",
    image: "../images/teeth.jpg"
})
const b3 = new BestSeller({
    name: "Deodorant",
    image: "../images/deodorant.Jpeg"
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

// Item.findOne({title:'C&C Adv. Wash'},function(err,found){

//     BestSeller.insertMany(
//         {
//         item:found.id
//         }
//         , function(err) {
//         if (err) console.log(err);

//     })
// })



// Category.insertMany([categ1, categ2, categ3, categ4], function(err) {
//     if (err) console.log(err);
//     else console.log([categ1, categ2, categ3]);
// })

// Brand.insertMany(
//     {
//         it
//     }
//     , function(err) {
//     if (err) console.log(err);
//     else console.log([brand1, brand2, brand3]);
// })

// Item.insertMany(


//     , function(err) {
//     if (err) {
//         console.log(err);
//     } else {

//     }
// })




app.get("/", function(req, res) {
    Brand.find({}, function(err, foundBrand) {
        if (!err) {
            BestSeller.find({}, function(err, best) {
                console.log("gg" + best)
                Category.find({}, function(err, foundCat) {
                    res.render("home", { categoriess: foundCat, req: req, brandss: foundBrand, best: best })

                })
            })
        }
    })
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

app.post("/items", function(req, res) {
    Item.find({}, function(err, items) {
        console.log(items);
        res.render("items", { req: req, items: items });

    })
})


app.post("/add", function(req, res) {
    console.log(req.body.id);
    Item.findByIdAndUpdate(req.body.id, {
        title: req.body.name,
        description: req.body.description,
        imgURL: req.body.imageURL,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        quantity: req.body.quantity,
        size: req.body.size
    }, function(err, user) {
        res.redirect('/items')
    })

});
app.post("/addNew", function(req, res) {
    const newItem = new Item({
        title: req.body.name,
        description: req.body.description,
        imgURL: req.body.imageURL,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        quantity: req.body.quantity,
        size: req.body.size
    });
    Item.insertMany([newItem]);
    res.redirect("/items");
})

app.post("/addCategory", function(req, res) {
    const newCat = new Category({
        category: req.body.name,
        img: req.body.imageURL
    })
    Category.insertMany([newCat]);
    res.redirect("/adminpage");
})


app.post("/addBrand", function(req, res) {
    const newBrand = new Brand({
        brand: req.body.name,
        img: req.body.imageURL
    })
    Brand.insertMany([newBrand]);
    res.redirect("/adminpage");
})


app.get("/items", function(req, res) {
    Item.find({}, function(err, items) {
        res.render("items", { req: req, items: items });
    })

})
app.get("/adminOrder", function(req, res) {
    if (req.isAuthenticated()) {
        passport.authenticate("local")(req, res, function() {
            if (user.username == 'saraalarab2000@gmail.com' || user.username == 'hadiyouness10@icloud.com') {

                res.render("adminOrder", { req: req, users: users })

            } else {
                res.render("adminsign", { req: req, })
            }
        })
    } else {
        res.render("adminsign", { req: req, })
    }
})

app.post("/adminOrder", function(req, res) {
    // console.log("user id: " + req.body.userOrder);
    // console.log("order id: " + req.body.Order);
    console.log("this is the post adminOrder");
    User.find({}, function(err, users) {
        User.findById(req.body.userOrder, function(err, user) {

            user.orders.forEach(function(order) {
                console.log(order.id)
                if (order.id == req.body.Order) {
                    res.render("adminOrder", { req: req, order: order, userr: user, users: users });
                    console.log("found")
                }

            })
        })
    })

})



app.get("/adminpage", function(req, res) {
    if (req.isAuthenticated()) {
        passport.authenticate("local")(req, res, function() {
            console.log("entered")
            if (user.username == 'saraalarab2000@gmail.com' || user.username == 'hadiyouness10@icloud.com') {

                User.find({}, function(err, users) {
                    res.render("admin", { req: req, users: users })
                })
            } else {
                res.render("adminsign", { req: req, })
            }
        })
    } else {
        res.render("adminsign", { req: req, })
    }
})






app.get("/admin", function(req, res) {

    res.render("adminsign", { req: req, })

})
app.post("/admin", function(req, res) {

    const user = new User({
        username: req.body.username,
    });


    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                console.log("hello")
                if (user.username == 'saraalarab2000@gmail.com' || user.username == "hadiyouness10@icloud.com") {
                    console.log(user.username);
                    User.find({}, function(err, users) {
                        res.render("admin", { req: req, users: users })
                    })

                } else {
                    res.redirect("/adminsign")
                }
            });

        }
    });


})

app.post("/recieved", function(req, res) {
    const id = req.body.userOrder;
    const orderid = req.body.Order;
    console.log(id)
    console.log(orderid)
    User.findByIdAndUpdate(id, { 'orders.$[ele].recieved': true }, { arrayFilters: [{ "ele._id": orderid }] }, function(err, user) {
        res.redirect('/adminpage')
    })
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


    let path = req.headers.referer;
    path = path.split('//localhost:3000')
    path = path[1]

    const user = new User({
        username: req.body.username,
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local", { failureRedirect: "/signinFail" })(req, res, function() {
                console.log("entered");
                res.redirect(path);
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



app.post("/shipping", function(req, res) {

    const created_at = new Date().toLocaleString();

    console.log("user is signed in")
    const box = req.body.box
    const size = req.body.size
    const img = req.body.img
    const title = req.body.title
    const price = req.body.price

    let checked = false;
    let s = false;
    if (req.user.orders.length == 0) {
        s = true;
    }
    if (req.user.orders.length > 0) {
        checked = req.user.orders[0].checkout;
    }


    if (checked || s) {
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
                    'orders.$[ele].items': {

                        'img': img,
                        'title': title,
                        'price': price,
                        'qty': box,
                        'size': size
                    },
                }
            }, { arrayFilters: [{ "ele.checkout": false }] }



            ,
            function(err) {
                if (err) {
                    console.log(err)
                }
            });


    }
    if (req.user.address.addrs == null) {
        res.render("shipping-card", { req: req, address: req.user.address });
    } else {

        res.redirect("/cart");
    }
})

app.post("/changeLocation", function(req, res) {
    res.render("shipping-card", { req: req, address: req.user.address });
})


app.get("/shipping", function(req, res) {
    res.render("shipping-card", { req: req, address: req.user.address });
})

app.get("/payment", function(req, res) {
    res.render("payment-card", { req: req });

})

app.post("/payment", function(req, res) {

    const tel = req.body.number;
    const add = req.body.address;
    const city = req.body.city;
    const id = req.user.id;

    User.findByIdAndUpdate(id, { $set: { 'address.addrs': add, 'address.tel': tel, 'address.city': city } }, function(err) {


        if (!err) {
            console.log("No error: " + req.user.address);
        } else {
            console.log(err)
        }
    })


    res.render("payment-card", { req: req });


})




app.get("/cart", function(req, res) {


    User.findById(req.user.id, function(err, user) {

        const orders = user.orders;
        if (req.user.address.addrs == null) {
            res.render("shipping-card", { req: req, address: req.user.address });


        } else if (orders.length == 0) {


            res.render("place-order", { req: req, items: [], order: {}, orders: [] });
        } else {
            const order = orders[0];

            res.render("place-order", { req: req, items: order.items, order: order, orders: orders });
        }



    })



})

app.post("/cart", function(req, res) {


    User.findById(req.user.id, function(err, user) {

        const orders = user.orders;
        const order = orders[0]

        if (req.user.address.addrs == null) {
            res.render("shipping-card", { req: req, address: req.user.address });


        } else {

            res.render("place-order", { req: req, items: order.items, order: order, orders: orders });
        }
    })



})


app.post("/checkout", function(req, res) {
    const date = new Date().toLocaleString()
    const total = req.body.orderTotal;

    console.log(typeof total)
    User.findByIdAndUpdate(req.user.id, { 'orders.0.checkout': true, 'orders.0.date': date, 'orders.0.total': total }, function(err, user) {
        res.redirect('/cart')
    })

})



app.post("/remove", function(req, res) {

    const item = req.body.item;

    User.findByIdAndUpdate(req.user.id, {
            $pull: {
                'orders.$[ele].items': {

                    '_id': item,

                },
            }
        }, { arrayFilters: [{ "ele.checkout": false }] }



        ,
        function(err) {
            if (err) {
                console.log(err)
            }
        });

    res.redirect("/cart")


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

    let category = req.body.categoryname;
    if (category.length > 1)
        category = category.charAt(0).toUpperCase() + category.slice(1);
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

    let brand = req.body.brandname;
    if (brand.length > 1)
        brand = brand.charAt(0).toUpperCase() + brand.slice(1);
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




app.get("/products/:custom", function(reqq, res) {
    const custom = reqq.params.custom;

    Item.findById(custom, function(err, foundItems) {
        if (!err) {
            if (foundItems == null) {
                res.redirect("/");
            } else {
                console.log("item found: " + foundItems);
                const brand = foundItems.brand;
                Item.find({ brand: brand }, function(err, items) {
                    res.render("product", { req: reqq, item: foundItems, items: items });
                })
            }
        }

    })
})


app.get("/products", function(req, res) {

    res.redirect("/brands")
})





app.post("/products", function(req, res) {


    category = req.body.category;
    item = req.body.item;
    brand = req.body.brand;
    which = req.body.which;
    categ = req.body.categ;
    bra = req.body.bra;
    console.log("**************************")
    console.log(category)
    console.log(item)
    console.log(brand)



    if (category == null && item == null && which == null) {
        console.log("1a")
        if (brand.length > 1)
            brand = brand.charAt(0).toUpperCase() + brand.slice(1);
        Item.find({ brand: brand }, function(err, foundb) {
            if (!err) {

                if (foundb.length != 0) {

                    Brand.find({ brand: brand }, function(err, found) {
                        if (!err) {
                            const foundCat = found[0].categories;
                            res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                        }
                    })

                } else {

                    Brand.find({ brand: brand }, function(err, found) {
                        if (!err) {

                            const foundCat = found[0].categories;
                            res.render("products", { items: [{ brand: brand }], categories: foundCat, req: req, brande: true })
                        }
                    })

                }
            }
        })

    } else
    if (item != null && which === "true") {
        console.log("2a")
        if (brand.length > 1)
            brand = brand.charAt(0).toUpperCase() + brand.slice(1);
        if (item.length > 1)

            item = item.charAt(0).toUpperCase() + item.slice(1);
        Item.find({ title: item, brand: brand }, function(err, foundb) {
            if (!err) {
                if (foundb.length != 0) {

                    Brand.find({ brand: brand }, function(err, found) {
                        const foundCat = found[0].categories;

                        if (!err) {
                            res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                        }
                    })


                } else {
                    Brand.find({ brand: brand }, function(err, found) {
                        const foundCat = found[0].categories;
                        console.log(found)
                        if (!err) {
                            res.render("products", { items: [{ brand: brand }], categories: foundCat, req: req, brande: true })
                        }
                    })

                }
            }
        })

    } else
    if (categ != null && which === "true") {
        console.log("3a")

        if (categ == "All") {
            console.log("dd" + brand)
            if (brand.length > 1)
                brand = brand.charAt(0).toUpperCase() + brand.slice(1);

            Item.find({ brand: brand }, function(err, foundb) {
                if (!err) {
                    Brand.find({ brand: brand }, function(err, found) {

                        const foundCat = found[0].categories;
                        console.log(foundCat)

                        res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                    })

                }



            })
        } else {

            Item.find({ category: categ, brand: brand }, function(err, foundb) {
                if (!err) {
                    if (foundb.length != 0) {
                        if (brand.length > 1)
                            brand = brand.charAt(0).toUpperCase() + brand.slice(1);

                        Brand.find({ brand: brand }, function(err, found) {

                            const foundCat = found[0].categories;
                            if (!err) {
                                res.render("products", { items: foundb, categories: foundCat, req: req, brande: true })
                            }
                        })

                    } else {
                        if (brand.length > 1)
                            brand = brand.charAt(0).toUpperCase() + brand.slice(1);

                        Brand.find({ brand: brand }, function(err, found) {

                            const foundCat = found[0].categories;
                            if (!err) {
                                res.render("products", { items: [{ brand: brand }], categories: foundCat, req: req, brande: true })
                            }
                        })
                    }



                }
            })
        }
    } else if (brand == null && item == null && which == null) {
        console.log("1b")
        if (category.length > 1)
            category = category.charAt(0).toUpperCase() + category.slice(1);

        Item.find({ category: category }, function(err, foundb) {
            if (!err) {
                if (foundb.length != 0) {

                    if (!err) {
                        Category.find({ category: category }, function(err, found) {
                            const foundBrand = found[0].brands;


                            res.render("products", { items: foundb, brands: foundBrand, req: req, brande: false })
                        })

                    }



                } else {
                    if (category.length > 1)
                        category = category.charAt(0).toUpperCase() + category.slice(1);

                    Category.find({}, function(err, found) {
                        if (!err) {
                            Category.find({ category: category }, function(err, found) {
                                const foundBrand = found[0].brands;

                                res.render("products", { items: [{ category: category }], brands: foundBrand, req: req, brande: false })
                            })

                        }
                    })

                }
            }
        })


    } else if (item != null && which === "false") {
        console.log("2b")
        if (item.length > 1)
            item = item.charAt(0).toUpperCase() + item.slice(1);
        if (category.length > 1)
            category = category.charAt(0).toUpperCase() + category.slice(1);

        Item.find({ title: item, category: category }, function(err, foundb) {
            if (!err) {
                if (foundb.length != 0) {

                    Category.find({ category: category }, function(err, found) {
                        if (!err) {
                            const foundBrand = found[0].brands;

                            res.render("products", { items: foundb, brands: foundBrand, req: req, brande: false })
                        }
                    })


                } else {
                    if (category.length > 1)
                        category = category.charAt(0).toUpperCase() + category.slice(1);

                    Category.find({ category: category }, function(err, found) {
                        if (!err) {
                            const foundBrand = found[0].brands;


                            res.render("products", { items: [{ category: category }], brands: foundBrand, req: req, brande: false })
                        }
                    })

                }
            }
        })

    } else
    if (bra != null && which === "false") {
        console.log("3b")
        if (bra == "All") {
            if (category.length > 1)
                category = category.charAt(0).toUpperCase() + category.slice(1);

            Item.find({ category: category }, function(err, foundb) {
                if (!err) {

                    if (!err) {
                        category = category.charAt(0).toUpperCase() + category.slice(1);

                        Category.find({ category: category }, function(err, found) {
                            const foundBrand = found[0].brands;


                            res.render("products", { items: foundb, brands: foundBrand, req: req, brande: false })
                        })

                    }


                }
            })
        } else {
            if (category.length > 1)
                category = category.charAt(0).toUpperCase() + category.slice(1);

            Item.find({ category: category, brand: bra }, function(err, foundb) {
                if (!err) {
                    if (foundb.length != 0) {

                        Category.find({ category: category }, function(err, found) {
                            if (!err) {
                                const foundBrand = found[0].brands;

                                res.render("products", { items: foundb, brands: foundBrand, req: req, brande: false })
                            }
                        })


                    } else {
                        if (category.length > 1)
                            category = category.charAt(0).toUpperCase() + category.slice(1);

                        Category.find({ category: category }, function(err, found) {
                            if (!err) {
                                const foundBrand = found[0].brands;

                                res.render("products", { items: [{ category: category }], brands: foundBrand, req: req, brande: false })
                            }
                        })
                    }
                }
            })

        }

    }

})

let port = process.env.PORT;
if (port == "" || port == null) {
    port = 3000;
}


app.listen(port, function() {
    console.log("Server started on port 3000");
})