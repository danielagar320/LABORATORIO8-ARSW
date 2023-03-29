var app = (function () {

    var topic = 0;

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var addPointToTopic = function(point){
        stompClient.send(topic, {}, JSON.stringify(point));
//        console.log("Funciona"+point)
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(topic, function (eventbody) {
        //        alert(eventbody)
                var point=JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
        });

    };
    
    

    return {

        init: function (drawId) {
            var can = document.getElementById("canvas");

            topic = "/topic/newpoint." + drawId;
            
            //websocket connection
            connectAndSubscribe();
            alert("Dibujo #" + drawId )

            if(window.PointerEvent){
                can.addEventListener("pointerdown",function(evt){
                    var pt = getMousePosition(evt);
                    addPointToCanvas(pt);
                    addPointToTopic(pt);
                })
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            addPointToTopic(pt);

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }

//        connect: function () {
//            if (stompClient !== null) {
//                stompClient.connect();
//            }
//            setConnected(true);
//            console.log("Connected");
//        }
    };

})();