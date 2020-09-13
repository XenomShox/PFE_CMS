const mongoose          = require( 'mongoose' ) ,
      CategoriesManager = require( './CategoriesManager' );

class PostManager {
    /*----------------Attributes------------*/
    Model;
    #Schema = {
        author          : { type : mongoose.Schema.ObjectId , ref : 'Vinland_User' } ,
        date            : { type : Date , default : new Date() } ,
        category        : { type : mongoose.Schema.ObjectId , ref : 'Vinland_Category' } ,
        comments        : [{ type :mongoose.Schema.ObjectId , ref : 'Vinland_Comments' }] ,
        comments_status : {
            type    : String ,
            enum    : [ 'ALLOW' , 'HOLD' , 'DISABLE' ] ,
            default : 'ALLOW' ,
        } ,
        covers          : { type : [ String ] } ,
        tags            : [ String ] ,
        excerpt         : String ,
        modified_date   : { type : Date , default : new Date() } ,
        rating          : {
            likes    : {
                type    : Number ,
                default : 0 ,
            } ,
            dislikes : {
                type    : Number ,
                default : 0 ,
            } ,
        } ,
        status          : {
            type    : String ,
            enum    : [ 'PRIVATE' , 'PUBLIC' , 'FUTURE' , 'DRAFT' , 'PENDING' , 'BLOCKED' ] ,
            default : 'PUBLIC' ,
        } ,
        title           : String ,
        visited         : {
            type    : Number ,
            default : 0 ,
        } ,
    };

    /*------------------Methods-------------*/
    constructor () {
        this.UpdateModel();
    }

    UpdateModel (api) {
        let Api = api ? api : require( './WebSite' ).getApiSettings(),
            content= { type : String , required:true };
        console.log(Api,!!api)
        if ( Api.Enabled ) content = { type : mongoose.Schema.ObjectId , ref : Api.reference , required:true };
        delete mongoose.connection.models['Vinland_Post'];
        this.Model = mongoose.model( 'Vinland_Post' , { ...this.#Schema , content } );
    }

    async CreatePost ( post ) {
        let Post;
        try {
            Post = await this.Model.create( post );
            CategoriesManager.AddPost( Post.category , Post[ '_id' ] )
            return Post;
        }
        catch ( err ) {
            console.error( err );
            if ( Post ) Post.remove();
            throw err;
        }
    }

    UpdatePost ( Id , Post , callback ) {
        this.Model.findOneAndUpdate( Id , Post , ( err , res ) => {
            if ( err ) {
                callback( 500 , 'Internal Error' );
            }
            else {
                callback( 200 , res );
            }
        } )
    }

    GetData ( options ) {
        return this.Model.find( {} )
            .sort( options.sort )
            .limit( options.limit )
            .populate( 'category' )
            .exec();
    }

    GetPosts ( options ) {
        let query;
        if ( options ) {
            if ( options.title ) query = this.Model.find( { title : { '$regex' : options.title , '$options' : 'i' } } );
            else if ( options.category ) query = this.Model.find( { category : options.category._id } )
            else if ( options.tag ) query = this.Model.find( { tags : options.tag } );
            else if( options.date ) query = this.Model.find( { date : new Date( options.date ) } )
            else {
                query = this.Model.find( {} )
            }
            if ( options.sort ) {
                query.sort( options.sort );
            }
            else {
                query.sort( '-date' );
            }
            if ( options.limit ) query.limit( options.limit );
            if ( options.skip ) query.skip( options.skip );
        }
        return query.populate( 'category' )
            .populate( 'author' , { username : 1 } )
            .exec();
    }

    async GetPost ( id ) {
        let post;
        try {
            post = await this.Model.findById( id ).populate( 'author' ).populate({path: "comments", populate: {path: "user"}}).exec()
            post.visited += 1;
            await post.save();
        }
        catch ( e ) {
            throw ( ( e instanceof mongoose.Error.CastError ) ? new Error( "Post Not Found" ) : e );
        }
        return post;
    }
}

module.exports = new PostManager();