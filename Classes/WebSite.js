// <editor-fold desc="Dependencies">
const mongoose = require("mongoose"),
    path = require("path"),
    fs = require("fs").promises,
    app = require("../app"),
    TemplatesManager = require("./TemplatesManager"),
    CategoriesManager = require("./CategoriesManager"),
    Validator = new (require("jsonschema").Validator)(),
    User = require("../models/user"),
    Console = require("./LogsManager"),
    { isLoggedIn, hasPermission } = require("../middlewares/middleware"),
    Role = require("../models/role");
function UnderConstruct(req, res) {
    res.status(404).render("Construct", { Title: process.env.Website });
}
// </editor-fold>
class WebSite {
    /*----------------Attributes------------*/
    #WebSiteDetails = {
        Data: {},
        Categories: [],
        Schema: {
            definitions: {
                SocialMedia: {
                    type: "object",
                    properties: {
                        Name: { type: "string" },
                        Url: { type: "string" },
                    },
                    required: ["Name", "Url"],
                },
            },
            type: "object",
            properties: {
                Name: { type: "string" },
                Logo: { type: "string" },
                Icon: { type: "string" },
                Description: { type: "string" },
                Licence: { type: "string" },
                SocialMedia: {
                    type: "object",
                    properties: {
                        Facebook: { $ref: "#/definitions/SocialMedia" },
                        Instagram: { $ref: "#/definitions/SocialMedia" },
                        Twitter: { $ref: "#/definitions/SocialMedia" },
                        LinkedIn: { $ref: "#/definitions/SocialMedia" },
                    },
                },
                Type: { type: "string" },
            },
            required: [
                "Name",
                "Logo",
                "Icon",
                "Description",
                "Licence",
                "Type",
            ],
        },
        File: "../settings/WebSiteSystem.json",
    };
    #ApiSettings = {
        Data: {},
        Schema: {
            type: "object",
            properties: {
                Enabled: { type: "boolean" },
                reference: { type: "string, null" },
            },
            required: ["Enabled", "reference"],
        },
        File: "../settings/ApiPost.json",
    };
    #Database = {
        Data: {},
        Schema: {
            type: "object",
            properties: {
                Name: { type: "string" },
                URI: { type: "string" },
                UserName: { type: "string" },
                Password: { type: "string" },
                SECRET_KEY: { type: "string" },
            },
            required: ["Name", "URI", "UserName", "Password", "SECRET_KEY"],
        },
        File: "../settings/Database.json",
    };
    #ReadingSettings = {
        File: "../settings/Reading.json",
        Schema: {},
        Data: {},
    };
    #EmailSettings = {
        Data: null,
        File: "../settings/Email.json",
        Schema: {
            type: "object",
            properties: {
                enabled: { type: "boolean" },
                host: { type: "string" },
                port: { type: "number" },
                secure: { type: "boolean" },
                auth: {
                    type: "object",
                    properties: {
                        user: { type: "string" },
                        pass: { type: "string" },
                    },
                    required: ["user", "pass"],
                },
            },
            required: ["enabled", "host", "port", "secure", "auth"],
        },
    };
    Install = {
        Step: -1,
        CurrentError: {},
    };
    #Template;

    /*----------------constructor------------*/
    constructor() {
        app.use(UnderConstruct);
        this.Installation()
            .then(async (index) => {
                await this.LoadApiSettings();
                return this.StartUp(index);
            })
            .catch(async (reason) => {
                await Console.error(reason, "Fatal Error");
                process.exit(reason);
            });
    }

    /*------------------Installation-------------*/
    Installation() {
        this.PrepareInstallation();
        return new Promise(async (res, rej) => {
            try {
                await this.CheckDataBase().catch((reason) => {
                    this.Install.Step = 1;
                    Console.error(reason, "Installation Error");
                    return new Promise((resolve) => {
                        this.Install.DataBaseInstall = resolve;
                    });
                });
                await this.CheckOwner().catch((reason) => {
                    this.Install.Step = 2;
                    Console.error(reason, "Installation Error");
                    return new Promise((resolve) => {
                        this.Install.OwnerInstall = resolve;
                    });
                });
                await this.CheckWebSiteDetails().catch((reason) => {
                    this.Install.Step = 3;
                    Console.error(reason, "Installation Error");
                    return new Promise((resolve) => {
                        this.Install.DetailsInstall = resolve;
                    });
                });
                await this.CheckEmail().catch((reason) => {
                    this.Install.Step = 5;
                    Console.error(reason, "Installation Error");
                    return new Promise((resolve) => {
                        this.Install.EmailInstall = resolve;
                    });
                });
                this.Install.Step = 6;
                app._router.stack.splice(app._router.stack.length - 3, 2);
                console.log("Installation finished");
                res(app._router.stack.length - 1);
            } catch (e) {
                Console.error(e, "Installation Error");
                rej(e);
            }
        });
    }

    PrepareInstallation() {
        console.log("preparation to Install the WebSite");
        app.use(
            "/Install",
            (req, res, next) => {
                res.locals.WebSite = this.#WebSiteDetails.Data;
                res.locals.Settings = this.#ApiSettings.Data;
                res.locals.DataBase = this.#Database.Data;
                res.locals.Email = this.#EmailSettings.Data;
                next();
            },
            require("../routes/Install")(this)
        );
        let last = app._router.stack.length - 1;
        app._router.stack.push(app._router.stack.splice(last - 2, 1)[0]);
    }

    CheckDataBase() {
        console.log("Retrieving Database information");
        return this.LoadJsonFile(this.#Database.File).then((file) => {
            if (!Validator.validate(file, this.#Database.Schema).valid) {
                throw new SyntaxError("DataBase Details aren't valid");
            }
            this.#Database.Data = file;
            console.log("Trying to connect to DataBase");
            return this.StartDataBase();
        });
    }

    async CheckOwner() {
        console.log("Checking for Owner in Database");
        let user = await User.find({}); //find owner instead
        if (user.length === 0)
            throw new Error("There is no Owner Account on database");
    }

    CheckWebSiteDetails() {
        console.log("Retrieving Website information");
        return this.LoadJsonFile(this.#WebSiteDetails.File).then((file) => {
            if (!Validator.validate(file, this.#WebSiteDetails.Schema).valid) {
                throw new SyntaxError("WebSite Details aren't valid");
            }
            this.#WebSiteDetails.Data = file;
        });
    }

    CheckEmail() {
        console.log("Retrieving Email settings");
        return this.LoadJsonFile(this.#EmailSettings.File).then((email) => {
            if (!Validator.validate(email, this.#EmailSettings.Schema).valid) {
                throw new SyntaxError("Email Settings aren't valid");
            }
            this.#EmailSettings.Data = email;
        });
    }

    LoadApiSettings() {
        console.log("Retrieving Api settings");
        return this.LoadJsonFile(this.#ApiSettings.File).then((file) => {
            if (!Validator.validate(file, this.#ApiSettings.Schema).valid)
                throw new SyntaxError("Email Settings aren't valid");
            this.#ApiSettings.Data = file;
        });
    }

    getApiSettings() {
        return this.#ApiSettings.Data;
    }

    /*------------------App Starting-------------*/
    async StartUp(index) {
        console.log("Lunching The WebSite");
        require("./ApiManager").StartApiManager();
        app.use("/Api", require("../routes/Api"));
        app.use((req, res, next) => {
            res.locals.WebSite = {
                ...this.#WebSiteDetails.Data,
                Categories: this.#WebSiteDetails.Categories,
            };
            res.locals.WebSite.Title = res.locals.WebSite.Name;
            if (this.#Template) res.locals.Additional = this.#Template.Data;
            next();
        });
        app.use(
            "/Admin",
            (req, res, next) => {
                res.locals.Settings = this.#ApiSettings.Data;
                res.locals.DataBase = this.#Database.Data;
                res.locals.Email = this.#EmailSettings.Data;
                next();
            },
            isLoggedIn,
            hasPermission(["admin"]),
            require("../routes/Admin")
        );
        app.use(
            "/role",
            isLoggedIn,
            hasPermission(["owner", "admin"]),
            require("../routes/roles")
        );
        app.use("/message", require("../routes/message"));
        try {
            switch (this.#WebSiteDetails.Data.Type) {
                case "Blog":
                    await this.SetUpBlog();
            }
            app._router.stack.splice(index, 1);
            console.log("WebSite Lunched correctly");
            mongoose.set("debug", true);
        } catch (err) {
            Console.error(err, "Blog Routing");
            process.exit(err);
        }
    }

    SetUpBlog() {
        let promises = [];
        promises.push(
            CategoriesManager.GetCategories().then((cats) =>
                this.LoadCategories(cats)
            )
        );
        promises.push(this.LoadTemplate());

        /*promises.push( this.LoadJsonFile(this.#ReadingSettings.File)
            .then(file=>{
                if(!Validator.validate(file,this.#ReadingSettings.Schema).valid) throw new SyntaxError("Template schema is wrong.");
                this.#ReadingSettings.Data=file;
            }) )*/
        return Promise.all(promises).then(() => {
            app.use((req, res, next) => {
                req.Schema = {
                    name: this.#Template.name,
                    ...this.#Template.structure,
                };
                next();
            });
            app.use("/user", require("../routes/user"));
            app.use(require("../routes/BlogRouting"));
        });
    }

    StartDataBase(database = this.#Database.Data) {
        return mongoose
            .connect(database.URI, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                auth: { user: database.UserName, password: database.Password },
                dbName: database.Name,
            })
            .then((eve) => {
                console.log("Db connected");
                eve.connection.on("disconnected", () =>
                    console.error("Database disconnected")
                );
            });
    }

    LoadCategories(Categories) {
        this.#WebSiteDetails.Categories = Categories;
        console.log("Categories Loaded");
    }

    LoadTemplate() {
        return TemplatesManager.getAppliedTemplate()
            .catch((reason) => {
                Console.error(reason, "Template Retrieving");
                return TemplatesManager.CreateTemplate({
                    name: "Blog(vinlandCMS)",
                    description: "the default template for vinland CMS",
                    type: "Blog",
                    data: [
                        {
                            name: "latest",
                            sort: "-date",
                            limit: 6,
                        },
                        {
                            name: "popular",
                            sort: "-visited",
                            limit: 4,
                        },
                    ],
                    structure: {
                        Index: "Index",
                        Categories: "Categories",
                        Post: "Post",
                        CreatePost: "Create",
                        EditPost: "Edit",
                        Tags: "Tags",
                        Search: "Search",
                        Messenger: "Messenger",
                        Profile: "Profile",
                        Error: "Error",
                    },
                    applied: Date.now(),
                });
            })
            .then(async (template) => {
                template = template.toObject();
                this.#Template = template;
                this.#Template.Data = await this.LoadDataForTemplate(
                    template.data
                );
            });
    }

    async LoadDataForTemplate(data) {
        try {
            let Data = {};
            for (let i = 0; i < data.length; i++) {
                Data[data[i].name] = await require("./PostManager").GetData(
                    data[i]
                );
            }
            return Data;
        } catch (e) {
            Console.error(e, "Template Data");
            return {};
        }
    }

    /*------------------WebSite dynamic-------------*/
    SaveSettings(settings, callback) {
        settings.Enabled = settings.Enabled === "true";
        if (Validator.validate(settings, this.#ApiSettings.Schema).valid) {
            this.WriteJsonFile(this.#ApiSettings.File, JSON.stringify(settings))
                .then(() => {
                    this.#ApiSettings.Data = settings;
                    require("./PostManager").UpdateModel(settings);
                    callback(200, "Api Settings Successfully changed");
                })
                .catch((reason) => {
                    callback(500, reason.message);
                });
        } else {
            callback(400, "These settings aren't Valid");
        }
    }

    SaveDatabase(database, callback) {
        if (!Validator.validate(database, this.#Database.Schema).valid) {
            return callback(400, "These settings aren't Valid");
        }
        return this.StartDataBase(database)
            .then(() => {
                this.#Database.Data = database;
                return this.WriteJsonFile(
                    this.#Database.File,
                    JSON.stringify(database)
                ).then(() => {
                    this.Install.Step = -1;
                    if (this.Install.DataBaseInstall)
                        this.Install.DataBaseInstall();
                    callback(200, "Database Settings Successfully changed");
                });
            })
            .catch((reason) => {
                callback(500, reason.message);
            });
    }

    SaveDetails(details, callback) {
        if (Validator.validate(details, this.#WebSiteDetails.Schema).valid) {
            this.WriteJsonFile(
                this.#WebSiteDetails.File,
                JSON.stringify(details)
            )
                .then(() => {
                    this.#WebSiteDetails.Data = details;
                    this.Install.Step = 4;
                    callback(200, "WebSite Details Successfully changed");
                })
                .catch((reason) => {
                    callback(500, reason.message);
                });
        } else {
            callback(400, "These Details aren't Valid");
        }
    }

    AddDetails(SocialMedia, callback) {
        let details = { ...this.#WebSiteDetails.Data, SocialMedia };
        if (Validator.validate(details, this.#WebSiteDetails.Schema).valid) {
            this.WriteJsonFile(
                this.#WebSiteDetails.File,
                JSON.stringify(details)
            )
                .then(() => {
                    this.#WebSiteDetails.Data = details;
                    this.Install.Step = -1;
                    if (this.Install.DetailsInstall)
                        this.Install.DetailsInstall();
                    callback(200, "WebSite Details Successfully changed");
                })
                .catch((reason) => {
                    callback(500, reason.message);
                });
        } else {
            callback(400, "These Details aren't Valid");
        }
    }

    SaveEmail(email, callback) {
        email.enabled = email.enabled || true;
        email.secure = email.secure === "true";
        email.port = Number(email.port);
        if (!Validator.validate(email, this.#EmailSettings.Schema).valid) {
            return callback(400, "These Details aren't Valid");
        }
        this.WriteJsonFile(this.#EmailSettings.File, JSON.stringify(email))
            .then(() => {
                this.#EmailSettings.Data = email;
                this.Install.Step = -1;
                if (this.Install.EmailInstall) this.Install.EmailInstall();
                callback(202, "WebSite's Email settings Successfully changed");
            })
            .catch((reason) => {
                callback(500, reason.message);
            });
    }

    async CreateOwner(data, callback) {
        try {
            let { password, ...body } = data,
                owner = await Role.create({
                    name: "Owner",
                    owner: true,
                    category: "all",
                });
            await User.register(
                new User({ ...body, roles: [owner["_id"]] }),
                password
            );
            this.Install.Step = -1;
            if (this.Install.OwnerInstall) this.Install.OwnerInstall();
            callback(200, "Owner successfully created.");
        } catch (err) {
            callback(400, err.message);
        }
    }

    LoadJsonFile(filename) {
        return fs
            .readFile(path.join(__dirname, filename), "utf-8")
            .then((file) => JSON.parse(file));
    }

    WriteJsonFile(filename, json) {
        return fs.writeFile(path.join(__dirname, filename), json, "utf-8");
    }
}

module.exports = new WebSite();
