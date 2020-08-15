const mongoose =require("mongoose"),
    path = require("path"),
    fs=require("fs"),
    readFile= require('util').promisify(fs.readFile),
    app=require("../app"),
    PostManager=require("./PostManager");
const statistics=mongoose.Schema({
    Total:{type:Number,default:0},
    LastMonth:[{type:Number,default:0}]
});
class WebSite {
    /*----------------Attributes------------*/
    static Statistics={
            Visitors:statistics,
            Users: {
                Subscribers: statistics,
                Active:statistics
            },
            Errors:statistics
        };
    #Settings;
    #WebSiteDetails;
    #WebSiteCategories;
    // #Roles;
    /*----------------constructor------------*/
    constructor() {
        this.LoadWebSiteSettings().then(file=>{
            if(file) {
                this.#Settings=file;
                this.StartUp();
            }
            else this.Installation();
        });
    }
    /*------------------Methods-------------*/
    LoadWebSiteSettings(){
        return this.LoadJsonFile("../VinlandSystem.json");
    }
    LoadWebSiteDetails(){
        return this.LoadJsonFile("../WebSiteSystem.json");
    }
    LoadJsonFile(filename){
        return readFile(path.join(__dirname,filename),"utf-8")
            .then((file)=> {
                if(typeof file==="string") return JSON.parse(file);
                else return null;
            })
            .catch(() => { return undefined;});
    }
    // updateRoles() {
    //     require('../models/role').find({},(err, res)=>{
    //         if(err) console.error(err);
    //         else this.Roles = res;
    //     });
    // }
    StartUp(){
        console.log("Lunching The WebSite");
        mongoose.connect(this.#Settings.DataBase.URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            auth:{user:this.#Settings.DataBase.UserName,password:this.#Settings.DataBase.Password},
            dbName: this.#Settings.DataBase.Name,
        })
            .then(()=> {
                console.log("Db connected");
                require("./PostManager")
                if(this.#Settings.ApiManager.Enabled){
                    // lunch the apiManager
                    require("./ApiManager").StartApiManager();
                    app.use("/Api", require("../routes/Api"));
                }
            })//Api System
            .then(()=>{
                let $this=this
                app.use(function (req,res,next) {
                    res.locals.WebSite = $this.#WebSiteDetails;
                    res.locals.Categories = $this.#WebSiteCategories;
                    res.locals.WebSite.Title=res.locals.WebSite.Name;
                    next();
                })
                
                app.use("/user", require("../routes/user"));
                app.use("/message", require("../routes/message"));
                app.use("/role", require("../routes/roles"));
                switch (this.#Settings.Type) {
                    case "Blog":
                        return this.SetUpBlog();
                }
            })//Web Site Type
            .then(()=>{console.log("WebSite Lunched correctly")})
            .catch((reason => {console.log("WebSite didn't lunch correctly ",reason)}));
        this.LoadWebSiteDetails().then((file)=>{
            if(file){
                this.#WebSiteDetails=file;
                app.set("System",this.#WebSiteDetails);
            }
            else{
                console.log("System not found")
                process.exit(0)
            }
        })
    }
    Installation(){
        console.log("Installing the WebSite");
    }
    LoadCategories(categories){
        this.#WebSiteCategories=[]
        categories.forEach((category)=>{
            this.#WebSiteCategories.push({
                "_id":category["_id"],
                "Name": category.Name,
                "Slug": category.Slug,
                "Description": category.Description
            });
        })
        console.log("Categories Loaded");
    }

    SetUpBlog() {
        return this.LoadJsonFile("../views/"+this.#WebSiteDetails.Template+"/Schema.json").then((data)=>{
            app.set("Schema", {path:this.#WebSiteDetails.Template+'/',...data.Structure});
            let additional={};
            data.Data.forEach(elm=>{
                PostManager.GetPosts(elm,(status,res)=>{
                    if(status===200) additional[elm.name]=res;
                    else additional[elm.name]=[];
                })
            })
            app.use(function (req,res,next){
                res.locals.Additional=additional
                next();
            });
            app.use(require("../routes/BlogRouting"));
        })
    }
}
module.exports = new WebSite();