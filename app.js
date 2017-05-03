var express = require( 'express' ),
  path = require( 'path' ),
  favicon = require( 'serve-favicon' ),
  logger = require( 'morgan' ),
  cookieParser = require( 'cookie-parser' ),
  bodyParser = require( 'body-parser' ),
  index = require( './routes/index' ),
  uuid = require( 'uuid' ),
  sassMiddleware = require( 'node-sass-middleware' ),
  app = express(),
  animalList = [ 't-rex', 'sloth', 'llama', 'dog', 'cat', 'waterbottle', 'shovel', 'door', 'shirt', 'potato' ],
  colorList = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'grey', 'black' ],
  userList = [],
  roomList = [],
  serv,
  c_user,
  c_room,
  i,
  n_user,
  message;

//Integrate socket.io
app.io = require( 'socket.io' )();

//view engine setup
app.set( 'views', path.join( __dirname, 'views' ));
app.set( 'view engine', 'hbs' );

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger( 'dev' ));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: false }));
app.use( cookieParser());
app.use( sassMiddleware({
  src: path.join( __dirname, 'scss' ),
  dest: path.join( __dirname, 'public' ),
  includePaths: [ path.join( __dirname, 'node_modules/foundation-sites/assests/' ) ],
  indentedSyntax: false,
  sourceMap: true,
  debug: false
}));
app.use( express.static( path.join( __dirname, 'public' )));

app.use( '/', index );

//catch 404 and forward to error handler
app.use( function notfoundhandler( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
});

//error handler
app.use( function errorhandler( err, req, res, next ) {
  //set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

  //render the error page
  res.status( err.status || 500 );
  res.render( 'error' );
});

/**
 * @function listRooms
 * @description This function lists the rooms in the server side terminal with
 *              pretty format
 */
function listRooms() {
  for ( let c_room of roomList ) {
    console.log( 'A room with the ID: ' + c_room.ID +
               '\n              name: ' + c_room.name +
               '\n             users: ' );
    for ( let c_user of c_room.users ) {
      console.log( '                  user: ' + c_user.name )
    }
  }
}


/**
 * @class
 * @description A class to represent a room.
 * @constructor
 * @property {string} ID the room's unique identifier
 * @property {string} name the room's name (this can be changed by the owner)
 * @property {objarray} users the vector of users currently in the room
 * @property {string} roomOwner the id of the roomowner for cleanup
 * @requires uuid
 */
class room {
  /** @param {string} name - the class is passed what the name of the room will be */
  constructor( name ) {
    this.ID = uuid();
    this.name = name;
    this.users = [];
    this.roomOwner = '';
  }
}

roomList.push( new room( 'Lobby' ));

roomList.push( new room( 'Random' ));

/**
 * @class
 * @description A class to represent a user.
 * @constructor
 * @property ID the user's unique identifier
 * @property name the user's name (this can be changed by the user)
 * @property uiPref the user's ui preference. This will only be used if multiple colorschemes are implemented
 * @property roomID the user's current room by it's unique identifier
 * @property ownsRoom whether the user owns the room they are currently in. (whenever a user changes room this is set to false)
 *
 * @requires uuid
 */
class user {
  constructor() {
    this.ID = '';
    this.name = colorList[ Math.floor( Math.random() * 10 ) ] + '_' + animalList[ Math.floor( Math.random() * 10 ) ];
    this.uiPref = 'default';
    this.roomID = roomList [ 0 ].ID;
    this.ownsRoom = 'false';
    //owns room will be the new rooms ID
    //when the user leaves the room the ownsRoom id persists
    //when the room closes ownsroom is set to false
    //if the user leaves, the room becomes a zombie, what to do?
    this.message = '';
  }
}

serv = new user();
serv.name = 'SERVER';
serv.roomID = '-1';

/**
 * @function connection
 * @description When a client connects to the server the client side javascript
 *              creates a socket connection between the server and itself
 * @param {object} socket The object that makes the magic happen. This is the client
 */
app.io.on( 'connection', function connection( socket ) {


  /**
   * @function pushUsertoRoom
   * @description This function adds a copy of the sockets user to the room obj
   * @param {object} n_user A user is passed into the function to be copied into
   *                        the list of users in a room
   */
  function pushUsertoRoom( n_user ) {
    for ( let i = 0; i < roomList.length; i++ ) {
      if ( roomList [ i ].ID === n_user.roomID ) {
        roomList [ i ].users.push( n_user );
      }
    }
  }

  /**
   * @function updateUserinRoom
   * @description This function updates the copy of the sockets user in the room obj
   * @param {object} u_user An updated user is passed into the function to overwrite
   *                        it's old self in the roomList
   */
  function updateUserinRoom( u_user ) {
    for ( let i = 0; i < roomList.length; i++ ) {
      for ( let j = 0; j < roomList [ i ].users.length; j++ ) {
        if ( roomList [ i ].users [ j ].ID === u_user.ID ) {
          //console.log( roomList [ i ].users [ j ]);
          //console.log( u_user );
          roomList [ i ].users [ j ] = u_user;
          //listRooms();
        }
      }
    }
  }

  /**
   * @function removeUserfromRooms
   * @description This function removes the copy of the user from the roomList
   * @param {object} u_user An updated user is passed into the function to overwrite
   *                        it's old self in the roomList
   */
  function removeUserfromRooms( u_user ) {
    for ( let i = 0; i < roomList.length; i++ ) {
      for ( let j = 0; j < roomList [ i ].users.length; j++ ) {
        if ( u_user.ID === roomList [ i ].users [ j ].ID ) {
          roomList [ i ].users.splice( j, 1 );
          j--;
          if ( roomList [ i ].users.length === 0 ) {
            if (( roomList [ i ].name !== 'Lobby' ) && ( roomList [ i ].name !== 'Random' )) {
              owner = app.io.sockets.connected[ roomList [ i ].roomOwner ];
              //this just got the socket of the owner
              if ( owner ) {
                owner.user.ownsRoom = 'false';
                socket.to( owner.id ).emit( 'send-user', owner.user );
                serv.message = 'Your room was deleted due to emptiness';
                socket.to( owner.id ).emit( 'room-to-clients', serv );
                //update the owner of the room (they no longer own a room)
              }
              roomList.splice( i, 1 );
              i--;
            }
          }
        }
      }
    }
  }

  console.log( '####connection####' );
  //make the user object
  socket.user = new user();
  socket.user.ID = socket.id;
  console.log( socket.user.ID );
  //testing for ui if the user owns a room
  //socket.user.ownsRoom = socket.user.roomID;
  //tell the server that the user just joined
  console.log( 'client connected with user: ' + socket.user.name );
  serv.message = socket.user.name + ' joined the server!';
  socket.broadcast.emit( 'room-to-clients', serv );
  //Have the socket join a room based on the users roomID
  socket.join( socket.user.roomID );
  //Tell the room object that a user joined it
  pushUsertoRoom( socket.user );
  //Tell the entire server that someone joined the lobby
  app.io.emit( 'send-rooms', roomList );

  /**
   * @function request_user
   * @description When a new client requests a user we respond with an emit of
   *              the user data
   */
  socket.on( 'request-user', function request_user() {
    console.log( '####request-user####' );
    socket.emit( 'send-user', socket.user );
  });

  /**
   * @function request_rooms
   * @description When a client requests the rooms we respond with an emit of
   *              the roomList to the entire
   */
  socket.on( 'request-rooms', function request_rooms() {
    console.log( '####request-rooms####' );
    socket.emit( 'send-rooms', roomList );
  });

  /**
   * @function client_to_room
   * @description When a client sends a message we respond with an emit of the
   *              users object containing the message to only the senders room
   * @param {object} u_user An updated version of the user, modified client side
   */
  socket.on( 'client-to-room', function client_to_room( u_user ) {
    console.log( '####client-to-room####' );
    socket.user = u_user;
    app.io.in( socket.user.roomID ).emit( 'room-to-clients', socket.user );
  });

  /**
   * @function update_username
   * @description The user wants to update their username so we update it in the
   *              room list and we update the sockets version of the user. We then
   *              respond with a send-user and to the server a send-rooms
   * @param {object} u_user An updated version of the user, modified client side
   */
  socket.on( 'update-username', function update_username( u_user ) {
    console.log( '####update-username####' );
    //make sure the user is actually changing name
    if ( u_user.name === socket.user.name ) {
      return;
    }
    //tell the server the user updated their name
    serv.message = socket.user.name + ' changed their name to ' + u_user.name;
    socket.in( socket.user.roomID ).emit( 'room-to-clients', serv );
    serv.message = 'You changed your name to ' + u_user.name;
    socket.emit( 'room-to-clients', serv );
    //update sockets version of user
    socket.user = u_user;
    //update rooms version of user
    updateUserinRoom( socket.user );
    //send the user back to the client
    socket.emit( 'send-user', socket.user );
    //send the user to all clients
    app.io.emit( 'send-rooms', roomList );
  });

  /**
   * @function change_room
   * @description A client will update their version of the user to what room they
   *              want to move to and this function moves the user accordingly
   * @param {object} u_user An updated version of the user, modified client side
   */
  socket.on( 'change-room', function change_room( u_user ) {
    console.log( '####change-room####' );
    //make sure the user is actually changing rooms
    if ( u_user.roomID === socket.user.roomID ) {
      return;
    }
    //tell the room the user left
    serv.message = socket.user.name + ' left the room.'
    socket.in( socket.user.roomID ).emit( 'room-to-clients', serv );
    //make the socket leave the room
    socket.leave( socket.user.roomID );
    //update the sockets version of the user
    socket.user = u_user;
    //take the user out of all rooms (should just be one though)
    removeUserfromRooms( socket.user );
    //make the socket join the new room (updated when .user was set to u_user)
    socket.join( socket.user.roomID );
    //Tell the room object that a user joined it
    serv.message = socket.user.name + ' joined the room.'
    socket.in( socket.user.roomID ).emit( 'room-to-clients', serv );
    pushUsertoRoom( socket.user );
    //Tell the entire server that someone joined the lobby
    app.io.emit( 'send-rooms', roomList );
    //update the user for redundancy
    socket.emit( 'send-user', socket.user );
  });

  /**
   * @function make_room
   * @description The user want's to make a room so the server will generate one
   *              for them and move them into it automatically.
   * @param {object} u_user An updated version of the user, modified client side
   */
  socket.on( 'make-room', function make_room( room_name ) {
    console.log( '####make-room#### ' );
    temp = new room( room_name );
    temp.roomOwner = socket.user.ID;
    socket.leave( socket.user.roomID );
    removeUserfromRooms( socket.user );
    //user is now stripped of all room info
    socket.user.roomID = temp.ID;
    //make the user the owner
    socket.user.ownsRoom = temp.ID;
    //to update for owns room
    temp.users.push( socket.user );
    socket.join( socket.user.roomID );
    //push the socket into their own room
    roomList.push( temp );
    //push the room into the list of rooms;
    app.io.emit( 'send-rooms', roomList );
    //update the user for redundancy
    socket.emit( 'send-user', socket.user );
  });

  /**
   * @function rename_room
   * @description The user want's to make a room so the server will generate one
   *              for them and move them into it automatically.
   * @param {object} u_user An updated version of the user, modified client side
   */
  socket.on( 'update-room', function rename_room( new_roomname ) {
    console.log( '####update-room#### ' );
    for ( let i = 0; i < roomList.length; i++ ) {
      console.log( roomList [ i ].roomOwner );
      console.log( socket.id );
      if ( roomList [ i ].roomOwner === socket.id ) {
        console.log( 'found room' );
        roomList [ i ].name = new_roomname;
      }
    }
    app.io.emit( 'send-rooms', roomList );
  });

  /**
   * @function disconnect
   * @description When a client closes the connection this runs (like a destructor)
   *              It removes the users from all rooms and updates other users of
   *              the change
   */
  socket.on( 'disconnect', function disconnect() {
    console.log( '####disconnect####' );
    removeUserfromRooms( socket.user );
    for ( let i = 0; i < roomList.length; i++ ) {
      if ( roomList [ i ].roomOwner === socket.user.ID ) {
        roomList [ i ].roomOwner = '-1';
      }
    }
    serv.message = socket.user.name + ' left the server!';
    socket.broadcast.emit( 'room-to-clients', serv );
    app.io.emit( 'send-rooms', roomList );
  });

});

module.exports = app;
