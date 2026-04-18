import { createClient } from '@supabase/supabase-js'

function getRequiredEnvVar(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
	const value = process.env[name]

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}

	return value
}

const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseKey)