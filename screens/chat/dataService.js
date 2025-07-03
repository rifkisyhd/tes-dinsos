// dataService.js - Service untuk mengakses data dari Supabase Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konfigurasi Supabase Storage
const SUPABASE_URL = 'https://ixrmjbmblmzlpwgauxgq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cm1qYm1ibG16bHB3Z2F1eGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzkwOTIsImV4cCI6MjA1OTkxNTA5Mn0.DvaXjedssLmQ1cNU-8mMa2BypA-YTkSztppdhHp2kXg';
const STORAGE_BUCKET = 'chat-jsc'; // nama bucket di Supabase Storage
const DATA_FILE = 'dataupt.json'; // nama file JSON

// Cache configuration
const CACHE_KEY = 'dinsos_data_cache';
const CACHE_TIMESTAMP_KEY = 'dinsos_data_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 jam

class DataService {
  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_ANON_KEY;
    this.storageUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${DATA_FILE}`;
  }

  // Method utama untuk load data dengan cache
  async loadDinsosData() {
    try {
      console.log('🔄 Loading Dinsos data...');
      
      // 1. Cek cache terlebih dahulu
      const cachedData = await this.getCachedData();
      if (cachedData) {
        console.log('✅ Using cached data');
        return cachedData;
      }

      // 2. Ambil dari Supabase Storage
      const freshData = await this.fetchFromStorage();
      if (freshData) {
        console.log('✅ Fresh data loaded from Supabase Storage');
        await this.setCachedData(freshData);
        return freshData;
      }

      // 3. Fallback ke data lokal
      console.log('⚠️ Using fallback local data');
      return await this.getFallbackData();

    } catch (error) {
      console.error('❌ Error in loadDinsosData:', error);
      return await this.getFallbackData();
    }
  }

  // Ambil data dari Supabase Storage (file JSON)
  async fetchFromStorage() {
    try {
      console.log('📡 Fetching from Storage URL:', this.storageUrl);
      
      const response = await fetch(this.storageUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Error fetching from storage:', error);
      return null;
    }
  }

  // Cek dan ambil data dari cache
  async getCachedData() {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const cacheTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (!cachedData || !cacheTimestamp) {
        return null;
      }

      const now = Date.now();
      const isValidCache = (now - parseInt(cacheTimestamp)) < CACHE_DURATION;

      if (isValidCache) {
        return JSON.parse(cachedData);
      } else {
        // Cache expired, hapus
        await this.clearCache();
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting cached data:', error);
      return null;
    }
  }

  // Simpan data ke cache
  async setCachedData(data) {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      console.log('💾 Data cached successfully');
    } catch (error) {
      console.error('❌ Error caching data:', error);
    }
  }

  // Hapus cache
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  // Fallback ke data lokal jika semua gagal
  async getFallbackData() {
    try {
      // Pastikan file dataupt.json ada di folder yang sama
      const fallbackData = require('./dataupt.json');
      console.log('📁 Using local fallback data');
      return fallbackData;
    } catch (error) {
      console.error('❌ Error loading fallback data:', error);
      return {
        kantor_pusat: {
          nama: "Dinas Sosial Provinsi Jawa Timur",
          alamat: "Data sedang dimuat...",
          telepon: "Hubungi admin"
        },
        upt_list: []
      };
    }
  }

  // Force refresh data (hapus cache dan ambil fresh data)
  async refreshData() {
    console.log('🔄 Force refreshing data...');
    await this.clearCache();
    return await this.loadDinsosData();
  }

  // Cek status koneksi dan data
  async getDataStatus() {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const cacheTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      const status = {
        hasCachedData: !!cachedData,
        cacheAge: cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null,
        isCacheValid: false,
        lastUpdate: cacheTimestamp ? new Date(parseInt(cacheTimestamp)).toLocaleString() : 'Never'
      };

      if (status.cacheAge !== null) {
        status.isCacheValid = status.cacheAge < CACHE_DURATION;
      }

      return status;
    } catch (error) {
      console.error('❌ Error getting data status:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new DataService();