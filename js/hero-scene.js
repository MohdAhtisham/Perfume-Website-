const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeroScene(THREE, RoomEnvironment) {
  const canvas = document.getElementById('bottleCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  const hero = canvas.closest('.hero');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.5);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffe3b0, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb3ff, 1.1);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x404040, 0.6));

  /* bottle silhouette via lathe */
  const profile = [
    [0, 0], [0.72, 0], [0.74, 0.06], [0.78, 1.9], [0.7, 2.3], [0.42, 2.42],
    [0.4, 2.5], [0.18, 2.62], [0.18, 3.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const bottleGroup = new THREE.Group();

  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xcaa46a, transmission: 1, thickness: 0.6, roughness: 0.06,
      ior: 1.4, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    })
  );
  glass.position.y = -1.5;
  bottleGroup.add(glass);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.2, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xd4af6a, metalness: 0.9, roughness: 0.25 })
  );
  cap.position.y = 1.75;
  bottleGroup.add(cap);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.025, 16, 40),
    new THREE.MeshStandardMaterial({ color: 0xd4af6a, metalness: 0.9, roughness: 0.2 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.12;
  bottleGroup.add(ring);

  bottleGroup.scale.setScalar(1.35);
  bottleGroup.position.x = window.innerWidth < 900 ? 0 : 1.6;
  scene.add(bottleGroup);

  /* soft contact shadow */
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(bottleGroup.position.x, -2.05, 0);
  scene.add(shadow);

  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bottleGroup.position.x = w < 900 ? 0 : 1.6;
    shadow.position.x = bottleGroup.position.x;
  }
  resize();
  window.addEventListener('resize', resize);

  /* pointer interaction: drag to spin, hover to tilt */
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let targetTiltX = 0;
  let targetTiltZ = 0;

  const onPointerDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetTiltX = ny * 0.25;
    targetTiltZ = -nx * 0.18;
    if (dragging) {
      const dx = e.clientX - lastX;
      velocity += dx * 0.006;
      lastX = e.clientX;
    }
  };
  const onPointerUp = (e) => {
    dragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp);

  let autoRotate = !prefersReducedMotion;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (autoRotate && !dragging) velocity += dt * 0.12;
    velocity *= 0.94;
    bottleGroup.rotation.y += velocity;

    bottleGroup.rotation.x += (targetTiltX - bottleGroup.rotation.x) * 0.06;
    bottleGroup.rotation.z += (targetTiltZ - bottleGroup.rotation.z) * 0.06;

    renderer.render(scene, camera);
  }
  animate();

  canvas.classList.add('is-ready');
}

async function boot() {
  const fallback = document.getElementById('heroFallback');
  if (!('WebGLRenderingContext' in window)) {
    fallback.style.display = 'block';
    return;
  }
  try {
    const [THREE, { RoomEnvironment }] = await Promise.all([
      import('three'),
      import('three/addons/environments/RoomEnvironment.js'),
    ]);
    initHeroScene(THREE, RoomEnvironment);
  } catch (err) {
    fallback.style.display = 'block';
  }
}

boot();
