exports.isLoggedIn = function ( req , res , next ) {
    if ( req.isAuthenticated() ) return next();
    req.flash( 'error' , 'Please Login First' );
    res.status( 400 ).redirect( '/login' );
};

exports.hasPermission = ( permissions ) => {
    if ( !Array.isArray( permissions ) ) permissions = [ permissions ];
    return async ( req , res , next ) => {
        try {
            let user = req.user;
            if ( user.roles.some( ( role ) => role[ 'owner' ] ) || user.roles.some( ( role ) => role[ 'admin_privillage' ] ) ) {
                return next();
            }
            permissions.forEach( ( permission ) => {
                if ( !user.roles.some( ( role ) => role[ permission ] ) ) {
                    req.flash( 'error' , 'Not Authorized' );
                    res.redirect( '/' );
                }
            } );
            return next();
        }
        catch ( err ) {
            return next( err );
        }
    };
};
