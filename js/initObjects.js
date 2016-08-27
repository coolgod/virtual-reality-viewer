var skybox = null;
var nextSkyboxIdx = null;
var lastSkyboxIdx = null;

var introText = null;
var logo = null;
var cubes = [];
var cubeTxt = [];
var audios = [];

function initSkybox(nextSkyboxIdx, lastSkyboxIdx, gazeIdx) {
  Util.log("Scene change:", lastSkyboxIdx, "=>", nextSkyboxIdx);

  // reset camera
  if (manager != undefined && nextSkyboxIdx == 1) {
    manager.hmd.resetPose();
  }

  // clean up previous scene
  if (lastSkyboxIdx != null || lastSkyboxIdx != undefined) {
    clearAudio(lastSkyboxIdx);
    if (lastSkyboxIdx == 1) {
      clearIntroText();
    }
  }

  // load intro text and gaze pointer
  if (nextSkyboxIdx != 0) {
    // logo
    if (logo == null) {
      initHomeLogo(); //load logo only when it hasn't been initialized
    }

    // intro text
    if (nextSkyboxIdx == 1) {
      initIntroText(nextSkyboxIdx);
      logo.visible = false;
    } else {
      logo.visible = true;
    }
  }

  // load skybox
  var this_skybox = skybox_imgs[nextSkyboxIdx];
  textureLoader.load(
    path_pre + this_skybox.bg_img,
    function(texture) {

      // start caching skybox images for other scenes asynchronously
      for (i = 0; i < this_skybox.box.length; i++) {
        var path = path_pre + skybox_imgs[this_skybox.box[i].next_idx].bg_img;
        textureLoader.load(path);
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
        skybox.material.transparent = true;
        scene.add(skybox);

        // loading new cubes
        box_count = this_skybox.box.length;
        for (i = 0; i < box_count; i++) {
          this.cubes.push(this.initCube(this_skybox.box[i]));
        }
      } else {
        manager.hmd.resetPose();
        skybox.rotation.y = 0;
        if (gazeIdx != -1) {
          (function fadeout() {
            // rotate skybox to align to the cube
            skybox.rotation.y = cubes[gazeIdx].rotation.y;

            if (cubes[gazeIdx].material.opacity > 0.1) {
              cubes[gazeIdx].material.opacity -= 0.05;
              requestAnimationFrame(fadeout);
            } else {
              clearOldCubesAndText();
              lights.children.pop();
              // loading new cubes
              box_count = this_skybox.box.length;
              for (i = 0; i < box_count; i++) {
                cubes.push(initCube(this_skybox.box[i]));
              }
            }
          })();
        } else {
          // TO-DO: figure out a way to eliminate duplicate
          clearOldCubesAndText();
          // loading new cubes
          for (i = 0; i < this_skybox.box.length; i++) {
            cubes.push(initCube(this_skybox.box[i]));
          }
        }

        skybox.material.map = texture;
      }
    }
  );

  initAudio(skybox_imgs[nextSkyboxIdx].bg_audio);
}

function initAudio(path) {
  if (path != "") {
    var audio = audios[path];
    if (audio == null) { // if it hasn't been loaded
      audios[path] = new Howl({
        src: [path],
        autoplay: true
      });
    } else {
      if (audio != false) audio.play();
    }
  }
}

function initCube(box_specific) {
  // load texture images
  var texture = textureLoader.load(
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

  // initialize 3D Text above the cube
  initCubeTxt(cube, box_specific.text);
  return cube;
}

function initCubeTxt(cube, txt) {
  var loader = new THREE.FontLoader();
  loader.load('fonts/Lato_Regular.js', function(font) {
    var geometry = new THREE.TextGeometry(txt, {
      size: 1,
      height: 0.2,
      curveSegments: 2,
      font: font,
    });

    geometry.computeBoundingBox();

    var material = new THREE.MultiMaterial([
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        overdraw: 0.5
      }),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        overdraw: 0.5
      })
    ]);

    var mesh = new THREE.Mesh(geometry, material);

    var deltaX = ((cube.position.z > 0) ? +1 : -1) * (txt.length * 0.2);
    var deltaZ = ((cube.position.x > 0) ? -1 : +1) * (txt.length * 0.2);
    deltaX = (cube.position.z == 0) ? 0 : deltaX;
    deltaZ = (cube.position.x == 0) ? 0 : deltaZ;
    mesh.position.set(cube.position.x + deltaX, cube.position.y + 1.5, cube.position.z + deltaZ);


    mesh.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

    mesh.visible = false;

    scene.add(mesh);
    cubeTxt.push(mesh);
  });
}

function initIntroText(nextSkyboxIdx) {
  var txt = skybox_imgs[nextSkyboxIdx].bg_name;

  var loader = new THREE.FontLoader();
  loader.load('fonts/Lato_Regular.js', function(font) {
    var geometry = new THREE.TextGeometry(txt, {
      size: 1,
      height: 0.2,
      curveSegments: 2,
      font: font,
    });

    var material = new THREE.MultiMaterial([
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        overdraw: 0.5
      }),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        overdraw: 0.5
      })
    ]);

    introText = new THREE.Mesh(geometry, material);
    introText.position.set(-10, 5, -15);
    introText.lookAt(new THREE.Vector3(camera.position.x - 10, camera.position.y, camera.position.z));
    introText.visible = true;
    scene.add(introText);
  });
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

  logo = new THREE.Mesh(
    new THREE.CircleGeometry(3, 30),
    new THREE.MeshPhongMaterial({
      map: texture,
      shading: THREE.SmoothShading,
      transparent: true
    })
  );
  logo.position.set(camera.position.x, camera.position.y - 10, camera.position.z);
  logo.lookAt(camera.position);
  resetLogo();
  logo.visible = true;
  scene.add(logo);
}

function resetLogo() {
  logo.scale.set(1, 1, 1);
  logo.material.opacity = 0.2;
}
