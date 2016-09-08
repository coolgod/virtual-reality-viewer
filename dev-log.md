### 04.30
1. View from inside a spherical cube looking outwards can differ when the cube's material is changed from *MeshBasicMaterial* to *MeshPhongMatrial*. Due to the nature of these two materials, the second one makes the view darker if a *Camera* and a *PointLight* is set at the center of the cube.
2. To zoom in a cube, there are two approaches. The first one is to change the position of the camera and move it towards the center of the cube. The second is to change the position of the cube and move it towards the camera. The first one is better because relative positions of other objects are changed. However, one should keep in mind to reset the camera's position after the animation is finished.
3. VRControls modifies the camera's position.