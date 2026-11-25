/**
 * Main Application Orchestrator
 */

class App {
  constructor() {
    this.photos = [];
    this.currentFolderId = null;
    this.editor = new GalleryEditor();
    this.lightbox = new GalleryLightbox();
    this.favorites = new FavoritesManager();
    window.favoritesManager = this.favorites;

    this.isClientOnly = false;
    this.filterOnlyFavorites = false;
  }

  async init() {
    this.bindGlobalUI();

    // Check URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const folderParam = urlParams.get('folder');
    const viewParam = urlParams.get('view');

    if (viewParam === 'client') {
      this.setClientMode(true);
    }

    if (folderParam && folderParam !== 'demo') {
      this.currentFolderId = folderParam;
      this.editor.init(this.currentFolderId);
      this.favorites.init(this.currentFolderId);
      await this.loadFolderPhotos(this.currentFolderId);
    } else {
      // Default to Demo Dataset
      this.currentFolderId = "demo";
      this.editor.init("demo");
      this.favorites.init("demo");
      this.loadDemoPhotos();
    }
  }

  bindGlobalUI() {
    // Toast helper
    window.showToast = (msg, duration = 3000) => {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), duration);
    };

    // Toggle Sidebar Button (Editor toggle)
    const toggleSidebarBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('editor-sidebar');
    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Toggle Client View / Preview Mode Button
    const toggleViewBtn = document.getElementById('btn-toggle-view');
    if (toggleViewBtn) {
      toggleViewBtn.addEventListener('click', () => {
        this.setClientMode(!this.isClientOnly);
      });
    }

    // Load Folder Form Submit
    const folderForm = document.getElementById('form-load-folder');
    const folderInput = document.getElementById('input-folder-link');
    if (folderForm && folderInput) {
      folderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const extractedId = DriveService.extractFolderId(folderInput.value);
        if (!extractedId) {
          window.showToast("⚠️ Link Google Drive tidak valid. Masukkan link folder lengkap.");
          return;
        }

        this.currentFolderId = extractedId;
        this.editor.init(extractedId);
        this.favorites.init(extractedId);

        // Update URL query without reloading
        const newUrl = `${window.location.pathname}?folder=${extractedId}`;
        window.history.pushState({}, '', newUrl);

        await this.loadFolderPhotos(extractedId);
      });
    }

    // Demo Data Button
    const btnLoadDemo = document.getElementById('btn-load-demo');
    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', () => {
        this.currentFolderId = "demo";
        this.editor.init("demo");
        this.favorites.init("demo");
        window.history.pushState({}, '', window.location.pathname);
        this.loadDemoPhotos();
        window.showToast("Berhasil memuat galeri demo");
      });
    }

    // API Key Modal Trigger
    const btnApiKey = document.getElementById('btn-open-api-modal');
    const modalApiKey = document.getElementById('modal-api-key');
    const inputApiKey = document.getElementById('input-google-api-key');
    const btnSaveApiKey = document.getElementById('btn-save-api-key');

    if (btnApiKey && modalApiKey) {
      btnApiKey.addEventListener('click', () => {
        if (inputApiKey) inputApiKey.value = DriveService.getApiKey();
        this.openModal('modal-api-key');
      });
    }

    if (btnSaveApiKey && inputApiKey) {
      btnSaveApiKey.addEventListener('click', () => {
        DriveService.setApiKey(inputApiKey.value);
        this.closeModal('modal-api-key');
        window.showToast("✅ Google Drive API Key berhasil disimpan!");
        if (this.currentFolderId && this.currentFolderId !== "demo") {
          this.loadFolderPhotos(this.currentFolderId);
        }
      });
    }

    // Share Modal Trigger
    const btnShare = document.getElementById('btn-open-share-modal');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        const shareUrl = this.editor.saveConfig();
        const shareInput = document.getElementById('input-share-url');
        if (shareInput) shareInput.value = shareUrl;
        this.openModal('modal-share');
      });
    }

    // Copy Share Link Button
    const btnCopyShare = document.getElementById('btn-copy-share-url');
    if (btnCopyShare) {
      btnCopyShare.addEventListener('click', () => {
        const shareInput = document.getElementById('input-share-url');
        if (shareInput) {
          navigator.clipboard.writeText(shareInput.value);
          window.showToast("📋 Link galeri berhasil disalin!");
        }
      });
    }

    // WhatsApp Floating Button & Modal Trigger
    const floatingWaBtn = document.getElementById('client-floating-badge');
    const topFavBtn = document.getElementById('btn-top-favorites');
    if (floatingWaBtn) {
      floatingWaBtn.addEventListener('click', () => this.openWhatsAppModal());
    }
    if (topFavBtn) {
      topFavBtn.addEventListener('click', () => this.openWhatsAppModal());
    }

    // Send WhatsApp Action
    const btnSubmitWa = document.getElementById('btn-send-whatsapp');
    const inputWaNumber = document.getElementById('input-wa-number');
    if (btnSubmitWa) {
      btnSubmitWa.addEventListener('click', () => {
        const phone = inputWaNumber ? inputWaNumber.value : "";
        const waLink = this.favorites.generateWhatsAppLink(phone);
        if (waLink) {
          window.open(waLink, '_blank');
          this.closeModal('modal-whatsapp');
        } else {
          window.showToast("Belum ada foto yang dipilih");
        }
      });
    }

    // Copy Favorites List Text
    const btnCopyFavList = document.getElementById('btn-copy-fav-list');
    if (btnCopyFavList) {
      btnCopyFavList.addEventListener('click', () => {
        const list = this.favorites.getFavoritesList();
        if (list.length === 0) return;
        const text = list.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
        navigator.clipboard.writeText(text);
        window.showToast("📋 Daftar nama foto berhasil disalin ke clipboard!");
      });
    }

    // Generic Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  setClientMode(isClient) {
    this.isClientOnly = isClient;
    const sidebar = document.getElementById('editor-sidebar');
    const toggleViewBtn = document.getElementById('btn-toggle-view');
    const toggleSidebarBtn = document.getElementById('btn-toggle-sidebar');

    if (isClient) {
      if (sidebar) sidebar.classList.add('collapsed');
      if (toggleSidebarBtn) toggleSidebarBtn.style.display = 'none';
      if (toggleViewBtn) {
        toggleViewBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Mode Editor
        `;
        toggleViewBtn.classList.remove('btn-secondary');
        toggleViewBtn.classList.add('btn-primary');
      }
    } else {
      if (sidebar) sidebar.classList.remove('collapsed');
      if (toggleSidebarBtn) toggleSidebarBtn.style.display = 'inline-flex';
      if (toggleViewBtn) {
        toggleViewBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Preview Klien
        `;
        toggleViewBtn.classList.remove('btn-primary');
        toggleViewBtn.classList.add('btn-secondary');
      }
    }
  }

  loadDemoPhotos() {
    this.photos = [...window.DEMO_PHOTOS];
    this.lightbox.setPhotos(this.photos);
    this.renderGallery();
    const badge = document.getElementById('display-photo-count');
    if (badge) badge.textContent = `${this.photos.length} Foto (Sample Demo)`;
  }

  async loadFolderPhotos(folderId) {
    const galleryEl = document.getElementById('gallery-container');
    const badge = document.getElementById('display-photo-count');
    
    // Show loading state
    if (galleryEl) {
      galleryEl.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <p style="font-weight: 600;">Mengambil foto dari Google Drive...</p>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">Folder ID: ${folderId}</p>
        </div>
      `;
    }

    try {
      const photos = await DriveService.fetchFolderPhotos(folderId);
      if (photos.length === 0) {
        if (galleryEl) {
          galleryEl.innerHTML = `
            <div class="state-container" style="grid-column: 1 / -1;">
              <p style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Folder Kosong</p>
              <p style="font-size: 14px; color: var(--text-secondary); max-width: 400px;">Tidak ditemukan file foto/gambar di dalam folder ini.</p>
            </div>
          `;
        }
        return;
      }

      this.photos = photos;
      this.lightbox.setPhotos(this.photos);
      this.renderGallery();
      if (badge) badge.textContent = `${this.photos.length} Foto`;
      window.showToast(`Berhasil memuat ${this.photos.length} foto dari Google Drive!`);
    } catch (err) {
      console.error(err);
      if (err.message === "API_KEY_REQUIRED") {
        this.openModal('modal-api-key');
        window.showToast("⚠️ Masukkan Google Drive API Key kamu untuk memuat folder");
      } else {
        window.showToast("Gagal memuat: " + err.message);
      }
      // Fallback back to demo
      this.loadDemoPhotos();
    }
  }

  renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = "";

    const displayPhotos = this.filterOnlyFavorites 
      ? this.photos.filter(p => this.favorites.isFavorite(p.id))
      : this.photos;

    if (displayPhotos.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1; width: 100%;">
          <p style="font-weight: 700; font-size: 16px;">Belum ada foto pilihan</p>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 6px;">Klik tombol hati di foto untuk menandai foto favorit.</p>
        </div>
      `;
      return;
    }

    displayPhotos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.className = "photo-card";
      card.dataset.index = index;

      const isFav = this.favorites.isFavorite(photo.id);

      card.innerHTML = `
        <img 
          src="${photo.previewUrl}" 
          alt="${photo.name}" 
          class="photo-img" 
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'"
        />
        <div class="photo-overlay">
          <div class="photo-top-actions">
            <button 
              class="icon-action-btn ${isFav ? 'favorite-active' : ''}" 
              data-fav-id="${photo.id}" 
              title="Pilih Favorit"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <a 
              href="${photo.downloadUrl}" 
              download="${photo.name}" 
              class="icon-action-btn" 
              title="Download Asli" 
              onclick="event.stopPropagation();"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          </div>
          <div class="photo-bottom-info">
            <p class="photo-name">${photo.name}</p>
          </div>
        </div>
      `;

      // Click card to open lightbox
      card.addEventListener('click', (e) => {
        // If clicked favorite heart button, toggle favorite instead of opening modal
        const favBtn = e.target.closest('[data-fav-id]');
        if (favBtn) {
          e.stopPropagation();
          this.favorites.toggleFavorite(photo);
          return;
        }
        this.lightbox.open(index);
      });

      container.appendChild(card);
    });

    this.editor.applyLayout();
  }

  openWhatsAppModal() {
    const list = this.favorites.getFavoritesList();
    const countEl = document.getElementById('modal-wa-count');
    const listContainer = document.getElementById('modal-wa-list');

    if (countEl) countEl.textContent = `${list.length} Foto`;

    if (listContainer) {
      if (list.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">Belum ada foto yang dipilih. Klik ikon hati pada foto untuk memilih.</p>`;
      } else {
        listContainer.innerHTML = list.map((p, i) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color); font-size: 13px;">
            <span>${i + 1}. ${p.name}</span>
            <span style="color: var(--text-muted); font-size: 11px;">${p.dimensions || ''}</span>
          </div>
        `).join('');
      }
    }

    this.openModal('modal-whatsapp');
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
