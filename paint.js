var canvas = document.getElementById('myCanvas');
var context = canvas.getContext("2d");
var shapes = [];


$(".Shape").click(function() {
    alert(this.id);
    $(".Shape").removeClass("active");
        $(this).addClass("active");
});
