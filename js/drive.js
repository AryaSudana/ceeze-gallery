/**
 * Google Drive API Service & Link Parser
 */

const DriveService = {
  STORAGE_KEY_API: "ceeze_gdrive_api_key",
  
  /**
   * Extract folder ID from various Google Drive & Picspot URL formats
   */
  extractFolderId(input) {
    if (!input || typeof input !== "string") return null;
    const clean = input.trim();
    
    // Pattern 1: drive.google.com/drive/folders/{ID}
    const matchDrive = clean.match(/folders\/([a-zA-Z0-9_-]{25,})/);
    if (matchDrive) return matchDrive[1];

    // Pattern 2: editor.picspot.co/{ID} or picspot.co/{ID}
    const matchPicspot = clean.match(/picspot\.co\/([a-zA-Z0-9_-]{25,})/);
    if (matchPicspot) return matchPicspot[1];

    // Pattern 3: id parameter ?id={ID}
    const matchParam = clean.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
    if (matchParam) return matchParam[1];

    // Pattern 4: Raw Folder ID (Google Drive IDs are usually 28-44 chars alphanumeric)
    if (/^[a-zA-Z0-9_-]{25,}$/.test(clean)) {
      return clean;
    }

    return null;
  },

  /**
   * Get configured Google Drive API Key
   */
  getApiKey() {
    return localStorage.getItem(this.STORAGE_KEY_API) || "";
  },

  /**
   * Save custom API Key
   */
  setApiKey(key) {
    if (key) {
      localStorage.setItem(this.STORAGE_KEY_API, key.trim());
    } else {
      localStorage.removeItem(this.STORAGE_KEY_API);
    }
  },

  /**
   * Fetch photos from a Google Drive Folder via official Drive API v3
   */
  async fetchFolderPhotos(folderId, customApiKey = "") {
    const apiKey = customApiKey || this.getApiKey();

    if (!apiKey) {
      throw new Error("API_KEY_REQUIRED");
    }

    // Query for non-trashed image files inside the specified parent folder
    const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;
    const fields = "files(id, name, mimeType, size, thumbnailLink, webContentLink, imageMediaMetadata)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100&orderBy=name&key=${apiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || response.statusText;
      
      if (response.status === 403 || response.status === 401) {
        throw new Error("PERMISSION_OR_KEY_INVALID: " + message);
      }
      if (response.status === 404) {
        throw new Error("FOLDER_NOT_FOUND");
      }
      throw new Error(`GDRIVE_API_ERROR: ${message}`);
    }

    const data = await response.json();
    const files = data.files || [];

    if (files.length === 0) {
      return [];
    }

    // Format files into clean photo objects
    return files.map((file, index) => {
      const width = file.imageMediaMetadata?.width || 1200;
      const height = file.imageMediaMetadata?.height || 800;
      const isPortrait = height > width;

      return {
        id: file.id,
        name: file.name || `Photo_${index + 1}.jpg`,
        // Google Thumbnail CDN provides fast, optimized cached images
        previewUrl: `https://lh3.googleusercontent.com/d/${file.id}=w1200`,
        fullUrl: `https://lh3.googleusercontent.com/d/${file.id}=w2560`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
        aspectRatio: isPortrait ? "portrait" : "landscape",
        size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "N/A",
        dimensions: `${width}x${height}`
      };
    });
  }
};

window.DriveService = DriveService;
