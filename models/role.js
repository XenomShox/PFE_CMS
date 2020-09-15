const mongoose = require( 'mongoose' ),
      User     = require( './user' );

roleSchema = new mongoose.Schema(
    {
        name             : {
            type     : String ,
            max      : 30 ,
            required : true ,
        } ,
        category         : { type : String , required : true } ,
        owner            : { type : Boolean , default : false } ,
        admin_privillage : { type : Boolean , default : false } ,
        create_post      : { type : Boolean , default : false } ,
        delete_post      : { type : Boolean , default : false } ,
    } );

roleSchema.pre( 'remove' , async ( next ) => {
    try {
        let users = await User.find();
        users.forEach( ( user ) => {
            if ( user.roles.some( ( role ) => role.equals( this.id ) ) ) user.roles.remove( this.id );
        } );
        return next();
    }
    catch ( err ) {
        return next( err );
    }
} );

module.exports = mongoose.model( 'Vinland_Role' , roleSchema );
