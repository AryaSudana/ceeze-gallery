/**
 * Client Selection & Favorites Management System
 */

class FavoritesManager {
  constructor() {
    this.folderId = "default";
    this.favorites = new Map(); // id -> photo object
    this.onUpdateCallbacks = [];
  }

  init(folderId = "default") {
    this.folderId = folderId;
    this.load();
    this.updateUI();
  }

  getStorageKey() {
    return `ceeze_favs_${this.folderId}`;
  }

  load() {
    this.favorites.clear();
    const saved = localStorage.getItem(this.getStorageKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.forEach(photo => this.favorites.set(photo.id, photo));
      } catch (e) {
        console.warn("Failed to parse favorites:", e);
      }
    }
  }

  save() {
    const list = Array.from(this.favorites.values());
    localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
    this.notifyUpdate();
  }

  isFavorite(photoId) {
    return this.favorites.has(photoId);
  }

  toggleFavorite(photo) {
    if (this.favorites.has(photo.id)) {
      this.favorites.delete(photo.id);
      window.showToast?.("Foto dihapus dari daftar pilihan");
    } else {
      this.favorites.set(photo.id, photo);
      window.showToast?.("❤️ Foto ditambahkan ke pilihan favorit");
    }
    this.save();
    this.updateCardUI(photo.id);
  }

  getFavoritesList() {
    return Array.from(this.favorites.values());
  }

  getCount() {
    return this.favorites.size;
  }

  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }

  notifyUpdate() {
    this.updateUI();
    this.onUpdateCallbacks.forEach(cb => cb(this.getFavoritesList()));
  }

  updateCardUI(photoId) {
    const isFav = this.isFavorite(photoId);
    const cardBtns = document.querySelectorAll(`[data-fav-id="${photoId}"]`);
    cardBtns.forEach(btn => {
      if (isFav) {
        btn.classList.add('favorite-active');
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
      } else {
        btn.classList.remove('favorite-active');
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
      }
    });
  }

  updateUI() {
    const count = this.getCount();
    
    // Top Bar Pill Button
    const counterBadge = document.getElementById('fav-count-badge');
    if (counterBadge) counterBadge.textContent = count;

    // Floating WhatsApp Button
    const floatingBtn = document.getElementById('client-floating-badge');
    const floatingCount = document.getElementById('floating-fav-count');
    if (floatingBtn) {
      if (count > 0) {
        floatingBtn.style.display = 'flex';
        if (floatingCount) floatingCount.textContent = `${count} Foto Terpilih`;
      } else {
        floatingBtn.style.display = 'none';
      }
    }
  }

  /**
   * Export to formatted WhatsApp Message
   */
  generateWhatsAppLink(photographerPhone = "") {
    const list = this.getFavoritesList();
    if (list.length === 0) return null;

    let text = `*Halo Kak, berikut daftar foto pilihan saya dari galeri:*\n\n`;
    list.forEach((p, index) => {
      text += `${index + 1}. ${p.name}\n`;
    });
    text += `\n*Total:* ${list.length} foto terpilih.\nMohon info untuk proses selanjutnya ya kak. Terima kasih!`;

    const cleanPhone = photographerPhone.replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone ? cleanPhone : "";
    return `https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`;
  }
}

window.FavoritesManager = FavoritesManager;
