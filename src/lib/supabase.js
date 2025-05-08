
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzryjbteawirmkyhhcqa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cnlqYnRlYXdpcm1reWhoY3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTcwNjYsImV4cCI6MjA2MTk5MzA2Nn0.Mu1XjOI29DxwmhRqnvIqdIjdmwM3SxT22c1k4VRIhms';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
