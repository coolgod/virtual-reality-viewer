var skybox = null;
var nextSkyboxIdx = null;
var lastSkyboxIdx = null;
var isLoading = false;

var introText = null;
var homeLogo = null;
var cubeArray = [];
var cubeTextArray = [];

var annie = null;
var audios = new Array();

// global image loader for skybox and cubes only
var imgLoader = new THREE.TextureLoader();

function initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx) {
  console.log("Scene change:", lastSkyboxIdx, "=>", nextSkyboxIdx);

  // manager.input is defined after invoking render method
  if (manager.input != undefined && nextSkyboxIdx == 1) {
    manager.input.theta = 0;
    manager.input.phi = 0;
  }

  // clean up previous scene
  if (lastSkyboxIdx != null || lastSkyboxIdx != undefined) {
    clearAudio(lastSkyboxIdx);
    if (lastSkyboxIdx == 1) {
      clearIntroText();
    }
  }

  // preload audio
  if (nextSkyboxIdx == 0 || nextSkyboxIdx == 1) {
    audios[skybox_imgs[0].bg_audio] = new Howl({
      urls: [skybox_imgs[0].bg_audio]
    });
    audios[skybox_imgs[6].bg_audio] = new Howl({
      urls: [skybox_imgs[6].bg_audio]
    });
  }

  // load intro text and gaze pointer
  if (nextSkyboxIdx != 0) {
    // logo
    if (homeLogo == null) {
      initHomeLogo(); //load logo only when it hasn't been initialized
    }

    // intro text
    if (nextSkyboxIdx == 1) {
      initIntroText(nextSkyboxIdx);
      homeLogo.visible = false;
    } else {
      homeLogo.visible = true;
    }

    // gaze pointer
    if (ring == null) {
      ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.017, 0, 70),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        }));
      top_scene.add(ring);
    }
  }

  // load skybox
  var this_skybox = skybox_imgs[nextSkyboxIdx];
  imgLoader.load(
    path_pre + this_skybox.bg_img,
    function(texture) {
      // start caching skybox images for other scenes asynchronously
      for (i = 0; i < this_skybox.box.length; i++) {
        var path = path_pre + skybox_imgs[this_skybox.box[i].next_idx].bg_img;
        imgLoader.load(path);
      }

      if (this_skybox.bg_img != "") {
        texture.minFilter = THREE.NearestMipMapLinearFilter;
      }

      if (skybox == null) {
        skybox = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40),
          new THREE.MeshBasicMaterial({
            map: texture
          }));
        skybox.scale.x = -1.0;
        skybox.receiveShadow = true;
        skybox.material.transparent = true;
        scene.add(skybox);

        // loading new cubes
        box_count = this_skybox.box.length;
        for (i = 0; i < box_count; i++) {
          this.cubeArray.push(this.initCube(this_skybox.box[i]));
        }
      } else {
        manager.input.phi = 0;
        skybox.rotation.y = 0;

        if (gazeIdx != -1) {
          (function fadeout() {
            // rotate skybox to align to the cube         
            skybox.rotation.y = cubeArray[gazeIdx].rotation.y;

            if (cubeArray[gazeIdx].material.opacity > 0.1) {
              cubeArray[gazeIdx].material.opacity -= 0.05;
              requestAnimationFrame(fadeout);
            } else {
              clearOldCubesAndText();
              // loading new cubes
              box_count = this_skybox.box.length;
              for (i = 0; i < box_count; i++) {
                cubeArray.push(initCube(this_skybox.box[i]));
              }
              ambientLight.color = new THREE.Color(0x222222);
            }
          })();
        }else{
          // TO-DO: figure out a way to eliminate duplicate
          clearOldCubesAndText();
          // loading new cubes
          for (i = 0; i < this_skybox.box.length; i++) {
            cubeArray.push(initCube(this_skybox.box[i]));
          }
          ambientLight.color = new THREE.Color(0x222222);
        }

        skybox.material.map = texture;
      }
    }
  );

  // load audio using Howler.js
  var audio_path = skybox_imgs[nextSkyboxIdx].bg_audio;
  if (audio_path != "") {
    if (audios[audio_path] == null) { // if it hasn't been loaded
      audios[audio_path] = new Howl({
        urls: [audio_path]
      }).play();
      // console.log( audios[audio_path] );
    } else {
      if (audios[audio_path] != false) { //if it has been loaded but not played
        audios[audio_path].play();
      }
    }
  }
}

function initCube(box_specific) {
  // load texture images
  var texture = imgLoader.load(
    box_path_pre + skybox_imgs[box_specific.next_idx].bg_img,
    function(texture) {
      return texture;
    }
  );
  texture.miniFilter = THREE.LinearFilter;

  // create cube mesh
  var cube = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.SmoothShading,
      opacity: 0.7,
      transparent: true
    })
  );
  cube.next_idx = box_specific.next_idx;
  var pos = new THREE.Vector3(box_specific.coord[0],
    box_specific.coord[1],
    box_specific.coord[2]);
  // because the skybox has rotated, adjust the cube's postion
  pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), skybox.rotation.y);
  cube.position.set(pos.x, pos.y, pos.z);

  scene.add(cube);

  // initialize 3D Text
  var text3D = initText(cube, box_specific.text);
  scene.add(text3D);
  cubeTextArray.push(text3D);

  return cube;
}

// text above cube
function initText(cube, txt) {
  var textGeometry = new THREE.TextGeometry(txt, {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 3,
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });
  var textMaterial = new THREE.MeshPhongMaterial({
    color: 0xDDDDDD,
    specular: 0x009900,
    shininess: 10,
    shading: THREE.SmoothShading,
    opacity: 0.8,
    transparent: true
  });

  text3D = new THREE.Mesh(textGeometry, textMaterial);

  var deltaX = ((cube.position.z > 0) ? +1 : -1) * (txt.length * 0.2);
  var deltaZ = ((cube.position.x > 0) ? -1 : +1) * (txt.length * 0.2);
  deltaX = (cube.position.z == 0) ? 0 : deltaX;
  deltaZ = (cube.position.x == 0) ? 0 : deltaZ;
  text3D.position.set(cube.position.x + deltaX, cube.position.y + 1.5, cube.position.z + deltaZ);


  text3D.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

  text3D.visible = false;
  return text3D;
}

function initIntroText(nextSkyboxIdx) {
  var textGeometry = new THREE.TextGeometry(skybox_imgs[nextSkyboxIdx].bg_name, {
    size: 1,
    height: 0.2,
    weight: "normal",
    style: "normal",
    curveSegments: 20,
    font: "raleway",
    material: 0,
    extrudeMaterial: 1
  });
  var textMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x595050,
    specular: 0xffffff,
    shininess: 10,
    shading: THREE.SmoothShading,
    opacity: 0.8,
    transparent: true
  });
  introText = new THREE.Mesh(textGeometry, textMaterial);
  introText.position.set(-10, 5, -15);
  introText.lookAt(new THREE.Vector3(camera.position.x - 10, camera.position.y, camera.position.z));
  introText.visible = true;
  scene.add(introText);
}

function initHomeLogo() {
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var texture = loader.load(
    logo_img,
    function(texture) {
      return texture;
    }
  );

  homeLogo = new THREE.Mesh(
    new THREE.CircleGeometry(1, 30),
    new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.SmoothShading,
      transparent: true
    })
  );
  homeLogo.position.set(camera.position.x, camera.position.y - 10, camera.position.z);
  homeLogo.lookAt(camera.position);
  resetHomeLogo();
  homeLogo.visible = true;
  scene.add(homeLogo);
}

function resetHomeLogo() {
  homeLogo.scale.set(3, 3, 3);
  homeLogo.material.opacity = 0.2;
}