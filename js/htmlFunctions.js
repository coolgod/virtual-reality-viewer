
$(document).ready(function(){
    $("#start-btn").click(function(){
        $("#wrapper").fadeOut(2000,"swing",function() {
        	var vr_btn = $(".webvr-button");
	        vr_btn.css("-webkit-box-sizing","content-box");
	        vr_btn.css("moz-box-sizing","content-box");
	        vr_btn.css("box-sizing","content-box");

	        renderer.domElement.style.display = "block";
	        document.body.appendChild(renderer.domElement);
        });
    });
});
