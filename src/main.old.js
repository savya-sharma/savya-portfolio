// import * as THREE from "three";
// import crystalfragment from './shaders/crystalfragment.glsl';
// import crystalvertex from './shaders/crystalvertex.glsl';

// // Wait for DOM to be fully parsed and all resources loaded
// window.addEventListener("DOMContentLoaded", () => {
//     // Get canvas and check if it exists in the document
//     const canvas = document.getElementById("canvas");
//     if (!canvas) {
//         console.error("No canvas with id 'canvas' found!");
//         return;
//     }

//     // Setup renderer with found canvas
//     const renderer = new THREE.WebGLRenderer({
//         canvas: canvas,
//         alpha: true,
//         antialias: true,
//     });

//     // renderer.setClearColor(0x000000, 0); // transparent background
//     renderer.setSize(window.innerWidth, window.innerHeight);

//     // Create scene and camera
//     const scene = new THREE.Scene();

//     const camera = new THREE.PerspectiveCamera(
//         75,
//         window.innerWidth / window.innerHeight,
//         0.1,
//         1000
//     );
//     camera.position.z = 500;

//     // Store mesh planes if needed
//     const planes = [];

//     // Now that DOM is ready, find all images
//     const images = document.querySelectorAll("img");
//     if (images.length === 0) {

//         const geometry = new THREE.PlaneGeometry(100, 100);
//         const material = new THREE.ShaderMaterial({
//             side: THREE.DoubleSide,
//             vertexShader: crystalvertex,
//             fragmentShader: crystalfragment,
//         });
//         const plane = new THREE.Mesh(geometry, material);
//         scene.add(plane);
//         planes.push(plane);
//     } else {
//         images.forEach((image) => {
//             if (!image.complete) {
//                 image.addEventListener('load', () => addImagePlane(image));
//             } else {
//                 addImagePlane(image);
//             }
//         });
//     }

//     // Handle window resize
//     window.addEventListener('resize', () => {
//         camera.aspect = window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(window.innerWidth, window.innerHeight);
//     });

//     function animate() {
//         requestAnimationFrame(animate);
//         renderer.render(scene, camera);
//     }

//     animate();
// });






const projects = document.querySelectorAll('.project');
const overlay = document.querySelector('.overlay');


projects.forEach((project) => {
    project.addEventListener('mouseover', () => {
        overlay.style.display = 'block';
    });
    project.addEventListener('mouseout', () => {
        overlay.style.display = 'none';
    });
});

