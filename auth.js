/**
 * CeEZe Studio - License Key, Quota, Expiration & Cloud Sync Engine
 * Hybrid: Firebase Firestore (Online Cloud) + LocalStorage (Offline Resilience)
 */

const AuthService = {
  STORAGE_KEYS: "ceeze_license_keys_v2",
  STORAGE_GALLERIES: "ceeze_galleries_meta_v2",
  STORAGE_ADMIN_PIN: "ceeze_admin_pin_v2",
  STORAGE_FIREBASE_CONFIG: "ceeze_firebase_config_v2",
  DEFAULT_PIN: "ceeze2026",

  // Firestore Collections
  COLLECTION_LICENSES: "ceeze_licenses",
  COLLECTION_GALLERIES: "ceeze_galleries",
  COLLECTION_SETTINGS: "ceeze_settings",

  // Official CeEZe Studio Firebase Cloud Config
  DEFAULT_FIREBASE_CONFIG: {
    apiKey: atob("QUl6YVN5RGNHREZmM2RLcFJYR0FiUzlkQ2lrbjFvc1RBMmxqbDd3"),
    authDomain: "ceeze-gallery-515803.firebaseapp.com",
    projectId: "ceeze-gallery-515803",
    storageBucket: "ceeze-gallery-515803.firebasestorage.app",
    messagingSenderId: "390624404842",
    appId: "1:390624404842:web:2cfd67e2f97fa869ab3113",
    measurementId: "G-LF7QPPDE43"
  },

  db: null,
  isFirebaseActive: false,

  init() {
    this.initLocalDefaults();
    this.initFirebase();
  },

  initLocalDefaults() {
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
          expiryDate: null
        }
      };
      localStorage.setItem(this.STORAGE_GALLERIES, JSON.stringify(initialMeta));
    }
  },

  getFirebaseConfig() {
    try {
      const raw = localStorage.getItem(this.STORAGE_FIREBASE_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.DEFAULT_FIREBASE_CONFIG;
  },

  saveFirebaseConfig(configObj) {
    if (!configObj) {
      localStorage.removeItem(this.STORAGE_FIREBASE_CONFIG);
      this.db = null;
      this.isFirebaseActive = false;
      return false;
    }
    localStorage.setItem(this.STORAGE_FIREBASE_CONFIG, JSON.stringify(configObj));
    return this.initFirebase(configObj);
  },

  initFirebase(customConfig = null) {
    const config = customConfig || this.getFirebaseConfig();
    if (!config || typeof window === "undefined" || !window.firebase) {
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.db = firebase.firestore();
      this.isFirebaseActive = true;
      console.log("☁️ Firebase Firestore connected successfully.");
      return true;
    } catch (err) {
      console.warn("⚠️ Firebase init failed, fallback to local:", err.message);
      this.isFirebaseActive = false;
      this.db = null;
      return false;
    }
  },

  async testConnection() {
    if (!this.isFirebaseActive || !this.db) {
      return { 
        success: false, 
        message: "Firebase SDK belum aktif. Pastikan config terpasang dan internet terhubung." 
      };
    }
    try {
      // Test read & write to verify Firestore database is created and security rules allow access
      const testRef = this.db.collection(this.COLLECTION_SETTINGS).doc('test_connection');
      await testRef.set({
        connected: true,
        testedAt: new Date().toISOString()
      }, { merge: true });
      
      const snap = await testRef.get();
      if (snap.exists) {
        return { success: true, message: "Koneksi Cloud Firestore 100% Berhasil & Aktif!" };
      }
      return { success: false, message: "Dokumen test tidak dapat dibaca dari Firestore." };
    } catch (err) {
      console.error("Firebase Test Connection Error:", err);
      let userMsg = err.message;
      const lower = (err.message || "").toLowerCase();
      if (err.code === 'permission-denied' || lower.includes('permission')) {
        userMsg = "Izin database ditolak (Permission Denied).\n\nSolusi: Buka Firebase Console > Firestore Database > tab Rules, ubah menjadi 'allow read, write: if true;' lalu klik Publish.";
      } else if (err.code === 'not-found' || lower.includes('not found') || lower.includes('database')) {
        userMsg = "Database Firestore belum dibuat di Firebase Console.\n\nSolusi: Buka Firebase Console > Databases & Storage > Firestore Database, lalu klik tombol 'Create database'.";
      } else if (err.code === 'unavailable') {
        userMsg = "Database Firestore sedang diinisialisasi atau offline. Pastikan database sudah dibuat di Firebase Console.";
      }
      return { success: false, code: err.code, message: userMsg };
    }
  },

  // 1. ADMIN PIN
  async getAdminPinAsync() {
    if (this.isFirebaseActive && this.db) {
      try {
        const doc = await this.db.collection(this.COLLECTION_SETTINGS).doc('admin_pin').get();
        if (doc.exists && doc.data()?.pin) {
          const cloudPin = doc.data().pin;
          localStorage.setItem(this.STORAGE_ADMIN_PIN, cloudPin);
          return cloudPin;
        }
      } catch (e) {
        console.warn("Error reading PIN from cloud:", e);
      }
    }
    return this.getAdminPin();
  },

  getAdminPin() {
    return localStorage.getItem(this.STORAGE_ADMIN_PIN) || this.DEFAULT_PIN;
  },

  async verifyAdminPinAsync(inputPin) {
    const clean = (inputPin || "").trim();
    const correctPin = await this.getAdminPinAsync();
    return clean === correctPin;
  },

  verifyAdminPin(inputPin) {
    return (inputPin || "").trim() === this.getAdminPin();
  },

  async setAdminPin(newPin) {
    if (!newPin || newPin.length < 4) return false;
    const cleanPin = newPin.trim();
    localStorage.setItem(this.STORAGE_ADMIN_PIN, cleanPin);

    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection(this.COLLECTION_SETTINGS).doc('admin_pin').set({
          pin: cleanPin,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Error saving PIN to cloud:", e);
      }
    }
    return true;
  },

  // 2. LICENSE KEYS
  async getAllKeysAsync() {
    if (this.isFirebaseActive && this.db) {
      try {
        const snapshot = await this.db.collection(this.COLLECTION_LICENSES).get();
        if (!snapshot.empty) {
          const cloudKeys = [];
          snapshot.forEach(doc => {
            cloudKeys.push(doc.data());
          });
          cloudKeys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.saveAllKeys(cloudKeys);
          return cloudKeys;
        }
      } catch (e) {
        console.warn("Error fetching keys from cloud:", e);
      }
    }
    return this.getAllKeys();
  },

  getAllKeys() {
    this.initLocalDefaults();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveAllKeys(keys) {
    localStorage.setItem(this.STORAGE_KEYS, JSON.stringify(keys));
  },

  async createLicenseKey(clientName, maxGalleries = 2) {
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

    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection(this.COLLECTION_LICENSES).doc(key).set(newKey);
      } catch (e) {
        console.warn("Error saving key to cloud:", e);
      }
    }

    return newKey;
  },

  async deleteLicenseKey(key) {
    const keys = this.getAllKeys().filter(k => k.key !== key);
    this.saveAllKeys(keys);

    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection(this.COLLECTION_LICENSES).doc(key).delete();
      } catch (e) {
        console.warn("Error deleting key from cloud:", e);
      }
    }
  },

  async validateKey(inputKey) {
    if (!inputKey) return { valid: false, reason: "Key tidak boleh kosong" };
    const cleanKey = inputKey.trim().toUpperCase();

    // Check Cloud if online
    if (this.isFirebaseActive && this.db) {
      try {
        const doc = await this.db.collection(this.COLLECTION_LICENSES).doc(cleanKey).get();
        if (doc.exists) {
          const data = doc.data();
          if (data.usedGalleries >= data.maxGalleries) {
            return {
              valid: false,
              reason: `Kuota galeri sudah habis (${data.usedGalleries}/${data.maxGalleries} terpakai)`
            };
          }
          return {
            valid: true,
            license: data,
            remainingQuota: data.maxGalleries - data.usedGalleries
          };
        }
      } catch (e) {
        console.warn("Error validating key in cloud:", e);
      }
    }

    // Fallback to local
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
  async getAllGalleriesMetaAsync() {
    if (this.isFirebaseActive && this.db) {
      try {
        const snapshot = await this.db.collection(this.COLLECTION_GALLERIES).get();
        if (!snapshot.empty) {
          const cloudMeta = {};
          snapshot.forEach(doc => {
            cloudMeta[doc.id] = doc.data();
          });
          this.saveAllGalleriesMeta(cloudMeta);
          return cloudMeta;
        }
      } catch (e) {
        console.warn("Error fetching galleries from cloud:", e);
      }
    }
    return this.getAllGalleriesMeta();
  },

  getAllGalleriesMeta() {
    this.initLocalDefaults();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_GALLERIES)) || {};
    } catch (e) {
      return {};
    }
  },

  saveAllGalleriesMeta(meta) {
    localStorage.setItem(this.STORAGE_GALLERIES, JSON.stringify(meta));
  },

  async registerGallery(licenseKey, folderId, config = {}, expiryDays = 30) {
    const cleanKey = (licenseKey || "").trim().toUpperCase();

    let license = null;
    let keys = this.getAllKeys();
    const keyIndex = keys.findIndex(k => k.key.toUpperCase() === cleanKey);

    if (this.isFirebaseActive && this.db) {
      try {
        const keyDoc = await this.db.collection(this.COLLECTION_LICENSES).doc(cleanKey).get();
        if (keyDoc.exists) {
          license = keyDoc.data();
        }
      } catch (e) {}
    }

    if (!license && keyIndex !== -1) {
      license = keys[keyIndex];
    }

    if (!license) {
      throw new Error("Key unik tidak terdaftar");
    }

    const alreadyRegistered = license.galleries && license.galleries.includes(folderId);

    if (!alreadyRegistered) {
      if (license.usedGalleries >= license.maxGalleries) {
        throw new Error(`Batas kuota tercapai (${license.maxGalleries} galeri)`);
      }
      license.usedGalleries += 1;
      license.galleries = license.galleries || [];
      license.galleries.push(folderId);

      // Update in cloud
      if (this.isFirebaseActive && this.db) {
        try {
          await this.db.collection(this.COLLECTION_LICENSES).doc(cleanKey).set(license, { merge: true });
        } catch (e) {}
      }

      // Update locally
      if (keyIndex !== -1) {
        keys[keyIndex] = license;
        this.saveAllKeys(keys);
      }
    }

    // Calculate Expiry Date
    let expiryDate = null;
    if (expiryDays && expiryDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + parseInt(expiryDays, 10));
      expiryDate = exp.toISOString();
    }

    const galleryData = {
      folderId,
      title: config.heroTitle || "The Wedding Collection",
      subtitle: config.heroSubtitle || "A curated gallery of unforgettable moments and timeless memories.",
      theme: config.theme || "dark",
      layout: config.layout || "masonry",
      columnsDesktop: config.columnsDesktop || 3,
      columnsMobile: config.columnsMobile || 1,
      licenseKey: cleanKey,
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate
    };

    // Save locally
    const allMeta = this.getAllGalleriesMeta();
    allMeta[folderId] = galleryData;
    this.saveAllGalleriesMeta(allMeta);

    // Save to Firestore Cloud
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection(this.COLLECTION_GALLERIES).doc(folderId).set(galleryData);
      } catch (e) {
        console.warn("Error saving gallery to cloud:", e);
      }
    }

    return galleryData;
  },

  async checkGalleryStatus(folderId) {
    let meta = null;

    // Check Cloud first if active
    if (this.isFirebaseActive && this.db) {
      try {
        const doc = await this.db.collection(this.COLLECTION_GALLERIES).doc(folderId).get();
        if (doc.exists) {
          meta = doc.data();
          const allMeta = this.getAllGalleriesMeta();
          allMeta[folderId] = meta;
          this.saveAllGalleriesMeta(allMeta);
        }
      } catch (e) {
        console.warn("Error checking gallery from cloud:", e);
      }
    }

    if (!meta) {
      const allMeta = this.getAllGalleriesMeta();
      meta = allMeta[folderId];
    }

    if (!meta || !meta.expiryDate) {
      return { isExpired: false, expiryDate: null, daysLeft: null, meta };
    }

    const now = new Date();
    const expiry = new Date(meta.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime <= 0) {
      return { isExpired: true, expiryDate: meta.expiryDate, daysLeft: 0, meta };
    }

    return { isExpired: false, expiryDate: meta.expiryDate, daysLeft: diffDays, meta };
  }
};

window.AuthService = AuthService;
AuthService.init();
