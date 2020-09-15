const Message = require( '../models/messages' ) ,
      Console = require( '../Classes/LogsManager' ) ,
      User    = require( '../models/user' );

function ErrorHandler ( err , res ) {
    Console.error( err , 'Messages' )
    return res.status( 500 ).json( err );
}

exports.getMessages = async ( req , res , next ) => {
    try {
        return res.status( 200 ).json( await Message.find() );
    }
    catch ( err ) {
        ErrorHandler( err , res );
    }
};

exports.getMessage = async ( req , res , next ) => {
    try {
        return res.status( 200 ).json( await Message.findById( req.params.id ) );
    }
    catch ( err ) {
        ErrorHandler( err , res );
    }
};

exports.addMessage = async ( req , res , next ) => {
    try {
        const { sender , receiver } = req.params;
        const { text }              = req.body;
        let message                 = await Message.create( { text , sender , receiver } );

        let userSender   = await User.findById( sender );
        let userReceiver = await User.findById( receiver );

        userSender.messages.push( message.id );
        userReceiver.messages.push( message.id );

        if (
            !userSender.contacts.some( ( contact ) =>
                                           contact.equals( userReceiver.id ),
            )
        ) {
            userSender.contacts.push( userReceiver.id );
        }
        if (
            !userReceiver.contacts.some( ( contact ) =>
                                             contact.equals( userSender.id ),
            )
        ) {
            userReceiver.contacts.push( userSender.id );
        }

        await userSender.save();
        await userReceiver.save();

        /*const foundMessage = await Message.findById(message.id)
            .populate("sender", {
                username: true,
            })
            .populate("receiver", {
                username: true,
            });*/

        res.redirect( req.header( 'Referer' ) || '/' );
    }
    catch ( err ) {
        ErrorHandler( err , res );
    }
};

exports.deleteMessage = async ( req , res , next ) => {
    try {
        const foundMessage = await Message.findById( req.params.id );

        await foundMessage.remove();
        return res.status( 200 ).json( foundMessage );
    }
    catch ( err ) {
        ErrorHandler( err , res );
    }
};
