// ===== Utility =====
function bringToFront(el) {
  const windows = document.querySelectorAll(".window");
  let maxZ = 10;
  windows.forEach((w) => {
    const z = parseInt(window.getComputedStyle(w).zIndex || "10", 10);
    if (z > maxZ) maxZ = z;
  });
  el.style.zIndex = maxZ + 1;
}

// ===== Clock =====
function updateClock() {
  const clockEl = document.getElementById("taskbar-clock");
  if (!clockEl) return;

  const now = new Date();

  // Show only time (no date)
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Date only for tooltip on hover
  const date = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  clockEl.textContent = time;
  clockEl.title = date; // hover tooltip [web:134]
}
setInterval(updateClock, 1000);
updateClock();

// ===== Elements =====
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const startupSound = document.getElementById("startup-sound");
const shutdownOverlay = document.getElementById("shutdown-overlay");
const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const loginNameInput = document.getElementById("login-name");
const loginError = document.getElementById("login-error");

// ===== Create shutdown audio =====
const shutdownSound = document.createElement("audio");
shutdownSound.id = "shutdown-sound-new";
shutdownSound.src = "shutdown.mp3"; // your uploaded file [file:78]
shutdownSound.preload = "auto";
document.body.appendChild(shutdownSound);

// ===== Start menu =====
if (startButton && startMenu) {
  startButton.onclick = () => startMenu.classList.toggle("active");
  document.addEventListener("click", (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target))
      startMenu.classList.remove("active");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && startMenu.classList.contains("active"))
      startMenu.classList.remove("active");
  });
}

// ===== Windows =====
function openWindow(name) {
  const win = document.getElementById(`window-${name}`);
  if (!win) return;
  win.classList.add("active");
  bringToFront(win);
}

function closeWindow(name) {
  const win = document.getElementById(`window-${name}`);
  if (!win) return;
  win.classList.remove("active");
}

// ===== Desktop icons =====
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  const target = icon.dataset.window;
  if (target) icon.onclick = () => openWindow(target);
});

// ===== Start menu icons (ALL WORK) =====
document
  .querySelectorAll(".start-left-item, .start-right-item")
  .forEach((item) => {
    const target = item.dataset.window;
    if (target)
      item.onclick = () => {
        startMenu.classList.remove("active");
        openWindow(target);
      };
  });

// ===== Window close =====
document.querySelectorAll(".window-close").forEach((btn) => {
  const target = btn.dataset.window;
  if (target) btn.onclick = () => closeWindow(target);
});

// ===== Drag windows =====
document.querySelectorAll(".window").forEach((win) => {
  const titlebar = win.querySelector(".window-titlebar");
  if (!titlebar) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("mousedown", (e) => {
    isDragging = true;
    bringToFront(win); // keep dragged window on top
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  win.addEventListener("mousedown", () => bringToFront(win));
});

// ===== SHUT DOWN (shutdown.mp3 + thank you) =====
function doShutdown() {
  startMenu?.classList.remove("active");

  // Play your shutdown.mp3 [file:78]
  shutdownSound.currentTime = 0;
  shutdownSound.play().catch(() => {});

  // Show "Thank you for visiting my portfolio" overlay
  if (shutdownOverlay) shutdownOverlay.classList.add("active");

  // Hide desktop/taskbar after 2s
  setTimeout(() => {
    const desktop = document.getElementById("desktop");
    const taskbar = document.getElementById("taskbar");
    if (desktop) desktop.style.display = "none";
    if (taskbar) taskbar.style.display = "none";
  }, 2000);
}

// ===== LOG OFF (black screen ONLY - no sound) =====
let logoffOverlay = document.getElementById("logoff-overlay");
if (!logoffOverlay) {
  logoffOverlay = document.createElement("div");
  logoffOverlay.id = "logoff-overlay";
  logoffOverlay.style.cssText =
    "position:fixed;inset:0;background:#000;display:none;z-index:9999;cursor:pointer;";
  document.body.appendChild(logoffOverlay);
}

function showLogoff() {
  startMenu?.classList.remove("active");
  logoffOverlay.style.display = "block";
}

// Click black screen = close overlay (no sound, no shutdown)
logoffOverlay.onclick = (e) => {
  e.stopPropagation();
  logoffOverlay.style.display = "none";
};

// ===== FOOTER BUTTONS (separate functions) =====
const startShutdownBtn = document.getElementById("start-shutdown");
if (startShutdownBtn) startShutdownBtn.onclick = doShutdown;

const startLogoffBtn = document.getElementById("start-logoff");
if (startLogoffBtn) startLogoffBtn.onclick = showLogoff;

// ===== Login =====
if (loginForm && loginScreen && loginNameInput) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const name = loginNameInput.value.trim();
    if (!name) {
      loginError.textContent = "Please enter your name to continue.";
      return;
    }
    loginError.textContent = "";
    const userLabel = document.getElementById("start-menu-username");
    if (userLabel) userLabel.textContent = name;
    if (startupSound) startupSound.play().catch(() => {});
    loginScreen.style.transition = "opacity 0.5s";
    loginScreen.style.opacity = "0";
    setTimeout(() => (loginScreen.style.display = "none"), 500);
  };
}
