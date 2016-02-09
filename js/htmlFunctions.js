
$(document).ready(function(){
    $(".button").click(function(){
        $(".wrapper").fadeOut(2000,"swing")

        var img = document.getElementsByTagName('img');
        img[0].style.width = '48px';
        img[0].style.height = '48px';
        img[1].style.width = '48px';
        img[1].style.height = '48px';
        img[2].style.width = '48px';
        img[2].style.height = '48px';
        img[3].style.width = '48px';
        img[3].style.height = '48px';
        document.body.appendChild(renderer.domElement);
    });
    // $(".btn2").click(function(){
    //     $("p").fadeIn();
    // });
});
