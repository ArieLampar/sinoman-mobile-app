// Supabase Edge Function: Send OTP via FONTTE WhatsApp API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';
import { validatePhoneNumber, sanitizePhoneForLog } from '../_shared/validators.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { phone } = await req.json();

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: phoneValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = phoneValidation.normalized!;
    console.log(`Send OTP request for: ${sanitizePhoneForLog(normalizedPhone)}`);

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Konfigurasi server tidak lengkap' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Configuration from environment
    const OTP_EXPIRY_MINUTES = parseInt(Deno.env.get('OTP_EXPIRY_MINUTES') || '5');
    const RESEND_COOLDOWN_SECONDS = parseInt(Deno.env.get('RESEND_COOLDOWN_SECONDS') || '60');
    const MAX_HOURLY_REQUESTS = parseInt(Deno.env.get('MAX_OTP_ATTEMPTS') || '20'); // Increased for testing
    console.log(`Config: OTP_EXPIRY=${OTP_EXPIRY_MINUTES}min, COOLDOWN=${RESEND_COOLDOWN_SECONDS}s`);

    // Rate limiting: Check recent OTP requests
    console.log('Checking rate limiting...');
    const cooldownTime = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);

    let recentOtp;
    try {
      const { data, error } = await supabase
        .from('otp_requests')
        .select('created_at')
        .eq('phone', normalizedPhone)
        .gte('created_at', cooldownTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Rate limit check error:', error);
        throw error;
      }
      recentOtp = data;
    } catch (error) {
      console.error('Database error during rate limit check:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Terjadi kesalahan sistem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (recentOtp) {
      console.log('Rate limit hit - cooldown active');
      const waitSeconds = Math.ceil(
        RESEND_COOLDOWN_SECONDS - (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Mohon tunggu ${waitSeconds} detik sebelum kirim ulang`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check hourly request count
    console.log('Checking hourly rate limit...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let count;
    try {
      const result = await supabase
        .from('otp_requests')
        .select('*', { count: 'exact', head: true })
        .eq('phone', normalizedPhone)
        .gte('created_at', oneHourAgo.toISOString());

      if (result.error) {
        console.error('Hourly rate limit check error:', result.error);
        throw result.error;
      }
      count = result.count;
    } catch (error) {
      console.error('Database error during hourly rate limit check:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Terjadi kesalahan sistem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Hourly request count: ${count}`);
    if (count && count >= MAX_HOURLY_REQUESTS) {
      console.log('Hourly rate limit exceeded');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Terlalu banyak permintaan. Silakan coba lagi nanti'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP (ensure not starting with 0)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP to database
    const { error: dbError } = await supabase
      .from('otp_requests')
      .insert({
        phone: normalizedPhone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Gagal menyimpan OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call FONNTE API
    const fontteToken = Deno.env.get('FONNTE_API_TOKEN');
    if (!fontteToken) {
      console.error('FONNTE_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Konfigurasi server tidak lengkap' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('FONNTE API Token loaded successfully');

    const message = `Kode OTP Sinoman Anda: ${otpCode}. Berlaku selama ${OTP_EXPIRY_MINUTES} menit. JANGAN BAGIKAN kode ini kepada siapapun.`;

    const formData = new FormData();
    formData.append('target', normalizedPhone);
    formData.append('message', message);
    formData.append('countryCode', '62');

    console.log('Calling FONNTE API...');

    // Add timeout to FONNTE API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    let fontteResponse;
    try {
      fontteResponse = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fontteToken
        },
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('FONNTE API fetch error:', fetchError.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Timeout mengirim OTP. Silakan coba lagi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('FONNTE API responded with status:', fontteResponse.status);
    const fontteResult = await fontteResponse.json();
    console.log('FONNTE API result:', fontteResult);

    // Check if FONNTE API returned an error
    // FONNTE success response: { detail: "success! message in queue", id: [...], process: "pending" }
    // FONNTE error response: { reason: "...", status: false }
    if (!fontteResponse.ok || fontteResult.status === false || fontteResult.reason) {
      console.error('FONNTE API error:', fontteResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: fontteResult.reason || 'Gagal mengirim OTP. Silakan coba lagi'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP sent successfully to: ${sanitizePhoneForLog(normalizedPhone)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP berhasil dikirim ke WhatsApp',
        expiresIn: OTP_EXPIRY_MINUTES * 60
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Terjadi kesalahan. Silakan coba lagi'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
