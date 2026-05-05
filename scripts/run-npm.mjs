import { spawn } from 'node:child_process'

const args = process.argv.slice(2)

if (!args.length) {
  console.error('[run-npm] missing npm arguments')
  process.exit(1)
}

const isWindows = process.platform === 'win32'
const command = isWindows ? 'cmd.exe' : 'npm'
const commandArgs = isWindows ? ['/d', '/s', '/c', 'npm.cmd', ...args] : args

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: process.env,
})

child.on('error', (error) => {
  console.error(`[run-npm] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})