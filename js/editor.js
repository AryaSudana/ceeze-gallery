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
    // 1. Check URL search parameters for short custom settings
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('t') || urlParams.get('theme');
    const layoutParam = urlParams.get('l') || urlParams.get('layout');
    const titleParam = urlParams.get('title');

    if (themeParam && THEME_PRESETS[themeParam]) {
      this.config.theme = themeParam;
      Object.assign(this.config, THEME_PRESETS[themeParam]);
    }
    if (layoutParam && (layoutParam === "masonry" || layoutParam === "grid")) {
      this.config.layout = layoutParam;
    }
    if (titleParam) {
      this.config.heroTitle = decodeURIComponent(titleParam);
    }

    // 2. Try to load from localStorage if available
    const storageKey = this.folderId ? `ceeze_cfg_${this.folderId}` : "ceeze_cfg_default";
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (e) {
        console.warn("Failed to parse local config:", e);
      }
    }
  }

  saveConfig() {
    const storageKey = this.folderId ? `ceeze_cfg_${this.folderId}` : "ceeze_cfg_default";
    localStorage.setItem(storageKey, JSON.stringify(this.config));
    
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const folderParam = this.folderId || "demo";

    // Build short parameters
    const clientParams = new URLSearchParams();
    clientParams.set("f", folderParam);

    if (this.config.theme && this.config.theme !== "dark") {
      clientParams.set("t", this.config.theme);
    }
    if (this.config.layout && this.config.layout !== "masonry") {
      clientParams.set("l", this.config.layout);
    }
    if (this.config.heroTitle && this.config.heroTitle !== "The Wedding Collection") {
      clientParams.set("title", this.config.heroTitle);
    }

    const editorParams = new URLSearchParams(clientParams);
    editorParams.set("edit", "1");

    return {
      clientUrl: `${baseUrl}?${clientParams.toString()}`,
      editorUrl: `${baseUrl}?${editorParams.toString()}`
    };
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
          this.applyTypography();
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

  getStyleTarget() {
    // If in editor page (sidebar exists), apply theme and typography ONLY
    // to the preview viewport wrapper so the editor studio UI stays 100% fixed dark!
    const isEditor = !!document.getElementById('editor-sidebar');
    if (isEditor) {
      const root = document.documentElement;
      // Clean any lingering inline styles on root so editor UI stays default
      root.style.removeProperty('--bg-color');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--font-family');
      root.style.removeProperty('--font-heading');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--glass-bg');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--text-muted');

      return document.getElementById('preview-viewport-wrapper') || document.getElementById('main-preview-area');
    }
    return document.documentElement;
  }

  applyThemeColors() {
    const target = this.getStyleTarget();
    if (!target) return;

    target.style.setProperty('--bg-color', this.config.bgColor);
    target.style.setProperty('--text-primary', this.config.textColor);
    target.style.setProperty('--accent-color', this.config.accentColor);

    // Auto-calculate subtle borders & secondary surfaces based on background luminance
    const isDark = this.isColorDark(this.config.bgColor);
    if (isDark) {
      target.style.setProperty('--bg-secondary', '#161920');
      target.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      target.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.04)');
      target.style.setProperty('--glass-bg', 'rgba(13, 15, 18, 0.85)');
      target.style.setProperty('--text-secondary', '#94a3b8');
      target.style.setProperty('--text-muted', '#64748b');
    } else {
      target.style.setProperty('--bg-secondary', '#ffffff');
      target.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.08)');
      target.style.setProperty('--card-bg', '#ffffff');
      target.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.88)');
      target.style.setProperty('--text-secondary', '#475569');
      target.style.setProperty('--text-muted', '#94a3b8');
    }

    target.style.backgroundColor = this.config.bgColor;
    target.style.color = this.config.textColor;

    // In client view (gallery.html), also sync body background
    if (target === document.documentElement && document.body) {
      document.body.style.backgroundColor = this.config.bgColor;
      document.body.style.color = this.config.textColor;
    }
  }

  applyLayout() {
    const target = this.getStyleTarget();
    const galleryEl = document.getElementById('gallery-container');
    if (!target || !galleryEl) return;

    target.style.setProperty('--columns-desktop', this.config.columnsDesktop);
    target.style.setProperty('--columns-mobile', this.config.columnsMobile);
    target.style.setProperty('--gallery-gap', `${this.config.gap}px`);
    target.style.setProperty('--border-radius', `${this.config.borderRadius}px`);

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
    const target = this.getStyleTarget();
    if (!target) return;

    target.style.setProperty('--font-family', this.config.fontFamily);
    target.style.setProperty('--font-heading', this.config.fontHeading);
    target.style.fontFamily = this.config.fontFamily;

    const titleEl = document.getElementById('display-hero-title');
    if (titleEl) {
      titleEl.style.fontFamily = this.config.fontHeading;
      titleEl.style.color = this.config.textColor;
    }
    const subtitleEl = document.getElementById('display-hero-subtitle');
    if (subtitleEl) {
      subtitleEl.style.fontFamily = this.config.fontFamily;
      subtitleEl.style.color = this.config.textColor;
    }

    if (target === document.documentElement && document.body) {
      document.body.style.fontFamily = this.config.fontFamily;
    }
  }

  applyAllStyles() {
    this.syncColorPickers();
    this.applyThemeColors();
    this.applyLayout();
    this.applyTypography();

    // Sync slider positions and value displays
    const colSlider = document.getElementById('input-columns-desktop');
    const colValDisplay = document.getElementById('val-columns-desktop');
    if (colSlider) colSlider.value = this.config.columnsDesktop;
    if (colValDisplay) colValDisplay.textContent = this.config.columnsDesktop;

    const colMobileSlider = document.getElementById('input-columns-mobile');
    const colMobileValDisplay = document.getElementById('val-columns-mobile');
    if (colMobileSlider) colMobileSlider.value = this.config.columnsMobile;
    if (colMobileValDisplay) colMobileValDisplay.textContent = this.config.columnsMobile;

    const gapSlider = document.getElementById('input-gallery-gap');
    const gapValDisplay = document.getElementById('val-gallery-gap');
    if (gapSlider) gapSlider.value = this.config.gap;
    if (gapValDisplay) gapValDisplay.textContent = `${this.config.gap}px`;

    const radiusSlider = document.getElementById('input-border-radius');
    const radiusValDisplay = document.getElementById('val-border-radius');
    if (radiusSlider) radiusSlider.value = this.config.borderRadius;
    if (radiusValDisplay) radiusValDisplay.textContent = `${this.config.borderRadius}px`;

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
