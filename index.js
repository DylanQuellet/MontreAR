// Initialisation de la scène Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Chargement du modèle 3D de la montre
let watchModel;
const loader = new THREE.GLTFLoader();
loader.load(
  'models/watch.glb',
  function (gltf) {
    watchModel = gltf.scene;
    watchModel.scale.set(0.1, 0.1, 0.1); // Ajustez l'échelle selon votre modèle
    scene.add(watchModel);
  },
  undefined,
  function (error) {
    console.error('Erreur lors du chargement du modèle :', error);
  }
);

// Position initiale de la caméra
camera.position.z = 2;

// Accès à la webcam
const videoElement = document.getElementById('video');
const cameraUtils = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
cameraUtils.start();

// Initialisation de MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});
hands.onResults(onResults);

// Fonction appelée à chaque détection
function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const wrist = landmarks[0];

  // Conversion des coordonnées normalisées en coordonnées de la scène
  const x = (wrist.x - 0.5) * 2;
  const y = -(wrist.y - 0.5) * 2;

  if (watchModel) {
    watchModel.position.set(x, y, 0);
  }
}

// Animation de la scène
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
