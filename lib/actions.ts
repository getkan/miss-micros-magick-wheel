import { revalidatePath } from 'next/cache'
 
export async function refreshEntries() {
  'use server'
  revalidatePath('/wheel')
}


const DEFAULT_MODE = 'professional'
export async function getIsClub(){
    'use server'
    const mode = process.env.GAME_MODE?.trim() || DEFAULT_MODE
    return mode === 'club';
}