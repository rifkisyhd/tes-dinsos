import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
// const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;

const supabaseUrl = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
