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
  $("#socialbuttons .hatena").socialbutton('hatena');
  $("#socialbuttons .twitter").socialbutton('twitter', {button:'horizontal', via:'kawaz'});
  $("#socialbuttons .facebook_share").socialbutton('facebook_share', {button:"button_count"});
  $("#socialbuttons .facebook_like").socialbutton('facebook_like', {button:"button_count", show_faces:false});
  $("#socialbuttons .mixi_like").socialbutton('mixi_like', {key:'49a87265704bd6d4f5d798d55dd09a8fd6d27365', show_faces:false});

  socket.connect();
  socket.on('connect', function(){ $("#status").text("[connect]"); });
  socket.on('connecting', function(){ $("#status").text("[connecting]"); });
  socket.on('connect_failed', function(){ $("#status").text("[connect_failed]"); });
  socket.on('close', function(){ $("#status").text("[close]"); });
  socket.on('disconnect', function(){ $("#status").text("[disconnect]"); });
  socket.on('reconnect', function(){ $("#status").text("[reconnect]"); });
  socket.on('reconnecting', function(){ $("#status").text("[reconnecting]"); });
  socket.on('reconnect_failed', function(){ $("#status").text("[reconnect_failed]"); });
  socket.on('message', function(m){
    m && actions[m.act] && actions[m.act](m);
  });

});
