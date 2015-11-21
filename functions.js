function initSkybox( skybox_index ) {

  var boxWidth = 5;
  var texture = THREE.ImageUtils.loadTexture(skybox_index[0]);

  var geometry = new THREE.SphereGeometry( 500, 60, 40 )
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide
  });

  skybox = new THREE.Mesh(geometry, material);
  scene.add(skybox);

  /*
    need to change or remove the cubes already in the scene
  */
  cubeArray = [];

  for (i = 1; i < skybox_index.length; i++) {
    initCube( skybox_index[i], i - 1 );
  }
}

function initCube( cube_coord, index ) {


  var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'img/engineering.jpg' ) } )
  var cube = new THREE.Mesh(geometry, material);

  cube.position.x = cube_coord[0];
  cube.position.y = cube_coord[1];
  cube.position.z = cube_coord[2];

  scene.add(cube);
  console.log(cube);

  cubeArray.push(cube);

  // Initialize 3D Text
  initText(cube);
}

function initText( cube ) {
  // text above cube
  var textGeometry = new THREE.TextGeometry( "Olin", 
  {
    size: 0.5,
    height: 0.1,
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
  scene.add( text3D );

}


function gazeFunction() {
  var t = clock.getElapsedTime();
  var factor = 1;

  // On loading complete, change scene
  if(t > 4.8){
    if ( skybox.material.map.sourceFile == skybox_images.BR[0] ) {
                initSkybox(skybox_images.EN);
    }
  }

  // Loading animation
  if(t > 3.65) factor = 1 + t / 10;  // zoom out the ring
  else factor = 1 - t / 80;          // zoom in the ring
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
    if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
  {
    videoScreenContext.drawImage( video, 0, 0 );
    if ( videoTexture ) 
      videoTexture.needsUpdate = true;
  }
}