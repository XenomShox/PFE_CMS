const mongoose = require("mongoose");

class CategoriesManager {
    /*----------------Attributes------------*/
    #CategoriesModel;

    /*------------------Methods-------------*/
    constructor() {
        this.#CategoriesModel = mongoose.model("Vinland_Category", {
            Name: { type: String, required: true },
            Cover: String,
            Slug: {
                type: String,
                required: true,
                unique: true,
                dropDups: true,
                index: true,
            },
            Description: { type: String, required: true },
            Posts: { type: [mongoose.Schema.ObjectId], ref: "Vinland_Post" },
        });
    }

    CreateCategory(Category) {
        return this.#CategoriesModel.create(Category).then((category) => {
            this.UpdateCategories();
            return category;
        });
    }

    GetCategories() {
        return this.#CategoriesModel.find({}).exec();
    }

    async GetCategory(Slug) {
        let category = await this.#CategoriesModel
            .findOne({ Slug: Slug })
            .exec();
        if (!category) return new Error("Category not found");
        return category;
    }

    AddPost(Id, PostID) {
        return this.#CategoriesModel
            .updateOne({ _id: Id }, { $push: { Posts: PostID } })
            .exec();
    }

    async UpdateCategory(id, data) {
        await this.#CategoriesModel.updateOne({ _id: id }, data).exec();
        this.UpdateCategories();
    }

    async UpdateCategories() {
        let categories = await this.#CategoriesModel.find({});
        require("./WebSite").LoadCategories(categories);
    }

    async DeleteCategory(Id) {
        let category = await this.#CategoriesModel.findById(Id).exec();
        await category.remove();
        this.UpdateCategories();
    }
}

module.exports = new CategoriesManager();
