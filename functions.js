var skybox = null;
var audio = null;
var doorArray = null;
var animationArray = null;
var introText = null;
var annie = null;
var loadingSkyboxIndex = null;
var isLoading = false;

function initSkybox( skybox_index ) {

  clearRing();
  clearOldSkybox();
  clearOldCubesAndText();
  clearVideoScreen();
  clearAudio();
  clearDoors();
  clearAnimation();
  if (skybox_index != 8) {
    clearIntroText();
  }

  // camera.lookAt( new THREE.Vector3(0,0,0) );
  
  var this_skybox = skybox_images[skybox_index];
  var boxWidth = 5;
  var texture = THREE.ImageUtils.loadTexture(this_skybox.bg_img);

  var geometry = new THREE.SphereGeometry( 500, 60, 40 );

  //
  // damn that's soooooooo weird:
  // a potential problem here
  // any 3d object insert before the declaration of skybox material(with BackSide parameter) will disappear in vreffect mode
  // so I have to declare "ring" and "cubeArray" after the next line of code is executed
  //

  var material = new THREE.MeshBasicMaterial({
    map: texture
  });
  
  skybox = new THREE.Mesh(geometry, material);
  skybox.scale.x = -1.0;
  scene.add(skybox);
  
  /* loading new cubes */
  cubeTextArray = [];
  cubeArray = [];
  box_count = this_skybox.box_specifics.length;
  for (i = 0; i < box_count; i++) {
    cubeArray.push( initCube( this_skybox.box_specifics[i] ) );
  }

  skybox.receiveShadow = true;

  /* loading new doors & running man */
  animationArray = [];
  doorArray = [];
  // if we are not currently in the first
  if ( skybox_index != 8 ) {
    for (i = 0; i < box_count; i++) {
      animationArray.push( addAnimatedTexture( this_skybox.box_specifics[i] ) );
      initAnimation( this_skybox.box_specifics[i] );
    }
  }


  /* load video screen */
  if ( skybox_index == 0 && videoMesh == null) {
    // addVideo();
  }

  /* load Intro text */
  if ( skybox_index == 8 ) {
    addIntroText( skybox_index );
  }

  /* loading gaze pointer */
  if(ring == null){
    ring = new THREE.Mesh(
    new THREE.TorusGeometry( 0.17, 0.017, 0, 70 ),            // set 'radius segment' to 0 to make it a flat 2D ring
    new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ));      // set color to white
    top_scene.add(ring);
  }





  /* loading audio */
  if (skybox_images[skybox_index].bg_audio != "") {
    audio = new THREE.Audio( listener );
    audio.load( skybox_images[skybox_index].bg_audio );
    audio.autoplay = true;
    audio.setRefDistance( 20 );
    scene.add(audio);
  }
}

function initCube( box_specific ) {


  var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture( box_specific.box_img_path ), shading: THREE.SmoothShading, opacity: 0.7, transparent: true});
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.next_index = box_specific.next_index;
  sphere.position.set( box_specific.box_coord[0], box_specific.box_coord[1], box_specific.box_coord[2] );
  scene.add(sphere);
  
  // Initialize 3D Text
  var text3D = initText(sphere, box_specific.box_text);
  scene.add( text3D );
  cubeTextArray.push( text3D ); // temp solution, each time a cube is added, the text is pushed to a corresponding array
  //cube.add( text3D ); // text is bined as a child object of cube --> doesn't work out because child rotate with parent

  return sphere;
}

function initText( sphere, txt ) {

  // text above cube
  var textGeometry = new THREE.TextGeometry( txt, 
  {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 3,
    font: "Lato",
    material: 0,
    extrudeMaterial: 1
  });

  var textMaterial = new THREE.MeshFaceMaterial( [
    new THREE.MeshPhongMaterial( { color: 0xDDDDDD  , specular: 0x009900, shininess: 10, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } )
  ] );
  text3D = new THREE.Mesh( textGeometry, textMaterial );

  var deltaX = ( (sphere.position.z > 0) ? +1 : -1 ) * ( txt.length * 0.2 );
  var deltaZ = ( (sphere.position.x > 0) ? -1 : +1 ) * ( txt.length * 0.2 );
  deltaX = (sphere.position.z == 0) ? 0 : deltaX;
  deltaZ = (sphere.position.x == 0) ? 0 : deltaZ;

  text3D.position.set( sphere.position.x + deltaX, sphere.position.y + 1.5, sphere.position.z + deltaZ);
  text3D.lookAt(camera.position);
  text3D.visible = false;
  return text3D;
}


function initAnimation( box_specific ) {
  // Add Collada Loader
  var loader = new THREE.ColladaLoader();
  var dae;
  loader.options.convertUpAxis = true;
  loader.load('animation/Door.dae', function (result) {
    // cube.material.map = result.scene;
    dae = result.scene;
    console.log(result);
    dae.scale.x = dae.scale.y = dae.scale.z = 0.05;
    // dae.position.set( 20, -5, -2.5 );
    dae.position.set(box_specific.box_coord[0] * 1.15, box_specific.box_coord[1] * 1.15 - 3.6, box_specific.box_coord[2] * 1.15);
    dae.updateMatrix();
    dae.lookAt( new THREE.Vector3(0,-7,0) );
    dae.material = new THREE.MeshBasicMaterial();

    scene.add(dae);
    doorArray.push(dae);
    
  });
}

function addAnimatedTexture( box_specific ) {
  var runnerTexture = new THREE.ImageUtils.loadTexture( 'img/run.png' );
  annie = new TextureAnimator( runnerTexture, 10, 1, 10, 75 ); // texture, #horiz, #vert, #total, duration.
  var runnerMaterial = new THREE.MeshBasicMaterial( { map: runnerTexture, side:THREE.DoubleSide } );
  var runnerGeometry = new THREE.PlaneGeometry(4, 7, 1, 1);
  runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
  // runner.position.set(27.5,-2,-1);
  runner.position.set(box_specific.box_coord[0] * 1.3, box_specific.box_coord[1] * 1.3, box_specific.box_coord[2] * 1.3);

  runner.lookAt( new THREE.Vector3(0,-3,0) );
  scene.add(runner);
  return runner;

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

  showText( gazingIndex );
  
  // Loading animation
  if(t > 3.65){
    if(t > 4.8){          // if zoom-out-zoom-in animation finish
      clock.stop();       // stop the clock;

      /* zoom in */
      if (skybox.material.map.image == null) {
        loadingSkyboxIndex = gazingIndex;
        newCameraPosition.x = camera.getWorldDirection().x*400*delta;
        newCameraPosition.y = camera.getWorldDirection().y*400*delta;
        newCameraPosition.z = camera.getWorldDirection().z*400*delta;
      }
      /* change scene here */
      else {
        initSkybox(cubeArray[gazingIndex].next_index);
      }
      // console.log(camera.position);
      // newCameraPosition = camera.position;

    }else{
      factor = 1 + t / 10;  // secondly, zoom in the ring
    }
  }else{
    factor = 1 - t / 80;    // firstly, zoom out the ring
  }        
  ring.scale.set(ring.scale.x*factor, ring.scale.y*factor, ring.scale.y*factor);
}

function addVideo() {
  /*
      Video Texture
  */
  video = document.getElementById( 'video' );
  videoScreen = document.createElement( 'canvas' );
  videoScreen.id = "videoScreen";
  videoScreen.width = 480;
  videoScreen.height = 204;

  videoScreenContext = videoScreen.getContext( '2d' );
  // background color if no video present
  videoScreenContext.fillStyle = '#000000';
  videoScreenContext.fillRect( 0, 0, videoScreen.width, videoScreen.height );

  videoTexture = new THREE.Texture( videoScreen );
  videoTexture.min_filter = THREE.LinearFilter;
  videoTexture.mag_filter = THREE.LinearFilter;

  // var parameters = { color: 0xffffff, map: videoTexture };
  // material_base = new THREE.MeshLambertMaterial( parameters );
  // renderer.initMaterial( material_base );

  var videoMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
  // the geometry on which the movie will be displayed;
  // movie image will be scaled to fit these dimensions.
  var videoGeometry = new THREE.PlaneGeometry( 24, 10, 4, 4 );
  videoMesh = new THREE.Mesh( videoGeometry, videoMaterial );
  videoMesh.position.set( 28, -3, -2.5 );
  videoMesh.rotation.y = Math.PI/2;
  // videoMesh.rotation.z = 0;
  scene.add(videoMesh);
}

function addIntroText( skybox_index ) {
  var textGeometry = new THREE.TextGeometry( skybox_images[skybox_index].bg_name, 
  {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 10,
    font: "Lato",
    material: 0,
    extrudeMaterial: 1
  });

  var textMaterial = new THREE.MeshFaceMaterial( [
    new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x595050, specular: 0xffffff, shininess: 10, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } )
  ] );
  introText = new THREE.Mesh( textGeometry, textMaterial );

  introText.position.set( -10, 5, -15 );
  introText.lookAt( new THREE.Vector3(camera.position.x-10, camera.position.y, camera.position.z) );
  introText.visible = true;
  scene.add( introText );

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

/* objects recycle */

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubeArray.length; i++){
    scene.remove( cubeTextArray[i] );
    //cubeTextArray[i].material.dispose();
    cubeTextArray[i].geometry.dispose();

    scene.remove( cubeArray[i] );
    cubeArray[i].material.dispose();
    cubeArray[i].material.map.dispose();
    cubeArray[i].geometry.dispose();
  }
}

function clearOldSkybox(){
  if(skybox != null){
    scene.remove(skybox);
    skybox.geometry.dispose();
    skybox.material.map.dispose();
    skybox.material.dispose();
  }
}

function clearVideoScreen(){
  if(videoMesh != null){
    scene.remove( videoMesh );
    videoMesh.geometry.dispose();
    videoMesh.material.map.dispose();
    videoMesh.material.dispose();
    videoScreenContext.clearRect( 0, 0, videoScreen.width, videoScreen.height )
    videoMesh = null;
  }
}

function clearRing () {
  if(ring != null){
    top_scene.remove(ring);
    ring.geometry.dispose();
    ring.material.dispose();
    ring = null;
  }
}

function clearAudio () {
  if(audio != null){
    console.log("hi");
    // audio.dispose();
    audio.stop();
    scene.remove(audio);
    audio = null;
  }
}

function clearDoors() {
  console.log("DOOR: " + doorArray.length);
  for (var i = 0; i < doorArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    console.log("DOOR: " + doorArray[i]);

    scene.remove(doorArray[i]);
    // doorArray[i].geometry.dispose();
  }
}

function clearAnimation() {
  for (var i = 0; i < animationArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    scene.remove(animationArray[i]);
    console.log(animationArray[i]);
    animationArray[i].geometry.dispose();
  }

}

function clearIntroText() {
  if(introText != null) {
    scene.remove( introText );
    introText.geometry.dispose();
  }
}

// function clearAnimationTexture() {
//   if (runner != null) {
//     scene.remove( runner );
//     runner.geometry.dispose();
//   }
// }

function changeCameraTarget( phi, theta ) {
  camera.target.x = - Math.sin(this.phi + 0.5 * Math.PI) * Math.cos(this.theta - 0.5 * Math.PI) * 3;
  camera.target.y = - Math.cos(this.phi + 0.5 * Math.PI) * 3;
  camera.target.z = Math.sin(this.phi + 0.5 * Math.PI) * Math.sin(this.theta - 0.5 * Math.PI) * 3;
}
