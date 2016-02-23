function rotateCube() {
  for ( var i = 0; i < cubeArray.length; i++ ) {
    cubeArray[i].rotation.y += 0.01;
  }
}

function positionRing() {
  ring.position.set(camera.getWorldDirection().x * 3, camera.getWorldDirection().y * 3, camera.getWorldDirection().z * 3);
  ring.quaternion.copy( camera.quaternion );    // makes the ring face the screen (in conjunction with the camera)
}

function positionRaycaster() {
  raycaster.set(  camera.position, camera.getWorldDirection() );       // ray is from camera position to camera target
}

function renderIntersects() {
  var intersects = raycaster.intersectObjects( scene.children );

  var isGazingCube = false, gazingIndex = null, isGazingVideoScreen = false, isGazingLogo = false;
  for ( var i = 0; i < intersects.length; i++ ) {
    // if collide with the cubes
    for ( var j = 0; j < cubeArray.length; j++ ) {
      if ( intersects[ i ].object == cubeArray[ j ] ) { 
          isGazingCube = true;
          gazingIndex = j;
      }
    }

    // if collide with the logo
    if ( homeLogo != null && intersects[i].object == homeLogo ) {
      isGazingLogo = true;
    }

    // if collide with movie screen
    if ( videoMesh != null && intersects[ i ].object == videoMesh ) {     
      isGazingVideoScreen = true;
    }
  }

  if ( isGazingCube ) {
      cubeArray[ gazingIndex ].scale.set(1.2, 1.2, 1.2); // 1 is the initial value
      gazeFunction( gazingIndex );
  } else if ( isGazingLogo ) {
      homeLogo.scale.set( 3.5, 3.5, 3.5 ); // 3 is the initial value
      homeLogo.material.opacity = 0.6;
      gazeFunction( -1 ); // -1 means go back to start
  }
  else {
      clock.stop();
      // reset cubes
      for ( var i = 0; i < cubeArray.length; i++ ) {
        cubeArray[ i ].scale.set(1, 1, 1);
      }
      ring.scale.set(1, 1, 1);
      hideText();
      // reset logo
      homeLogo.scale.set( 3, 3, 3 );
      homeLogo.material.opacity = 0.2;
  }

  if ( video != null ) {
    if ( isGazingVideoScreen ) {
      // Render the 2D Video Texture
      renderVideo();
      video.play();
    }
    else video.pause();
  }
}

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

  if ( gazingIndex != -1 ){
    showText( gazingIndex );
  }

  // Loading animation
  //if(t > 2){
  if(t > 2){
    if(t > 3){          // if zoom-out-zoom-in animation finish
      clock.stop();       // stop the clock;

      // zoom in
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

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) { 
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

function animateIntroText() {
  if (introText != null) {
  }
}

