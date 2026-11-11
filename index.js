
import * as THREE from "three";

/* =========================================
   ALBERTO CLOCKS — LUXURY 3D WATCH STUDIO
   Realistic materials, glass, dial and straps
========================================= */

const GOLD = 0xd0a04b;
const PALE_GOLD = 0xf4d58a;
const STEEL = 0xc6cbd0;
const DARK = 0x080a0e;

const activeScenes = [];

function physical(color, metalness = 0, roughness = 0.35, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    ...extra
  });
}

function makeBox(parent, width, height, depth, material, x, y, z, radius = 0) {
  let geometry;

  if (radius > 0) {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(radius, w, h);

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: Math.min(depth * 0.15, r * 0.2),
      bevelThickness: Math.min(depth * 0.15, r * 0.2),
      curveSegments: 8
    });
    geometry.translate(0, 0, -depth / 2);
  } else {
    geometry = new THREE.BoxGeometry(width, height, depth);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeCylinder(parent, radius, depth, material, x, y, z, segments = 96) {
  const geometry = new THREE.CylinderGeometry(
    radius, radius, depth, segments
  );
  geometry.rotateX(Math.PI / 2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeRing(parent, radius, tube, material, x = 0, y = 0, z = 0) {
  const geometry = new THREE.TorusGeometry(radius, tube, 12, 120);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function buildWatch(options = {}) {
  const {
    metal = "gold",
    dialColor = 0x10141b,
    strapColor = 0x21150f,
    strapStyle = "leather",
    accentColor = 0xe9c477
  } = options;

  const watch = new THREE.Group();

  const caseColor = metal === "silver" ? STEEL : GOLD;
  const caseMaterial = physical(caseColor, 0.92, 0.23);
  const polishedGold = physical(PALE_GOLD, 0.95, 0.16);
  const darkMetal = physical(0x252932, 0.85, 0.25);
  const dialMaterial = physical(dialColor, 0.25, 0.22);
  const strapMaterial = physical(strapColor, 0.05, 0.55);
  const accentMaterial = physical(accentColor, 0.85, 0.2);
  const handMaterial = physical(0xf4ead1, 0.75, 0.2);

  // Strap: upper and lower sections, with stitched details.
  const strapWidth = 0.56;
  const strapDepth = 0.18;

  makeBox(
    watch, strapWidth, 1.05, strapDepth,
    strapMaterial, 0, 1.12, -0.04, 0.10
  );

  makeBox(
    watch, strapWidth, 1.05, strapDepth,
    strapMaterial, 0, -1.12, -0.04, 0.10
  );

  // Strap edges and decorative stitch-like marks.
  const stitchMaterial = physical(0xc4a16b, 0.18, 0.65);

  for (const side of [-1, 1]) {
    for (let section = 0; section < 2; section++) {
      const centerY = section === 0 ? 1.12 : -1.12;
      for (let i = 0; i < 12; i++) {
        const y = centerY + (i - 5.5) * 0.075;
        makeBox(
          watch, 0.018, 0.035, 0.008,
          stitchMaterial, side * 0.205, y, 0.055
        );
      }
    }
  }

  // Metal lugs joining the case to the strap.
  for (const y of [-0.70, 0.70]) {
    for (const x of [-0.23, 0.23]) {
      makeBox(
        watch, 0.13, 0.34, 0.18,
        caseMaterial, x, y, -0.02, 0.035
      );
    }
  }

  // Main watch case and polished bezel.
  makeCylinder(watch, 0.91, 0.24, darkMetal, 0, 0, 0);
  makeCylinder(watch, 0.89, 0.23, caseMaterial, 0, 0, 0.035);
  makeRing(watch, 0.84, 0.055, polishedGold, 0, 0, 0.15);
  makeCylinder(watch, 0.80, 0.045, darkMetal, 0, 0, 0.14);
  makeCylinder(watch, 0.775, 0.035, dialMaterial, 0, 0, 0.17);

  // Bezel minute marks.
  const bezelMarkMaterial = physical(0xffe7aa, 0.9, 0.2);
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const radius = major ? 0.755 : 0.775;

    const mark = makeBox(
      watch,
      major ? 0.022 : 0.009,
      major ? 0.075 : 0.035,
      0.008,
      bezelMarkMaterial,
      Math.sin(angle) * radius,
      Math.cos(angle) * radius,
      0.205,
      0.003
    );
    mark.rotation.z = -angle;
  }

  // Inner chapter ring.
  makeRing(
    watch, 0.69, 0.008,
    physical(0x9c7b3c, 0.75, 0.3),
    0, 0, 0.205
  );

  // Hour markers and raised applied indices.
  const indexMaterial = physical(0xffe7ae, 0.85, 0.18);
  const markerDark = physical(0x77716a, 0.7, 0.28);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 0.635;
    const isMain = i % 3 === 0;

    const marker = makeBox(
      watch,
      isMain ? 0.055 : 0.028,
      isMain ? 0.115 : 0.075,
      0.018,
      indexMaterial,
      Math.sin(angle) * radius,
      Math.cos(angle) * radius,
      0.23,
      0.008
    );
    marker.rotation.z = -angle;

    // A small dark inset gives the indices more depth.
    if (isMain) {
      makeBox(
        watch, 0.012, 0.055, 0.006,
        markerDark,
        Math.sin(angle) * radius,
        Math.cos(angle) * radius,
        0.244,
        0.003
      ).rotation.z = -angle;
    }
  }

  // Small minute graduations on the dial.
  const minuteMaterial = physical(0xb4a78e, 0.45, 0.35);
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;

    const angle = (i / 60) * Math.PI * 2;
    makeBox(
      watch, 0.009, 0.028, 0.006,
      minuteMaterial,
      Math.sin(angle) * 0.70,
      Math.cos(angle) * 0.70,
      0.215
    ).rotation.z = -angle;
  }

  // Brand name, rendered as a small texture.
  const brandCanvas = document.createElement("canvas");
  brandCanvas.width = 512;
  brandCanvas.height = 128;
  const ctx = brandCanvas.getContext("2d");

  ctx.clearRect(0, 0, 512, 128);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e9c477";
  ctx.font = "600 46px Georgia";
  ctx.fillText("ALBERTO", 256, 55);
  ctx.fillStyle = "#c7b58d";
  ctx.font = "18px Arial";
  ctx.fillText("C L O C K S", 256, 88);

  const brandTexture = new THREE.CanvasTexture(brandCanvas);
  brandTexture.colorSpace = THREE.SRGBColorSpace;

  const brand = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.115),
    new THREE.MeshBasicMaterial({
      map: brandTexture,
      transparent: true,
      depthWrite: false
    })
  );
  brand.position.set(0, 0.31, 0.222);
  watch.add(brand);

  // Date window with a dark surround.
  makeBox(
    watch, 0.19, 0.12, 0.018,
    darkMetal, 0.37, -0.05, 0.225, 0.015
  );

  makeBox(
    watch, 0.15, 0.085, 0.012,
    physical(0xf0e9d7, 0.05, 0.45),
    0.37, -0.05, 0.24, 0.008
  );

  // Date number.
  const dateCanvas = document.createElement("canvas");
  dateCanvas.width = 128;
  dateCanvas.height = 80;
  const dateCtx = dateCanvas.getContext("2d");
  dateCtx.fillStyle = "#f4eddd";
  dateCtx.fillRect(0, 0, 128, 80);
  dateCtx.fillStyle = "#171717";
  dateCtx.font = "bold 43px Arial";
  dateCtx.textAlign = "center";
  dateCtx.textBaseline = "middle";
  dateCtx.fillText("24", 64, 40);

  const dateTexture = new THREE.CanvasTexture(dateCanvas);
  const date = new THREE.Mesh(
    new THREE.PlaneGeometry(0.13, 0.08),
    new THREE.MeshBasicMaterial({ map: dateTexture })
  );
  date.position.set(0.37, -0.05, 0.25);
  watch.add(date);

  // Central pivot.
  makeCylinder(
    watch, 0.065, 0.025,
    polishedGold, 0, 0, 0.27, 48
  );

  // Hands are separate pivots, so they can move like a real clock.
  function makeHand(width, length, depth, material, z, tail = 0.06) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0, z);
    watch.add(pivot);

    makeBox(
      pivot, width, length, depth,
      material, 0, length / 2 - tail, 0,
      width * 0.28
    );

    // Small counterweight.
    if (tail > 0.08) {
      makeBox(
        pivot, width * 1.2, tail * 0.5, depth,
        material, 0, -tail * 0.25, 0,
        width * 0.2
      );
    }

    return pivot;
  }

  const hourHand = makeHand(
    0.055, 0.37, 0.025, handMaterial, 0.29, 0.07
  );

  const minuteHand = makeHand(
    0.034, 0.53, 0.022, accentMaterial, 0.32, 0.07
  );

  const secondsHand = makeHand(
    0.012, 0.61, 0.012,
    physical(0xc83e35, 0.55, 0.22),
    0.35, 0.11
  );

  // Crown on the right side of the case.
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.19, 32),
    caseMaterial
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.94, 0, 0.015);
  crown.castShadow = true;
  watch.add(crown);

  for (let i = 0; i < 7; i++) {
    const x = 0.94 + (i - 3) * 0.018;
    makeBox(
      watch, 0.012, 0.16, 0.12,
      darkMetal, x, 0, 0.02
    );
  }

  // Upper pusher details.
  for (const y of [-0.28, 0.28]) {
    const pusher = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.14, 24),
      caseMaterial
    );
    pusher.rotation.z = Math.PI / 2;
    pusher.position.set(0.94, y, 0.01);
    watch.add(pusher);
  }

  // Sapphire crystal: subtle clear surface above the dial.
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.785, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xe9f3ff,
      metalness: 0,
      roughness: 0.08,
      transmission: 0.12,
      transparent: true,
      opacity: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      depthWrite: false
    })
  );
  glass.position.z = 0.255;
  watch.add(glass);

  // Soft simulated reflection on the crystal.
  const reflectionMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.075,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const reflection = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 1.05),
    reflectionMaterial
  );
  reflection.position.set(-0.25, 0.04, 0.26);
  reflection.rotation.z = 0.38;
  watch.add(reflection);

  // Rear buckle.
  makeBox(
    watch, 0.36, 0.22, 0.055,
    caseMaterial, 0, -1.72, -0.04, 0.035
  );

  makeBox(
    watch, 0.22, 0.11, 0.065,
    polishedGold, 0, -1.72, -0.01, 0.025
  );

  return { watch, hourHand, minuteHand, secondsHand };
}

function updateClockHands(model) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);

  const get = type => Number(
    parts.find(part => part.type === type)?.value ?? 0
  );

  const milliseconds = now.getMilliseconds();
  const seconds = get("second") + milliseconds / 1000;
  const minutes = get("minute") + seconds / 60;
  const hours = (get("hour") % 12) + minutes / 60;

  model.hourHand.rotation.z = -(hours / 12) * Math.PI * 2;
  model.minuteHand.rotation.z = -(minutes / 60) * Math.PI * 2;
  model.secondsHand.rotation.z = -(seconds / 60) * Math.PI * 2;
}

function createWatchScene(element, options = {}) {
  if (!element) return null;

  const width = element.clientWidth;
  const height = element.clientHeight;

  if (!width || !height) {
    console.warn("ALBERTO: Watch container needs a CSS height.", element);
    return null;
  }

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    36, width / height, 0.1, 100
  );
  camera.position.set(0, 0, 6.4);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  element.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", "Interactive 3D ALBERTO luxury watch");

  // Studio lighting: broad, soft-looking sources for metal highlights.
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));

  const keyLight = new THREE.DirectionalLight(0xffe2a5, 3.0);
  keyLight.position.set(-3, 4, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc4d8ff, 1.7);
  fillLight.position.set(4, 1, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffbd53, 2.2);
  rimLight.position.set(0, -3, -2);
  scene.add(rimLight);

  const topLight = new THREE.PointLight(0xffffff, 35, 15);
  topLight.position.set(1.5, 3, 4);
  scene.add(topLight);

  // Dark, glossy studio floor under the watch.
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 64),
    new THREE.MeshBasicMaterial({
      color: 0x5e4725,
      transparent: true,
      opacity: 0.10,
      depthWrite: false
    })
  );
  floor.position.set(0, -1.4, -0.9);
  scene.add(floor);

  const model = buildWatch(options);
  scene.add(model.watch);

  const isMini = element.classList.contains("mini-watch");
  const scale = isMini ? 0.76 : 1.0;
  model.watch.scale.setScalar(scale);
  model.watch.rotation.set(-0.08, -0.18, -0.08);

  let dragging = false;
  let moved = false;
  let previousX = 0;
  let previousY = 0;
  let targetRotationX = -0.08;
  let targetRotationY = -0.18;
  let targetZoom = 6.4;

  function pointerDown(event) {
    dragging = true;
    moved = false;
    previousX = event.clientX;
    previousY = event.clientY;

    element.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!dragging) return;

    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;

    if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;

    targetRotationY += dx * 0.009;
    targetRotationX += dy * 0.009;
    targetRotationX = THREE.MathUtils.clamp(
      targetRotationX, -1.0, 1.0
    );

    previousX = event.clientX;
    previousY = event.clientY;
  }

  function pointerUp() {
    dragging = false;
  }

  function wheel(event) {
    event.preventDefault();
    targetZoom += event.deltaY * 0.004;
    targetZoom = THREE.MathUtils.clamp(targetZoom, 4.2, 9.5);
  }

  element.addEventListener("pointerdown", pointerDown);
  element.addEventListener("pointermove", pointerMove);
  element.addEventListener("pointerup", pointerUp);
  element.addEventListener("pointercancel", pointerUp);
  element.addEventListener("wheel", wheel, { passive: false });

  // Resize correctly if the browser or card size changes.
  const resizeObserver = new ResizeObserver(() => {
    const w = element.clientWidth;
    const h = element.clientHeight;
    if (!w || !h) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(element);

  let animationId;
  let previousTime = 0;

  function animate(time = 0) {
    animationId = requestAnimationFrame(animate);

    const delta = Math.min((time - previousTime) / 1000 || 0, 0.05);
    previousTime = time;

    // Gentle idle motion, with mouse drag control.
    if (!dragging) {
      targetRotationY += delta * 0.12;
    }

    model.watch.rotation.x +=
      (targetRotationX - model.watch.rotation.x) * 0.08;

    model.watch.rotation.y +=
      (targetRotationY - model.watch.rotation.y) * 0.08;

    camera.position.z +=
      (targetZoom - camera.position.z) * 0.12;

    updateClockHands(model);
    renderer.render(scene, camera);
  }

  animate();

  const controller = {
    dispose() {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();

      element.removeEventListener("pointerdown", pointerDown);
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerup", pointerUp);
      element.removeEventListener("pointercancel", pointerUp);
      element.removeEventListener("wheel", wheel);

      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach(material => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });

      renderer.dispose();
    }
  };

  return controller;
}

/* =========================================
   START ALL FOUR WATCHES
========================================= */

function startAlbertoWatches() {
  // Avoid duplicate renderers if the script is reloaded.
  activeScenes.forEach(scene => scene.dispose());
  activeScenes.length = 0;

  const main = document.querySelector("#watch3d");
  const one = document.querySelector("#watch3d-one");
  const two = document.querySelector("#watch3d-two");
  const three = document.querySelector("#watch3d-three");

  const configs = [
    {
      element: main,
      options: {
        metal: "gold",
        dialColor: 0x10141b,
        strapColor: 0x24170e,
        strapStyle: "leather",
        accentColor: 0xf2cc79
      }
    },
    {
      element: one,
      options: {
        metal: "gold",
        dialColor: 0x101010,
        strapColor: 0x20130e,
        strapStyle: "leather",
        accentColor: 0xf3d38c
      }
    },
    {
      element: two,
      options: {
        metal: "silver",
        dialColor: 0x17222d,
        strapColor: 0x14171a,
        strapStyle: "leather",
        accentColor: 0xd4e2f3
      }
    },
    {
      element: three,
      options: {
        metal: "gold",
        dialColor: 0x26150d,
        strapColor: 0x4a2917,
        strapStyle: "leather",
        accentColor: 0xffd69b
      }
    }
  ];

  for (const config of configs) {
    if (!config.element) continue;

    const controller = createWatchScene(
      config.element,
      config.options
    );

    if (controller) activeScenes.push(controller);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAlbertoWatches, {
    once: true
  });
} else {
  startAlbertoWatches();
}
