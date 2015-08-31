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

var users_list = [
   {
      token: 'A+bgyKsIFoElbswj5EGpfTiuhlkSNCJsuFKHdpKdMJQ6z/rNJGu+NsW1AZxaRwQy+MW07mGQbCeedR+zoY7fehP7CwnUZWYStlr/Nv4TxqIALSQ1xOt2JF4dZVOcI7fdBTkSRiMh6MiaGZsRpdGWhZNegub2/WPCPwzr0FmrhQ8=',
      user_id: '1041364',
      name: "Real"
   },
   {
      token: '3qrr3eFwzO2hW/YcHb6WylMpJBHy9T6ux9dSEpyRXcMElXD91aK23MUQJG1DugbfhDrUp7XeJ1Xo+R1aaa3IOGMABSnmjDuRvj+8I/FYYVA+6klMpZDgbI9tf6HQ5FvK9+2T1qr5fvKFX26sIec/NQrlRRXjgRgd0PdbPQ1EchY=',
      user_id: '3381197',
      name: "Fake"
   }
];

var token = 'A+bgyKsIFoElbswj5EGpfTiuhlkSNCJsuFKHdpKdMJQ6z/rNJGu+NsW1AZxaRwQy+MW07mGQbCeedR+zoY7fehP7CwnUZWYStlr/Nv4TxqIALSQ1xOt2JF4dZVOcI7fdBTkSRiMh6MiaGZsRpdGWhZNegub2/WPCPwzr0FmrhQ8=';
var user_id = '1041364';
// var room_id = "55da92477c05fb4600c2716f"; // pre
var room_id = "55e008ae66d27a5700021516"; // prod

var urlHost;

function user(shouldBroadcast, host, port) {
   var current_user = process.env.USER || '0';
   current_user = parseInt(current_user);
   console.log(current_user);
   urlHost = host;
   var socket = io.connect(urlHost+':'+port, options);
   console.log("Opening SOCKET");
   socket.on('connect', function() {

      connectionCount++;
      console.log("   SOCKET connected "+connectionCount);
      var authenData = {token:users_list[current_user].token, user_id:users_list[current_user].user_id, name:users_list[current_user].name};
      socket.emit("authen", authenData, function(data){
         console.log(   "AUTHEN SUCCESS");
         // console.log(data.result.status);
         // sendMsg();

         setInterval(function(){
           sendMsg(users_list[current_user].user_id);
        },50);

         // if (current_user === 0){

         //   setTimeout(function(){
         //      sendMsg(users_list[current_user].user_id);
         //   },1000);
         // }




      });

      // sendMsg(socket);

      // var chat = {text:"TEXT_"};


      socket.on('message', function(message) {
         if (message.sender_id != users_list[current_user].user_id) {
            // console.log("GET MSG FROM: "+message.sender_id+"  : "+message.text);
            process.stdout.write("1 ");
            // setTimeout(function() {
            //    sendMsg(users_list[current_user].user_id);
            // }, 10);
         }
      });


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
      // //   console.log(socket.id+" GET MSG: "+message.text);
      //   setTimeout(function(){
      //     sendMsg(socket);
      //   },5000);
      // });
      //
      // socket.on('broadcastOk', function() {
      //   socket.emit('broadcast', message);
      // });

      socket.on('hb', function() {
        socket.emit('hb', " ");
      });
   });

   socket.on('connect_error', function(data) {
      console.log("connect_error");
      console.log(data);
      // console.log(data.description.target._events);
   });

   socket.on('disconnect', function(data) {
      console.log("disconnect");
      console.log(data);
      // console.log(data.description.target._events);
   });

   function sendMsg(from_id){
      var text = randomString({length: 10})+"_"+currentTimestamp();
      var messageData = {};
      messageData.sender_id = from_id;
      messageData.text = text;
      messageData.room_id = room_id;
      messageData.client_created_time = "1439886389.931";

      var log_send = "Send: "+text;
      // process.stdout.write(log_send);
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
         if (body) {
            var result = JSON.parse(body);
            var status = result.status;
            if (status != "success") {
              console.log("ERROR");
              console.log(result);
            }
            else{
              process.stdout.write(". ");
            }
         }
         else{
            console.log("BODY UNDEFINE");
         }
      }
      request.post(options, complete);
   }
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
// var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'https://chat.pre24x7th.com';
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'https://chat.24x7th.com';
// var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'http://localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '1337';

for(var i=0; i<users; i++) {
   setTimeout(function() { user(shouldBroadcast, host, port); }, i * newUserTimeout);
};
