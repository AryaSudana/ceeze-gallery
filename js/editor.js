/**
 * Gallery Editor & Realtime Customizer Controller
 */

const DEFAULT_CONFIG = {
  theme: "dark",
  bgColor: "#0d0f12",
  textColor: "#f8fafc",
  accentColor: "#3b82f6",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontHeading: "'Plus Jakarta Sans', system-ui, sans-serif",
  
  layout: "masonry", // 'masonry' | 'grid'
  aspectRatio: "original", // 'original' | 'portrait' | 'landscape'
  columnsDesktop: 3,
  columnsMobile: 1,
  gap: 16,
  borderRadius: 10,
  
  heroTitle: "The Wedding Collection",
  heroSubtitle: "A curated gallery of unforgettable moments and timeless memories.",
  coverStyle: "minimal" // 'minimal' | 'banner'
};

const THEME_PRESETS = {
  "dark": {
    bgColor: "#0d0f12",
    textColor: "#f8fafc",
    accentColor: "#3b82f6",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontHeading: "'Plus Jakarta Sans', system-ui, sans-serif"
  },
  "light": {
    bgColor: "#f8fafc",
    textColor: "#0f172a",
    accentColor: "#2563eb",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontHeading: "'Plus Jakarta Sans', system-ui, sans-serif"
  },
  "warm-beige": {
    bgColor: "#f7f4ee",
    textColor: "#292524",
    accentColor: "#b45309",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontHeading: "'Playfair Display', Georgia, serif"
  },
  "velvet-noir": {
    bgColor: "#070709",
    textColor: "#fafaf9",
    accentColor: "#d97706",
    fontFamily: "'Cinzel', Georgia, serif",
    fontHeading: "'Cinzel', Georgia, serif"
  },
  "editorial-white": {
    bgColor: "#ffffff",
    textColor: "#18181b",
    accentColor: "#18181b",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Inter', system-ui, sans-serif"
  }
};

class GalleryEditor {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.folderId = null;
    this.isClientView = false;
  }

  init(folderId = null) {
    this.folderId = folderId;
    this.loadSavedConfig();
    this.bindInputs();
    this.applyAllStyles();
  }

  loadSavedConfig() {
    // 1. Try to load from URL hash if shared via link
    const hash = window.location.hash;
    if (hash && hash.startsWith("#cfg=")) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(hash.replace("#cfg=", ""))));
        this.config = { ...DEFAULT_CONFIG, ...decoded };
        return;
      } catch (e) {
        console.warn("Failed to parse URL config:", e);
      }
    }

    // 2. Try to load from localStorage
    const storageKey = this.folderId ? `ceeze_cfg_${this.folderId}` : "ceeze_cfg_default";
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.warn("Failed to parse local config:", e);
      }
    }
  }

  saveConfig() {
    const storageKey = this.folderId ? `ceeze_cfg_${this.folderId}` : "ceeze_cfg_default";
    localStorage.setItem(storageKey, JSON.stringify(this.config));
    
    // Also generate clean share link with hash
    const encoded = btoa(encodeURIComponent(JSON.stringify(this.config)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?folder=${this.folderId || "demo"}#cfg=${encoded}`;
    return shareUrl;
  }

  bindInputs() {
    // Layout Radio Buttons (Masonry vs Grid)
    const layoutBtns = document.querySelectorAll('[data-layout]');
    layoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        layoutBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.config.layout = btn.dataset.layout;
        this.applyLayout();
      });
    });

    // Aspect Ratio Buttons
    const aspectBtns = document.querySelectorAll('[data-aspect]');
    aspectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        aspectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.config.aspectRatio = btn.dataset.aspect;
        this.applyLayout();
      });
    });

    // Theme Presets
    const presetPills = document.querySelectorAll('.preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const presetKey = pill.dataset.preset;
        if (THEME_PRESETS[presetKey]) {
          presetPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.config.theme = presetKey;
          Object.assign(this.config, THEME_PRESETS[presetKey]);
          this.syncColorPickers();
          this.applyThemeColors();
        }
      });
    });

    // Color Pickers
    const bgPicker = document.getElementById('input-bg-color');
    if (bgPicker) {
      bgPicker.addEventListener('input', (e) => {
        this.config.bgColor = e.target.value;
        this.applyThemeColors();
      });
    }

    const textPicker = document.getElementById('input-text-color');
    if (textPicker) {
      textPicker.addEventListener('input', (e) => {
        this.config.textColor = e.target.value;
        this.applyThemeColors();
      });
    }

    const accentPicker = document.getElementById('input-accent-color');
    if (accentPicker) {
      accentPicker.addEventListener('input', (e) => {
        this.config.accentColor = e.target.value;
        this.applyThemeColors();
      });
    }

    // Range Sliders
    const colSlider = document.getElementById('input-columns-desktop');
    const colValDisplay = document.getElementById('val-columns-desktop');
    if (colSlider) {
      colSlider.addEventListener('input', (e) => {
        this.config.columnsDesktop = parseInt(e.target.value, 10);
        if (colValDisplay) colValDisplay.textContent = this.config.columnsDesktop;
        this.applyLayout();
      });
    }

    const colMobileSlider = document.getElementById('input-columns-mobile');
    const colMobileValDisplay = document.getElementById('val-columns-mobile');
    if (colMobileSlider) {
      colMobileSlider.addEventListener('input', (e) => {
        this.config.columnsMobile = parseInt(e.target.value, 10);
        if (colMobileValDisplay) colMobileValDisplay.textContent = this.config.columnsMobile;
        this.applyLayout();
      });
    }

    const gapSlider = document.getElementById('input-gallery-gap');
    const gapValDisplay = document.getElementById('val-gallery-gap');
    if (gapSlider) {
      gapSlider.addEventListener('input', (e) => {
        this.config.gap = parseInt(e.target.value, 10);
        if (gapValDisplay) gapValDisplay.textContent = `${this.config.gap}px`;
        this.applyLayout();
      });
    }

    const radiusSlider = document.getElementById('input-border-radius');
    const radiusValDisplay = document.getElementById('val-border-radius');
    if (radiusSlider) {
      radiusSlider.addEventListener('input', (e) => {
        this.config.borderRadius = parseInt(e.target.value, 10);
        if (radiusValDisplay) radiusValDisplay.textContent = `${this.config.borderRadius}px`;
        this.applyLayout();
      });
    }

    // Typography
    const fontSelect = document.getElementById('select-font-family');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.config.fontFamily = e.target.value;
        this.config.fontHeading = e.target.value;
        this.applyTypography();
      });
    }

    // Hero Header Inputs
    const titleInput = document.getElementById('input-hero-title');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        this.config.heroTitle = e.target.value;
        const displayEl = document.getElementById('display-hero-title');
        if (displayEl) displayEl.textContent = this.config.heroTitle || "Untitled Gallery";
      });
    }

    const subtitleInput = document.getElementById('input-hero-subtitle');
    if (subtitleInput) {
      subtitleInput.addEventListener('input', (e) => {
        this.config.heroSubtitle = e.target.value;
        const displayEl = document.getElementById('display-hero-subtitle');
        if (displayEl) displayEl.textContent = this.config.heroSubtitle;
      });
    }
  }

  syncColorPickers() {
    const bgPicker = document.getElementById('input-bg-color');
    const textPicker = document.getElementById('input-text-color');
    const accentPicker = document.getElementById('input-accent-color');
    const fontSelect = document.getElementById('select-font-family');

    if (bgPicker) bgPicker.value = this.config.bgColor;
    if (textPicker) textPicker.value = this.config.textColor;
    if (accentPicker) accentPicker.value = this.config.accentColor;
    if (fontSelect) fontSelect.value = this.config.fontFamily;
  }

  applyThemeColors() {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', this.config.bgColor);
    root.style.setProperty('--text-primary', this.config.textColor);
    root.style.setProperty('--accent-color', this.config.accentColor);

    // Auto-calculate subtle borders & secondary surfaces based on background luminance
    const isDark = this.isColorDark(this.config.bgColor);
    if (isDark) {
      root.style.setProperty('--bg-secondary', '#161920');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--glass-bg', 'rgba(13, 15, 18, 0.85)');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--text-muted', '#64748b');
    } else {
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.88)');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#94a3b8');
    }
  }

  applyLayout() {
    const root = document.documentElement;
    const galleryEl = document.getElementById('gallery-container');
    if (!galleryEl) return;

    root.style.setProperty('--columns-desktop', this.config.columnsDesktop);
    root.style.setProperty('--columns-mobile', this.config.columnsMobile);
    root.style.setProperty('--gallery-gap', `${this.config.gap}px`);
    root.style.setProperty('--border-radius', `${this.config.borderRadius}px`);

    // Reset layout classes
    galleryEl.className = "gallery-container";

    if (this.config.layout === "masonry") {
      galleryEl.classList.add("gallery-masonry");
    } else {
      galleryEl.classList.add("gallery-grid");
      if (this.config.aspectRatio === "portrait") {
        galleryEl.classList.add("aspect-portrait");
      } else if (this.config.aspectRatio === "landscape") {
        galleryEl.classList.add("aspect-landscape");
      }
    }
  }

  applyTypography() {
    const root = document.documentElement;
    root.style.setProperty('--font-family', this.config.fontFamily);
    root.style.setProperty('--font-heading', this.config.fontHeading);
  }

  applyAllStyles() {
    this.syncColorPickers();
    this.applyThemeColors();
    this.applyLayout();
    this.applyTypography();

    // Populate initial text inputs
    const titleInput = document.getElementById('input-hero-title');
    const subtitleInput = document.getElementById('input-hero-subtitle');
    const titleDisplay = document.getElementById('display-hero-title');
    const subtitleDisplay = document.getElementById('display-hero-subtitle');

    if (titleInput) titleInput.value = this.config.heroTitle;
    if (subtitleInput) subtitleInput.value = this.config.heroSubtitle;
    if (titleDisplay) titleDisplay.textContent = this.config.heroTitle;
    if (subtitleDisplay) subtitleDisplay.textContent = this.config.heroSubtitle;
  }

  isColorDark(hex) {
    if (!hex || hex[0] !== '#') return true;
    const rgb = parseInt(hex.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
  }
}

window.GalleryEditor = GalleryEditor;
