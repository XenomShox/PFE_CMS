const router                         = require( 'express' ).Router() ,
      CategoriesManager              = require( '../Classes/CategoriesManager' ) ,
      PostManager                    = require( '../Classes/PostManager' ) ,
      url                            = require( 'url' ) ,
      CommentManager                 = require( '../Classes/CommentsManager' ) ,
      { isLoggedIn , hasPermission } = require( '../middlewares/middleware' );

function renderFunction ( res ) {
    return ( err , html ) => {
        if ( err ) throw err;
        res.status( 200 ).send( html );
    }
}

/*---------------Index------------------*/
router.get( '/' , async function ( req , res ) {
    try {
        let Posts = await PostManager.GetPosts( { sort : '-visited' } );
        res.render( `templates/${ req.Schema.name }/${ req.Schema.Index }` , { Posts } , renderFunction( res ) );
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
} );
/*---------------Categories------------------*/
router.route( '/Categories' )
    .get( ( req , res,next ) => {
        if ( req.query.f ) return next();
        else res.redirect( '/' );
    } , isLoggedIn , (req,res)=>{
        CategoriesManager.GetCategories()
            .then( data => { res.status( 200 ).send( data ) } )
            .catch( reason => {
                console.error( reason );
                res.status( 500 ).send( reason );
            } )
    })
    .post( isLoggedIn , hasPermission(["admin"] ) ,( req , res ) => {
        //verify if he is an admin
        try {
            CategoriesManager.CreateCategory( req.body ).then( data => {
                res.status( 200 ).send( { id : data._id , message : 'Category have been Created' } )
            } )
        }
        catch ( e ) {
            console.error( e );
            res.status( 500 ).send( e.message );
        }
    } )
    .put( isLoggedIn , hasPermission(["admin"] ) ,( req , res ) => {
        try {
            if ( req.query.id ) {
                CategoriesManager.UpdateCategory( req.query.id , req.body )
                    .then( () => { res.status( 200 ).send( { message : 'Category have been Updated' } ) } )
            }
            else {
                throw new Error( 'there is no id' );
            }
        }
        catch ( e ) {
            console.error( e );
            res.status( 500 ).send( e.message )
        }
    } )
    .delete( isLoggedIn , hasPermission(["admin"] ) ,( req , res ) => {
        try {
            if ( req.query.id ) {
                CategoriesManager.DeleteCategory( req.query.id )
                    .then( () => { res.status( 200 ).send( 'Done removing' ) } )
            }
            else {
                throw new Error( 'there is no id' );
            }
        }
        catch ( e ) {
            console.error( e );
            res.status( 500 ).send( e.message )
        }
    } )
router.route( '/Categories/*' )
    .all( async ( req , res , next ) => {
        try {
            res.locals.Category = await CategoriesManager.GetCategory( decodeURI( url.parse( req.url ).pathname ) )
            next();
        }
        catch ( e ) { ErrorHandler( req , res , e ) }
    } )
    .get( CategoryHandler , PostHandler , isLoggedIn , hasPermission( [ 'create_post' ] ) , CreateHandler )
    .post( isLoggedIn , AddComment , hasPermission( [ 'create_post' ] ) , EditPost , CreatePost )
    .delete( isLoggedIn , DeleteComment , hasPermission( [ 'delete_post' ] ) , DeletePost )
    .put( isLoggedIn , UpdateComment , RatePost )
/*----------------Tag System-----------------*/
router.route( '/tags/:tag' )
    .get( async ( req , res ) => {
        res.locals.WebSite.Title += ' - #' + req.params.tag;
        try {
            let Posts = await PostManager.GetPosts( { tag : req.params.tag , ...req.query } )
            res.status( 200 ).render( `templates/${ req.Schema.name }/${ req.Schema.Tags }` ,
                                      { Posts , tag : req.params.tag } , renderFunction( res ) )
        }
        catch ( e ) {ErrorHandler( req , res , e );}
    } )
/*----------------Search System-----------------*/
router.route( '/search/' )
    .get( async ( req , res ) => {
        try {
            let Posts  = await PostManager.GetPosts( {
                                                         title    : req.query.search ,
                                                         sort     : req.query.sort ,
                                                         skip     : ( req.query.page - 1 ) * 10 ,//*page time limit
                                                         limit    : 10 ,
                                                         tag      : req.query.tag ,
                                                         category : req.query.category,
                                                     } ) ,
                search = req.query.search || req.query.category || req.query.tag;
            res.locals.WebSite.Title += ' - searching for : ' + search;
            res.render( `templates/${ req.Schema.name }/${ req.Schema.Search }` , {
                Posts ,
                search,
            } , renderFunction( res ) )
        }
        catch ( e ) { ErrorHandler( req , res , e ) }
    } )

/*---------------Categories------------------*/
async function CategoryHandler ( req , res , next ) {
    if ( req.query.post || req.query.create ) return next();
    res.locals.WebSite.Title += ' - ' + res.locals.Category.Name;
    try {
        res.locals.Posts = await PostManager.GetPosts( { category : res.locals.Category._id } )
        res.status( 200 ).render( `templates/${ req.Schema.name }/${ req.Schema.Categories }` , renderFunction( res ) )
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

/*--------------Post-----------------*/
async function PostHandler ( req , res , next ) {
    if ( req.query.create ) return next();
    res.locals.WebSite.Title += ' - ' + res.locals.Category.Name;
    try {
        let Post = await PostManager.GetPost( req.query.post )
        res.locals.WebSite.Title += ' - ' + Post.title;
        if ( req.query.edit ) {
            res.render( `templates/${ req.Schema.name }/${ req.Schema.Edit }` , { Post } , renderFunction( res ) );
        }
        else {
            res.render( `templates/${ req.Schema.name }/${ req.Schema.Post }` , { Post } , renderFunction( res ) );
        }
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

function CreateHandler ( req , res ) {
    res.locals.WebSite.Title += ' - Create Post'
    try {res.render( `templates/${ req.Schema.name }/${ req.Schema.CreatePost }` , renderFunction( res ) );}
    catch ( e ) { ErrorHandler( req , res , e ) }
}

async function RatePost ( req , res ) {
    try {
        await PostManager.RatePost( req.query.post ,/*req.user._id*/'5f60162e8c5d9d18305ec7f7' , req.body.rate )
        res.status( 200 ).send( 'Rate Succeeded' )
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

async function CreatePost ( req , res ) {
    try {
        let post = await PostManager.CreatePost( {
                                                     ...req.body ,
                                                     category : res.locals.Category[ '_id' ] ,
                                                     author   : req.user[ '_id' ],
                                                 } )
        res.redirect( res.locals.Category.Slug + '?post=' + post._id );
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

async function EditPost ( req , res , next ) {
    if ( req.body.tags && !Array.isArray( req.body.tags ) ) req.body.tags = req.body.tags.split( ' ' )
    if ( req.body.covers && !( req.body.covers instanceof Array ) ) req.body.covers = [ req.body.covers ];
    if ( !req.query.edit ) return next();
    try {
        let post = await PostManager.UpdatePost( req.query.edit , {
            ...req.body ,
            author   : req.user[ '_id' ],
        } )
        res.redirect( res.locals.Category.Slug + '?post=' + post._id );
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

async function DeletePost ( req , res ) {
    try {
        await PostManager.DeletePost( req.query.post , req.user[ '_id' ] )
        res.redirect( res.locals.Category.Slug );
    }
    catch ( e ) { ErrorHandler( req , res , e ) }
}

/*--------------Comments-----------------*/
function AddComment ( req , res, next ) {
    if ( !req.query.post ) return next();
    CommentManager.Create( req.query.post , req.body , ( status , result ) => {
        res.status( status ).send( result );
    } )
}

function UpdateComment ( req , res , next ) {
    if ( req.query.comment ) {
        CommentManager.Modify( req.query.comment , req.body.text , req.user ,( status , result ) => {
            res.status( status ).json( result );
        } );
    }
    else if ( req.body.rate !== undefined && req.query.post ) return next();
    else res.status( 400 ).send( 'Bad request' );
}

function DeleteComment ( req , res , next ) {
    if(req.query.post) return next();
    if ( req.query.comment ) {
        CommentManager.Delete( req.query.comment , req.user , ( status , result ) => {
            res.status( status ).json( result );
        } );
    }
    else {
        res.status( 400 ).send( 'Bad request' );
    }
}

/*-------------------Error-------------*/
function ErrorHandler ( req , res , e ) {
    console.error( e );
    res.locals.WebSite.Title += " - Error";
    res.status( 500 ).render( `templates/${ req.Schema.name }/${ req.Schema.Error }` , { message : e.message } )
}

router.all( "*" , ( req , res ) => {
    ErrorHandler( req , res , new Error( "Page Not Found" ) );
} )
module.exports = router;
