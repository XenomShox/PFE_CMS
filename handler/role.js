const Role    = require( '../models/role' ) ,
      Console = require( '../Classes/LogsManager' );
function ErrorHandler ( err , res ) {
    Console.error( err , 'Messages' )
    return res.status( 500 ).json( { error : { message : err.message } } );
}
exports.getRoles = async ( req , res  ) => {
    try{
        return res.status( 200 ).json( await Role.find() );
    }
    catch ( e ) {
        ErrorHandler(e,res);
    }
};

exports.getRole = async ( req , res ) => {
    try {
        return res.status( 200 ).json( await Role.findById( req.params.role_id ) );
    }
    catch ( err ) {
        ErrorHandler(err,res);
    }
};

exports.modifyRole = async ( req , res ) => {
    try {
        let role = await Role.findById( req.params.role_id );
        if ( role.name === 'Owner' && role.owner ) throw new Error('you cannot modify this role');
        await role.update(  req.body );
        return res.status( 200 ).json( role );
    }
    catch ( err ) {
        ErrorHandler(err,res);
    }
};

exports.removeRole = async ( req , res ) => {
    try {
        let role = await Role.findById( req.params.role_id );
        if ( role.name === 'Owner' && role.owner ) throw new Error('you cannot delete this role');
        await role.remove();
        return res.status( 200 ).json( role );
    }
    catch ( err ) {
        ErrorHandler(err,res);
    }
};

exports.createRole = async ( req , res , next ) => {
    try {
        const { category , name , ...body } = req.body;
        Object.keys( body ).forEach( ( key ) => {
            body[ key ] = Boolean( body[ key ] );
        } );

        let role;
        if ( await Role.count( {} > 0 ) ) {
            role = await Role.create( { ...body , owner : false , category , name } );
        }
        else {
            role = await Role.create( { ...body , category , name } );
        }
        return res.status( 200 ).json( role );
    }
    catch ( err ) {
        ErrorHandler(err,res);
    }
};
