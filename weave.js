/* ============================================================
   FOKAL COMPANY — Hero "Woven Light"
   Port em vanilla JS do efeito de partículas Three.js,
   recolorido na paleta azul Fokal. Sem build, Three via CDN.
   ============================================================ */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const mount = document.getElementById("weave");

try {
  if (mount) initWeave(mount);
} catch (err) {
  // WebGL indisponível → degrada graciosamente (glow/grid do hero permanecem)
  console.warn("Weave hero desativado:", err);
}

function initWeave(mount) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = mount.clientWidth || window.innerWidth;
  let height = mount.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const mouse = new THREE.Vector2(0, 0);
  const clock = new THREE.Clock();

  // --- Densidade de partículas adaptativa ---
  const isSmall = width < 768;
  const particleCount = isSmall ? 16000 : 40000;

  const positions = new Float32Array(particleCount * 3);
  const originalPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  const geometry = new THREE.BufferGeometry();
  const knot = new THREE.TorusKnotGeometry(1.5, 0.5, 220, 32);
  const knotCount = knot.attributes.position.count;

  const color = new THREE.Color();
  for (let i = 0; i < particleCount; i++) {
    const vi = i % knotCount;
    const x = knot.attributes.position.getX(vi);
    const y = knot.attributes.position.getY(vi);
    const z = knot.attributes.position.getZ(vi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;

    // Paleta Fokal: azul (#0051C5 ≈ h.59) com brilhos ciano pontuais
    const sparkle = Math.random() > 0.93;
    const hue = sparkle ? 0.5 + Math.random() * 0.03 : 0.58 + Math.random() * 0.055;
    const sat = 0.85;
    const light = sparkle ? 0.74 : 0.4 + Math.random() * 0.2;
    color.setHSL(hue, sat, light);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.95,
  });

  const points = new THREE.Points(geometry, material);
  // Malha centralizada — envolve o título como um halo
  points.position.x = 0;
  scene.add(points);
  knot.dispose();

  // --- Interação com o mouse ---
  const onMove = (e) => {
    const r = mount.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  };
  window.addEventListener("mousemove", onMove, { passive: true });

  // Vetores reutilizados (evita alocação por frame)
  const mouseWorld = new THREE.Vector3();
  const cur = new THREE.Vector3();
  const orig = new THREE.Vector3();
  const vel = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const pos = geometry.attributes.position.array;

  const frame = () => {
    const t = clock.getElapsedTime();
    // Mouse mapeado para o espaço local da malha (compensa o deslocamento x)
    mouseWorld.set(mouse.x * 3 - points.position.x, mouse.y * 3, 0);

    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      cur.set(pos[ix], pos[iy], pos[iz]);
      orig.set(originalPositions[ix], originalPositions[iy], originalPositions[iz]);
      vel.set(velocities[ix], velocities[iy], velocities[iz]);

      const dist = cur.distanceTo(mouseWorld);
      if (dist < 1.5) {
        const force = (1.5 - dist) * 0.01;
        dir.subVectors(cur, mouseWorld).normalize();
        vel.add(dir.multiplyScalar(force));
      }
      // Retorno à posição original + amortecimento
      dir.subVectors(orig, cur).multiplyScalar(0.001);
      vel.add(dir);
      vel.multiplyScalar(0.95);

      pos[ix] += vel.x; pos[iy] += vel.y; pos[iz] += vel.z;
      velocities[ix] = vel.x; velocities[iy] = vel.y; velocities[iz] = vel.z;
    }

    geometry.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.05;
    renderer.render(scene, camera);
  };

  // --- Loop (pausa quando aba oculta; estático se reduced-motion) ---
  let raf = null;
  const loop = () => { frame(); raf = requestAnimationFrame(loop); };

  if (prefersReduced) {
    points.rotation.y = 0.5;
    renderer.render(scene, camera);
  } else {
    loop();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        loop();
      }
    });
  }

  // --- Resize ---
  const onResize = () => {
    width = mount.clientWidth || window.innerWidth;
    height = mount.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", onResize);
}
