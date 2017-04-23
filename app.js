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
  i,
  ret,
  room = {};

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
//push the default room

app.io.on( 'connection', function onconnect( socket ) {

  user = {
    id: '',
    name: '',
    message: '',
    uiPref: 'default',
    roomId: '',
    ownsRoom: false };

  console.log( 'A user connected!' );

  //set the user id and then the sockets id to that
  user.id = uuid();
  socket.uid = user.id;
  user.roomId = roomList [ 0 ].id;
  user.name = colorList[ Math.floor( Math.random() * 10 ) ] + '_' + animalList[ Math.floor( Math.random() * 10 ) ];
  roomList [ 0 ].users.push( user.name );

  console.log( 'A user connected with the id: ' + user.id +
               '\n                        name: ' + user.name +
               '\n                     room id: ' + user.roomId );

  userList.push( user );

  listUsers();

  socket.on( 'request-user', function ru() {
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList[ i ].id == socket.uid ) {
        ret = userList[ i ];
        break;
      }
    }
    socket.emit( 'send-user', ret );
  });

  socket.on( 'request-rooms', function rr() {
    app.io.emit( 'send-rooms', roomList );
  });

  socket.on( 'client-to-room', function c2r( user ) {
    app.io.to( user.roomId ).emit( 'room-to-clients', user );
  });

  socket.on( 'disconnect', function disc() {
    for ( i = 0; i < userList.length; i++ ) {
      if ( userList [ i ].id === socket.uid ) {
        for ( j = 0; j < roomList.length; j++ ) {
          for ( k = 0; k < roomList [ j ].users.length; k++ ) {
            if ( userList [ i ].name === roomList [ j ].users[ k ]) {
              console.log( 'disconnected user' );
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
