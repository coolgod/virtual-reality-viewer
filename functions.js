cubeArray= [];

function initSkybox( skybox_index ) {
  hasMoved = false;
  clearOldCubesAndText();

  var this_skybox = skybox_images[skybox_index];
  var boxWidth = 5;
  var texture = THREE.ImageUtils.loadTexture(this_skybox.bg_img);

  var geometry = new THREE.SphereGeometry( 500, 60, 40 )
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide
  });

  skybox = new THREE.Mesh(geometry, material);
  scene.add(skybox);
  
  /* loading new cubes */
  cubeTextArray = [];
  cubeArray = [];
  box_count = this_skybox.box_specifics.length;
  for (i = 0; i < box_count; i++) {
    cubeArray.push( initCube( this_skybox.box_specifics[i] ) );
  }
  
  /*
  console.log("cube array begins");
  for (i = 0; i < cubeArray.length; i++){
    console.log( JSON.stringify(cubeArray[i]) );
  }
  */

  // update the clock
  clock = new THREE.Clock(false);
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
      if ( skybox.material.map.sourceFile == skybox_images[0].bg_img ) {
        if( gazingIndex == 1 ) {
          initSkybox(1);
        }else{
          initSkybox(2);
        }     
        return;
      }
      if ( skybox.material.map.sourceFile == skybox_images[1].bg_img ) {
        if( gazingIndex == 0 ) {
          initSkybox(0);
        }else{
          initSkybox(2);
        }  
        return;   
      }
      if ( skybox.material.map.sourceFile == skybox_images[2].bg_img ) {
        if( gazingIndex == 0 ) {
          initSkybox(1);
        }else{
          initSkybox(0);
        }  
        return;   
      }
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