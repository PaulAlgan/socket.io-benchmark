var profile = require('v8-profiler');
var io = require('socket.io-client');
var request = require('request');
var randomString = require('random-string');
var moment = require('moment');

var message = "o bispo de constantinopla nao quer se desconstantinopolizar";
var connectionCount = 0;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var token = 'A+bgyKsIFoElbswj5EGpfTiuhlkSNCJsuFKHdpKdMJQ6z/rNJGu+NsW1AZxaRwQy+MW07mGQbCeedR+zoY7fehP7CwnUZWYStlr/Nv4TxqIALSQ1xOt2JF4dZVOcI7fdBTkSRiMh6MiaGZsRpdGWhZNegub2/WPCPwzr0FmrhQ8=';
var user_id = '1041364';

var urlHost;

function user(shouldBroadcast, host, port) {
  urlHost = 'https://'+host;
  var socket = io.connect(urlHost+':'+port, options);
  console.log("Opening SOCKET");
  socket.on('connect', function() {

    connectionCount++;
    console.log("   SOCKET connect "+connectionCount);
    var authenData = {token:token, user_id:user_id, name:"1041364_test"};
    socket.emit("authen", authenData, function(data){
      // console.log(data.result.status);
      sendMsg();

    });

    // sendMsg(socket);

    // var chat = {text:"TEXT_"};
    // setInterval(function() {
    //   socket.emit("chat", chat);
    // }, 2000);



// authen

    // Start messaging loop
    // if (shouldBroadcast) {
    //   // message will be broadcasted by server
    //   socket.emit('broadcast', message);
    // } else {
    //   // message will be echoed by server
    //   socket.send(message);
    // }

    // socket.on('chat', function(message) {
    //   console.log(socket.id+" GET MSG: "+message.text);
    //   setTimeout(function(){
    //     sendMsg(socket);
    //   },5000);
    // });
    //
    // socket.on('broadcastOk', function() {
    //   socket.emit('broadcast', message);
    // });
  });

  socket.on('connect_error', function(data) {
    console.log("connect_error");
    console.log(data);
    // console.log(data.description.target._events);
  });
}

function sendMsg(){
  var text = randomString({length: 10})+"_"+currentTimestamp();
  var messageData = {};
  messageData.sender_id = user_id;
  messageData.text = text;
  messageData.room_id = "55d6d4040e94814a00253432";
  messageData.client_created_time = "1439886389.931";

  console.log("Send: "+text);
  // console.log(messageData);
  var options = {
    url:  urlHost+":5000"+'/api/message/send',
    headers: {
      'private_token': token,
      'member_id': user_id
    },
    formData: messageData
  };

  function complete(error, response, body) {

    var result = JSON.parse(body);
    console.log(response.body);
    // var status = result.status;
    // if (status != "success") {
    //   console.log(result);
    // }
    // else{
    //   // console.log("1");
    //   process.stdout.write("1");
    // }
  }
  request.post(options, complete);
}




function currentTimestamp(){
  var now = moment.utc();
	var nowString = String(now.valueOf());
  return nowString;
}

var argvIndex = 2;

var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000; // in seconds
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'chat.pre24x7th.com';
// var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '1337';

for(var i=0; i<users; i++) {
  setTimeout(function() { user(shouldBroadcast, host, port); }, i * newUserTimeout);
};
