const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x444444));

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

let selectedObject = null;
const objects = [];

function createMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
    roughness: 0.4,
    metalness: 0.2
  });
}

function addShape(geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  mesh.position.set(0, 1, 0);
  mesh.userData.rotate = true;
  scene.add(mesh);
  objects.push(mesh);
  selectObject(mesh);
}

function selectObject(obj) {
  if (selectedObject) transformControls.detach(selectedObject);
  selectedObject = obj;
  if (obj) transformControls.attach(obj);
}

document.getElementById('addCube').onclick = () => addShape(new THREE.BoxGeometry(1, 1, 1));
document.getElementById('addSphere').onclick = () => addShape(new THREE.SphereGeometry(0.6, 32, 16));
document.getElementById('addCylinder').onclick = () => addShape(new THREE.CylinderGeometry(0.5, 0.5, 1, 32));

document.getElementById('deleteSelected').onclick = () => {
  if (selectedObject) {
    scene.remove(selectedObject);
    objects.splice(objects.indexOf(selectedObject), 1);
    transformControls.detach(selectedObject);
    selectedObject = null;
  }
};

document.getElementById('resetCamera').onclick = () => {
  camera.position.set(5, 5, 10);
  orbitControls.target.set(0, 0, 0);
  orbitControls.update();
};

document.getElementById('export').onclick = () => {
  const exporter = new THREE.GLTFExporter();
  exporter.parse(
    scene,
    result => {
      const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'scene.glb';
      link.click();
    },
    { binary: false }
  );
};

window.addEventListener('pointerdown', (event) => {
  if (event.target !== renderer.domElement) return;
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    selectObject(intersects[0].object);
  } else {
    selectObject(null);
  }
});

transformControls.addEventListener('dragging-changed', e => {
  orbitControls.enabled = !e.value;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();

  for (let obj of objects) {
    if (obj.userData.rotate) {
      obj.rotation.y += 0.003;
    }
  }

  renderer.render(scene, camera);
}
animate();
