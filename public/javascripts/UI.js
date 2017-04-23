function sendMessage() {
  user.message = $( '#text-bar' ).val();
  if ( user.message === '' ) {
    return;
  }
  socket.emit( 'client-to-room', user );
  document.getElementById( 'text-bar' ).value = '';
  objDiv = document.getElementById( 'chat' );
  $( '#chat' ).animate({ scrollTop: $( '#chat' ).get( 0 ).scrollHeight }, 2500 );
}

function changeName() {
  var title = 'Change Your Name',
    header = 'What else are we gonna call you?',
    button = 'Change it!',
    func = updateUsername;

  displayPopup( title, header, button, func );
}

function displayPopup( title, header, button, func ) {
  $( '#popuptitle' ).html( title + '<a style="float: right" onclick="closePopup()"><i class="fa fa-times" aria-hidden="true"></i></a>' );
  $( '#popupheader' ).html( header );
  $( '#popupbutton' ).html( button );
  $( '#popupbutton' ).click( func );
  $( '#popup' ).show();
}

function closePopup() {
  $( '#popup' ).hide();
}

function updateUsername() {
  var name = $( '#card-bar' ).val();
  if ( name === '' ) {
    return;
  }
  document.getElementById( 'card-bar' ).value = '';
  user.name = name;
  socket.emit( 'update-username', user );
  closePopup();
}

