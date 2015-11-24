var skybox = null;

function initSkybox( skybox_index ) {

  hasMoved = false;
  clearRing();
  clearOldSkybox();
  clearOldCubesAndText();
  clearVideoScreen();
  
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

  /* loading gaze pointer */
  if(ring == null){
    ring = new THREE.Mesh(
    new THREE.TorusGeometry( 0.17, 0.017, 0, 70 ),            // set 'radius segment' to 0 to make it a flat 2D ring
    new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ));      // set color to white
    scene.add(ring);
  }
  
  // update the clock
  clock = new THREE.Clock(false);

  if ( skybox_index == 0 && videoMesh == null) {
    addVideo();
  }
}

function initCube( box_specific ) {
  var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( box_specific.box_img_path ) } )
  var cube = new THREE.Mesh(geometry, material);
  cube.next_index = box_specific.next_index;

  cube.position.x = box_specific.box_coord[0];
  cube.position.y = box_specific.box_coord[1];
  cube.position.z = box_specific.box_coord[2];

  scene.add(cube);
  
  // Initialize 3D Text
  var text3D = initText(cube, box_specific.box_text);
  scene.add( text3D );
  cubeTextArray.push( text3D ); // temp solution, each time a cube is added, the text is pushed to a corresponding array
  //cube.add( text3D ); // text is bined as a child object of cube --> doesn't work out because child rotate with parent

  return cube;
}

function initText( cube, txt ) {
  // text above cube
  var textGeometry = new THREE.TextGeometry( txt, 
  {
    size: 0.3,
    height: 0.04,
    weight: "normal",
    style: "normal",
    curveSegments: 3,
    font: "helvetiker",
    material: 0,
    extrudeMaterial: 1
  });

  var textMaterial = new THREE.MeshFaceMaterial( [
    new THREE.MeshBasicMaterial( { color: 0xffff00, overdraw: 0.5 } ),
    new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
  ] );
  text3D = new THREE.Mesh( textGeometry, textMaterial );
  text3D.position.set( cube.position.x, cube.position.y + 0.8, cube.position.z - 0.5);
  text3D.rotation.y =  - Math.PI / 2;
  return text3D;
}

function gazeFunction( gazingIndex ) {
  var t = clock.getElapsedTime();
  var factor = 1;


  // Loading animation
  if(t > 3.65){
    if(t > 4.8){          // if zoom-out-zoom-in animation finish
      clock.stop();       // stop the clock;
      /* change scene here */
      initSkybox(cubeArray[gazingIndex].next_index);
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
  videoMesh.position.set( 10, 0, 60 );
  videoMesh.rotation.y = 50;
  videoMesh.rotation.z = 0;
  scene.add(videoMesh);
}

function renderVideo() {
  if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
    videoScreenContext.drawImage( video, 0, 0 );
    if ( videoTexture ) 
      videoTexture.needsUpdate = true;
  }
}

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubeArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    scene.remove (cubeTextArray[i] );
    scene.remove( cubeArray[i] );
  }
}

function clearOldSkybox(){
  if(skybox != null){
    skybox.geometry.dispose();
    skybox.material.dispose();
    scene.remove(skybox);
  }
}

function clearVideoScreen(){
  if(videoMesh != null){
    console.log("clear video");
    videoMesh.geometry.dispose();
    videoMesh.material.map.dispose();
    videoMesh.material.dispose();
    scene.remove( videoMesh );
    videoScreenContext.clearRect( 0, 0, videoScreen.width, videoScreen.height )
    videoMesh = null;
  }
}

function clearRing () {
  if(ring != null){
    ring.geometry.dispose();
    ring.material.dispose();
    scene.remove(ring);
    ring = null;
  }
}