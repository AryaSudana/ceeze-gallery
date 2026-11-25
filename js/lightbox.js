/**
 * Mobile-Friendly Touch & Keyboard Lightbox Viewer
 */

class GalleryLightbox {
  constructor() {
    this.photos = [];
    this.currentIndex = 0;
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.modalEl = document.getElementById('lightbox-modal');
    this.imgEl = document.getElementById('lightbox-img');
    this.titleEl = document.getElementById('lightbox-title');
    this.counterEl = document.getElementById('lightbox-counter');
    this.downloadBtn = document.getElementById('lightbox-download-btn');
    this.favoriteBtn = document.getElementById('lightbox-favorite-btn');
    
    this.initEvents();
  }

  setPhotos(photos) {
    this.photos = photos || [];
  }

  open(index) {
    if (!this.photos || this.photos.length === 0) return;
    this.currentIndex = Math.max(0, Math.min(index, this.photos.length - 1));
    this.isOpen = true;
    this.updateContent();
    this.modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  prev() {
    if (!this.isOpen || this.photos.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.updateContent();
  }

  next() {
    if (!this.isOpen || this.photos.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.updateContent();
  }

  updateContent() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    // Show smooth loading placeholder or high-res
    this.imgEl.style.opacity = '0.5';
    this.imgEl.src = photo.fullUrl || photo.previewUrl;
    this.imgEl.onload = () => {
      this.imgEl.style.opacity = '1';
    };

    if (this.titleEl) this.titleEl.textContent = photo.name;
    if (this.counterEl) this.counterEl.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
    if (this.downloadBtn) {
      this.downloadBtn.href = photo.downloadUrl || photo.fullUrl;
      this.downloadBtn.setAttribute('download', photo.name);
    }

    // Sync favorite state
    this.syncFavoriteButton();

    // Preload next image for instant display
    const nextIdx = (this.currentIndex + 1) % this.photos.length;
    if (this.photos[nextIdx]) {
      const preloadImg = new Image();
      preloadImg.src = this.photos[nextIdx].fullUrl || this.photos[nextIdx].previewUrl;
    }
  }

  syncFavoriteButton() {
    if (!this.favoriteBtn || !window.favoritesManager) return;
    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    const isFav = window.favoritesManager.isFavorite(photo.id);
    if (isFav) {
      this.favoriteBtn.classList.add('favorite-active');
      this.favoriteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    } else {
      this.favoriteBtn.classList.remove('favorite-active');
      this.favoriteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    }
  }

  initEvents() {
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Close button
    const closeBtn = document.getElementById('lightbox-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Navigation buttons
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Favorite toggle in lightbox
    if (this.favoriteBtn) {
      this.favoriteBtn.addEventListener('click', () => {
        const photo = this.photos[this.currentIndex];
        if (photo && window.favoritesManager) {
          window.favoritesManager.toggleFavorite(photo);
          this.syncFavoriteButton();
        }
      });
    }

    // Touch Swipe for Mobile & Tablet
    const bodyEl = document.querySelector('.lightbox-body');
    if (bodyEl) {
      bodyEl.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      bodyEl.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }
  }

  handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    const threshold = 50; // min distance for swipe
    if (swipeDistance > threshold) {
      this.prev(); // swipe right -> show previous
    } else if (swipeDistance < -threshold) {
      this.next(); // swipe left -> show next
    }
  }
}

window.GalleryLightbox = GalleryLightbox;
