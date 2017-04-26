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
  new_user,
  room = {},
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
app.use( require( 'node-sass-middleware' )({
  src: path.join( __dirname, 'public' ),
  dest: path.join( __dirname, 'public' ),
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
    //iterate through all users and return with matching id
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList[ i ].id == socket.uid ) {
        new_user = userList[ i ];
        break;
      }
    }
    socket.emit( 'send-user', new_user );
  });

  socket.on( 'request-rooms', function rr() {
    console.log( '####request-rooms####' );
    //sends roomList with list of rooms each containing id, name, list of user objs
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'client-to-room', function c2r( user ) {
    console.log( '####client-to-room####' );
    //this is the turn around for a message
    app.io.to( user.roomId ).emit( 'room-to-clients', user );
  });

  socket.on( 'update-username', function uu( updated_user ) {
    console.log( '####update-username####' );
    //iterate through all users
    for ( i = 0; i < userList.length; i++ ) {
      //if the current is the one we're looking for
      if ( socket.uid === userList [ i ].id ) {
        //iterate through all of the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          //iterate through all of the users of the jth room
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //if the user we're looking for is in the room
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              //create and the server display message
              serv.message = userList [ i ].name + ' changed their name to ' + updated_user.name;
              socket.broadcast.to( updated_user.roomId ).emit( 'room-to-clients', serv );
              //update the user in the room
              roomList [ j ].users [ k ] = updated_user;
              //update the user in the user list
              userList [ i ] = updated_user;
            }
          }
        }
      }
    }
    //send the updated user back to the client
    socket.emit( 'send-user', updated_user );
    //send the updated roomList back to all clients
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'change-room', function cr( user, new_roomName ) {
    //whenever a user leaves a room they forfeit any right of owning the room
    user.ownsRoom = false;

    //iterate through all of the users
    for ( i = 0; i < userList.length; i++ ) {
      //if the current is the one we're looking for
      if ( userList [ i ].id === socket.uid ) {
        //iterate through all of the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          //iterate through all of the users in the jth room
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //if the kth user of the jth room is the one we are looking for
            if ( roomList [ j ].users[ k ].id === socket.uid ) {
              //if the new_roomName is the same as the current room don't change rooms
              if ( new_roomName == roomList [ j ].name ) {
                return;
              }

              //have socket leave room
              socket.leave( user.roomId );
              //create and send the server display message
              serv.message = userList [ i ].name + ' has left the room.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );
              //remove user from list of users for room
              roomList [ j ].users.splice( k, 1 );
              //check to see if there are any users in the room
              if ( roomList [ j ].users.length === 0 ) {
                //if the room is not the Lobby or Random
                if ( roomList [ j ].name !== 'Lobby' ) {
                  if ( roomList [ j ].name !== 'Random' ) {
                    //then cut the room from the list of rooms
                    roomList.splice( j, 1 );
                    //j-- because we go out of bounds in the for loop if we don't
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
      //if the ith user in the list is the one we're looking for
      if ( userList[ i ].id === socket.uid ) {
        //iterate through all of the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          //if the jth room is the room that we are looking for
          if ( roomList [ j ].name === new_roomName ) {
            //set the users roomID to the rooms id
            userList [ i ].roomId = roomList [ j ].id;
            //push the user into the rooms list of users
            roomList [ j ].users.push( userList [ i ]);
            //have the socket join that room
            socket.join( userList [ i ].roomId );
            //set ret as the user to update
            updatedUser = userList [ i ];
          }
        }
      }
    }

    //create and send the server display message
    serv.message = updatedUser.name + ' has joined the room!';
    socket.broadcast.to( updatedUser.roomId ).emit( 'room-to-clients', serv );
    //send the updated user back to the client
    socket.emit( 'send-user', updatedUser );
    //send the updated list of rooms back to all clients
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'make-room', function mr( user ) {
    console.log( '####make-room#### ' );
    //don't make a new room if the user already owns a room
    if ( user.ownsRoom === true ) {
      return;
    }

    //iterate through all of the users
    for ( i = 0; i < userList.length; i++ ) {
      //if the ith user is the one we are looking for
      if ( userList [ i ].id === socket.uid ) {
        //iterate through all of the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          //iterate through the jth rooms users
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //if the ith user is the same as the kth usre of the jth room
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              //have the socket leave the room
              socket.leave( user.roomId );
              //create and send the server message
              serv.message = userList [ i ].name + ' has left the room.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );
              //remove the kth user from the jth room
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

    //after a room obj is made the user now owns a room
    user.ownsRoom = true;
    //set the users roomId to the previously mentioned room
    user.roomId = room.id;
    //put the user into the list of users for their room
    room.users.push( user );
    //push the newly created room into the list of rooms
    roomList.push( room );
    //iterate through all of the users
    for ( i = 0; i < userList.length; i++ ) {
      //if the ith user is the one we're looking for
      if ( user.id === userList [ i ].id ) {
        //update that user in the list of users
        userList [ i ] = user;
      }
    }
    //have the socket join the new room
    socket.join( user.roomId );
    //send the updated user back to the client
    socket.emit( 'send-user', user );
    //send the updated list of rooms back to all clients
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'disconnect', function disc() {
    console.log( '####disconnect####' );
    //if a user disconnects they no longer own a room
    user.ownsRoom = false;
    //iterate through all of the users
    for ( i = 0; i < userList.length; i++ ) {
      //if the ith user is the one we're looking for
      if ( userList [ i ].id === socket.uid ) {
        //iterate through all of the rooms
        for ( j = 0; j < roomList.length; j++ ) {
          //iterate through the users of the jth room
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            //if the kth user of the jth room is the user we are looking for
            if ( userList [ i ].id === roomList [ j ].users[ k ].id ) {
              //create and send the server message
              serv.message = userList [ i ].name + ' has left the server.';
              app.io.to( userList [ i ].roomId ).emit( 'room-to-clients', serv );
              //remove the kth user from the list of users in the jth room
              roomList [ j ].users.splice( k, 1 );
              //remove the ith user from the list of users
              userList.splice( i, 1 );

              //if the room is now empty
              if ( roomList [ j ].users.length === 0 ) {
                //if the room is not the Lobby or Random
                if ( roomList [ j ].name !== 'Lobby' ) {
                  if ( roomList [ j ].name !== 'Random' ) {
                    //then cut the room from the list of rooms
                    roomList.splice( j, 1 );
                    //j-- because we go out of bounds in the for loop if we don't
                    j--;
                  }
                }
              }

              //send the updated list of rooms to all clients
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
