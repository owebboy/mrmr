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
  document.getElementById( 'text-bar' ).placeholder = res.name;
  $( '#ddOwner' ).hide();
  if ( user.ownsRoom == true ) {
    $( '#ddOwner' ).show();
  }
});

socket.on( 'send-rooms', function receiveRooms( res ) {

  $( '#accordion' ).empty();
  for ( i = 0; i < res.length; i++ ) {
    $( '#' + res [ i ].name + 'List' ).empty();
  }

  var div = $( '<div>', { 'class': 'card' });
  var div2 = $( '<div>', { 'class': 'card-header', 'role': 'tab', 'id': 'H' + res [ 0 ].name });
  var h5 = $( '<h5>', { 'class': 'mb-0' });
  var a = $( '<a>', { 'data-toggle': 'collapse', 'data-parent': '#accordion', 'href': '#C' + res [ 0 ].name, 'aria-expanded': 'true', 'aria-controls': 'C' + res [ 0 ].name }).text( res [ 0 ].name );
  var join = $( '<button>', { 'class': "btn side-btn", 'onclick': 'changeRoom( "' + res [ 0 ].name + '" )' }).text( 'Join' );

  h5 = h5.append( a );
  div2 = div2.append( h5 );
  div2 = div2.append( join );

  var div3 = $( '<div>', { 'id': 'C' + res [ 0 ].name, 'class': 'collapse show', 'role': 'tabpanel', 'aria-labelledby': 'H' + res [ 0 ].name });
  var div4 = $( '<div>', { 'class': 'card-block' });
  var ul = $( '<ul>', { 'id': res [ 0 ].name + 'List' });

  div4 = div4.append( ul );
  div3 = div3.append( div4 );

  div = div.append( div2 );
  div = div.append( div3 );

  $( '#accordion' ).append( div );

  for ( j = 0; j < res [ 0 ].users.length; j++ ) {
    $( '#' + res [ 0 ].name + 'List' ).append( $( '<p>' ).text( res [ 0 ].users[ j ]));
  }

  for ( i = 1; i < res.length; i++ ) {
    var div = $( '<div>', { 'class': 'card' });
    var div2 = $( '<div>', { 'class': 'card-header', 'role': 'tab', 'id': 'H' + res [ i ].name });
    var h5 = $( '<h5>', { 'class': 'mb-0' });
    var a = $( '<a>', { 'class': 'collapsed', 'data-toggle': 'collapse', 'data-parent': '#accordion', 'href': '#C' + res [ i ].name, 'aria-expanded': 'false', 'aria-controls': 'C' + res [ i ].name }).text( res [ i ].name );
    var join = $( '<button>', { 'class': "btn side-btn", 'onclick': 'changeRoom( "' + res [ i ].name + '" )' }).text( 'Join' );

    h5 = h5.append( a );
    div2 = div2.append( h5 );
    div2 = div2.append( join );

    var div3 = $( '<div>', { 'id': 'C' + res [ i ].name, 'class': 'collapse show', 'role': 'tabpanel', 'aria-labelledby': 'H' + res [ i ].name });
    var div4 = $( '<div>', { 'class': 'card-block' });
    var ul = $( '<ul>', { 'id': res [ i ].name + 'List' });

    div4 = div4.append( ul );
    div3 = div3.append( div4 );

    div = div.append( div2 );
    div = div.append( div3 );

    $( '#accordion' ).append( div );

    for ( j = 0; j < res [ i ].users.length; j++ ) {
      $( '#' + res [ i ].name + 'List' ).append( $( '<p>' ).text( res [ i ].users[ j ]));
    }
  }
});


/*
function makeRoom() {
  socket.emit( 'make-room', user );
  changeRoom( user.name + '\'s Room' );
}
*/
