const mongoose              = require( 'mongoose' );
const passportLocalMongoose = require( 'passport-local-mongoose' );

let userSchema = new mongoose.Schema(
    {
        username     : { type : String , unique : true , required : true } ,
        firstName    : { type : String , required : true } ,
        lastName     : { type : String , required : true } ,
        email        : { type : String , unique : true , required : true } ,
        roles        : [ { type : mongoose.Schema.ObjectId , ref : 'Vinland_Role' } ] ,
        password     : { type : String } ,
        birthday     : { type : Date , required : true } ,
        banned       : { isBanned : { type : Boolean , default: false } , dateOfBan : Date , duration : Number } ,
        phone        : { type : String } ,
        profileImage : { type : String , default : '/admin/Files/images/default-profile.png' } ,
        messages     : [ { type : mongoose.Schema.ObjectId , ref : 'Vinland_Message' } ] ,
        contacts     : [ { type : mongoose.Schema.ObjectId , ref : 'Vinland_User' } ] ,
        Admin        : {
            LogoHeader   : { type : String , default : 'dark' } ,
            NavbarHeader : { type : String , default : 'dark' } ,
            Background   : { type : String , default : 'dark' } ,
            Sidebar      : { type : String , default : 'dark' } ,
            layout       : { type : String , default : 'dark' } ,
        } ,
    } , { timestamps: true, });

userSchema.methods.getIsBanned = function () { return this.banned.isBanned };

userSchema.methods.setBan = function ( days ) {
    if ( !this.banned.isBanned ) {
        this.banned.isBanned  = true;
        this.banned.dateOfBan = new Date();
        this.banned.duration  = days;
    }
};

userSchema.methods.unbanUser = function () {
    if ( this.banned.isBanned ) {
        this.banned.isBanned  = false;
        this.banned.dateOfBan = undefined;
        this.banned.duration  = undefined;
    }
};

userSchema.methods.banExpired = function () {
    return ( ( ( new Date() ).getTime() - this.banned.dateOfBan.getTime() ) / ( 1000 * 3600 * 24 ) ) >= this.banned.duration;
};

userSchema.plugin( passportLocalMongoose , { populateFields : 'roles contacts' } );

module.exports = mongoose.model( "Vinland_User" , userSchema );
