var skybox = null;
var skybox_index = null;
var prev_skybox_index = null;
var doorArray = null;
var animationArray = null;
var introText = null;
var annie = null;
var loadingSkyboxIndex = null;
var isLoading = false;
var audios = new Array();

// global image loader for skybox and cubes only
var imgLoader = new THREE.TextureLoader();
imgLoader.crossOrigin = '';
// global texture for skybox
var skyboxTexture;

function initSkybox( skybox_index, prev_skybox_index ) {
  console.log("enter scene: " + skybox_index + ", prev scene: " + prev_skybox_index );    

  // manager.input is defined after invoking render method
  if( manager.input != undefined ){
    manager.input.theta = 0;
    manager.input.phi = 0;
  }

  // clean up previous scene
  if ( prev_skybox_index != null || prev_skybox_index != undefined){
    clearAll( prev_skybox_index );
    if( prev_skybox_index == 1 ){
      clearIntroText();
    }
  }

  // preload audio
  if (skybox_index == 0 || skybox_index == 1){
    audios[skybox_imgs[0].bg_audio] = new Howl({
    urls: [skybox_imgs[0].bg_audio]
    });
    audios[skybox_imgs[6].bg_audio] = new Howl({
    urls: [skybox_imgs[6].bg_audio]
    });
  }
  
  // load intro text and gaze pointer
  if ( skybox_index != 0 ) {
    // logo
    if ( homeLogo == null ){
        initHomeLogo(); //load logo only when it hasn't been initialized
    }

    // intro text
    if ( skybox_index == 1 ) {
      initIntroText( skybox_index );
      homeLogo.visible = false;
    }else{
      homeLogo.visible = true;
    }
    // gaze pointer
    if(ring == null){
      ring = new THREE.Mesh(
      new THREE.TorusGeometry( 0.17, 0.017, 0, 70 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ));
      top_scene.add(ring);
    }
  }

  // load skybox
  var this_skybox = skybox_imgs[skybox_index];
  skyboxTexture = imgLoader.load(
    path_pre + this_skybox.bg_img,
    function ( texture ) {
      // start caching skybox images for other scenes asynchronously
      var cacheLoader = new THREE.ImageLoader( THREE.DefaultLoadingManager );
      cacheLoader.setCrossOrigin( '' );
      for(i = 0; i < this_skybox.box.length; i++) {
        var path = path_pre + skybox_imgs[this_skybox.box[i].next_idx].bg_img;
        cacheLoader.load( path );
      }
      return texture;
    }
  );

  skyboxTexture.minFilter = THREE.NearestMipMapLinearFilter;
  if ( skybox == null ){
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    var material = new THREE.MeshBasicMaterial({ map: skyboxTexture });
    skybox = new THREE.Mesh(geometry, material);
    skybox.scale.x = -1.0;
    skybox.receiveShadow = true;
    scene.add(skybox);
  }else{
    skybox.material.map = skyboxTexture;
  }
  

  // loading new cubes
  cubeTextArray = [];
  cubeArray = [];
  box_count = this_skybox.box.length;
  for (i = 0; i < box_count; i++) {
    cubeArray.push( initCube( this_skybox.box[i] ) );
  }
  
  // load audio using Howler.js
  var audio_path = skybox_imgs[skybox_index].bg_audio;
  if(audio_path != ""){
    if(audios[audio_path] == null){ // if it hasn't been loaded
      audios[audio_path] = new Howl({
        urls: [audio_path]
      }).play();
      // console.log( audios[audio_path] );
    }else{
      if( audios[audio_path] != false ){ //if it has been loaded but not played
        audios[audio_path].play();
      }
    }
  }
}

function initCube( box_specific ) {
  // load texture images
  var texture = imgLoader.load(
    box_path_pre + skybox_imgs[box_specific.next_idx].bg_img,
    function ( texture ) {
      return texture;
    }
  );
  texture.miniFilter = THREE.LinearFilter;

  // create cube mesh
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({map: texture, shading: THREE.SmoothShading, opacity: 0.7, transparent: true})
  );
  sphere.next_idx = box_specific.next_idx;
  sphere.position.set( box_specific.coord[0] , box_specific.coord[1], box_specific.coord[2] );
  scene.add(sphere);
  
  // initialize 3D Text
  var text3D = initText(sphere, box_specific.text);
  scene.add( text3D );
  cubeTextArray.push( text3D );
  
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
  text3D.position.set( sphere.position.x + deltaX, sphere.position.y + 1.5, sphere.position.z + deltaZ);


  text3D.lookAt( new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z) );

  text3D.visible = false;
  return text3D;
}

function initIntroText( skybox_index ) {
  var textGeometry = new THREE.TextGeometry( skybox_imgs[skybox_index].bg_name, 
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
    dae.position.set(box_specific.coord[0] * 1.15, box_specific.coord[1] * 1.15 - 3.6, box_specific.coord[2] * 1.15);
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
  runner.position.set(box_specific.coord[0] * 1.3, box_specific.coord[1] * 1.3, box_specific.coord[2] * 1.3);

  runner.lookAt( new THREE.Vector3(0,-3,0) );
  scene.add(runner);
  return runner;
}

function initHomeLogo() {
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var texture = loader.load(
    logo_img,
    function ( texture ) {
      return texture;
    }
  );

  homeLogo = new THREE.Mesh(
    new THREE.CircleGeometry( 1, 30 ), 
    new THREE.MeshPhongMaterial({map: texture, shading: THREE.SmoothShading, opacity: 0.2, transparent: true})
    );
  homeLogo.position.set(camera.position.x, camera.position.y - 10, camera.position.z);
  homeLogo.lookAt( camera.position );
  homeLogo.scale.set( 3, 3, 3 );

  homeLogo.visible = true;
  scene.add( homeLogo );
}