# vrv
#HOW TO RUN#
put all the files on a local or remote Apache server, use any webkit browser to access the index.php under the root directory.

#PROJECT STRUCTURE
- audio: audio files
- bower_components: dependent packages
- data: configuration data files
- fonts: font files three.js
- img: picture resources
- js: script files
- bower.json: bower configuration file

#LIBRARY AND PACKAGE DEPENDENCY#
- our project is dependent on threejs and webvr-boilerplate
- webvr-boilerplate is dependent on threejs, webvr-polyfill and promise-polyfill(never used)
- include order should be threejs->webvr-polyfill->webvr-boilerplate
