// Supabase Edge Function: Verify OTP and create session
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';
import { validatePhoneNumber, validateOtpCode, sanitizePhoneForLog } from '../_shared/validators.ts';

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
    const { phone, otp } = await req.json();

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: phoneValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate OTP code
    const otpValidation = validateOtpCode(otp);
    if (!otpValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: otpValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = phoneValidation.normalized!;
    console.log(`Verify OTP request for: ${sanitizePhoneForLog(normalizedPhone)}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const MAX_OTP_ATTEMPTS = parseInt(Deno.env.get('MAX_OTP_ATTEMPTS') || '3');

    // Query OTP record
    const { data: otpRecord, error: queryError } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (queryError || !otpRecord) {
      console.log('OTP record not found or expired');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Kode OTP tidak valid atau sudah kadaluarsa'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP code
    console.log('Comparing OTP - stored:', otpRecord.otp_code, 'provided:', otp, 'match:', otpRecord.otp_code === otp);
    console.log('Stored OTP type:', typeof otpRecord.otp_code, 'Provided OTP type:', typeof otp);
    if (otpRecord.otp_code !== otp) {
      // Increment attempts
      const newAttempts = otpRecord.attempts + 1;

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        // Max attempts reached, expire the OTP
        await supabase
          .from('otp_requests')
          .update({ expires_at: new Date().toISOString(), attempts: newAttempts })
          .eq('id', otpRecord.id);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Maksimal percobaan tercapai. Silakan minta OTP baru'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update attempts counter
      await supabase
        .from('otp_requests')
        .update({ attempts: newAttempts })
        .eq('id', otpRecord.id);

      const remaining = MAX_OTP_ATTEMPTS - newAttempts;
      return new Response(
        JSON.stringify({
          success: false,
          error: `Kode OTP salah. Sisa percobaan: ${remaining}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('otp_requests')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id);

    // Get or create user - use user_profiles table for deterministic lookup
    console.log('Looking up user profile for:', sanitizePhoneForLog(normalizedPhone));
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, phone, is_profile_complete')
      .eq('phone', normalizedPhone)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK for new users
      console.error('Error querying user_profiles:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Gagal mengakses data pengguna' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let user = null;
    let isProfileComplete = false;

    if (existingProfile) {
      console.log('Existing user found:', existingProfile.id);
      // Existing user - get from auth.users
      const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(existingProfile.id);

      if (getUserError) {
        console.error('Error getting auth user:', getUserError);
        return new Response(
          JSON.stringify({ success: false, error: 'Gagal mengakses data pengguna' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      user = authUser?.user || null;
      isProfileComplete = existingProfile.is_profile_complete ?? false;
      console.log('User loaded, profile complete:', isProfileComplete);
    }

    if (!user) {
      console.log('Creating new user for:', sanitizePhoneForLog(normalizedPhone));

      // Create user with email instead of phone (phone auth requires SMS provider)
      // Use phone as email with dummy domain
      const dummyEmail = `${normalizedPhone.replace('+', '')}@phone.sinoman.id`;

      console.log('Creating user with email:', dummyEmail);
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: dummyEmail,
        email_confirm: true,
        user_metadata: {
          phone: normalizedPhone,
          is_profile_complete: false
        }
      });

      if (createError || !newUserData.user) {
        console.error('Failed to create user. Error:', createError);
        console.error('Error message:', createError?.message);
        console.error('Error status:', createError?.status);
        console.error('Error details:', JSON.stringify(createError));
        return new Response(
          JSON.stringify({ success: false, error: 'Gagal membuat akun pengguna' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      user = newUserData.user;
      console.log('New user created:', user.id);

      // Create user profile
      console.log('Creating user profile for user:', user.id);
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          phone: normalizedPhone,
          is_profile_complete: false
        });

      if (insertError) {
        console.error('Failed to create user profile. Error:', insertError);
        console.error('Error message:', insertError?.message);
        console.error('Error code:', insertError?.code);
        console.error('Error details:', JSON.stringify(insertError));
        return new Response(
          JSON.stringify({ success: false, error: 'Gagal membuat profil pengguna' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      isProfileComplete = false;
      console.log('User profile created');
    } else {
      // Existing user - update phone_confirmed_at if null
      if (!user.phone_confirmed_at) {
        console.log('Updating phone confirmation for existing user');
        await supabase.auth.admin.updateUserById(user.id, {
          phone_confirm: true
        });
      }
    }

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Construct user object
    const userObject = {
      id: user.id,
      phone: normalizedPhone,
      email: userProfile?.email || null,
      name: userProfile?.name || null,
      address: userProfile?.address || null,
      isProfileComplete,
      createdAt: user.created_at,
      updatedAt: userProfile?.updated_at || user.created_at
    };

    // Update user metadata with phone
    console.log('Updating user metadata with phone');
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        phone: normalizedPhone,
        is_profile_complete: isProfileComplete,
        name: userProfile?.name || null,
        email: userProfile?.email || null,
        address: userProfile?.address || null
      }
    });

    // Generate a one-time token link for the user
    console.log('Generating auth token for user:', user.id);
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    });

    if (tokenError || !tokenData?.properties?.hashed_token) {
      console.error('Failed to generate auth token:', tokenError);
      return new Response(
        JSON.stringify({ success: false, error: 'Gagal membuat sesi login' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Auth token generated successfully for: ${sanitizePhoneForLog(normalizedPhone)}, profile complete: ${isProfileComplete}`);

    // Return the hashed token which can be verified by the client
    return new Response(
      JSON.stringify({
        success: true,
        user: userObject,
        isProfileComplete,
        authToken: tokenData.properties.hashed_token
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);

    // Return detailed error in development
    const errorDetails = {
      message: error?.message || String(error),
      type: error?.constructor?.name || typeof error,
      stack: error?.stack || 'No stack trace'
    };

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Terjadi kesalahan. Silakan coba lagi',
        details: errorDetails // Include error details for debugging
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
