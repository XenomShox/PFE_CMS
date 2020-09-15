const mongoose          = require( 'mongoose' ) ,
      Console           = require( './LogsManager'),
      CategoriesManager = require( './CategoriesManager' );

class PostManager {
    /*----------------Attributes------------*/
    Model;
    #content = { type : String , required:true };
    #Schema = {
        author          : { type : mongoose.Schema.ObjectId , ref : 'Vinland_User' } ,
        date            : { type : Date , default : new Date() } ,
        category        : { type : mongoose.Schema.ObjectId , ref : 'Vinland_Category' } ,
        comments        : [{ type :  mongoose.Schema.ObjectId  , ref : 'Vinland_Comments' }] ,
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
        let Api = api ? api : require( './WebSite' ).getApiSettings();
        if ( Api.Enabled ) this.#content = { type : mongoose.Schema.ObjectId , ref : Api.reference , required:true };
        else this.#content={ type : String , required:true };
        delete mongoose.connection.models['Vinland_Post'];
        this.Model = mongoose.model( 'Vinland_Post' , { ...this.#Schema , content:this.#content } );
        Console.log( {
                         name    : 'Api Post updated' ,
                         message : 'post content has been changed into ' + Api.Enabled ? Api.reference : 'string' ,
                         code    : 'CMS_LOG',
                     } )
    }

    async CreatePost ( post ) {
        let Post;
        try {
            Post = await this.Model.create( {
                ...post ,
                content : this.#content.type === String ? post.content :
                      ( await mongoose.connection.models[ this.#content.ref ].create( post.content ) )._id,
            } );
            CategoriesManager.AddPost( Post.category , Post[ '_id' ] )
            Console.log( {
                             name    : 'Post Creation' ,
                             message : `post ${Post._id} is created by ${Post.author}`,
                             code    : 'CMS_LOG',
                         } )
            return Post;
        }
        catch ( err ) {
            Console.error( err , "Post Creation" );
            if ( Post ) Post.remove();
            throw err;
        }
    }

    async UpdatePost ( _id , post ) {
        try {
            let Post                  = await this.Model.findById( _id ) ,
                { content , ...rest } = post;
            if ( this.#content.type !== String )
                await mongoose.connection.models[ this.#content.ref ].updateOne( { _id : Post.content } , content )
            await Post.update( rest );
            Console.log( {
                             name    : 'Post Updating' ,
                             message : `post ${ Post._id } is Updated` ,
                             code    : 'CMS_LOG' ,
                         } );
            return Post;
        }
        catch ( e ) {
            Console.error( e , 'Post Updating' );
            throw e;
        }
    }

    async DeletePost ( _id ) {
        try {
            let post = await this.Model.findById( _id );
            if ( this.#content.type !== String )
                await mongoose.connection.models[ this.#content.ref ].remove( { _id : post.content } );
            await post.remove()
            Console.log( {
                             name    : 'Post Deleting' ,
                             message : `post ${ post._id } is deleted` ,
                             code    : 'CMS_LOG' ,
                         } );
        }
        catch ( e ) {
            Console.error( e , 'Post Deleting' );
            throw e;
        }
    }

    GetData ( options ) {
        let query= this.Model.find( {} )
            .sort( options.sort )
            .limit( options.limit )
            .populate( 'category' )
        if(this.#content.type !== String) query.populate('content');
        return query.exec();
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
        if(this.#content.type !== String) query.populate('content');
        return query.populate( 'category' )
            .populate( 'author' , { username : 1 } )
            .exec();
    }

    async GetPost ( id ) {
        let post;
        try {
            let query = this.Model.findById( id ).populate( 'author' )
                .populate({path: "comments", populate: {path: "user"}})
            if ( this.#content.type !== String ) query.populate( 'content' );
            post = await query.exec()
            post.visited += 1;
            await post.save();
        }
        catch ( e ) {
            Console.error( e, "Getting Post")
            throw ( ( e instanceof mongoose.Error.CastError ) ? new Error( 'Post Not Found' ) : e );
        }
        return post;
    }
}

module.exports = new PostManager();