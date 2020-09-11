require("dotenv").config();
// <editor-fold desc="Dependencies setup">
const express = require("express"),
    path = require("path"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    mongoose = require("mongoose"),
    app = express(); //Creating the App
// </editor-fold>
// <editor-fold desc="view engine setUp">
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// </editor-fold>
// <editor-fold desc="Files Routing">
app.use('/Admin/files', express.static(path.join(__dirname, "public"))); //CMS Files
app.use('/Admin/files/*', (req, res) => {res.status(404).send("Not Found")}); // Files Not Found in Admin
app.use('/files', express.static(path.join(__dirname, 'files'))); //Files
//</editor-fold>
// <editor-fold desc="User Setup">
const User = require("./models/user");
// <editor-fold desc="Security Setup">
const passport = require("passport"),
    LocalStrategy = require("passport-local"),
    { stratV2 } = require("./handler/strategy");
// </editor-fold>
// <editor-fold desc="serialization of password and user">
let expressSession = require("express-session")({secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false}),
    strategy = new LocalStrategy({},stratV2);
app.use(expressSession);
app.use(passport.initialize({}));
app.use(passport.session({}));
passport.use("Vinland Strategy",strategy);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// </editor-fold>
// <editor-fold desc="flash and Cookies setting "
app.use(cookieParser());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
// </editor-fold>
// </editor-fold>
app.set("IP", (req) => {
    if (req.connection.remoteAddress.substr(0, 7) === "::ffff:")
        return { version: "IPv4", IP: req.connection.remoteAddress.substr(7) };
    else if (req.connection.remoteAddress.substr(0, 3) === "::1")
        return { version: "LocalHost", IP: req.connection.remoteAddress };
    else return { version: "IPv6", IP: req.connection.remoteAddress };
}); //Ip
// <editor-fold desc="parsing and cookies">
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));
// </editor-fold>
// <editor-fold desc="mongoose & app Debug">
app.use(require("morgan")("tiny"));
// </editor-fold>
// <editor-fold desc="Routes">
app.use("/files", require("./routes/Files"));
const userMethods = require("./handler/user");
app.post("/signup", userMethods.createUser);
app.route("/login")
    .get(userMethods.renderLogin)
    .post(passport.authenticate("Vinland Strategy", {failureRedirect: "/login", failureFlash: true}),
        (req, res) => {
        if(req.body.to)res.redirect(req.body.to);
        else res.status(200).send("Successfully Logged in");
    });
app.route("/logout").get(userMethods.logout);
// </editor-fold>
module.exports = app;
require("./Classes/WebSite");
