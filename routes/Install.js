const router = require("express").Router(),
    Owner= {username:process.env.usernameVinland,password:process.env.passwordVinland},
    passport=require("passport");
function Install(WebSite){
    function callback(res){
        return (status,result)=>{
            res.status(status).send(result);
        }
    }
    function getAppCookies (req) {
        const rawCookies = req.headers.cookie.split('; ');
        let parsedCookies = {};
        rawCookies.forEach(rawCookie=>{
            const parsedCookie = rawCookie.split('=');
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
        return parsedCookies;
    }
    function sendCookie(name,data, res)  {
        res.clearCookie(name);
        res.cookie(name, data, { maxAge: 24 * 60 * 60 * 100, httpOnly: true, secure: false});
    }
    function isLoggedIn(req,res){
        if(WebSite.Install.Step>2){
            res.clearCookie("username");
            res.clearCookie("password");
            return !!req.user;
        }
        let {username,password} = getAppCookies(req);
        return (username === Owner.username && password === Owner.password);
    }
    router.post("/LogIn",(req, res,next) => {
        if (WebSite.Install.Step>2) return next();
        let {username,password} =req.body;
        if(username!==Owner.username || password!==Owner.password) return res.status(400).render("Admin/Installation/index",{step:"LogIn",message:"Wrong Username or password"});
        sendCookie("username",username,res);
        sendCookie("password",password,res);
        res.redirect("/Install/");
    },
        passport.authenticate("Vinland Strategy", {
            failureRedirect: "/Install",
            successRedirect:"/Install",
            failureFlash: true
        }))
    router.all("*",(req, res, next) => {
        if(!isLoggedIn(req,res)) {
            if(req.query.f)return  res.status(200).render("Admin/Installation/LogIn",{message:""});
            return res.status(200).render("Admin/Installation/index");
        }
        next();
    })
    router.get("/",async (req, res) => {
            if(req.query.f!==undefined) {
                let interval=setInterval(()=>{
                    if(WebSite.Install.Step===-1) return ;
                    if(WebSite.Install.Step<6) res.render("Admin/Installation/"+WebSite.Install.Step);
                    else res.status(202).send("Installation Finished");
                    clearInterval(interval);
                },200);
            }
            else res.render("Admin/Installation/index");
        })
    router.post("/Database",(req, res) => {
        WebSite.SaveDatabase(req.body,callback(res));
    })
    router.post("/Details/1",(req, res,next) => {
        WebSite.SaveDetails(req.body,callback(res));
    })
    router.post("/Details/2",(req, res, next) => {
        WebSite.AddDetails(req.body.SocialMedia,callback(res));
    })
    router.post("/Email",(req, res) => {
        let obj=req.body;
        if(req.body.skip) obj= {enabled:false, "host":"","port":465,"secure":true,"auth":{"user":"", "pass":""}}
        WebSite.SaveEmail(obj,callback(res));
    })
    router.post("/SignUp",async (req, res) => {
        WebSite.CreateOwner(req.body,callback(res));
    })

    return  router;
}
module.exports = Install;