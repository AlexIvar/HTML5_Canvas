
var shapes = [];
$(document).ready(function() {

  resizeWhiteboard();
  $(window).resize(resizeWhiteboard);

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext("2d");
var shapeclicked = undefined;
var currShape = undefined;
var isDrawing = false;
var isTyping = false;
var objContainer = [];
var lineWidth = "1";
var currColor = "black";

$(".Shape").click(function() {
    shapeclicked = $(this).attr('id');
    shapes.push(shapeclicked);
    $(".Shape").removeClass("active");
    $(this).addClass("active");
});

$(".width").click(function() {
   lineWidth = $(this).attr('value');
   $(".width").removeClass("active");
   $(this).addClass("active");
});

$(".colors").click(function() {
   currColor = $(this).attr('value');
   $(".colors").removeClass("active");
   $(this).addClass("active");
});

$(".clear").click(function() {
     objContainer = [];
     context.clearRect(0, 0, canvas.width, canvas.height);
});

$(".undo").click(function() {
     objContainer.pop();
     redraw();
});

 $("#myCanvas").mousedown(function(ev) {
   var mousePos = getMousePos(canvas, ev);
   switch (shapeclicked) {
     case "rectangle":
     //console.log("x : " + mousePos.x + " " + "y : " + mousePos.y);
        currShape = new rectangle(mousePos.x, mousePos.y, currColor , lineWidth);
        isDrawing = true;
       break;
    case "circle":
        currShape = new circle(mousePos.x, mousePos.y, currColor , lineWidth);
        isDrawing = true;
        break;
    case "line":
        currShape = new line(mousePos.x, mousePos.y, currColor , lineWidth);
        isDrawing = true;

        break;
    case "pencil":
        currShape = new pencil(mousePos.x, mousePos.y,  currColor , lineWidth);
        isDrawing = true;
        break;
    case "eraser":
        currShape = new erase(mousePos.x, mousePos.y, "white", lineWidth);
        isDrawing = true;
        break;
    case "text":
          currShape = new Text(mousePos.x, mousePos.y, currColor , lineWidth);
          isTyping = true;
          break;
     default:
        currShape = new pencil(mousePos.x, mousePos.y, currColor , lineWidth);
        isDrawing = true;
        break;

   }
 });

 $("#myCanvas").mousemove(function(ev) {

   if(isDrawing)
   {
     var mousePos = getMousePos(canvas, ev);

     var width = mousePos.x - currShape.x;
     var height = mousePos.y  - currShape.y;
  //   console.log("widht : " + width + "height : " + height);

     switch (shapeclicked) {
       case "rectangle":
       //console.log("x : " + mousePos.x + " " + "y : " + mousePos.y);
          currShape.width = width;
          currShape.height = height;

         break;
       case "circle":
          currShape.x1 = mousePos.x;
          currShape.y1 = mousePos.y;
          break;
       case "line":
         currShape.x1 = mousePos.x;
         currShape.y1 = mousePos.y;
         break;
      case "pencil":
          currShape.addPoint(mousePos.x, mousePos.y);
          break;
      case "eraser":
          currShape.addPoint(mousePos.x, mousePos.y);
          break;
       default:
          currShape.addPoint(mousePos.x, mousePos.y);


     }
    // console.log("currShape : " + JSON.stringify(currShape));
      redraw();
      currShape.draw();
   }
 });

 $("#myCanvas").mouseup(function(ev) {
    if ( shapeclicked != "text") {
            objContainer.push(currShape);
            redraw();
    }
            isDrawing = false;
  });

 //this is a function that gets the points of the canvas when user clicks the canvas.
 function getMousePos(canvas, ev) {
         var rect = canvas.getBoundingClientRect();
         return {
           x: ev.clientX - rect.left,
           y: ev.clientY - rect.top
         };
}


function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < objContainer.length; i++) {
        objContainer[i].draw();
    //    console.log(JSON.stringify(objContainer[i]));
    }
}

//shapes
function rectangle(x, y, color,lineWidth, width, height){
  this.x = x;
  this.y = y;
  this.lineWidth = lineWidth;
  this.width = width;
  this.height = height;
  this.color = color;
}

rectangle.prototype.draw = function() {
    context.strokeStyle = this.color;
    context.lineWidth = this.lineWidth;
    context.strokeRect(this.x, this.y, this.width, this.height);
};

function circle(x, y, color, lineWidth, x1, y1){
  this.x = x;
  this.y = y;
  this.color = color;
  this.lineWidth = lineWidth;
  this.x1 = x1;
  this.y1 = y1;
}

circle.prototype.draw = function(){
  var x0 = this.x,
      y0 = this.y,
      x1 = this.x1,
      y1 = this.y1;

      context.lineWidth = this.lineWidth;
      context.strokeStyle = this.color;

      context.beginPath();

      context.moveTo(x0, y0 + (y1 - y0) / 2);
      context.bezierCurveTo(x0, y0, x1, y0, x1, y0 + (y1 - y0) / 2);
      context.bezierCurveTo(x1, y1, x0, y1, x0, y0 + (y1 - y0) / 2);

      context.stroke();
      context.closePath();
}

function line(x, y, color, lineWidth, x1, y1){
  this.x = x;
  this.y = y;
  this.color = color;
  this.lineWidth = this.lineWidth;
  this.x1 = x1;
  this.y1 = y1;
}

line.prototype.draw = function(){
    context.lineCap = 'round';
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x1, this.y1);

    context.strokeStyle = this.color;

    context.stroke();
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}


function pencil(x, y, color, lineWidth){
  this.x = x;
  this.y = y;
  this.color = color;
  this.lineWidth = lineWidth;
  this.points = new Array(new Point(x, y));

}

pencil.prototype.addPoint = function(x, y) {
    this.points.push(new Point(x, y));
};

pencil.prototype.draw = function(){
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(this.x, this.y);

    for (var i = 0; i < this.points.length; i++) {
        context.lineTo(this.points[i].x, this.points[i].y);
    }

    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.color;
    context.stroke();
}

function erase(x, y, color, lineWidth){
  this.x = x;
  this.y = y;
  this.color = color;
  this.lineWidth = lineWidth;
  this.points = new Array(new Point(x, y));

}

erase.prototype.draw = function(){
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(this.x, this.y);

    for (var i = 0; i < this.points.length; i++) {
        context.lineTo(this.points[i].x, this.points[i].y);
    }

    context.lineWidth = this.lineWidth;
    context.strokeStyle = "white";
    context.stroke();
}

erase.prototype.addPoint = function(x, y) {
    this.points.push(new Point(x, y));
};

function text(x, y, color, fontSize, text){
  this.x = x;
  this.y = y;
  this.color = color;
  this.fontSize = fontSize;
  this.text = text;

}

text.prototype.draw = function() {
    context.font = this.fontSize*5 + "px Arial";
    context.fillStyle = this.color;
    context.fillText(this.text, this.x, this.y);
};

function resizeWhiteboard() {
    var browserWidth = $("#theCanvas").width();
    var browserHeight = $("#theCanvas").height();

    $("#myCanvas").attr("width", browserWidth);
    $("#myCanvas").attr("height", browserHeight);
}

});
