function dropdownOpen() {
  document.getElementById( 'dropdown' ).style.display = 'flex';
  $( '#menu-close' ).attr( 'onclick', 'dropdownClose()' );
}

function dropdownClose() {
  document.getElementById( 'dropdown' ).style.display = 'none';
  $( '#menu-close' ).attr( 'onclick', 'dropdownOpen()' );
}

/*
window.onclick = function drop_check( e ) {
  if ( !e.target.matches( '.menu-button' )) {
    document.getElementById( 'dropdown' ).style.display = 'none';
  }
}
*/

function roomoverlayOpen() {
  document.getElementById( 'room-overlay' ).style.display = 'flex';
  dropdownClose();
  if ( document.documentElement.clientWidth < 640 ) {
    document.getElementById( 'room-close' ).style.display = 'block';
  }
  $( '#roomoverlayOpen' ).attr( 'onclick', 'roomoverlayClose()' );
}

function roomoverlayClose() {
  document.getElementById( 'room-overlay' ).style.display = 'none';
  document.getElementById( 'room-close' ).style.display = 'none';
  $( '#roomoverlayOpen' ).attr( 'onclick', 'roomoverlayOpen()' );
}

function updateRoomitems( roomList ) {
  $( '#room-overlay' ).empty();
  for ( let i = 0; i < roomList.length; i++ ) {
    let card = $( '<div>', { 'class': 'card room-item' }),
      divider1 = $( '<div>', { 'class': 'card-divider card-flex' }),
      roomName = $( '<p>' ),
      section = $( '<div>', { 'class': 'card-section scrollable' }),
      userList = $( '<ul>' ),
      divider2 = $( '<div>', { 'class': 'card-divider card-flex' }),
      button = $( '<button>', { 'type': 'button', 'class': 'button primary card-button', 'onclick': 'changeRoom( "' + roomList [ i ].ID + '" )', }),
      strong = $( '<strong>' );

    strong.text( 'Join!' );
    button.append( strong );
    divider2.append( button );

    for ( let j = 0; j < roomList [ i ].users.length; j++ ) {
      userList.append( '<li>' + roomList [ i ].users [ j ].name + '</li>' );
    }
    section.append( userList );

    roomName.text( roomList [ i ].name );
    console.log( roomList [ i ].name );
    divider1.append( roomName );

    card.append( divider1 );
    card.append( section );
    card.append( divider2 );

    $( '#room-overlay' ).append( card );
  }
}

function closepopup() {
  document.getElementById( 'popup' ).style.display = 'none';
}

function openpopup() {
  document.getElementById( 'popup' ).style.display = 'block';
}

function settingsOpen() {
  document.getElementById( 'settings-dropdown' ).style.display = 'inline-block';
  $( '#settings-text' ).text( '>' );
  $( '#settings-button' ).attr( 'onclick', 'settingsClose()' );
}

function settingsClose() {
  document.getElementById( 'settings-dropdown' ).style.display = 'none';
  $( '#settings-text' ).text( 'Settings' );
  $( '#settings-button' ).attr( 'onclick', 'settingsOpen()' );
}

function roomsettingsOpen() {
  document.getElementById( 'room-settings-dropdown' ).style.display = 'inline-block';
  $( '#room-settings-text' ).text( '>' );
  $( '#room-settings-button' ).attr( 'onclick', 'roomsettingsClose()' );
}

function roomsettingsClose() {
  document.getElementById( 'room-settings-dropdown' ).style.display = 'none';
  $( '#room-settings-text' ).text( 'Room Settings' );
  $( '#room-settings-button' ).attr( 'onclick', 'roomsettingsOpen()' );
}

function changenamePopup() {
  dropdownClose();
  settingsClose();
  roomoverlayClose();
  $( '#popup-footer' ).empty();
  $( '#popup-header' ).empty();
  $( '#popup-header' ).text( 'Change Your Name' );
  let form = $( '<form>', { 'class': 'input-area', 'onsubmit': 'return false', 'id': 'name-form' }),
    input = $( '<input>', { 'type': 'text', 'class': 'message-input', 'id': 'name-input', 'placeholder': 'New Name!', 'autocomplete': 'off' }),
    button = $( '<button>', { 'type': 'submit', 'id': 'name-submit', 'class': 'button primary submit-button', 'onclick': 'changeName()' }),
    change = $( '<strong>' );

  change.text( 'Change!' );
  button.append( change );
  form.append( input );
  form.append( button );

  $( '#popup-footer' ).append( form );

  openpopup();
}

function makeroomPopup() {
  dropdownClose();
  settingsClose();
  roomoverlayClose();
  $( '#popup-footer' ).empty();
  $( '#popup-header' ).empty();
  $( '#popup-header' ).text( 'Make a Room' );
  let form = $( '<form>', { 'class': 'input-area', 'onsubmit': 'return false', 'id': 'name-form' }),
    input = $( '<input>', { 'type': 'text', 'class': 'message-input', 'id': 'name-input', 'placeholder': 'New Room!', 'autocomplete': 'off' }),
    button = $( '<button>', { 'type': 'submit', 'id': 'name-submit', 'class': 'button primary submit-button', 'onclick': 'makeRoom()' }),
    change = $( '<strong>' );

  change.text( 'Make!' );
  button.append( change );
  form.append( input );
  form.append( button );

  $( '#popup-footer' ).append( form );

  openpopup();
}

function changeroomnamePopup() {
  dropdownClose();
  settingsClose();
  $( '#popup-footer' ).empty();
  $( '#popup-header' ).empty();
  $( '#popup-header' ).text( 'Change Room Name' );
  let form = $( '<form>', { 'class': 'input-area', 'onsubmit': 'return false', 'id': 'name-form' }),
    input = $( '<input>', { 'type': 'text', 'class': 'message-input', 'id': 'name-input', 'placeholder': 'New Name!', 'autocomplete': 'off' }),
    button = $( '<button>', { 'type': 'submit', 'id': 'name-submit', 'class': 'button primary submit-button', 'onclick': 'changeroomName()' }),
    change = $( '<strong>' );

  change.text( 'Change!' );
  button.append( change );
  form.append( input );
  form.append( button );

  $( '#popup-footer' ).append( form );

  openpopup();
}
