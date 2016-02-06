function scrollToBottom() {
	console.log("scroll");
	var windowHeight = window.innerHeight;
	window.scrollBy(0,windowHeight);
}

function toggleVisibility(id) {
   var e = document.getElementById(id);
   console.log(id);
   if(e.style.display == 'block')
      e.style.display = 'none';
   else
      e.style.display = 'block';
}
$(document).ready(function(){
    $(".button").click(function(){
        $(".wrapper").fadeOut(2000,"swing")
    });
    // $(".btn2").click(function(){
    //     $("p").fadeIn();
    // });
});
