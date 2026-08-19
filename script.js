// QUICK EDIT ---------------------------------------------------------------
const PROJECT = {
  twitterUrl: "https://x.com/",
  pumpUrl: "https://pump.fun/coin/",
  contractAddress: "contract address"
};
// --------------------------------------------------------------------------

const ASSET = "assets/";
const portal = document.querySelector("#portal");
const site = document.querySelector("#site");
const audio = document.querySelector("#backgroundAudio");
const video = document.querySelector("#backgroundVideo");
const soundButton = document.querySelector("#soundButton");
const contractButton = document.querySelector("#contractButton");

document.querySelector("#twitterButton").href = PROJECT.twitterUrl;
document.querySelector("#pumpButton").href = PROJECT.pumpUrl;

function makeGifBars() {
  document.querySelectorAll(".gifbar").forEach((bar) => {
    const fragment = document.createDocumentFragment();
    for (let repeat = 0; repeat < 2; repeat += 1) {
      for (let i = 1; i <= 14; i += 1) {
        const img = document.createElement("img");
        img.src = `${ASSET}gifbar/${i}.gif`;
        img.alt = "";
        img.loading = "eager";
        fragment.appendChild(img);
      }
    }
    bar.appendChild(fragment);
  });
}

function addSprite(layer, file, className, options = {}) {
  const img = document.createElement("img");
  img.src = `${ASSET}${file}`;
  img.alt = "";
  img.className = `chaos-sprite ${className}`;
  img.style.left = options.left ?? `${Math.random() * 78}%`;
  img.style.top = options.top ?? `${Math.random() * 78}%`;
  img.style.setProperty("--left", options.left ?? `${Math.random() * 90}%`);
  img.style.setProperty("--speed", options.speed ?? `${2.5 + Math.random() * 6}s`);
  img.style.animationDelay = `${Math.random() * -5}s`;
  layer.appendChild(img);
}

function makeChaosLayers() {
  const hemanLayer = document.querySelector("#hemanLayer");
  const stormLayer = document.querySelector("#stormLayer");
  const moneyLayer = document.querySelector("#moneyLayer");

  for (let i = 1; i <= 4; i += 1) {
    addSprite(hemanLayer, `heman${i}.gif`, "heman-sprite", {
      left: `${8 + ((i - 1) * 23)}%`,
      top: `${10 + ((i % 2) * 48)}%`,
      speed: `${3 + i * .7}s`
    });
  }

  ["thunder1.gif", "thunder2.gif", "storm.gif", "thunder1.gif", "storm.gif"].forEach((file) => {
    addSprite(stormLayer, file, "storm-sprite");
  });

  ["7%", "36%", "68%"].forEach((left, index) => {
    addSprite(moneyLayer, "money.gif", "money-sprite", { left, top: "-10%", speed: `${4 + index}s` });
  });
}

function makeMemeGallery() {
  const grid = document.querySelector("#memeGrid");
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= 56; i += 1) {
    const card = document.createElement("div");
    card.className = "meme-card";
    card.style.setProperty("--tilt", `${(Math.random() * 6 - 3).toFixed(2)}deg`);
    card.style.setProperty("--speed", `${1.2 + Math.random() * 3}s`);
    card.dataset.index = String(i - 1);
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.src = `${ASSET}memes/${i}.jpg`;
    img.alt = `HIGHER meme ${i}`;
    img.loading = i < 10 ? "eager" : "lazy";
    img.decoding = "async";
    card.appendChild(img);
    fragment.appendChild(card);
  }
  grid.appendChild(fragment);
}

const memeModal = document.querySelector("#memeModal");
const modalImage = document.querySelector("#modalImage");
const modalCounter = document.querySelector("#modalCounter");
let activeMeme = 0;

function showMeme(index) {
  activeMeme = (index + 56) % 56;
  modalImage.src = `${ASSET}memes/${activeMeme + 1}.jpg`;
  modalImage.alt = `HIGHER meme ${activeMeme + 1}`;
  modalCounter.textContent = `${activeMeme + 1} / 56`;
}

function openMeme(index) {
  showMeme(index);
  memeModal.classList.add("open");
  memeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector("#modalClose").focus();
}

function closeMeme() {
  memeModal.classList.remove("open");
  memeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelector("#memeGrid").addEventListener("click", (event) => {
  const card = event.target.closest(".meme-card");
  if (card) openMeme(Number(card.dataset.index));
});

document.querySelector("#memeGrid").addEventListener("keydown", (event) => {
  const card = event.target.closest(".meme-card");
  if (card && (event.key === "Enter" || event.key === " ")) openMeme(Number(card.dataset.index));
});

document.querySelector("#modalClose").addEventListener("click", closeMeme);
document.querySelector("#modalPrev").addEventListener("click", () => showMeme(activeMeme - 1));
document.querySelector("#modalNext").addEventListener("click", () => showMeme(activeMeme + 1));
memeModal.addEventListener("click", (event) => { if (event.target === memeModal) closeMeme(); });

window.addEventListener("keydown", (event) => {
  if (!memeModal.classList.contains("open")) return;
  if (event.key === "ArrowLeft") showMeme(activeMeme - 1);
  if (event.key === "ArrowRight") showMeme(activeMeme + 1);
  if (event.key === "Escape") closeMeme();
});

async function startMedia() {
  video.currentTime = 0;
  audio.currentTime = 0;
  audio.volume = 0.72;
  await Promise.allSettled([video.play(), audio.play()]);
}

function enterSite() {
  if (site.classList.contains("live")) return;
  portal.classList.add("exit");
  site.classList.add("live");
  site.setAttribute("aria-hidden", "false");
  startMedia();
  setTimeout(() => portal.remove(), 850);
}

portal.addEventListener("click", enterSite);
portal.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") enterSite();
});

soundButton.addEventListener("click", async () => {
  if (audio.paused) {
    await audio.play();
    soundButton.textContent = "SOUND: ON";
  } else {
    audio.pause();
    soundButton.textContent = "SOUND: OFF";
  }
});

contractButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(PROJECT.contractAddress);
    contractButton.textContent = "COPIED!!!";
  } catch {
    contractButton.textContent = PROJECT.contractAddress;
  }
  setTimeout(() => { contractButton.textContent = "COPY CONTRACT"; }, 1600);
});

window.addEventListener("click", (event) => {
  if (!site.classList.contains("live") || event.target.closest("button, a")) return;
  document.documentElement.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`;
  setTimeout(() => { document.documentElement.style.filter = ""; }, 130);
});

makeGifBars();
makeChaosLayers();
makeMemeGallery();

const hemanCursor = document.createElement("img");

hemanCursor.src = "assets/heman3.gif";
hemanCursor.className = "heman-cursor";

document.body.appendChild(hemanCursor);

window.addEventListener("pointermove", (event) => {
  hemanCursor.style.left = `${event.clientX}px`;
  hemanCursor.style.top = `${event.clientY}px`;
});

