const mongoose = require("mongoose");
module.exports = class ApiManager {
    /*----------------Attributes------------*/
    static Schemas = require("./Schemas");
    static Models = require("./Models");
    static #DataBaseName = "ApiTest"; // "CMS_PFE";

    /*------------------Methods-------------*/
    static async StartDataBase() {
        await mongoose.disconnect().then(() => {
            mongoose
                .connect(process.env.MONGODB_URI, {
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useUnifiedTopology: true,
                    dbName: ApiManager.#DataBaseName,
                })
                .then(() => {
                    ApiManager.Schemas.LoadSchemaSystem(ApiManager).then(() => {
                        ApiManager.Schemas.GetAllSchemas((status, result) => {
                            ApiManager.Models.LoadModels(result);
                        }).then(() => {
                            console.log("Db connected");
                        });
                    });
                });
        });
    }
};
