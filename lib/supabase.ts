import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to prevent build-time errors
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    }
    return url;
}

function getSupabaseAnonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
    }
    return key;
}

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    }
    return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin) {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey();
        _supabaseAdmin = createClient(getSupabaseUrl(), serviceRoleKey);
    }
    return _supabaseAdmin;
}

// For backwards compatibility - these will throw if used during build time
// but that's expected behavior for API routes
export const supabase = {
    get from() { return getSupabase().from.bind(getSupabase()); },
    get auth() { return getSupabase().auth; },
    get storage() { return getSupabase().storage; },
    get rpc() { return getSupabase().rpc.bind(getSupabase()); },
};

export const supabaseAdmin = {
    get from() { return getSupabaseAdmin().from.bind(getSupabaseAdmin()); },
    get auth() { return getSupabaseAdmin().auth; },
    get storage() { return getSupabaseAdmin().storage; },
    get rpc() { return getSupabaseAdmin().rpc.bind(getSupabaseAdmin()); },
};
