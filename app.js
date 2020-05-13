require("dotenv").config();

const createError = require("http-errors"),
    express = require("express"),
    path = require("path"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    logger = require("morgan"),
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

const indexRouter = require("./routes/index"),
    ApiRouter = require("./routes/Api"),
    FilesRouter = require("./routes/Files"),
    AdminRouter = require("./routes/Admin"),
    authRoutes = require("./routes/user"),
    app = express();

//mongoose Debug
mongoose.set("debug", true);
// mongoose.set("debug", function (coll, method, query, doc) {
//     console.log(
//         "%s" +
//             coll +
//             "%s %s" +
//             method +
//             "%s query: " +
//             JSON.stringify(query) +
//             " doc:" +
//             JSON.stringify(doc),
//         "\x1b[44m",
//         "\x1b[0m",
//         "\x1b[42m",
//         "\x1b[0m"
//     );
// });
// lunch the apiManager
require("./Classes/ApiManager").StartApiManager(
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        dbName: "ApiTest",
    })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//Files Routes
app.use("/files", express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "files")));
//request parsing and cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/files", FilesRouter);
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
//debug for development
app.use(logger("dev"));
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

// Routes
app.use("/Api", ApiRouter);
app.use("/Admin", isLoggedIn, AdminRouter);
app.use("/", indexRouter);
app.use("/user", authRoutes);

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
