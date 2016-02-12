
$(document).ready(function(){
    $(".button").click(function(){
        $(".wrapper").fadeOut(2000,"swing")

        var vr_btn = $(".webvr-button");
        vr_btn.css("-webkit-box-sizing","content-box");
        vr_btn.css("moz-box-sizing","content-box");
        vr_btn.css("box-sizing","content-box");
        document.body.appendChild(renderer.domElement);
    });
    // $(".btn2").click(function(){
    //     $("p").fadeIn();
    // });
});
