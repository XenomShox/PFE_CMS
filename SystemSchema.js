let Category={
        Name:String,
        Slug:String|null,//url name
        Description: String,
        SubCategories:[Category]
    },
    Configue={
    WebSite:{
        Name:{"type":String},
        Logo:String,//logo Link
        Icon:String,//Icon Link
        Description:String,//Website Description
        Licence:String,//Website Licence
    },
    WebSystem:{
        Type: {
            type:String,
            enum:["BLOG"],
            default:"BLOG"
        },
        Categories:[{
            Name:String,
            Cover:String
        }]
    },
    Security:{
        SECRET_KEY:String
    },
    DataBase:{
        Name:String,
        URI:String,
        UserName:String,
        Password:String
    },
    ApiManager: {
        Enabled: Boolean,
        ApiPostContent: {
            Enabled: Boolean,
            reference:String
        }
    }
}