function mouseClick() {
  //updating position of loading icon
  $('.loading:eq(0)').css("left", window.innerWidth * 0.25 + "px");
  $('.loading:eq(1)').css("left", window.innerWidth - $('.loading:eq(0)').position.left - 105 + "px");
  $('.loading').css("display", "block");

  if( !myplugin1 ){
       myplugin1 = $('.loading:eq(0)').cprogress(                         // the left loading icon
       {
         percent: 0,                                                      // starting position
         img1: 'img/v1.png',                                         // background
         img2: 'img/v2.png',                                         // foreground
         speed: 100,                                                      // speed (timeout)
         PIStep : 0.1,                                                    // every step foreground area is bigger about this val
         limit: 100,                                                      // end value
         loop : false,                                                    //if true, no matter if limit is set, progressbar will be running
         showPercent : true,                                              //show hide percent
         onInit: function(){console.log('left onInit');},
         onProgress: function(p){console.log('left onProgress', p);},     //p = current percent
         onComplete: function(p){
              console.log('left onComplete', p);
         }
      });
  }
  if( !myplugin2 )
  {
       myplugin2 = $('.loading:eq(1)').cprogress(                         // the right loading icon
       {
         percent: 0,
         img1: 'img/v1.png',
         img2: 'img/v2.png',
         speed: 100,
         PIStep : 0.1,
         limit: 100,
         loop : false,
         showPercent : true,
         onInit: function(){console.log('right onInit');},
         onProgress: function(p){console.log('right onProgress', p);},
         onComplete: function(p){
              console.log('right onComplete', p);
         }
      });
  }
}
