

function showText( gazingIndex ) {
  if ( !cubeTextArray[gazingIndex].visible ) {
    cubeTextArray[gazingIndex].visible = true;
  }
}

function hideText( gazingIndex ) {
  for ( var i = 0; i < cubeTextArray.length; i++ ) {
    if (cubeTextArray[i].visible) {
      cubeTextArray[i].visible = false;
    }
  }
}

function gazeFunction( gazingIndex ) {
  if ( !clock.running ) {
    clock.start();
  }
  var t = 0.001 * ( self.performance.now() - clock.oldTime );
  var factor = 1;

  showText( gazingIndex );
  
  // Loading animation
  if(t > 2){
    if(t > 3){          // if zoom-out-zoom-in animation finish
      clock.stop();       // stop the clock;

      // /* zoom in */
      loadingSkyboxIndex = gazingIndex;
      newCameraPosition.x = camera.getWorldDirection().x*400*delta;
      newCameraPosition.y = camera.getWorldDirection().y*400*delta;
      newCameraPosition.z = camera.getWorldDirection().z*400*delta;
      
    }else{
      factor = 1 + t / 10;  // secondly, zoom in the ring
    }
  }else{
    factor = 1 - t / 20;    // firstly, zoom out the ring
  }        
  ring.scale.set(ring.scale.x*factor, ring.scale.y*factor, ring.scale.y*factor);
}





function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{ 
  // note: texture passed by reference, will be updated by the update function.
    
  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet. 
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
  texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration;
  // how long has the current image been displayed?
  this.currentDisplayTime = 0;
  // which image is currently being displayed?
  this.currentTile = 0;
    
  this.update = function( milliSec )
  {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration)
    {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
      texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}   


function renderVideo() {
  if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
    videoScreenContext.drawImage( video, 0, 0 );
    if ( videoTexture ) 
      videoTexture.needsUpdate = true;
  }
}



// function clearAnimationTexture() {
//   if (runner != null) {
//     scene.remove( runner );
//     runner.geometry.dispose();
//   }
// }

