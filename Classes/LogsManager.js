const mongoose = require("mongoose");

class LogsManager {
    /*----------------Attributes------------*/
    #model;

    /*----------------constructor------------*/
    constructor() {
        this.#model = mongoose.model("Vinland_Logs", {
            name: { type: String, required: true },
            message: { type: String, required: true },
            stack: { type: String },
            code: {
                type: String,
                default: "CMS_LOG",
                enum: ["CMS_ERROR", "DB_ERROR", "CMS_LOG", "CMS_FILE_MANAGER"],
            },
            time: { type: Date, default: Date.now },
        });
    }

    /*------------------Methods-------------*/
    log(data) {
        return this.#model
            .create(data)
            .catch((reason) => console.error(reason));
    }

    error(error, name) {
        return this.#model.create({
            name: name ? name : error.name,
            message: error.message,
            stack: error.stack,
            code: error instanceof mongoose.Error ? "DB_ERROR" : "CMS_ERROR",
        });
    }

    getLogs() {
        return this.#model.find({}).exec();
    }

    count() {
        return this.#model.countDocuments();
    }
}

module.exports = new LogsManager();
