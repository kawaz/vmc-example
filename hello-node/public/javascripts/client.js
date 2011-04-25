var WEB_SOCKET_SWF_LOCATION = "http://cdn.socket.io/stable/WebSocketMain.swf";
$(function(){
  var socket = new io.Socket(null, {
    rememberTransport: false,
    transports: [
      'websocket',
      'flashsocket',
      //'htmlfile', //IE9 Error
      //'xhr-multipart', //FF4 Error
      'xhr-polling',
      'jsonp-polling'
    ]
  }); 
  var lastTs = 0;
  var actions = {
    count: function(m) {
      $("#count").text(m.count);
    },
    message: function(m) {
      $("<div>")
        .append($("<img>").attr({src:'http://api.dan.co.jp/twicon/'+ m.name +'/mini'}))
        .append($("<a>").addClass("name").text('@' + m.name).attr({href:"http://twitter.com/#!" + m.name}))
        .append($("<span>").addClass("text").text(m.text))
        .append($("<span>").addClass("ts").text(strftime("%Y-%m-%d %H:%M:%S", new Date(m.ts))))
        .insertBefore("#chat>:first-child");
      lastTs = m.ts;
    },
    logs: function(m) {
      $(m.logs).each(function(){
        if(lastTs < this.ts) {
          actions.message(this);
        }
      });
    }
  }

  $("#form").submit(function(e){
    e.preventDefault();
    socket.send({
      act:"message",
      name: $("#name").val(),
      text: $("#text").val()
    });
    $("#text").val("").focus();
    if(localStorage) {
      localStorage.name = $("#name").val();
    }
  });
  if(localStorage && localStorage.name) {
    $("#name").val(localStorage.name);
    $("#text").focus();
  }

  socket.connect();
  socket.on('connect', function(){
    $("#status").text("[connected]");
  });
  socket.on('disconnect', function(){
    $("#status").text("[disconnected]");
  });
  socket.on('message', function(m){
    m && actions[m.act] && actions[m.act](m);
  });

});
