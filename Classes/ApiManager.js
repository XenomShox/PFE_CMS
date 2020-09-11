class ApiManager {
    /*----------------Attributes------------*/
    Schemas = require("./Schemas");
    Models = require("./Models");
    /*------------------Methods-------------*/
    StartApiManager() {
        this.Schemas.LoadSchemaSystem(this)
            .then(() => {
            this.Schemas.GetAllSchemas((status, result) => {
                this.Models.LoadModels(result);
            });
        });
    }
};
module.exports = new ApiManager();