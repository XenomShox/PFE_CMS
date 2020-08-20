module.exports = class ApiManager {
    /*----------------Attributes------------*/
    static Schemas = require("./Schemas");
    static Models = require("./Models");
    /*------------------Methods-------------*/
    static StartApiManager() {
        ApiManager.Schemas.LoadSchemaSystem(ApiManager).then(() => {
            ApiManager.Schemas.GetAllSchemas((status, result) => {
                ApiManager.Models.LoadModels(result);
            });
        });
    }
};
