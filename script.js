var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 10e-3, 1e6);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;

var planetData = [
  // mercury
  {radius: 1, color: 0x858386, orbitalRadius: 0.5, orbitalPeriod: 0.5},
  // venus
  {radius: 1.9, color: 0xDBD8D3, orbitalRadius: 0.725, orbitalPeriod: 0.750},
  // earth
  {radius: 2, color: 0x00AAE4, orbitalRadius: 1, orbitalPeriod: 1},
  // mars
  {radius: 0.532, color: 0xE13B00, orbitalRadius: 1.5, orbitalPeriod: 1.881},
  // jupiter
  {radius: 3, color: 0xBFAF98, orbitalRadius: 2, orbitalPeriod: 5},
  // saturn
  {radius: 2.5, color: 0xD4AB77, orbitalRadius: 2.5, orbitalPeriod: 15},
  // uranus
  {radius: 1.4, color: 0xC3E9EC, orbitalRadius: 3, orbitalPeriod: 30},
  // neptune
  {radius: 1.3, color: 0x364ED2, orbitalRadius: 3.5, orbitalPeriod: 60},
];

// lighting
scene.add(new THREE.AmbientLight(0xcccccc));
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// sun
var sunGeometry = new THREE.SphereGeometry(25, 64, 64);
var sunMaterial = new THREE.MeshPhongMaterial({color: 0xffff00});
var sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

sunMesh.add(camera);
camera.position.z = 1000;

var TRAIL_MAX_POINTS = 10000;
var drawCount = 0;

// planets and trails
var planetMeshes = [];
var trails = [];
planetData.forEach(function(data) {
  var planetGeometry = new THREE.SphereGeometry(5 * data.radius, 64, 64);
  var planetMaterial = new THREE.MeshPhongMaterial({color: data.color});
  var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  planetMeshes.push(planetMesh);
  scene.add(planetMesh);
  
  var trailGeometry = new THREE.BufferGeometry();
  var trailPositions = new Float32Array(TRAIL_MAX_POINTS * 3);
  trailGeometry.addAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
  var trailMaterial = new THREE.LineBasicMaterial({color: data.color, linewidth: 1.2});
  var trail = new THREE.Line(trailGeometry, trailMaterial);
  trails.push(trail);
  scene.add(trail);
});

// rendering
var lastRender;

function render(t) {
  var dt = (lastRender !== undefined) ? (t - lastRender) / 1000 : 0;
  lastRender = t;
  
  renderer.render(scene, camera);
  
  sunMesh.position.x += 400 * dt;
  
  planetMeshes.forEach(function(planetMesh, i) {
    var data = planetData[i];
    planetMesh.position.x = sunMesh.position.x + 150 * data.orbitalRadius * Math.cos(60 * Math.PI / 180) * Math.sin(t / (100 * data.orbitalPeriod));
    planetMesh.position.y = sunMesh.position.y + 150 * data.orbitalRadius * Math.sin(60 * Math.PI / 180) * Math.sin(t / (100 * data.orbitalPeriod));
    planetMesh.position.z = sunMesh.position.z + 150 * data.orbitalRadius * Math.cos(t / (100 * data.orbitalPeriod));
    
    var positions = trails[i].geometry.attributes.position.array;
    
    if (drawCount === TRAIL_MAX_POINTS) {
      for (var j = 0; j < 3 * TRAIL_MAX_POINTS - 3; j++) {
        positions[j] = positions[j + 3];
      }
    }
    
    var point = 3 * Math.min(TRAIL_MAX_POINTS - 1, drawCount);
    positions[point + 0] = planetMesh.position.x;
    positions[point + 1] = planetMesh.position.y;
    positions[point + 2] = planetMesh.position.z;
    
    trails[i].geometry.setDrawRange(0, drawCount);
    trails[i].geometry.attributes.position.needsUpdate = true;
    trails[i].geometry.computeBoundingSphere();
  });

  drawCount = Math.min(TRAIL_MAX_POINTS, ++drawCount);
  
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
