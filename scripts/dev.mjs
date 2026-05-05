import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'cmd.exe' : 'npm'

const services = [
  {
    name: 'backend',
    command: npmCommand,
    args: buildNpmArgs(['run', 'dev', '--prefix', 'backend']),
    probes: ['http://127.0.0.1:4000/api/health'],
  },
  {
    name: 'frontend',
    command: npmCommand,
    args: buildNpmArgs(['run', 'dev', '--prefix', 'frontend']),
    probes: ['http://127.0.0.1:5173/admin', 'http://127.0.0.1:5174/admin'],
  },
]

const spawnedChildren = []

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(signal))
}

main().catch((error) => {
  console.error(`[dev] ${error instanceof Error ? error.message : String(error)}`)
  shutdown('error', 1)
})

async function main() {
  for (const service of services) {
    const reachableProbe = await findReachableProbe(service.probes)

    if (reachableProbe) {
      console.log(`[dev] ${service.name} already running at ${reachableProbe}`)
      continue
    }

    console.log(`[dev] starting ${service.name}...`)
    const child = spawn(service.command, service.args, {
      stdio: 'inherit',
      env: process.env,
    })

    child.on('exit', (code, signal) => {
      const suffix = signal ? `signal ${signal}` : `code ${code ?? 0}`
      console.log(`[dev] ${service.name} exited with ${suffix}`)
      const index = spawnedChildren.indexOf(child)
      if (index >= 0) {
        spawnedChildren.splice(index, 1)
      }

      if (spawnedChildren.length === 0) {
        process.exit(code ?? 0)
      }
    })

    spawnedChildren.push(child)
  }

  if (spawnedChildren.length === 0) {
    console.log('[dev] frontend and backend are already running')
    return
  }

  await new Promise(() => {})
}

async function findReachableProbe(probes) {
  for (const probe of probes) {
    if (await isReachable(probe)) {
      return probe
    }
  }

  return null
}

async function isReachable(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 800)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

function buildNpmArgs(args) {
  if (!isWindows) {
    return args
  }

  return ['/d', '/s', '/c', 'npm.cmd', ...args]
}

function shutdown(reason, code = 0) {
  if (reason) {
    console.log(`[dev] shutting down (${reason})`)
  }

  for (const child of spawnedChildren.splice(0)) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  process.exit(code)
}