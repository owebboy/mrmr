var socket = io(),
  i,
  $div;
socket.emit( 'request-user', null );
socket.emit( 'request-rooms', null );

socket.on( 'send-user', function receiveUser( res ) {
  console.log( res );
  document.getElementById( 'text-bar' ).placeholder = res.name;
});


socket.on( 'send-rooms', function receiveRooms( res ) {
  console.log( res );
  document.getElementById( 'room-insert' )
  for ( i = 0; i < res.length; i++ ) {
    $( '#room-insert' ).append( $( '<div>' ).attr( 'id', res [ i ].name ));
    $( '#' + res [ i ].name ).append( $( '<p>' ).text( res [ i ].name ));
    $( '#' + res [ i ].name ).append( $( '<ul>' ).attr( 'id', res [ i ].name + 'list' ));
    for ( j = 0; j < res [ i ].users.length; j++ ) {
      $( '#' + res [ i ].name + 'list' ).append( $( '<li>' ).text( res [ i ].users[ j ]));
    }
  }
});

$( document ).ready( function onload() {

  $( '#submit-button' ).click( function submit() {
    console.log( 'works' );
  });
});
