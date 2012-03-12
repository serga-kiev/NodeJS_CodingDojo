var userId = 222; //Configured user ID

window.onload = function () {
    var socket;
    if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        socket = io.connect('http://localhost:8080', {'transports':['xhr-polling']});
    } else {
        socket = io.connect('http://localhost:8080');
    }
    socket.on('connect', function () {
        socket.emit('userGreet', userId, function () {
            console.log('userId was sent to server')
        });

        socket.on('message', function (msg) {
            // Replacing messages with regexp
            document.querySelector('#log').innerHTML += strings[msg.event].replace(/\[questionId\]/, msg.questionId).replace(/\[serverQuestion\]/, msg.message).replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
            // Scrolling the log
            document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;

            // Responding to the server immediately
            if (msg.event == 'questionFromServer') {
                console.log(generateAnswer(msg));
                socket.json.send(msg);
            }
        });

        // Send text on <Enter> or button press
        /*document.querySelector('#input').onkeypress = function(e) {
         if (e.which == '13') {
         // Send the escaped value of input
         socket.send(escape(document.querySelector('#input').value));
         // Clear the input field
         document.querySelector('#input').value = '';
         }
         };
         document.querySelector('#send').onclick = function () {
         socket.send(escape(document.querySelector('#input').value));
         document.querySelector('#input').value = '';
         };*/
    });
};