/**
 * CeEZe Studio - License Key, Quota & Expiration Management Engine
 */

const AuthService = {
  STORAGE_KEYS: "ceeze_license_keys_v2",
  STORAGE_GALLERIES: "ceeze_galleries_meta_v2",
  STORAGE_ADMIN_PIN: "ceeze_admin_pin_v2",
  DEFAULT_PIN: "ceeze2026",

  init() {
    if (!localStorage.getItem(this.STORAGE_KEYS)) {
      // Seed initial demo key
      const initialKeys = [
        {
          key: "CEEZE-DEMO-2026",
          clientName: "Demo Studio",
          maxGalleries: 5,
          usedGalleries: 1,
          createdAt: new Date().toISOString(),
          galleries: ["demo"]
        }
      ];
      localStorage.setItem(this.STORAGE_KEYS, JSON.stringify(initialKeys));
    }

    if (!localStorage.getItem(this.STORAGE_GALLERIES)) {
      const initialMeta = {
        "demo": {
          folderId: "demo",
          title: "The Wedding Collection",
          licenseKey: "CEEZE-DEMO-2026",
          createdAt: new Date().toISOString(),
          expiryDate: null // null means no expiration
        }
      };
      localStorage.setItem(this.STORAGE_GALLERIES, JSON.stringify(initialMeta));
    }
  },

  // 1. ADMIN PIN
  getAdminPin() {
    return localStorage.getItem(this.STORAGE_ADMIN_PIN) || this.DEFAULT_PIN;
  },

  verifyAdminPin(inputPin) {
    return (inputPin || "").trim() === this.getAdminPin();
  },

  setAdminPin(newPin) {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(this.STORAGE_ADMIN_PIN, newPin.trim());
      return true;
    }
    return false;
  },

  // 2. LICENSE KEYS
  getAllKeys() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveAllKeys(keys) {
    localStorage.setItem(this.STORAGE_KEYS, JSON.stringify(keys));
  },

  createLicenseKey(clientName, maxGalleries = 2) {
    const cleanName = (clientName || "CLIENT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `CEEZE-${cleanName}-${randomCode}`;

    const newKey = {
      key,
      clientName: clientName.trim(),
      maxGalleries: parseInt(maxGalleries, 10) || 1,
      usedGalleries: 0,
      createdAt: new Date().toISOString(),
      galleries: []
    };

    const keys = this.getAllKeys();
    keys.unshift(newKey);
    this.saveAllKeys(keys);
    return newKey;
  },

  deleteLicenseKey(key) {
    const keys = this.getAllKeys().filter(k => k.key !== key);
    this.saveAllKeys(keys);
  },

  validateKey(inputKey) {
    if (!inputKey) return { valid: false, reason: "Key tidak boleh kosong" };
    const cleanKey = inputKey.trim().toUpperCase();
    const keys = this.getAllKeys();
    const found = keys.find(k => k.key.toUpperCase() === cleanKey);

    if (!found) {
      return { valid: false, reason: "Key unik tidak ditemukan / tidak valid" };
    }

    if (found.usedGalleries >= found.maxGalleries) {
      return { 
        valid: false, 
        reason: `Kuota galeri sudah habis (${found.usedGalleries}/${found.maxGalleries} terpakai)` 
      };
    }

    return {
      valid: true,
      license: found,
      remainingQuota: found.maxGalleries - found.usedGalleries
    };
  },

  // 3. GALLERIES & EXPIRATION
  getAllGalleriesMeta() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_GALLERIES)) || {};
    } catch (e) {
      return {};
    }
  },

  saveAllGalleriesMeta(meta) {
    localStorage.setItem(this.STORAGE_GALLERIES, JSON.stringify(meta));
  },

  /**
   * Register a new gallery under a license key and deduct quota
   */
  registerGallery(licenseKey, folderId, config = {}, expiryDays = 30) {
    const cleanKey = (licenseKey || "").trim().toUpperCase();
    const keys = this.getAllKeys();
    const keyIndex = keys.findIndex(k => k.key.toUpperCase() === cleanKey);

    if (keyIndex === -1) {
      throw new Error("Key unik tidak terdaftar");
    }

    const license = keys[keyIndex];

    // Check if this folderId was already created with this key (re-editing doesn't use double quota)
    const alreadyRegistered = license.galleries && license.galleries.includes(folderId);

    if (!alreadyRegistered) {
      if (license.usedGalleries >= license.maxGalleries) {
        throw new Error(`Batas kuota tercapai (${license.maxGalleries} galeri)`);
      }
      license.usedGalleries += 1;
      license.galleries = license.galleries || [];
      license.galleries.push(folderId);
      keys[keyIndex] = license;
      this.saveAllKeys(keys);
    }

    // Calculate Expiry Date
    let expiryDate = null;
    if (expiryDays && expiryDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + parseInt(expiryDays, 10));
      expiryDate = exp.toISOString();
    }

    // Save Gallery Metadata with complete design settings
    const allMeta = this.getAllGalleriesMeta();
    allMeta[folderId] = {
      folderId,
      title: config.heroTitle || "The Wedding Collection",
      subtitle: config.heroSubtitle || "A curated gallery of unforgettable moments and timeless memories.",
      theme: config.theme || "dark",
      layout: config.layout || "masonry",
      columnsDesktop: config.columnsDesktop || 3,
      licenseKey: cleanKey,
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate
    };
    this.saveAllGalleriesMeta(allMeta);

    return allMeta[folderId];
  },

  /**
   * Check if a gallery is expired
   */
  checkGalleryStatus(folderId) {
    const allMeta = this.getAllGalleriesMeta();
    const meta = allMeta[folderId];

    if (!meta || !meta.expiryDate) {
      return { isExpired: false, expiryDate: null, daysLeft: null };
    }

    const now = new Date();
    const expiry = new Date(meta.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime <= 0) {
      return { isExpired: true, expiryDate: meta.expiryDate, daysLeft: 0 };
    }

    return { isExpired: false, expiryDate: meta.expiryDate, daysLeft: diffDays };
  }
};

window.AuthService = AuthService;
AuthService.init();
