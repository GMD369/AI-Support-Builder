import { createClient } from '@supabase/supabase-js'

function getRequiredEnvVar(value: string | undefined, name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
	const normalizedValue = value?.trim()

	if (!normalizedValue) {
		throw new Error(`Missing required environment variable: ${name}`)
	}

	return normalizedValue
}

const supabaseUrl = getRequiredEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getRequiredEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseKey)