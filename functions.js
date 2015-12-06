var skybox = null;
var audio = null;
var doorArray = null;

function initSkybox( skybox_index ) {

  hasMoved = false;
  clearRing();
  clearOldSkybox();
  clearOldCubesAndText();
  clearVideoScreen();
  clearAudio();
  
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

  /* load video screen */
  if ( skybox_index == 0 && videoMesh == null) {
    addVideo();
  }

  /* loading gaze pointer */
  if(ring == null){
    ring = new THREE.Mesh(
    new THREE.TorusGeometry( 0.17, 0.017, 0, 70 ),            // set 'radius segment' to 0 to make it a flat 2D ring
    new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ));      // set color to white
    top_scene.add(ring);
  }


  doorArray = [];
  // doorArray.push( initAnimation() );
  /* loading audio */
  audio = new THREE.Audio( listener );
  audio.load( skybox_images[skybox_index].bg_audio );
  audio.autoplay = true;
  audio.setRefDistance( 20 );
  scene.add(audio);
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

function initAnimation() {
  // Add Collada Loader
  var loader = new THREE.ColladaLoader();
  var dae;
  loader.options.convertUpAxis = true;
  loader.load('animation/Door.dae', function (result) {
    // cube.material.map = result.scene;
    dae = result.scene;
    console.log(result);
    dae.scale.x = dae.scale.y = dae.scale.z = 0.05;
    dae.position.set( -15, -5, -5 );
    dae.updateMatrix();
    newMaterial = new THREE.MeshBasicMaterial();
    dae.material = newMaterial;
    scene.add(dae);
  });
  return dae;
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

/* objects recycle */

function clearOldCubesAndText(){
  /* remove the cubes already in the scene */
  for (var i = 0; i < cubeArray.length; i++){
    scene.remove (cubeTextArray[i] );
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
    // audio.dispose();
    audio.stop();
    scene.remove(audio);
    audio = null;
  }
}

function clearDoors() {
  for (var i = 0; i < doorArray.length; i++){
    // scene.remove( cubeArray[i].children[0] );
    scene.remove (doorArray[i]);
    doorArray[i].material.dispose();
  }
}

function changeCameraTarget( phi, theta ) {
  camera.target.x = - Math.sin(this.phi + 0.5 * Math.PI) * Math.cos(this.theta - 0.5 * Math.PI) * 3;
  camera.target.y = - Math.cos(this.phi + 0.5 * Math.PI) * 3;
  camera.target.z = Math.sin(this.phi + 0.5 * Math.PI) * Math.sin(this.theta - 0.5 * Math.PI) * 3;
}
