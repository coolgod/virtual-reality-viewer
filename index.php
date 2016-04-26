<!DOCTYPE html>
<html lang="en">
<head>
  <title>WashU VRV</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="wash u vrv">
  <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <link href='http://fonts.googleapis.com/css?family=Raleway' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
  <link href='css/style.css' rel='stylesheet' type='text/css'>
</head>
</head>

<body>
  <div id="wrapper">
    <div id="header"><h1 id="title">WuVR</h1></div>
    <div id="content">
        <p>Welcome to a virtual tour of Washington University in St.Louis</p>
        <div id="progressbar-text">Loading...</div>
        <div id="progressbar"></div>
        <a href="#" id="start-btn">Get Started</a>
    </div>
    <div id="footer">
      <div id="info">
        <span class="copyright">Washington University in St. Louis </span> —
        <a href="http://sts.wustl.edu" class="link">STS</a>
        <a href="#" class="link">SDC</a>
        <a href="http://sts.wustl.edu/vrv/" class="link">VRV</a>
      </div>
    </div>
  </div>
</body>

<!-- jquery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>

<script>
WebVRConfig = {
  /**
   * webvr-polyfill configuration
   */
  // Forces availability of VR mode.
  FORCE_ENABLE_VR: true, // Default: false.
  // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
  K_FILTER: 0.98, // Default: 0.98.
  /**
   * webvr-boilerplate configuration
   */
  // Forces distortion in VR mode.
  FORCE_DISTORTION: true, // Default: false.
  MOUSE_KEYBOARD_CONTROLS_DISABLED: false,
};

// change progress bar status
function progress( percent, prevPercent ) {
    $("#progressbar").progressbar();
    var val = $( "#progressbar" ).progressbar( "value" );
    if( val < 90 ){
      $( "#progressbar-text" ).text( "Loading resource..." );
    }
    if( val <= 70 ){
      $( "#progressbar-text" ).text( "Loading configuration..." );
    }
    if( val <= 50 ){
      $( "#progressbar-text" ).text( "Initializing graphics..." );
    }
    if( val <= 30 ){
      $( "#progressbar-text" ).text( "Loading scripts" );
    }
    if( val >= 90 ){
      $( "#progressbar-text" ).text( "Loading resource..." );
    }
    if( prevPercent == 99 ){
      $( "#progressbar" ).progressbar( "value", val + 1 );
    }
    if(val < percent){
      $( "#progressbar" ).progressbar( "value", val + 1 );
      setTimeout(function() { progress( percent, prevPercent ); }, 80);
    }
}
// initialize loading bar
$("#progressbar").progressbar({
    value: 0,
    change: function() {
    },
    complete: function() {
      $("#progressbar").fadeOut(1000, "swing", function() {
        $("#progressbar-text").css("display", "none");
        $("#start-btn").css("display", "inline-block");
      }); 
    }
});
progress(99, 0);
</script>

<!-- All Library dependencies -->
<!-- three.js: JavaScript 3D library -->
<script src="bower_components/threejs/build/three.js"></script>
<script src="js/threejs-extras/TextGeometry.js"></script>
<script src="js/threejs-extras/FontUtils.js"></script>
<script src="js/threejs-extras/VRControls.js"></script>
<script src="js/threejs-extras/VREffect.js"></script>
<script src="fonts/Raleway_Medium.js"></script>
<!-- WebVR Polyfill: a JavaScript implementation of the WebVR spec -->
<script src="bower_components/webvr-polyfill/build/webvr-polyfill.js"></script>
<!-- WebVR Boilerplate: A THREE.js-based starting point for VR experiences -->
<script src="bower_components/webvr-boilerplate/build/webvr-manager.js"></script>
<script src="js/webvr-boilerplate/webvr-manager-extras.js"></script>

<!-- howler.js - Modern Web Audio Javascript Library -->
<script src="bower_components/howler.js/howler.js"></script>
<!-- External library for smooth animations -->
<script src='bower_components/tween.js/src/Tween.js'></script>

<!--All Self-implemented Script -->
<script src="js/initObjects.js"></script>
<script src="js/htmlFunctions.js"></script>
<script src="js/removeObjects.js"></script>
<script src="js/cameraFunctions.js"></script>
<script src="js/functions.js"></script>
<script src="js/util.js"></script>

<script>
//Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.sortObjects = true;  // not always working
renderer.autoClear = false;

// Create a three.js scene.
var scene = new THREE.Scene();
var top_scene = new THREE.Scene();

// Create a three.js camera.
var aspect = document.body.clientWidth / document.body.clientHeight;
var camera = new THREE.PerspectiveCamera(90, aspect, 0.1, 501);
camera.position.set(0, 0, 0);
camera.lookAt(new THREE.Vector3( 0, 0, -1 ) );

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(document.body.clientWidth, document.body.clientHeight);

// Create a clock object for animation control
var clock = new THREE.Clock(false);
var animationClock = new THREE.Clock();
var updateTween = false;

// Lights
var particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
scene.add( particleLight );
scene.add( new THREE.AmbientLight( 0x111111 ) );

var directionalLight = new THREE.DirectionalLight( Math.random() *  0xff0000, 0.4 );
directionalLight.position.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
directionalLight.position.normalize();
scene.add( directionalLight );

var pointLight = new THREE.PointLight( 0xffffff, 1 );
particleLight.add( pointLight );

// raycaster for gaze indicator
var raycaster = new THREE.Raycaster(camera.position, camera.getWorldDirection(), 1);
// gaze indicator
var ring = null;

// helper object for zooming camera in/out
newCameraPosition = new THREE.Vector3(0,0,0);

// Create a VR manager helper to enter and exit VR mode.
var manager = new WebVRManager(renderer, effect, {hideButton: false});

// Load resource data files
var data_file = new XMLHttpRequest();
data_file.open("GET", "data/data.json", false);
data_file.send();
var skybox_imgs = JSON.parse(data_file.responseText).locations;
var logo_img = JSON.parse(data_file.responseText).logo;
var path_pre = JSON.parse(data_file.responseText).path_pre;
var box_path_pre = path_pre["box"];
if ( /iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream ) {
  path_pre = path_pre["iphone"];
}else if ( /iPad/i.test(navigator.userAgent) ) {
  path_pre = path_pre["default"];
}else if ( /Anroid/i.test(navigator.userAgent)  ){
  path_pre = path_pre["android"];
}else{
  path_pre = path_pre["default"];
}

// set inital skybox_index
skybox_index = Util.getQueryParameter("skybox_index");
if ( skybox_index == "" ) {
  skybox_index = 1;
}

// preload images for intro page, brookings and bears den
var preLoader = new THREE.ImageLoader( THREE.DefaultLoadingManager );
preLoader.load( path_pre + skybox_imgs[3].bg_img, function(){
  preLoader.load(box_path_pre+"brookings.jpg");
  preLoader.load(box_path_pre+"bd.jpg");
  for(i = 0; i < skybox_imgs[3].box.length; i++) {  
    preLoader.load(box_path_pre+skybox_imgs[skybox_imgs[3].box[i].next_idx].bg_img);
  }

  data_file.open("GET", "audio/Brookings.mp3", false);
  data_file.send();

  preLoader.load(path_pre + skybox_imgs[24].bg_img, function(){

    for(i = 0; i < skybox_imgs[24].box.length; i++) {  
        data_file.open("GET", box_path_pre+skybox_imgs[skybox_imgs[24].box[i].next_idx].bg_img, false);
        data_file.send();
    }

    data_file.open("GET", "audio/bd.mp3", false);
    data_file.send();

    data_file.open("GET", logo_img, false);
    data_file.send();

    progress(100, 99);
  });
});

// Initialize a skybox.
initSkybox(skybox_index, null);

// Kick off animation loop
animate();

// Request animation frame loop function
function animate(timestamp) {
  // Update VR headset position and apply to camera.
  controls.update();

  /* update clock for animation */
  delta = animationClock.getDelta();
  if (annie != null) {
    annie.update(1000 * delta);
  }

  if (updateTween == true) {
    TWEEN.update();
  }

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);
  requestAnimationFrame(animate);
}
  
// keyboard event listener handler
function onKey(event) {
  if (event.keyCode == 90) { // z
    // controls.resetSensor(); // Reset the position sensor when 'z' pressed.
    console.log(
      Math.round ( camera.getWorldDirection().x * 15 * 100 ) / 100 + ", " +
      Math.round ( camera.getWorldDirection().y * 15 * 100 ) / 100+ ", " +
      Math.round ( camera.getWorldDirection().z * 15 * 100 ) / 100
    );
  }
}

window.addEventListener('keydown', onKey, true);
</script>

</html>


