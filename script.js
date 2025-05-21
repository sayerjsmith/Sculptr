// Setup scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls (camera rotate/pan)
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

// Grid Helper
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Transform Controls (move/scale/rotate)
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Objects array and selected object ref
const objects = [];
let selectedObject = null;

// Raycaster for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function createMaterial() {
  return new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.5, metalness: 0.3 });
}

function addShape(geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  mesh.position.set(0, 1, 0);
  scene.add(mesh);
  objects.push(mesh);
  selectObject(mesh);
}

function selectObject(object) {
  if(selectedObject) transformControls.detach(selectedObject);
  selectedObject = object;
  if(object) transformControls.attach(object);
}

// Button events
document.getElementById('addCube').onclick = () => addShape(new THREE.BoxGeometry(1, 1, 1));
document.getElementById('addSphere').onclick = () => addShape(new THREE.SphereGeometry(0.7, 32, 16));
document.getElementById('addCylinder').onclick = () => addShape(new THREE.CylinderGeometry(0.5, 0.5, 1, 32));
document.getElementById('deleteSelected').onclick = () => {
  if(selectedObject){
    scene.remove(selectedObject);
    objects.splice(objects.indexOf(selectedObject), 1);
    transformControls.detach(selectedObject);
    selectedObject = null;
  }
};
document.getElementById('resetCamera').onclick = () => {
  camera.position.set(5, 5, 8);
  orbitControls.target.set(0, 0, 0);
  orbitControls.update();
};

// Select object on click
window.addEventListener('pointerdown', (event) => {
  if(event.target !== renderer.domElement) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);

  if(intersects.length > 0){
    selectObject(intersects[0].object);
  } else {
    selectObject(null);
  }
});

// Disable orbit controls while transforming
transformControls.addEventListener('dragging-changed', function(event) {
  orbitControls.enabled = !event.value;
});

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();
  renderer.render(scene, camera);
}
animate();
