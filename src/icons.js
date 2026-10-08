/**
 * HoopConvert Brand & Format Logos System
 * Authentic, real vector logos (Microsoft Word, Adobe PDF, HTML5, Markdown, PNG, Plain Text)
 * and sleek athletic HUD SVG icons, replacing generic emojis.
 */

export const ICONS = {
  // Official Microsoft Word Logo
  word: `<svg viewBox="0 0 32 32" class="brand-logo-svg word-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="22" height="24" rx="3.5" fill="#185ABD"/>
    <path d="M27 8.5L16 5V27L27 23.5V8.5Z" fill="#2B7CD3" opacity="0.95"/>
    <path d="M27 13L16 10.5V21.5L27 19V13Z" fill="#41A5EE" opacity="0.45"/>
    <rect x="3" y="7" width="16" height="18" rx="2.5" fill="#103F91"/>
    <path d="M5.5 11.5H7.3L8.8 18.2L10.4 11.5H12L13.6 18.2L15.1 11.5H16.8L14.7 20.5H12.8L11.2 14.2L9.6 20.5H7.7L5.5 11.5Z" fill="#FFFFFF"/>
  </svg>`,

  // Official Adobe Acrobat / PDF Logo
  pdf: `<svg viewBox="0 0 32 32" class="brand-logo-svg pdf-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="26" height="26" rx="5" fill="#ED2224"/>
    <path d="M22.8 18.8c-.6-.5-2.2-.4-3.6.1-.9-.8-1.8-1.9-2.5-3.2.4-1.6.7-3.3.1-4.2-.4-.6-1.1-.8-1.7-.6-.8.3-1.1 1.6-.9 3.1.2 1.3.8 2.8 1.6 4.2-1.3 2.7-2.9 4.6-4.2 5.3-.8.4-1.5.5-2 .3-.7-.3-.9-1.1-.6-2.1.4-1.2 1.9-2.2 4.2-2.7 0 0 .1 0 .2 0 .4-1.3.9-2.8 1.4-4.2-.5-1.5-.7-2.8-.7-3.6 0-.7.3-1.2.8-1.4.6-.2 1.3 0 1.7.7.7 1.2.3 3.1-.2 4.8.7 1.3 1.5 2.5 2.4 3.4 1.7-.5 3.5-.6 4.3 0 .7.6.7 1.5.1 2.2-.3.3-.6.4-1.1.2zm-12 1.7c-1.8.5-2.9 1.2-3.1 1.9-.1.4 0 .7.3.8.3.1.8 0 1.4-.4 1-.6 2.2-2 3-3.6-1 .6-1.6 1.3-1.6 1.3zm5.7-10.2c-.1-.7-.1-1.2.1-1.3.1 0 .3.1.4.4.2.5 0 1.5-.5 2.8.1-.7 0-1.4 0-1.9zm1.8 5.7c-.5 1.1-.9 2.3-1.3 3.4 1.1-.4 2.2-.6 3.1-.7-.7-1.1-1.3-2-1.8-2.7zm5 4.3c-.6-.4-1.8-.4-3.1-.1.9.7 1.8 1.1 2.5 1.1.5 0 .7-.3.7-.6 0-.1 0-.2-.1-.4z" fill="#FFFFFF"/>
  </svg>`,

  // Official W3C HTML5 Logo
  html: `<svg viewBox="0 0 32 32" class="brand-logo-svg html-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4L7.4 27L16 29.5L24.6 27L27 4H5Z" fill="#E34F26"/>
    <path d="M16 6.3V27.3L22.8 25.4L24.8 6.3H16Z" fill="#EF652A"/>
    <path d="M9.8 9.5H22.2L21.7 14.2H16V17.3H21.4L20.8 23.3L16 24.6V21.8L18.7 21.1L19 18.2H12.3L11.8 12.2H9.6L9.8 9.5Z" fill="#FFFFFF"/>
    <path d="M16 9.5V12.2H12.7L13 15.2H16V18.2H13.3L13.6 21.2L16 21.9V24.6L11.3 23.3L10.7 15.2L9.8 9.5H16Z" fill="#EBEBEB"/>
  </svg>`,

  // Official Markdown Logo
  md: `<svg viewBox="0 0 32 32" class="brand-logo-svg md-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="5.5" width="27" height="21" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.8"/>
    <path d="M6.5 11.5V20.5H9.2V15.2L11.2 18.2L13.2 15.2V20.5H15.9V11.5H13.6L11.2 15.1L8.8 11.5H6.5Z" fill="#FFFFFF"/>
    <path d="M19.5 15.2V11.5H21.5V15.2H24.2L20.5 19.8L16.8 15.2H19.5Z" fill="#38BDF8"/>
  </svg>`,

  // Plain Text Logo (.txt)
  txt: `<svg viewBox="0 0 32 32" class="brand-logo-svg txt-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="3.5" width="22" height="25" rx="3.5" fill="#1E293B" stroke="#475569" stroke-width="1.2"/>
    <path d="M18.5 3.5V9.5H26.5L18.5 3.5Z" fill="#475569"/>
    <rect x="8.5" y="11.5" width="15" height="2" rx="1" fill="#94A3B8"/>
    <rect x="8.5" y="15.5" width="11" height="2" rx="1" fill="#94A3B8"/>
    <rect x="8.5" y="19.5" width="13" height="2" rx="1" fill="#94A3B8"/>
    <rect x="8" y="23" width="16" height="4" rx="1.5" fill="#0284C7"/>
    <text x="16" y="26.1" fill="#FFFFFF" font-size="3.2" font-weight="800" font-family="'JetBrains Mono', monospace" text-anchor="middle">TXT</text>
  </svg>`,

  // PNG / JPG / Image Logo
  png: `<svg viewBox="0 0 32 32" class="brand-logo-svg image-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3.5" width="26" height="25" rx="4.5" fill="#0F766E"/>
    <circle cx="9.5" cy="10.5" r="2.8" fill="#FACC15"/>
    <path d="M4.5 24.5L11 16L16.5 21L20.5 15L27.5 24.5H4.5Z" fill="#14B8A6"/>
    <path d="M12 24.5L16.5 18.5L21.5 24.5H12Z" fill="#5EEAD4"/>
    <rect x="18" y="5.5" width="9.5" height="5" rx="1.5" fill="#134E4A"/>
    <text x="22.7" y="9.2" fill="#5EEAD4" font-size="3.6" font-weight="900" font-family="'JetBrains Mono', monospace" text-anchor="middle">PNG</text>
  </svg>`,

  // Generic document / fallback
  file: `<svg viewBox="0 0 32 32" class="brand-logo-svg file-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="3.5" width="20" height="25" rx="3.5" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>
    <path d="M18 3.5V9.5H25.5L18 3.5Z" fill="#64748B"/>
    <line x1="10" y1="14" x2="22" y2="14" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="18" x2="22" y2="18" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="10" y1="22" x2="18" y2="22" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  // Default empty drop zone icon
  upload: `<svg viewBox="0 0 32 32" class="brand-logo-svg upload-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="22" height="24" rx="4" fill="rgba(15, 23, 42, 0.6)" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M16 11V21M16 11L12 15M16 11L20 15" stroke="#00E5FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Athletic Basketball Logo
  basketball: `<svg viewBox="0 0 32 32" class="basketball-vector" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#FF5500" stroke="#E64A00" stroke-width="1.5"/>
    <path d="M2 16H30" stroke="#1E1B18" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M16 2V30" stroke="#1E1B18" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M6 6C11 11 11 21 6 26" stroke="#1E1B18" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M26 6C21 11 21 21 26 26" stroke="#1E1B18" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  // Target Bullseye / Arc
  target: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6" stroke="#FF5500"/>
    <circle cx="12" cy="12" r="2" fill="#00E5FF"/>
  </svg>`,

  // Slam Dunk Power Lightning
  lightning: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FFFFFF" stroke="#FFB700" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,

  // Arc 3-Point Shot
  arc: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20C4 11.163 11.163 4 20 4" stroke="#00E5FF" stroke-width="2.5" stroke-dasharray="3 3"/>
    <circle cx="20" cy="4" r="3" fill="#FF5500" stroke="#FFFFFF" stroke-width="1.5"/>
    <circle cx="4" cy="20" r="2" fill="#00E5FF"/>
  </svg>`,

  // Reset / Refresh
  reset: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12A9 9 0 0 1 18.36 5.64L21 8M21 3V8H16M21 12A9 9 0 0 1 5.64 18.36L3 16M3 21V16H8"/>
  </svg>`,

  // Golden Trophy
  trophy: `<svg viewBox="0 0 24 24" class="trophy-vector" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V3Z" fill="#FFB700" stroke="#F59E0B" stroke-width="1.5"/>
    <path d="M6 5H3C2.45 5 2 5.45 2 6C2 8.5 4 10.5 6 10.9V5Z" fill="#F59E0B"/>
    <path d="M18 5H21C21.55 5 22 5.45 22 6C22 8.5 20 10.5 18 10.9V5Z" fill="#F59E0B"/>
    <path d="M10 15V18H14V15" stroke="#F59E0B" stroke-width="2"/>
    <rect x="7" y="18" width="10" height="3" rx="1" fill="#D97706"/>
  </svg>`,

  // Download Arrow
  download: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`,

  // Eye Preview
  eye: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  // Sound Volume On
  volumeOn: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>`,

  // Sound Volume Off
  volumeOff: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`,

  // Flame Streak
  flame: `<svg viewBox="0 0 24 24" class="flame-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9.5 5.5 12 8 10 11C9 8.5 7.5 8 6 10C4.5 12 4 14.5 5 17C6.2 20 9 22 12 22C16.5 22 19 18.5 19 14.5C19 9.5 14 7.5 14 2L12 2Z" fill="#FF5500"/>
    <path d="M12 11C10.5 13 12 15 11 17C10.5 16 9.5 15.5 9 16.5C8.5 17.5 9 19 12 20C14 20 15.5 18.5 15.5 16.5C15.5 14 13 13 12 11Z" fill="#FFB700"/>
  </svg>`
};

/**
 * Returns the authentic brand logo SVG for a given file format or extension
 */
export function getFormatLogo(formatOrExt) {
  if (!formatOrExt) return ICONS.file;
  const key = formatOrExt.toLowerCase().replace(/^\./, '');
  
  if (['docx', 'doc', 'word'].includes(key)) {
    return ICONS.word;
  }
  if (['pdf'].includes(key)) {
    return ICONS.pdf;
  }
  if (['html', 'htm'].includes(key)) {
    return ICONS.html;
  }
  if (['md', 'markdown'].includes(key)) {
    return ICONS.md;
  }
  if (['txt', 'text'].includes(key)) {
    return ICONS.txt;
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'image', 'img'].includes(key)) {
    return ICONS.png;
  }
  return ICONS.file;
}
