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
    console.log( userList[ i ].name );
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

console.log( roomList[0].name );
console.log( roomList[1].name );
//push the default room

app.io.on( 'connection', function onconnect( socket ) {

  user = {
    id: '',
    name: '',
    message: '',
    uiPref: 'default',
    roomId: '',
    ownsRoom: false };

  serv = {
    id: '-1',
    name: 'SERVER',
    message: '',
    uiPref: '-1',
    roomId: '',
    ownsRoom: false };

  //set the user id and then the sockets id to that
  user.id = uuid();
  socket.uid = user.id;
  user.roomId = roomList [ 0 ].id;
  user.name = colorList[ Math.floor( Math.random() * 10 ) ] + '_' + animalList[ Math.floor( Math.random() * 10 ) ];
  roomList [ 0 ].users.push( user.name );

  socket.join( user.roomId );

  console.log( 'A user connected with the id: ' + user.id +
               '\n                        name: ' + user.name +
               '\n                     room id: ' + user.roomId );

  userList.push( user );

  listUsers();

  serv.message = user.name + ' has joined the room!';
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
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'client-to-room', function c2r( user ) {
    console.log( '####client-to-room####' );
    app.io.to( user.roomId ).emit( 'room-to-clients', user );
  });

  socket.on( 'update-username', function uu( user ) {
    console.log( '####update-username####' );
    for ( i = 0; i < userList.length; i++ ) {
      if ( user.id === userList [ i ].id ) {
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            if ( userList [ i ].name === roomList [ j ].users[ k ]) {
              serv.message = userList [ i ].name + ' changed their name to ' + user.name;
              socket.broadcast.to( user.roomId ).emit( 'room-to-clients', serv );
              roomList [ j ].users [ k ] = user.name;
              userList [ i ] = user;
            }
          }
        }
      }
    }
    socket.emit( 'send-user', user );
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'disconnect', function disc() {
    console.log( '####disconnect####' );
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList [ i ].id === socket.uid ) {
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            if ( userList [ i ].name === roomList [ j ].users[ k ]) {
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
