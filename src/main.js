/**
 * SlamDoc - Main Controller
 * Orchestrates Basketball Physics, Audio Synthesis, Client-side Document Conversion,
 * Telemetry UI, Trophy Celebrations, and Locker Room History.
 */

import './style.css';
import confetti from 'canvas-confetti';
import { sounds } from './audio.js';
import {
  convertDocument,
  getAvailableTargets,
  getDefaultTarget,
  createSampleDocument
} from './converter.js';
import { BasketballArena } from './basketballEngine.js';
import { ICONS, getFormatLogo } from './icons.js';

// DOM Element References
const canvas = document.getElementById('court-canvas');
const hudPointsVal = document.getElementById('hud-points-val');
const hudStreakVal = document.getElementById('hud-streak-val');
const hudConvertedVal = document.getElementById('hud-converted-val');
const targetSelect = document.getElementById('target-format-select');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');
const lockerDrawerBtn = document.getElementById('locker-drawer-btn');
const lockerCountBadge = document.getElementById('locker-count-badge');
const announcerMessage = document.getElementById('announcer-message');

const telemetryBox = document.getElementById('telemetry-box');
const telemetryTitle = document.getElementById('telemetry-title');
const telemetryPct = document.getElementById('telemetry-pct');
const telemetryBarFill = document.getElementById('telemetry-bar-fill');
const telemetryStepText = document.getElementById('telemetry-step-text');

const fileDropZone = document.getElementById('file-drop-zone');
const fileInput = document.getElementById('file-input-element');
const fileCardIcon = document.getElementById('file-card-icon');
const fileCardTitle = document.getElementById('file-card-title');
const fileCardDesc = document.getElementById('file-card-desc');
const fileCardBadge = document.getElementById('file-card-badge');

const btnSlamDunk = document.getElementById('btn-slam-dunk');
const btnThreePointer = document.getElementById('btn-three-pointer');
const btnResetBall = document.getElementById('btn-reset-ball');
const aimAssistToggle = document.getElementById('aim-assist-toggle');

const samplePdfBtn = document.getElementById('sample-pdf-btn');
const sampleDocxBtn = document.getElementById('sample-docx-btn');
const sampleImgBtn = document.getElementById('sample-img-btn');

const trophyModal = document.getElementById('trophy-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const trophyHeadlineTitle = document.getElementById('trophy-headline-title');
const trophySubheadline = document.getElementById('trophy-subheadline');
const matchupSourcePill = document.getElementById('matchup-source-pill');
const matchupSourceName = document.getElementById('matchup-source-name');
const matchupSourceSize = document.getElementById('matchup-source-size');
const matchupTargetPill = document.getElementById('matchup-target-pill');
const matchupTargetName = document.getElementById('matchup-target-name');
const matchupTargetSize = document.getElementById('matchup-target-size');
const downloadConvertedLink = document.getElementById('download-converted-link');
const btnPreviewContent = document.getElementById('btn-preview-content');
const btnShootAgain = document.getElementById('btn-shoot-again');

const lockerDrawer = document.getElementById('locker-drawer');
const lockerDrawerBackdrop = document.getElementById('locker-drawer-backdrop');
const lockerCloseBtn = document.getElementById('locker-close-btn');
const lockerListContainer = document.getElementById('locker-list-container');

const previewModal = document.getElementById('preview-modal');
const previewCloseBtn = document.getElementById('preview-close-btn');
const previewTitle = document.getElementById('preview-title');
const previewBody = document.getElementById('preview-body');

// App State
let currentFile = null;
let currentTargetFormat = 'docx';
let isConverting = false;
let latestConvertedResult = null;
let totalPoints = 0;
let currentStreak = 0;
let totalConverted = 0;
let sessionHistory = [];

// Initialize Basketball Arena Physics Engine
const arena = new BasketballArena(canvas, {
  onShoot: ({ isDunk, power }) => {
    if (isDunk) {
      setAnnouncer('AIR SLAM — TAKE FLIGHT TO THE RIM!');
    } else {
      setAnnouncer(`SHOT RELEASED — POWER: ${Math.round(power)}%`);
    }
  },
  onRimHit: () => {
    setAnnouncer('OFF THE RIM — REBOUND!');
  },
  onMiss: () => {
    currentStreak = 0;
    updateScoreboard();
    setAnnouncer('MISSED SHOT — GRAB THE BALL &amp; SHOOT AGAIN!');
  },
  onSwish: async ({ isDunk, points }) => {
    handleSwishScore(isDunk, points);
  }
});

/**
 * Handle Scored Basket (Swish / Dunk)
 */
async function handleSwishScore(isDunk, points) {
  totalPoints += points;
  currentStreak += 1;
  updateScoreboard();

  // Announcer commentary
  if (isDunk) {
    setAnnouncer('BOOMSHAKALAKA! MONSTER SLAM DUNK!');
  } else if (currentStreak >= 3) {
    setAnnouncer(`HE&#39;S ON FIRE — ${currentStreak} SWISHES IN A ROW!`);
  } else {
    setAnnouncer('SWISH FROM DOWNTOWN — NOTHING BUT NET!');
  }

  // Fire celebratory confetti burst
  launchArenaConfetti();

  // Start conversion pipeline if file is loaded
  if (currentFile) {
    await runConversionProcess();
  } else {
    // If user scored without file loaded, show encouragement to load a file
    setTimeout(() => {
      setAnnouncer('GREAT SHOT! LOAD A FILE BELOW TO CONVERT ON YOUR NEXT BUCKET!');
    }, 1800);
  }
}

/**
 * Execute Document Conversion with Telemetry
 */
async function runConversionProcess() {
  if (isConverting) return;
  isConverting = true;

  // Show telemetry overlay
  telemetryBox.classList.add('active');
  telemetryTitle.textContent = `CONVERTING TO .${currentTargetFormat.toUpperCase()}`;
  updateTelemetry(5, 'Initializing browser conversion runtime...');

  try {
    const startTime = performance.now();
    const result = await convertDocument(currentFile, currentTargetFormat, (pct, status) => {
      updateTelemetry(pct, status);
    });

    const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
    latestConvertedResult = result;
    totalConverted += 1;
    updateScoreboard();

    // Add to history locker
    sessionHistory.unshift({
      id: Date.now(),
      originalName: currentFile.name,
      convertedName: result.filename,
      originalSize: currentFile.size,
      convertedSize: result.size,
      url: result.url,
      format: currentTargetFormat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    updateLockerUI();

    sounds.playChime();
    setAnnouncer(`CONVERSION COMPLETE IN ${elapsedSec}s — CLAIM YOUR TROPHY!`);

    setTimeout(() => {
      telemetryBox.classList.remove('active');
      openTrophyModal(result);
      isConverting = false;
    }, 700);

  } catch (err) {
    console.error('Conversion error:', err);
    updateTelemetry(100, `Error: ${err.message}`);
    setAnnouncer(`ERROR: ${err.message}`);
    isConverting = false;
    setTimeout(() => {
      telemetryBox.classList.remove('active');
    }, 2500);
  }
}

function updateTelemetry(pct, message) {
  telemetryPct.textContent = `${Math.min(pct, 100)}%`;
  telemetryBarFill.style.width = `${Math.min(pct, 100)}%`;
  telemetryStepText.textContent = message;
}

/**
 * File Loading & Target Handling
 */
function loadFile(file) {
  currentFile = file;
  const ext = file.name.split('.').pop().toLowerCase();
  currentTargetFormat = getDefaultTarget(file.name);

  // Update target options dropdown to match supported types
  const targets = getAvailableTargets(file.name);
  targetSelect.innerHTML = '';
  targets.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.label;
    if (t.id === currentTargetFormat) opt.selected = true;
    targetSelect.appendChild(opt);
  });

  // Stamp Document on the basketball
  const badge = ext.toUpperCase().slice(0, 4);
  const color = ext === 'pdf' ? '#ef4444' : (ext === 'docx' ? '#3b82f6' : '#ff5500');
  arena.setDocument(badge, file.name, color);

  // Update Drop Zone UI with real logo
  fileDropZone.classList.add('has-file');
  fileCardIcon.innerHTML = getFormatLogo(ext);
  fileCardTitle.textContent = file.name;
  fileCardDesc.textContent = `${formatBytes(file.size)} • Target: .${currentTargetFormat.toUpperCase()}`;
  fileCardBadge.style.display = 'inline-block';

  // Update format pills
  syncFormatPills(currentTargetFormat);

  sounds.playDribble(0.6);
  setAnnouncer(`${file.name.toUpperCase()} LOADED — SHOOT AT THE HOOP TO CONVERT!`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

/**
 * Format Pills Synchronization
 */
const formatPills = document.querySelectorAll('.format-choice-pill');

function syncFormatPills(format) {
  currentTargetFormat = format;
  formatPills.forEach(pill => {
    if (pill.dataset.format === format) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  if (targetSelect.value !== format) {
    targetSelect.value = format;
  }

  if (currentFile) {
    fileCardDesc.textContent = `${formatBytes(currentFile.size)} • Target: .${currentTargetFormat.toUpperCase()}`;
  }
}

formatPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const chosenFormat = pill.dataset.format;
    syncFormatPills(chosenFormat);
    sounds.playDribble(0.4);
    setAnnouncer(`TARGET CHANGED TO .${chosenFormat.toUpperCase()} — READY TO SHOOT!`);
  });
});

/**
 * Drop Zone & Input Events
 */
fileDropZone.addEventListener('click', () => {
  fileInput.click();
});

fileDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileDropZone.classList.add('dragover');
});

fileDropZone.addEventListener('dragleave', () => {
  fileDropZone.classList.remove('dragover');
});

fileDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  fileDropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    loadFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    loadFile(e.target.files[0]);
  }
});

// Target format dropdown selection change
targetSelect.addEventListener('change', (e) => {
  syncFormatPills(e.target.value);
  setAnnouncer(`TARGET CHANGED TO .${e.target.value.toUpperCase()} — READY TO SHOOT!`);
});

/**
 * Quick Action Buttons
 */
btnSlamDunk.addEventListener('click', () => {
  arena.triggerSlamDunk();
});

btnThreePointer.addEventListener('click', () => {
  arena.triggerThreePointer();
});

btnResetBall.addEventListener('click', () => {
  arena.resetBallPosition();
  sounds.playDribble(0.5);
  setAnnouncer('BALL RESET TO SHOOTING PAD — TAKE AIM!');
});

aimAssistToggle.addEventListener('change', (e) => {
  arena.aimAssist = e.target.checked;
  setAnnouncer(e.target.checked ? 'AIM ASSIST ENABLED (MAGNET SWISH)' : 'PRO RIM MODE (RAW REBOUNDS)');
});

/**
 * Built-in Sample Files
 */
samplePdfBtn.addEventListener('click', async () => {
  setAnnouncer('PREPARING OFFICIAL SAMPLE PLAYBOOK PDF...');
  const sample = await createSampleDocument('pdf');
  loadFile(sample);
});

sampleDocxBtn.addEventListener('click', async () => {
  setAnnouncer('PREPARING SAMPLE SCOUTING REPORT DOCX...');
  const sample = await createSampleDocument('docx');
  loadFile(sample);
});

sampleImgBtn.addEventListener('click', async () => {
  setAnnouncer('PREPARING SAMPLE TICKET IMAGE...');
  const sample = await createSampleDocument('image');
  loadFile(sample);
});

/**
 * Audio Controls
 */
soundToggleBtn.addEventListener('click', () => {
  const isMuted = sounds.toggleMute();
  if (isMuted) {
    soundIcon.innerHTML = ICONS.volumeOff;
    soundLabel.textContent = 'SOUND OFF';
    soundToggleBtn.classList.remove('active');
  } else {
    soundIcon.innerHTML = ICONS.volumeOn;
    soundLabel.textContent = 'SOUND ON';
    soundToggleBtn.classList.add('active');
    sounds.playWhistle();
  }
});

/**
 * Trophy Celebration Modal
 */
function openTrophyModal(result) {
  matchupSourcePill.textContent = currentFile.name.split('.').pop().toUpperCase();
  matchupSourceName.textContent = currentFile.name;
  matchupSourceSize.textContent = formatBytes(currentFile.size);

  matchupTargetPill.textContent = result.filename.split('.').pop().toUpperCase();
  matchupTargetName.textContent = result.filename;
  matchupTargetSize.textContent = formatBytes(result.size);

  downloadConvertedLink.href = result.url;
  downloadConvertedLink.download = result.filename;

  trophyModal.classList.add('open');
}

function closeTrophyModal() {
  trophyModal.classList.remove('open');
}

modalCloseBtn.addEventListener('click', closeTrophyModal);
btnShootAgain.addEventListener('click', () => {
  closeTrophyModal();
  arena.resetBallPosition();
  setAnnouncer('READY FOR NEXT SHOT — LOAD ANOTHER FILE OR SHOOT AGAIN!');
});

/**
 * Document Content Preview
 */
btnPreviewContent.addEventListener('click', async () => {
  if (!latestConvertedResult) return;
  closeTrophyModal();

  previewTitle.textContent = `Preview: ${latestConvertedResult.filename}`;
  previewBody.textContent = 'Loading converted file preview...';
  previewModal.classList.add('open');

  const ext = latestConvertedResult.filename.split('.').pop().toLowerCase();

  if (['txt', 'html', 'md'].includes(ext)) {
    const text = await latestConvertedResult.blob.text();
    previewBody.textContent = text.slice(0, 15000);
  } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
    previewBody.innerHTML = `<img src="${latestConvertedResult.url}" style="max-width: 100%; border-radius: 8px;" alt="Preview" />`;
  } else if (ext === 'pdf') {
    previewBody.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p style="margin-bottom: 12px; font-size: 14px; color: #94a3b8;">High-Resolution Vector PDF Ready</p>
        <iframe src="${latestConvertedResult.url}" style="width: 100%; height: 500px; border: 1px solid #334155; border-radius: 6px;"></iframe>
      </div>
    `;
  } else {
    // DOCX preview info
    previewBody.textContent = `Microsoft Word (.docx) file generated successfully (${formatBytes(latestConvertedResult.size)}).\n\nClick "Download File" to open in Microsoft Word, Google Docs, or LibreOffice.`;
  }
});

previewCloseBtn.addEventListener('click', () => {
  previewModal.classList.remove('open');
});

/**
 * Locker Room Drawer
 */
lockerDrawerBtn.addEventListener('click', () => {
  lockerDrawer.classList.add('open');
  lockerDrawerBackdrop.classList.add('open');
});

function closeLocker() {
  lockerDrawer.classList.remove('open');
  lockerDrawerBackdrop.classList.remove('open');
}

lockerCloseBtn.addEventListener('click', closeLocker);
lockerDrawerBackdrop.addEventListener('click', closeLocker);

function updateLockerUI() {
  lockerCountBadge.textContent = sessionHistory.length;

  if (sessionHistory.length === 0) {
    lockerListContainer.innerHTML = `
      <div class="locker-empty-state">
        <div class="locker-empty-icon">${ICONS.basketball}</div>
        <p>No converted documents yet.<br>Take your first shot at the hoop!</p>
      </div>
    `;
    return;
  }

  lockerListContainer.innerHTML = '';
  sessionHistory.forEach(item => {
    const card = document.createElement('div');
    card.className = 'locker-item-card';
    card.innerHTML = `
      <div class="locker-item-info">
        <div class="locker-item-name">${item.convertedName}</div>
        <div class="locker-item-meta">${formatBytes(item.convertedSize)} • ${item.time}</div>
      </div>
      <a href="${item.url}" download="${item.convertedName}" class="locker-item-download" title="Download">
        ${ICONS.download}
      </a>
    `;
    lockerListContainer.appendChild(card);
  });
}

/**
 * Confetti Fireworks
 */
function launchArenaConfetti() {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.4, x: 0.75 },
    colors: ['#ff5500', '#ffb700', '#00e5ff', '#ffffff', '#a855f7']
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#ff5500', '#ffb700']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#00e5ff', '#a855f7']
    });
  }, 200);
}

/**
 * Scoreboard & Commentary
 */
function updateScoreboard() {
  hudPointsVal.textContent = totalPoints;
  const streakCountEl = document.getElementById('streak-count');
  if (streakCountEl) {
    streakCountEl.textContent = currentStreak;
  } else {
    hudStreakVal.textContent = currentStreak;
  }
  hudConvertedVal.textContent = totalConverted;
}

function setAnnouncer(text) {
  announcerMessage.innerHTML = text;
}

// Initial whistle welcoming the user
window.addEventListener('click', () => {
  sounds.ensureContext();
}, { once: true });

// Auto-load default sample playbook so the user immediately sees a live ball ready to shoot!
(async () => {
  try {
    const sample = await createSampleDocument('pdf');
    loadFile(sample);
  } catch (e) {
    console.warn('Initial sample load skipped', e);
  }
})();
