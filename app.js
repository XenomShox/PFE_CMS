require("dotenv").config();

const createError = require("http-errors"),
    express = require("express"),
    path = require("path"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    mongoose = require("mongoose");

// Middlewares - to Test -
const { isLoggedIn, isAdmin } = require("./middlewares/middleware");

// Models
const User = require("./models/user");

// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { stratV2 } = require("./handler/strategy");

const app = express();

//mongoose Debug
mongoose.set("debug", true);

// lunch the apiManager
require("./Classes/ApiManager").StartApiManager(mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        dbName: "ApiTest",
    }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//Files Routes
app.use("/Admin/files", express.static(path.join(__dirname, "public")));
app.use("/Admin/files/*",(req,res)=>{
    res.status(404).send("Not Found");
})
app.use("/files", express.static(path.join(__dirname, "files")));

// serialization of password and user
app.use(require("express-session")({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    }));
app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(customLocalStrat));
passport.use(new LocalStrategy(stratV2));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(cookieParser());
app.use(flash());
//Ip @ middleware
app.use(function (req, res, next) {
    if (req.connection.remoteAddress.substr(0, 7) === "::ffff:")
        req.MyIp = "IPv4: " + req.connection.remoteAddress.substr(7);
    else if (req.connection.remoteAddress.substr(0, 3) === "::1")
        req.MyIp = "From LocalHost";
    else req.MyIp = "IPv6: " + req.connection.remoteAddress;
    next();
});
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//request parsing and cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//debug for development
app.use((require("morgan"))("tiny"));

// @start Routes
app.use("/files", require("./routes/Files"));
app.use("/Api", require("./routes/Api"));
app.use("/Admin", isLoggedIn, require("./routes/Admin"));
app.use("/Category", require("./routes/Categories"));
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
// @end Routes

// website icon
app.use("/favicon.ico",(req,res)=>{
    res.sendFile("public/images/icon.ico");
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new createError("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
