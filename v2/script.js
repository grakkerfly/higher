// QUICK EDIT ---------------------------------------------------------------
const PROJECT = {
  twitterUrl: "https://x.com/",
  pumpUrl: "https://pump.fun/coin/",
  contractAddress: "contract address"
};
// --------------------------------------------------------------------------

const ASSET = "../assets/";
const portal = document.querySelector("#portal");
const site = document.querySelector("#site");
const audio = document.querySelector("#backgroundAudio");
const video = document.querySelector("#backgroundVideo");
const soundButton = document.querySelector("#soundButton");
const contractButton = document.querySelector("#contractButton");

document.querySelector("#twitterButton").href = PROJECT.twitterUrl;


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

let memeMedia = [];
// On a custom domain, fill owner/repo/path. Standard github.io URLs are detected.
const GITHUB_MEMES = { owner: '', repo: '', path: '', branch: '' };
async function loadMemeMedia() {
  const grid = document.querySelector('#memeGrid');
  grid.textContent = 'Loading memes...';
  try {
    const githubHost = location.hostname.endsWith('.github.io');
    const owner = GITHUB_MEMES.owner || (githubHost ? location.hostname.split('.')[0] : '');
    const segments = location.pathname.split('/').filter(Boolean);
    const repo = GITHUB_MEMES.repo || (githubHost ? (segments[0] && !segments[0].includes('.') ? segments[0] : owner + '.github.io') : '');
    if (!owner || !repo) throw new Error('Set GITHUB_MEMES owner and repo in script.js for local preview or a custom domain.');
    const mediaURL = new URL(ASSET + 'memes/', location.href);
    let folder = decodeURIComponent(mediaURL.pathname).replace(/^\/+|\/+$/g, '');
    if (folder.startsWith(repo + '/')) folder = folder.slice(repo.length + 1);
    folder = GITHUB_MEMES.path || folder;
    const endpoint = 'https://api.github.com/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo) + '/contents/' + folder.split('/').map(encodeURIComponent).join('/') + (GITHUB_MEMES.branch ? '?ref=' + encodeURIComponent(GITHUB_MEMES.branch) : '');
    const response = await fetch(endpoint, {headers:{Accept:'application/vnd.github+json'}});
    if (!response.ok) throw new Error('GitHub returned ' + response.status + '. Check repository, folder and API rate limit.');
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('The configured path is not a folder.');
    const image = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;
    const movie = /\.(mp4|webm|ogv|mov)$/i;
    memeMedia = entries.filter(item => item.type === 'file' && (image.test(item.name) || movie.test(item.name)))
      .sort((a,b) => a.name.localeCompare(b.name, 'en', {numeric:true}))
      .map(item => ({file:item.name, type:movie.test(item.name) ? 'video' : 'image', url:item.download_url}));
    grid.textContent = '';
    makeMemeGallery();
  } catch (error) {
    grid.textContent = 'Could not load memes. Please try again later.';
    console.error('Meme gallery:', error.message);
  }
}
function mediaElement(item, preview = false) {
  const element = document.createElement(item.type === 'video' ? 'video' : 'img');
  element.src = item.url || ASSET + 'memes/' + encodeURIComponent(item.file);
  if (item.type === 'video') {
    element.controls = !preview; element.muted = preview;
    element.playsInline = true; element.preload = 'metadata';
  } else { element.alt = item.file; element.loading = 'lazy'; element.decoding = 'async'; }
  return element;
}
function makeMemeGallery() {
  const grid = document.querySelector('#memeGrid');
  memeMedia.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'meme-card'; card.dataset.index = index;
    card.tabIndex = 0; card.setAttribute('role','button');
    card.setAttribute('aria-label','Open ' + item.file);
    card.appendChild(mediaElement(item, true));
    if (item.type === 'video') {
      const badge = document.createElement('span'); badge.className = 'video-badge';
      badge.textContent = '▶ VIDEO'; card.appendChild(badge);
    }
    grid.appendChild(card);
  });
  if (!memeMedia.length) grid.textContent = 'No memes yet.';
}
const memeModal = document.querySelector('#memeModal');
let modalImage = document.querySelector('#modalImage');
const modalCounter = document.querySelector('#modalCounter');
let activeMeme = 0;
function showMeme(index) {
  if (!memeMedia.length) return;
  activeMeme = (index + memeMedia.length) % memeMedia.length;
  const next = mediaElement(memeMedia[activeMeme]); next.id = 'modalImage';
  if (modalImage.tagName === 'VIDEO') modalImage.pause();
  modalImage.replaceWith(next); modalImage = next;
  modalCounter.textContent = (activeMeme + 1) + ' / ' + memeMedia.length;
}
function openMeme(index) {
  showMeme(index);
  memeModal.classList.add("open");
  memeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector("#modalClose").focus();
}

function closeMeme() {
  if (modalImage.tagName === 'VIDEO') modalImage.pause();
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
    soundButton.textContent = "SOUND ON";
  } else {
    audio.pause();
    soundButton.textContent = "SOUND OFF";
  }
});

contractButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(PROJECT.contractAddress);
    contractButton.textContent = "COPIED!!!";
  } catch {
    contractButton.textContent = PROJECT.contractAddress;
  }
  setTimeout(() => { contractButton.textContent = "COPY CA"; }, 1600);
});

window.addEventListener("click", (event) => {
  if (!site.classList.contains("live") || event.target.closest("button, a")) return;
  document.documentElement.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`;
  setTimeout(() => { document.documentElement.style.filter = ""; }, 130);
});

makeGifBars();

loadMemeMedia();

const hemanCursor = document.createElement("img");

hemanCursor.src = "../assets/heman3.gif";
hemanCursor.className = "heman-cursor";

document.body.appendChild(hemanCursor);

window.addEventListener("pointermove", (event) => {
  hemanCursor.style.left = `${event.clientX}px`;
  hemanCursor.style.top = `${event.clientY}px`;
});




// Animate in viewport coordinates so sprites never hit a hero/container boundary.
const flyingLayer = document.createElement('div');
flyingLayer.className = 'flying-hemen';
flyingLayer.setAttribute('aria-hidden', 'true');
document.body.appendChild(flyingLayer);
const flyers = Array.from({ length: 4 }, (_, i) => {
  const img = document.createElement('img');
  img.src = ASSET + 'heman' + (i + 1) + '.gif';
  img.alt = ''; img.className = 'flying-heman';
  flyingLayer.appendChild(img);
  return { img, phase: i * Math.PI / 2, speed: .00012 + i * .000025, rotation: (i % 2 ? -1 : 1) * (.018 + i * .004) };
});
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let flyingFrame;
function flyHeMen(time) {
  if (!motionPreference.matches && site.classList.contains('live') && !document.hidden) {
    const width = innerWidth, height = innerHeight;
    flyers.forEach(({ img, phase, speed, rotation }) => {
      const size = img.offsetWidth;
      const x = (width - size) * (.5 + .5 * Math.sin(time * speed + phase));
      const y = (height - size) * (.5 + .5 * Math.sin(time * speed * 1.37 + phase + .8));
      img.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (time * rotation + phase * 60) + 'deg)';
    });
    flyingLayer.hidden = false;
  } else flyingLayer.hidden = true;
  flyingFrame = requestAnimationFrame(flyHeMen);
}
flyingFrame = requestAnimationFrame(flyHeMen);




