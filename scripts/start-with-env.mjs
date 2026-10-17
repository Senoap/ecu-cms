// scripts/start-with-env.mjs
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const targetEnv = (process.argv[2] || 'dev').toLowerCase()
const nextCommand = process.argv[3] || 'dev'

const envFile = targetEnv === 'stg' || targetEnv === 'uat'
  ? '.env.stg'
  : targetEnv === 'prod' || targetEnv === 'production'
  ? '.env.prod'
  : '.env.dev'

const envPath = path.join(root, envFile)
if (!fs.existsSync(envPath)) {
  console.error(`❌ File ${envFile} tidak ditemukan!`)
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const parsedEnv = { ...process.env }
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    parsedEnv[key] = val
  }
}

console.log('====================================================')
console.log(`🚀 MENJALANKAN NEXT.JS [TARGET: ${targetEnv.toUpperCase()}]`)
console.log(`📄 Menggunakan env : ${envFile}`)
console.log(`🌐 Supabase URL    : ${parsedEnv.NEXT_PUBLIC_SUPABASE_URL}`)
console.log('====================================================\n')

const isWindows = process.platform === 'win32'
const cmd = isWindows ? 'npx.cmd' : 'npx'

const child = spawn(cmd, ['next', nextCommand], {
  cwd: root,
  stdio: 'inherit',
  env: parsedEnv,
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
