/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function createChatSocket() {
    return new WebSocket('ws://139.162.207.114:80/');
}

var users = [];

function refreshUsers() {
    $('#users').html('');
    for(i in users) {
        $('#users').append($(document.createElement('li')).text(users[i]));
    }
}

function onMessage(event) {
    var p = $(document.createElement('p')).text(event.data);

    $('#messages').append(p);
    $('#messages').animate({scrollTop: $('#messages')[0].scrollHeight});

    if(event.data.match(/^[^:]* joined/)) {
        var user = event.data.replace(/ .*/, '');
        users.push(user);
        refreshUsers();
    }

    if(event.data.match(/^[^:]* disconnected/)) {
        var user = event.data.replace(/ .*/, '');
        var idx = users.indexOf(user);
        users = users.slice(0, idx).concat(users.slice(idx + 1));
        refreshUsers();
    }
}


function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    $(document).ready(function () {
        $('#join-form').submit(function () {
            $('#warnings').html('');
            var user = $('#user').val();
            var ws = createChatSocket();
    
            ws.onopen = function() {
                ws.send('Hi! I am ' + user);
            };
    
            ws.onmessage = function(event) {
                if(event.data.match('^Welcome! Users: ')) {
                    /* Calculate the list of initial users */
                    var str = event.data.replace(/^Welcome! Users: /, '');
                    if(str != "") {
                        users = str.split(", ");
                        refreshUsers();
                    }
    
                    $('#join-section').hide();
                    $('#chat-section').show();
                    $('#users-section').show();
    
                    ws.onmessage = onMessage;
    
                    $('#message-form').submit(function () {
                        var text = $('#text').val();
                        ws.send(text);
                        $('#text').val('');
                        return false;
                    });
                } else {
                    $('#warnings').append(event.data);
                    ws.close();
                }
            };
    
            $('#join').append('Connecting...');
    
            return false;
        });
    });
}
