require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const OrderCount = require("./models/orderCount");
const flash = require("connect-flash");

// securing server
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

// mongoose.connect(process.env.MONGODB_URI,()=>{
// 	console.log("Connected to DB");
// });

mongoose
  .connect("mongodb://localhost:27017/flipkart")
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

const indexRoutes = require("./routes/index");
const productRoutes = require("./routes/product");
const reviewRoutes = require("./routes/review");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const orderRoutes = require("./routes/order");
const searchRoutes = require("./routes/search");

// security middlewares
app.use(xss());
app.use(mongoSanitize());

app.use(reviewRoutes);
app.use(orderRoutes);
app.use("/", indexRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/search", searchRoutes);

OrderCount.find({}, function (err, orderCountObjects) {
  if (orderCountObjects.length == 0) {
    OrderCount.create({ count: 0 });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
