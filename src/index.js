"use strict"

// glslify 
const glsl = require("glslify");
// threejs
const THREE = require("three");
// vertex shader
const vertexShader = glsl.file("./shader/vertex.glsl");
// fragment shader
const fragmentShader = glsl.file("./shader/fragment.glsl");
// orbit control, for easy camera control
const OrbitControls = require('three-orbit-controls')(THREE);

// import the geometry class
import Geometry from './geometry.js';

// The starting worker
const worker = new Worker("Worker/initWorker.js");

// the particle ParticleSystem
let particlesystem;

// scene, camera and renderer of the artwork
let scene, camera, renderer;

// orbit control, from THREE.js
let orbit;

// Particle amount to be displayed (squared)
let particlesAmount;
// and multiplier for the width and depth of the particles
let multiplier;

// movement over time
let move = 0.0;

// mouse and device orientation
let mouse = new THREE.Vector2(0.0, 0.0);
let mouse_nd = new THREE.Vector2(0.0, 0.0);
let mouse_m = 0.1;
let orientation_start = new THREE.Vector2(-1000000, -1000000);

// Trick: if the device is too slow to load the app, it goes on another page
let slowdev = true;

// Fading controls, for the mouse click when entering the website
let fading = 0;
let toFade = false;
let fadeAlpha = 1.0;

// Resolution (width and height) of the sketch
let resolution;

// Check if it is a mobile device, to change the layout
let isMobile = false;
let mobileCheck = function () {
    var check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
            .test(a) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
            .test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
isMobile = mobileCheck();

// Sketch reactive to the size of the window
window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
});

// Mouse
function mousePointer(e) {
    mouse_nd.x = e.pageX;
    mouse_nd.y = e.pageY;
}

// Device orientation
function deviceOrientationListener(event) {
    if (orientation_start.x === -1000000 && orientation_start.y === -1000000) {
        orientation_start.x = event.gamma;
        orientation_start.y = event.beta;
    }

    mouse_nd.x = (orientation_start.x - event.gamma) * 50.0;
    mouse_nd.y = (orientation_start.y - event.beta) * 10.0;
}

// Update function
const update = function () {

    if (toFade) {
        fading = 0.015 * (20000.0 - fading) + fading;
        fadeAlpha = 1.0 - fading / 20000.0;
        pass.uniforms.noiseamount.value = fadeAlpha;
    }

    mouse.x = 0.1 * (mouse_nd.x - mouse.x) + mouse.x;
    mouse.y = 0.1 * (mouse_nd.y - mouse.y) + mouse.y;

    var orbx = (mouse.x - resolution.x / 2) * -mouse_m;
    var orby = (mouse.y - resolution.y / 2) * -mouse_m;

    orbit.target = new THREE.Vector3(orbx, orby, 0);
    orbit.update();

    particlesystem.update(fading, fadeAlpha, move, performance.now(), 50.0);
};

// Render
const render = function () {
    renderer.render(scene, camera);
};

// Animate
const animate = function () {

    requestAnimationFrame(animate);

    update();

    render();
};

// When the worker is ready at the startup
worker.onmessage = function (e) {
    slowdev = false;

    particlesystem = new Geometry(e, vertexShader, fragmentShader);

    scene.add(particlesystem.ParticleSystem);

    animate();
}

// When the window is loaded, load everything and start the worker in background
window.onload = function () {

    // if it is mobile, activate the device orientation rather than the mouse
    if (isMobile) {
        if (window.DeviceOrientationEvent) { // if the device allows
            window.addEventListener("deviceorientation", deviceOrientationListener);
        }
    } else {
        window.addEventListener('mousemove', mousePointer);
    }

    // create new scene
    scene = new THREE.Scene();

    // create new camera
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000000);
    camera.position.z = -750;
    camera.position.y = 50;

    // create new canvas with webgl2 rendering
    var canv = document.createElement('canvas');
    var cont = canv.getContext('webgl2');
    renderer = new THREE.WebGLRenderer({
        canvas: canv,
        context: cont,
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x191919, 1.0);
    document.body.appendChild(renderer.domElement);

    // if it is a mobile device, reduce the number of the particles
    if (!isMobile) {
        particlesAmount = 300;
        multiplier = 3;
    } else {
        particlesAmount = 200;
        multiplier = 4;
    }

    // orbit control, for the camera movement
    orbit = new OrbitControls(camera);
    orbit.autoRotate = false;
    orbit.enabled = false;
    orbit.update();

    // message for the worker
    var message = {
        pn: particlesAmount,
        m: multiplier,
        mobile: isMobile
    };

    worker.postMessage(message);
}

// If the device is too slow, redirect to another page
// So it doesn't get stuck on this page trying to load
setTimeout(function () {
    if (slowdev) window.location.href = 'http://kesson.io/index_slowdev.html';
}, 6000);