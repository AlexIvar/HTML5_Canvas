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
var undoObjects = [];
var undoObject = undefined;
var textarea = null;
var currentInputBox = undefined;
var currentImage = undefined;
var imageWidth = undefined;
var imageHeight = undefined;
var newImageWidht = undefined;
var newImageHeight = undefined;
var originalImageRatio = undefined;
var xImage = undefined;
var yImage = undefined;

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

$(".right").click(function() {
   xImage = xImage + 10;
   redraw();
});
$(".down").click(function() {
  yImage = yImage + 10;
  redraw();
});
$(".left").click(function() {
   xImage = xImage - 10;
   redraw();
});
$(".up").click(function() {
  yImage = yImage - 10;
  redraw();
});


$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

    if ( this.files && this.files[0] ) {
        var FR = new FileReader();
        FR.onload = function(e) {
           currentImage = new Image();
           currentImage.onload = function() {
             context.clearRect(0, 0, canvas.width, canvas.height);
             var shape = new loadedImage(currentImage);
             objContainer = [];
             objContainer.push(shape);

             imageWidth = currentImage.naturalWidth;
             imageHeight = currentImage.naturalHeight;
             newImageWidht = imageWidth;
             newImageHeight = imageHeight;
             originalImageRatio = imageWidth / imageHeight;
             xImage = 600;
             yImage = 0;

             if(newImageWidht > newImageHeight && newImageWidht > 800){
               newImageWidht = 800;
               newImageHeight = 800 / originalImageRatio;
               xImage = 400;
             }
             if(newImageWidht > newImageHeight && newImageHeight > 500){
               newImageHeight = 500;
               newImageHeight = 500 * originalImageRatio;
             }
             if(newImageHeight > newImageWidht && newImageHeight > 500){
               newImageHeight = 500;
               newImageHeight = 500 * originalImageRatio;

             }
             if(newImageHeight == newImageWidht && newImageHeight > 500){
               newImageHeight = 500;
               newImageHeight = 500 * originalImageRatio;

             }

             context.drawImage(currentImage, xImage, yImage, newImageWidht,newImageHeight);
           };
           currentImage.src = e.target.result;
        };
        FR.readAsDataURL( this.files[0] );
    }
});

$('.btn-file :file').on('fileselect', function(event, numFiles, label) {
       console.log(numFiles);
       console.log(label);
   });


//slier fyrir lineWidth
/*$("#slider2").on("change",function(){
    //$(".myclass").css("color",$("#colorpicker").val());
    lineWidth = $("#slider2").val();
    $(".width").removeClass("active");
    $(this).addClass("active");
    //alert(color);
});*/

$("#theColor").on("change",function(){
    //$(".myclass").css("color",$("#colorpicker").val());
    currColor = $("#theColor").val();
    $(".colors").removeClass("active");
    $(this).addClass("active");
    //alert(color);
});

$(".clear").click(function() {
     objContainer = [];
     context.clearRect(0, 0, canvas.width, canvas.height);
});

$(".undo").click(function() {

     undoObject = objContainer.pop();
     undoObjects.push(undoObject);
     redraw();
});

$(".redo").click(function() {
     if(undoObjects.length !== 0)
     {
       var obj = undoObjects.pop();
       objContainer.push(obj);
     }
     redraw();
});


 $("#myCanvas").mousedown(function(ev) {
   var mousePos = getMousePos(canvas, ev);
   //var mouseX = ev.pageX - this.offsetLeft + $("#myCanvas").position().left;
   //var mouseY = ev.pageY - this.offsetTop;

   //console.log("mousePos.x : " + mousePos.x + " mousePos.y: " + mousePos.y);
   //console.log("mouseX: " + mouseX + " mouseY: " + mouseY);


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
          displayTextBox(ev.clientY, ev.clientX);
          var rect = canvas.getBoundingClientRect();
          /*console.log("x : " + rect.top + " y: "+ rect.left);
          var textArea = "<div id='textAreaPopUp' style='position:absolute;top:"+ev.clientY - rect.top+"px;left:"+ev.clientX - rect.left+"px;z-index:30;'><textarea id='textareaTest' style='width:100px;height:50px;'></textarea>";
          $("#textBox").append(textArea);*/
          currShape = new text(ev.clientX - rect.left, ev.clientY - rect.top, currColor , lineWidth);
          //currShape = new text(mousePos.x, mousePos.y, currColor , lineWidth);
          isTyping = true;
          break;
     default:
        currShape = new pencil(mousePos.x, mousePos.y, currColor , lineWidth);
        isDrawing = true;
        break;

   }
 });


  function displayTextBox(x, y) {
     if (currentInputBox) {
         currentInputBox.remove();
     }

     currentInputBox = $("<input />");
     currentInputBox.css("position", "fixed");
     currentInputBox.css("top", x);
     currentInputBox.css("left", y);

     $(".text-spawner").append(currentInputBox);
     currentInputBox.focus();
 }
 if(currentImage !== undefined)
 {
   currShape = new loadedImage(currentImage);
   objContainer.push(currShape);
 }

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
  this.lineWidth = lineWidth;
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
    context.font = this.fontSize*10 + "px Arial";
    context.fillStyle = this.color;
    context.fillText(this.text, this.x, this.y);
};

function loadedImage(image){
  this.image = image;
}
loadedImage.prototype.draw = function(){
  context.drawImage(this.image, xImage, yImage, newImageWidht,newImageHeight);
};

$("#theCanvas").keydown(function(ev) {
     if (isTyping) {
         if (ev.which === 13) {
             currShape.text = currentInputBox.val();

             objContainer.push(currShape);
             currShape.draw();
             //alert(currShape);

             isTyping = false;
             currentInputBox.remove();
         } else if (ev.which === 27) {
             isTyping = false;
             currentInputBox.remove();
         }
     }
 });

function resizeWhiteboard() {
    var browserWidth = $("#theCanvas").width();
    var browserHeight = $("#theCanvas").height();

    $("#myCanvas").attr("width", browserWidth);
    $("#myCanvas").attr("height", browserHeight);
}

});
