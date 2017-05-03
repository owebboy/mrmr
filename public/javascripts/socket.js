var socket = io(),
  user;

socket.emit( 'request-user' );

socket.on( 'send-user', function send_user( u_user ) {
  user = u_user;
  if ( user.ownsRoom === 'false' ) {
    console.log( '!owns room' );
    $( '.room-settings-button' ).each( function toggle1() {
      $( this ).css( 'display', 'none' )
    });
    $( '.make-room' ).each( function toggle2() {
      $( this ).css( 'display', 'inline-block' );
    });
  }
  if ( user.ownsRoom !== 'false' ) {
    console.log( 'owns room' );
    $( '.room-settings-button' ).each( function toggle3() {
      $( this ).css( 'display', 'inline-block' )
    });
    $( '.make-room' ).each( function toggle4() {
      $( this ).css( 'display', 'none' );
    });
  }
  document.getElementById( 'message' ).placeholder = user.name;
});

socket.on( 'send-rooms', function send_rooms( roomList ) {
  console.log( roomList );
  updateRoomitems( roomList );
});

socket.on( 'room-to-clients', function room_to_clients( user ) {
  $( '#chat-insert' ).append( '<li><strong>' + user.name + ': ' + user.message + '</strong></li>' );
  $( '#chat-insert' ).animate({ scrollTop: $( '#chat-insert' ).get( 0 ).scrollHeight }, 2000 );
});

function changeRoom( roomID ) {
  user.roomID = roomID;
  socket.emit( 'change-room', user );
  roomoverlayClose();
}

function sendMessage() {
  let message = document.getElementById( 'message' ).value;
  document.getElementById( 'input' ).reset();
  if ( message === '' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not send an empty message.</strong></li>' );
    return;
  }
  if ( message.length > 250 ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: Messages must be 250 characters or less.</strong></li>' );
    return;
  }
  user.message = message;
  console.log( user.message );
  socket.emit( 'client-to-room', user );
}

function changeName() {
  let name = document.getElementById( 'name-input' ).value;
  document.getElementById( 'name-form' ).reset();
  if ( name === '' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not have an empty name.</strong></li>' );
    closepopup();
    return;
  } else if ( name.length > 20 ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: Names must be 20 characters or less.</strong></li>' );
    closepopup();
    return;
  } else if ( user.name === name ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You have to actually change your name.</strong></li>' );
    closepopup();
    return;
  } else {
    user.name = name;
    socket.emit( 'update-username', user );
    closepopup();
  }
}

function makeRoom() {
  let name = document.getElementById( 'name-input' ).value;
  document.getElementById( 'name-form' ).reset();
  if ( name === '' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not have an empty room name.</strong></li>' );
    closepopup();
    return;
  } else if ( name.length > 12 ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: Room names must be 12 characters or less.</strong></li>' );
    closepopup();
    return;
  } else if ( name === 'Lobby' || name === 'Random' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not set your room name to the same name as the default rooms.</strong></li>' );
    closepopup();
    return;
  } else {
    socket.emit( 'make-room', name );
    closepopup();
  }
}

function changeroomName() {
  let name = document.getElementById( 'name-input' ).value;
  document.getElementById( 'name-form' ).reset();
  if ( name === '' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not have an empty name.</strong></li>' );
    closepopup();
    return;
  } else if ( name.length > 12 ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: Names must be 12 characters or less.</strong></li>' );
    closepopup();
    return;
  } else if ( name === 'Lobby' || name === 'Random' ) {
    $( '#chat-insert' ).append( '<li><strong>SERVER: You can not set your room name to the same name as the default rooms.</strong></li>' );
    closepopup();
    return;
  }
  socket.emit( 'update-room', name );
  closepopup();
}
