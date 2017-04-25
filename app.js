var express = require( 'express' ),
  path = require( 'path' ),
  favicon = require( 'serve-favicon' ),
  logger = require( 'morgan' ),
  cookieParser = require( 'cookie-parser' ),
  bodyParser = require( 'body-parser' ),
  index = require( './routes/index' ),
  uuid = require( 'uuid' ),
  app = express(),
  userList = [],
  roomList = [],
  animalList = [ 't-rex', 'sloth', 'llama', 'dog', 'cat', 'waterbottle', 'shovel', 'door', 'shirt', 'potato' ],
  colorList = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'grey', 'black' ],
  user = {},
  serv = {},
  i,
  ret,
  room = {},
  message;

// Integrate socket.io
app.io = require( 'socket.io' )();

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ));
app.set( 'view engine', 'hbs' );

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger( 'dev' ));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: false }));
app.use( cookieParser());
app.use( require( 'node-sass-middleware' )({
  src: path.join( __dirname, 'public' ),
  dest: path.join( __dirname, 'public' ),
  indentedSyntax: false,
  sourceMap: true,
  debug: false
}));
app.use( express.static( path.join( __dirname, 'public' )));

app.use( '/', index );

// catch 404 and forward to error handler
app.use( function notfoundhandler( req, res, next ) {
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
});

// error handler
app.use( function errorhandler( err, req, res, next ) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

  // render the error page
  res.status( err.status || 500 );
  res.render( 'error' );
});

function listUsers() {
  for ( i = 0; i < userList.length; i++ ) {
    console.log( 'A user connected with the id: ' + userList[ i ].id +
               '\n                        name: ' + userList[ i ].name +
               '\n                     room id: ' + userList[ i ].roomId );
  }
}

room = {
  id: '',
  name: '',
  users: []
}

room.id = ( uuid());
room.name = 'Lobby';
roomList.push( room );

room = {
  id: '',
  name: '',
  users: []
}

room.id = ( uuid());
room.name = 'Random';
roomList.push( room );

serv = {
  id: '-1',
  name: 'SERVER',
  message: '',
  uiPref: '-1',
  roomId: '',
  ownsRoom: false };

app.io.on( 'connection', function onconnect( socket ) {

  user = {
    id: uuid(),
    name: '',
    message: '',
    uiPref: 'default',
    roomId: roomList [ 0 ].id,
    ownsRoom: false };

  socket.uid = user.id;

  user.name = colorList[ Math.floor( Math.random() * 10 ) ] + '_' + animalList[ Math.floor( Math.random() * 10 ) ];
  userList.push( user );

  roomList [ 0 ].users.push( user );
  socket.join( user.roomId );

  serv.message = user.name + ' has joined the server!';
  console.log( '####room-to-clients####' );
  socket.broadcast.to( user.roomId ).emit( 'room-to-clients', serv );

  socket.on( 'request-user', function ru() {
    console.log( '####request-user####' );
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList[ i ].id == socket.uid ) {
        ret = userList[ i ];
        break;
      }
    }
    socket.emit( 'send-user', ret );
  });

  socket.on( 'request-rooms', function rr() {
    console.log( '####request-rooms####' );
    // sends roomList with list of rooms each containing id, name, list of user objs
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'client-to-room', function c2r( user ) {
    console.log( '####client-to-room####' );
    app.io.to( user.roomId ).emit( 'room-to-clients', user );
  });

  socket.on( 'update-username', function uu( new_user ) {
    console.log( '####update-username####' );
    for ( i = 0; i < userList.length; i++ ) {
      //find the user in the list of users
      if ( socket.uid === userList [ i ].id ) {
        //find the user in the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //find the user by their id in the rooms
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              serv.message = userList [ i ].name + ' changed their name to ' + new_user.name;
              socket.broadcast.to( user.roomId ).emit( 'room-to-clients', serv );

              roomList [ j ].users [ k ] = new_user;
              userList [ i ] = new_user;
            }
          }
        }
      }
    }
    socket.emit( 'send-user', user );
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'change-room', function cr( user, new_roomName ) {
    //remove user from current room
    //get id for new room
    //set users id for new room
    //send user back
    //send rooms list back

    user.ownsRoom = false;

    console.log( user.name );
    console.log( new_roomName );

    //find the user by id
    for ( i = 0; i < userList.length; i++ ) {
      // if the current user id == the sockets uid
      if ( userList [ i ].id === socket.uid ) {
        //start searching for the same id in the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          console.log( j );
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //if the users (in the room) id is the same as the sockets uid
            if ( roomList [ j ].users[ k ].id === socket.uid ) {
              //if the new_roomName is the same as the current room don't change rooms
              if ( new_roomName == roomList [ j ].name ) {
                return;
              }

              //have socket leave room
              socket.leave( user.roomId );
              serv.message = userList [ i ].name + ' has left the room.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );
              //remove user from list of users for room
              roomList [ j ].users.splice( k, 1 );
              if ( roomList [ j ].users.length === 0 ) {
                if ( roomList [ j ].name !== 'Lobby' ) {
                  if ( roomList [ j ].name !== 'Random' ) {
                    roomList.splice( j, 1 );
                    j--;
                  }
                }
              }
            }
          }
        }
      }
    }


    //find the user in the user list
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList[ i ].id === socket.uid ) {
        //find the room the user should now go into
        for ( j = 0; j < roomList.length; j++ ) {
          if ( roomList [ j ].name === new_roomName ) {
            //set the users roomID to the rooms id
            userList [ i ].roomId = roomList [ j ].id;
            userList [ i ].ownsRoom = false;
            //push the user into the list of rooms
            roomList [ j ].users.push( userList [ i ]);
            socket.join( userList [ i ].roomId );
            ret = userList [ i ];
          }
        }
      }
    }
    
    serv.message = ret.name + ' has joined the room!';
    socket.broadcast.to( ret.roomId ).emit( 'room-to-clients', serv );
    listUsers();
    socket.emit( 'send-user', ret );
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'make-room', function mr( user ) {
    if ( user.ownsRoom === true ) {
      return;
    }

    //removes user from all possible rooms if in multiple rooms (which they shouldn't be)
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList [ i ].id === socket.uid ) {
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              socket.leave( user.roomId );
              serv.message = userList [ i ].name + ' has left the room.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );
              roomList[ j ].users.splice( k, 1 );
            }
          }
        }
      }
    }

    room = {
      id: uuid(),
      name: user.name + 's-Room',
      users: []
    }

    user.ownsRoom = true;
    user.roomId = room.id;

    room.users.push( user );
    roomList.push( room );

    for ( i = 0; i < userList.length; i++ ) {
      if ( user.id === userList [ i ].id ) {
        userList [ i ] = user;
      }
    }

    socket.join( user.roomId );

    socket.emit( 'send-user', user );
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'disconnect', function disc() {
    user.ownsRoom = false;
    console.log( '####disconnect####' );
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList [ i ].id === socket.uid ) {
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              serv.message = userList [ i ].name + ' has left the server.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );

              roomList[ j ].users.splice( k, 1 );
              userList.splice( i, 1 );

              app.io.emit( 'send-rooms', roomList );
              return;
            }
          }
        }
      }
    }
  });
});

module.exports = app;
