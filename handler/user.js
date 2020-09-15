const User     = require( '../models/user' ) ,
      Role     = require( '../models/role' ) ,
      Console  = require( '../Classes/LogsManager' )
      passport = require( 'passport' );
function ErrorHandler ( err , res ) {
    Console.error( err , 'User' )
    return res.status( 500 ).json( err.message );
}
class UserMethods {
    renderLogin = function ( req , res ) {
        res.render( 'LogIn' , { to : req.header( 'Referer' ) || '/' } );
    };

    getUsers = async function ( req , res , next ) {
        try {
            res.status(200).send( await User.find( {} ) );
        }
        catch ( err ) {
            ErrorHandler(err,res);
        }
    };

    getUser = async function ( req , res , next ) {
        try {
            res.status( 200 ).json( await User.findById( req.params.user_id ) );
        }
        catch ( err ) {
            ErrorHandler(err,res);
        }
    };

    createUser      = function ( req , res ) {
        let { password , ...body } = req.body;

        User.register( new User( { ...body } ) , password , ( err , user ) => {
            if ( err ) {
                Console.error( err , 'User Creation' );
                return res.redirect( '/login' );
            }
            Console.log({ name : 'User Creation' , message : `User Created ${user.username }` })
            passport.authenticate( 'Vinland strategy' )( req , res , () => {
                res.redirect( '/Admin' );
            } );
        } );
    };
    updateUser      = async function ( req , res ) {
        try{
            let user = await User.findById(  req.params.user_id  )
            user.update( req.body );
            Console.log({ name : 'User Update' , message : `User Updated ${user.username }` })
            res.redirect( req.header( 'Referer' ) || '/' );
        }
        catch(err){
            Console.error( err , 'User Update' )
            return res.status( 500 ).json( err.message );
        }
    };
    updateUserTheme = async function ( req , res ) {
        try{
            let user = await User.findById( req.params.user_id )
            user.Admin = req.body.Admin;
            user.save();
            res.status( 200 ).send( 'Success' );
        }
        catch(err){
            ErrorHandler(err,res)
        }
    };

    logout = function ( req , res ) {
        req.logout();
        req.flash( 'success' , 'Logged you out!' );
        res.redirect( req.header( 'Referer' ) || '/' );
    };

    // PUT - /user/ban/:user_id/:days
    banUser = async function ( req , res ) {
        try {
            let user = await User.findById( req.params.user_id );
            user.setBan( Number( req.body.days ) );
            await user.save();
            res.status( 200 ).json( user.banned );
        }
        catch ( err ) {
            ErrorHandler(err,res);
        }
    };

    // PUT - /user/unban/:user_id
    unbanUser = async function ( req , res  ) {
        try {
            let user = await User.findById( req.params.user_id );
            user.unbanUser();
            await user.save();
            res.status( 200 ).json( user.banned );
        }
        catch ( err ) {
            ErrorHandler(err,res)
        }
    };

    asignRole = async function ( req , res , next ) {
        try {
            let user                    = await User.findById( req.params.user_id ),
                role                    = await Role.findById( req.params.role_id );
            if ( role.name === 'Owner' && role.owner ) throw new Error('You are not authorized to do that');
            if ( !user.roles.some( ( r ) => r.equals( role.id ) ) ) user.roles.push( role.id );
            await user.save();
            res.status( 200 ).json( user );
        }
        catch ( err ) {
            ErrorHandler(err,res)
        }
    };

    revokeRole = async function ( req , res  ) {
        try {
            let user = await User.findById( req.params.user_id ),
                role = await Role.findById( req.params.role_id );
            if ( role.name === 'Owner' && role.owner ) throw new Error('You are not authorized to do that');
            if ( user.roles.some( ( r ) => r.equals( role.id ) ) ) user.roles.remove( role.id );
            await user.save();
            res.status( 200 ).json( user );
        }
        catch ( err ) {
            ErrorHandler(err,res)
        }
    };

    renderChat = async ( req , res , next ) => {
        try {
            const { partner_id } = req.params;
            let loggedUser  = await User.findById( req.user._id )
                    .populate( 'messages' , { text : true , sender : true , receiver : true } ) ,
                partnerUser = await User.findById( partner_id );

            const messages = loggedUser.messages
                .filter( message => message.sender.equals( partner_id ) || message.receiver.equals( partner_id ) );

            res.render( `templates/${ req.Schema.name }/${ req.Schema.Messenger }` , { messages , partnerUser } ,( err , html )=>{
                if(err) throw err;
                res.status( 200 ).send( html );
            });
        }
        catch ( err ) {
            Console.error( err , 'WebSite Render' );
            res.locals.WebSite.Title = ' Error';
            res.status( 500 )
                .render( `templates/${ req.Schema.name }/${ req.Schema.Error }` , { message : err.message } )
        }
    };

    profile = async function ( req , res ) {
        try {
            let user = await User.findById( req.params.user_id );
            if ( user ) res.render( `templates/${ req.Schema.name }/${ req.Schema.Profile }` , { user } );
            else res.redirect( "/" );
        }catch ( err ) {
            Console.error( err , 'WebSite Render' );
            res.locals.WebSite.Title = ' Error';
            res.status( 500 )
                .render( `templates/${ req.Schema.name }/${ req.Schema.Error }` , { message : err.message } )
        }
    };
}

module.exports = new UserMethods();
