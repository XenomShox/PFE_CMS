const Console = require( './LogsManager' );

class ApiManager {
    /*----------------Attributes------------*/
    Schemas = require( './Schemas' );
    Models  = require( './Models' );

    /*------------------Methods-------------*/
    StartApiManager () {
        this.Schemas.LoadSchemaSystem( this )
            .then( () => {
                return this.Schemas.GetAllSchemas( ( status , result ) => {
                    if ( status === 500 ) throw result.Error;
                    this.Models.LoadModels( result );
                } );
            } )
            .catch( reason => Console.error( reason ) )
    }
}

module.exports = new ApiManager();
