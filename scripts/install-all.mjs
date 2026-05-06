import { spawn } from 'node:child_process'

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isWindows = process.platform === 'win32'

const steps = [
  {
    label: 'root dependencies',
    cwd: process.cwd(),
    command: isWindows ? 'cmd.exe' : 'npm',
    commandArgs: isWindows ? ['/d', '/s', '/c', 'npm.cmd', 'install'] : ['install'],
  },
  {
    label: 'backend dependencies',
    cwd: new URL('../backend/', import.meta.url),
    command: isWindows ? 'cmd.exe' : 'npm',
    commandArgs: isWindows ? ['/d', '/s', '/c', 'npm.cmd', 'install'] : ['install'],
  },
  {
    label: 'frontend dependencies',
    cwd: new URL('../frontend/', import.meta.url),
    command: isWindows ? 'cmd.exe' : 'npm',
    commandArgs: isWindows ? ['/d', '/s', '/c', 'npm.cmd', 'install'] : ['install'],
  },
]

for (const step of steps) {
  const cwd = toFileSystemPath(step.cwd)

  if (isDryRun) {
    console.log(`[install-all] ${step.label}: ${step.command} ${step.commandArgs.join(' ')} (${cwd})`)
    continue
  }

  console.log(`[install-all] installing ${step.label}...`)
  await runCommand(step.command, step.commandArgs, cwd)
}

if (isDryRun) {
  console.log('[install-all] dry run complete')
} else {
  console.log('[install-all] all dependencies installed')
}

function runCommand(command, commandArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated with signal ${signal}`))
        return
      }

      if (code !== 0) {
        reject(new Error(`Command exited with code ${code ?? 0}`))
        return
      }

      resolve()
    })
  })
}

function toFileSystemPath(value) {
  if (typeof value === 'string') {
    return value
  }

  return value.pathname.startsWith('/') && process.platform === 'win32'
    ? value.pathname.slice(1).replaceAll('/', '\\')
    : value.pathname
}