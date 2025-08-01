import { auth } from '@/lib/auth';
import "dotenv/config";

async function seed() {
  console.log('🌱 Seeding database...')
  
  try {


    console.log('✅ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
