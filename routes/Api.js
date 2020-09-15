const router                         = require( 'express' ).Router() ,
      ApiManager                     = require( '../Classes/ApiManager' ) ,
      { isLoggedIn , hasPermission } = require( '../middlewares/middleware' );
/*------------------------------Schema----------------------------*/
router.route( '/' )
    .all( isLoggedIn , hasPermission( 'admin_privillage' ) )
    .get( ( req , res ) => {
        if ( req.body.Name !== undefined ) {
            ApiManager.Schemas.GetASchema( req.body.Name , ( status , result ) => {
                res.status( status ).send( result );
            } );
        }
        else {
            ApiManager.Schemas.GetAllSchemas( ( status , result ) => {
                res.status( status ).send( result );
            } );
        }
    } )
    .post( ( req , res ) => {
        if ( req.body.Name !== undefined ) {
            if ( !( /^[1-9A-Za-z_]+$/.test( req.body.Name ) ) ) {
                res.status( 401 )
                    .send( { Error : 'Invalid Schema Name it must follow this regEX : "^[1-9A-Za-z]+$"' } );
            }
            else if ( req.body.Schema !== undefined ) {
                ApiManager.Schemas.AddASchema( req.body.Name , req.body.Schema , ( status ,
                    result ) => {
                    res.status( status ).send( result );
                } );
            }
            else {
                res.status( 406 )
                    .send( { Error : 'there is no Schema parameter in the body. we can\'t create an empty Schema' } );
            }
        }
        else {
            res.status( 406 ).send( { Error : 'Can\'t Create a Schema without a Name' } );
        }
    } )
    .put( ( req , res ) => {
        if ( req.body.Name !== undefined ) {
            if ( !( /^[1-9A-Za-z_]+$/.test( req.body.NewName ) ) ) {
                res.status( 401 )
                    .send( { Error : 'Invalid Schema Name it must follow this regEX : "^[1-9A-Za-z]+$"' } );
            }
            else if ( req.body.Schema !== undefined ) {
                ApiManager.Schemas.UpdateASchema( req.body.Name , req.body.NewName , req.body.Schema , ( status ,
                    result ) => {
                    res.status( status ).send( result );
                } );
            }
            else {
                res.status( 406 )
                    .send( { Error : 'there is no Schema parameter in the body. we can\'t update with an empty Schema' } );
            }
        }
        else {
            res.status( 406 ).send( { Error : 'Can\'t Update a Schema without a Name' } );
        }
    } )
    .delete( ( req , res ) => {
        if ( req.body.Name !== undefined ) {
            ApiManager.Schemas.DeleteASchema( req.body.Name , ( status , result ) => {
                res.status( status ).send( result );
            } );
        }
        else {
            res.status( 406 ).send( { Error : 'Can\'t Delete a Schema without a Name' } );
        }
    } );
/*------------------------------Data----------------------------*/
router.route( '/:Api' )
    .get( ( req , res ) => {
        ApiManager.Models.GetData( req.params.Api , {
            find   : req.body.find ,
            select : req.body.select ,
            limit  : req.body.limit ,
            skip   : req.body.skip ,
            sort   : req.body.sort ,
            count  : req.body.count,
        } , ( status , result ) => {
            res.status( status ).send( result );
        } );
    } )
    .post( isLoggedIn ,( req , res ) => {
        ApiManager.Models.AddData( req.params.Api , req.body , ( status , result ) => {
            res.status( status ).send( result );
        } );
    } )
    .delete( isLoggedIn ,( req , res ) => {
        ApiManager.Models.DeleteData( req.params.Api , req.body[ "_id" ] , ( status , result ) => {
            res.status( status ).send( result );
        } );
    } )
    .put( isLoggedIn ,( req , res ) => {
        let { "_id" : id , ...data } = req.body;
        ApiManager.Models.UpdateData( req.params.Api , id , data , ( status , result ) => {
            res.status( status ).send( result );
        } );
    } );
module.exports = router;
