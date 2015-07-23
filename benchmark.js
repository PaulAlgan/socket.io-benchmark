var profile = require('v8-profiler');
var io = require('socket.io-client');

var message = "o bispo de constantinopla nao quer se desconstantinopolizar";
var connectionCount = 0;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

function user(shouldBroadcast, host, port) {
  var socket = io.connect('http://' + host + ':' + port, options);
  console.log("Openint SOCKET");
  socket.on('connect', function() {
    connectionCount++;
    console.log("   SOCKET connect "+connectionCount);
    // var chat = {text:"TEXT_"};
    // setInterval(function() {
    //   socket.emit("chat", chat);
    // }, 5000);
    // Start messaging loop
    // if (shouldBroadcast) {
    //   // message will be broadcasted by server
    //   socket.emit('broadcast', message);
    // } else {
    //   // message will be echoed by server
    //   socket.send(message);
    // }

    // socket.on('chat', function(message) {
    //   socket.send(message);
    // });

    socket.on('broadcastOk', function() {
      socket.emit('broadcast', message);
    });
  });

  socket.on('connect_error', function(data) {
    console.log("connect_error");
    console.log(data);
  });
};

var argvIndex = 2;

var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000; // in seconds
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '54.251.48.117';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '1234';

for(var i=0; i<users; i++) {
  setTimeout(function() { user(shouldBroadcast, host, port); }, i * newUserTimeout);
};
