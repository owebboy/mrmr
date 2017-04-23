var socket = io(),
  user,
  i,
  $div;

socket.emit( 'request-user', null );
socket.emit( 'request-rooms', null );

function sendMessage() {
  user.message = $( '#text-bar' ).val();
  socket.emit( 'client-to-room', user );
  document.getElementById( 'text-bar' ).value = '';
}

socket.on( 'room-to-clients', function roomtoclients( res ) {
  console.log( res );
  $( '#chat-insert' ).append( $( '<li>' ).text( res.name + ': ' + res.message ));
});

socket.on( 'send-user', function receiveUser( res ) {
  console.log( res );
  user = res;
  document.getElementById( 'text-bar' ).placeholder = res.name;
});

socket.on( 'send-rooms', function receiveRooms( res ) {
  console.log( res );
  $( '#room-insert' ).empty();

  for ( i = 0; i < res.length; i++ ) {
    $( '#room-insert' ).append( $( '<div>' ).attr( 'id', res [ i ].name ));
    $( '#' + res [ i ].name ).append( $( '<p>' ).text( res [ i ].name ));
    $( '#' + res [ i ].name ).append( $( '<ul>' ).attr( 'id', res [ i ].name + 'list' ));
    for ( j = 0; j < res [ i ].users.length; j++ ) {
      $( '#' + res [ i ].name + 'list' ).append( $( '<li>' ).text( res [ i ].users[ j ]));
    }
  }
});
