var skybox = null;
var skybox_index = null;
var audio = null;
var doorArray = null;
var animationArray = null;
var introText = null;
var annie = null;
var loadingSkyboxIndex = null;
var isLoading = false;


// function updateSkybox( skybox_index ) {

//   var this_skybox = skybox_images[skybox_index];
//   var boxWidth = 5;
//   var loader = new THREE.TextureLoader();
//   loader.crossOrigin = '';
//   var texture = loader.load(
//     this_skybox.bg_img,
//     function ( texture ) {
//       // start caching skybox images for other scenes asynchronously
//       var cacheLoader = new THREE.ImageLoader( THREE.DefaultLoadingManager );
//       cacheLoader.setCrossOrigin( '' );
//       for(i = 0; i < this_skybox.box_specifics.length; i++) {
//         var path = skybox_images[this_skybox.box_specifics[i].next_index].bg_img;
//         cacheLoader.load( path );
//       }
//       return texture;
//     }
//   );

//   skybox.material.map.needsUpdate = true;
//   skybox.material.map.texture = texture;
//   skybox.material.map.needsUpdate = false;

// }

function initSkybox( skybox_index ) {

  clearAll();
  if (skybox_index != 8 || skybox_index != 9) {
    clearIntroText();
  }
  
  var this_skybox = skybox_images[skybox_index];
  var boxWidth = 5;
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var texture = loader.load(
    this_skybox.bg_img,
    function ( texture ) {
      // start caching skybox images for other scenes asynchronously
      var cacheLoader = new THREE.ImageLoader( THREE.DefaultLoadingManager );
      cacheLoader.setCrossOrigin( '' );
      for(i = 0; i < this_skybox.box_specifics.length; i++) {
        var path = skybox_images[this_skybox.box_specifics[i].next_index].bg_img;
        cacheLoader.load( path );
      }
      return texture;
    }
  );

  

  texture.minFilter = THREE.NearestMipMapLinearFilter;

  var geometry = new THREE.SphereGeometry( 500, 60, 40 );

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

  /* load Intro text */
  if ( skybox_index == 9 ) {

  } else {
    if ( skybox_index == 8 ) {
      initIntroText( skybox_index );
    }
    /* loading gaze pointer */
    if(ring == null){
      ring = new THREE.Mesh(
      new THREE.TorusGeometry( 0.17, 0.017, 0, 70 ),            // set 'radius segment' to 0 to make it a flat 2D ring
      new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ));      // set color to white
      top_scene.add(ring);
    }
  }


  /* loading audio */
  if (skybox_images[skybox_index].bg_audio != "") {
    audio = new THREE.Audio( listener );
    audio.setRefDistance( 20 );
    audio.autoplay = true;
    audio.load( skybox_images[skybox_index].bg_audio );
    scene.add(audio);
  }

}

function initCube( box_specific ) {


  var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var texture = loader.load(
    box_specific.box_img_path,
    function ( texture ) {
      return texture;
    }
  );
  texture.miniFilter = THREE.LinearFilter;
  var sphereMaterial = new THREE.MeshPhongMaterial({map: texture , shading: THREE.SmoothShading, opacity: 0.7, transparent: true});
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.next_index = box_specific.next_index;
  sphere.position.set( box_specific.box_coord[0] , box_specific.box_coord[1], box_specific.box_coord[2] );
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
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });
  var textMaterial = new THREE.MeshPhongMaterial( { color: 0xDDDDDD, specular: 0x009900, shininess: 10, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } );
  
  text3D = new THREE.Mesh( textGeometry, textMaterial );

  var deltaX = ( (sphere.position.z > 0) ? +1 : -1 ) * ( txt.length * 0.2 );
  var deltaZ = ( (sphere.position.x > 0) ? -1 : +1 ) * ( txt.length * 0.2 );
  deltaX = (sphere.position.z == 0) ? 0 : deltaX;
  deltaZ = (sphere.position.x == 0) ? 0 : deltaZ;

  /* Change this if we want to implement door and text needs to be in a higher position*/
  // if (skybox_index == 8) {
  //   text3D.position.set( sphere.position.x + deltaX, sphere.position.y + 1.5, sphere.position.z + deltaZ);
  // }
  // else {
  //   text3D.position.set( sphere.position.x + deltaX, sphere.position.y + 4, sphere.position.z + deltaZ);
  // }
  text3D.position.set( sphere.position.x + deltaX, sphere.position.y + 1.5, sphere.position.z + deltaZ);


  text3D.lookAt( new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z) );

  text3D.visible = false;
  return text3D;
}

function initIntroText( skybox_index ) {
  var textGeometry = new THREE.TextGeometry( skybox_images[skybox_index].bg_name, 
  {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 20,
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });

  var textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x595050, specular: 0xffffff, shininess: 10, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } );
  introText = new THREE.Mesh( textGeometry, textMaterial );

  introText.position.set( -10, 5, -15 );
  introText.lookAt( new THREE.Vector3(camera.position.x-10, camera.position.y, camera.position.z) );
  introText.visible = true;
  scene.add( introText );

}

function initVideo() {
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

    /* disable door Animation */
    scene.add(dae);
    doorArray.push(dae);
    
  });
}

function initAnimatedTexture( box_specific ) {
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
