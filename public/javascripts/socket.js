var socket = io(),
  user,
  i,
  $div,
  objdiv;

socket.emit( 'request-user', null );
socket.emit( 'request-rooms', null );

socket.on( 'room-to-clients', function roomtoclients( res ) {
  $( '#chat-insert' ).append( $( '<li>' ).text( res.name + ': ' + res.message ));
});

socket.on( 'send-user', function receiveUser( res ) {
  user = res;
  console.log( user );
  document.getElementById( 'text-bar' ).placeholder = res.name;
  $( '#ddOwner' ).hide();
  if ( user.ownsRoom == true ) {
    $( '#ddOwner' ).show();
  }
});

socket.on( 'send-rooms', function receiveRooms( res ) {
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
