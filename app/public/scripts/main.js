(function(exports){
  $('#content').html($('#intro-template').html());
  var socket = io();
  var playerName;
  var isPlayingGame = false;

  socket.on('new room', function(data){
    $('#content').html($('#loading-template').html());
    $('#room-id').text(data.roomID);
  });

  socket.on('updateAvailableRooms', function(data){
    if (!isPlayingGame){
      $('#joinButtons').empty().append('<h2>Join a room</h2>');

      if (data.rooms.length > 0){
        for (var i = 0; i < data.rooms.length; i++){
          $('#joinButtons').append('<button class="js-join-button">' + data.rooms[i] + '</button>');
        }
      }
      else {
        $('#joinButtons').append('<p>No rooms available</p>')
      }
    }
  });

  socket.on('player joined', function(data){
    isPlayingGame = true;
    window.testCases = data.testCases;

    $('#content').html($('#game-template').html());
    $('#joinButtons').html($('#instructions-template').html());
    $('#js-instructions').text(data.instructions);

    socket.roomID = data.roomID;

    CodeMirror.fromTextArea(document.getElementById("solution"), {
      lineNumbers: true,
      matchBrackets: true,
      mode: 'javascript'
    });
  });

  socket.on('game over', function(data){
    isPlayingGame = false;
    $('#content').html($('#endgame-template').html());
    $('#endgame-announcer').text(data.winner + " has won!");
  });

  socket.on('set names', function(data){
    $('#competitors').text(data.p1 + " vs. " + data.p2);
  });

  function printMessage(message){
    $('#intro-notices').text(message);

    $('.main').animate({
        scrollTop: $("#name-anchor").offset().top
    }, 500);

  }

  $('.host-button').click(function(){
    if($('#player-name').val() === "") {
      printMessage('You must enter a name to play!');
    }
    else {
      playerName = $('#player-name').val();
      var challengeID = $(this).data('challenge-id');
      socket.emit('hostGame', { challengeID: challengeID, playerName: $('#player-name').val() });
    }
  });

























  //

  $('body').on('click', '.js-join-button', function(){
    if($('#player-name').val() === "") {
      printMessage('You must enter a name to play!');
    }
    else {
      playerName = $('#player-name').val();
      socket.emit('joinGame', { roomID: $(this).text(), playerName: $('#player-name').val() });
    }
  });

  $("body").on('submit', '#solution-form', function(e){
    event.preventDefault();
    var submission = $('.js-solution-text').val();
    var testResults = submissionHandler(submission,testCases,test,generateHTML,playerName);
    $('.js-results').html(testResults);
  });

  exports.socket = socket;
})(this);
