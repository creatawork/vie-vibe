import { readFileSync, readdirSync, statSync, createReadStream } from 'node:fs'
import { join, relative } from 'node:path'
import { Client } from 'ssh2'

const HOST = '189.24.79.130'
const USER = 'root'
const PASSWORD = process.env.SSH_PASSWORD
const DOMAIN = 'vie-vibe.cn'
const PRIVATE_KEY = readFileSync('deploy/gh-deploy', 'utf8')
const PUB_KEY = readFileSync('deploy/gh-deploy.pub', 'utf8').trim()
const DEPLOY_DIR = '/opt/vie/app/deploy'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn))
    conn.on('error', reject)
    const opts = { host: HOST, port: 22, username: USER, readyTimeout: 60000 }
    if (PASSWORD) {
      opts.password = PASSWORD
    } else {
      opts.privateKey = PRIVATE_KEY
    }
    conn.connect(opts)
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`命令失败 (${code}): ${cmd}`))
      })
    })
  })
}

function sftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s))
  })
}

function mkdirp(s, dir) {
  return new Promise((resolve, reject) => {
    s.mkdir(dir, { mode: 0o755 }, (err) => {
      if (!err || err.code === 4) return resolve()
      reject(err)
    })
  })
}

async function uploadDir(s, localDir, remoteDir) {
  await mkdirp(s, remoteDir)
  for (const name of readdirSync(localDir)) {
    const localPath = join(localDir, name)
    const remotePath = `${remoteDir}/${name}`
    if (statSync(localPath).isDirectory()) {
      await uploadDir(s, localPath, remotePath)
    } else {
      await new Promise((resolve, reject) => {
        s.fastPut(localPath, remotePath, (err) => err ? reject(err) : resolve())
      })
    }
  }
}

async function uploadFile(s, localPath, remotePath) {
  await new Promise((resolve, reject) => {
    s.fastPut(localPath, remotePath, (err) => err ? reject(err) : resolve())
  })
}

async function main() {
  console.log('>>> 连接服务器...')
  const conn = await connect()
  const s = await sftp(conn)

  try {
    if (PASSWORD) {
      console.log('>>> 配置 SSH 公钥...')
      await exec(conn, `mkdir -p ~/.ssh && chmod 700 ~/.ssh && grep -qxF '${PUB_KEY}' ~/.ssh/authorized_keys 2>/dev/null || echo '${PUB_KEY}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`)
    }

    console.log('>>> 安装 Docker...')
    await exec(conn, 'command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh')

    console.log('>>> 创建部署目录...')
    await exec(conn, `mkdir -p ${DEPLOY_DIR}/site-dist`)

    console.log('>>> 上传部署配置...')
    await uploadFile(s, 'deploy/Caddyfile', `${DEPLOY_DIR}/Caddyfile`)
    await uploadFile(s, 'deploy/docker-compose.yml', `${DEPLOY_DIR}/docker-compose.yml`)
    await uploadFile(s, 'deploy/.env.example', `${DEPLOY_DIR}/.env.example`)

    console.log('>>> 上传静态站点（约 1~2 分钟）...')
    await exec(conn, `rm -rf ${DEPLOY_DIR}/site-dist/*`)
    await uploadDir(s, 'site/.vitepress/dist', `${DEPLOY_DIR}/site-dist`)

    console.log('>>> 写入 .env 并启动 Caddy...')
    await exec(conn, `cd ${DEPLOY_DIR} && cp -n .env.example .env 2>/dev/null || true && sed -i 's/^DOMAIN=.*/DOMAIN=${DOMAIN}/' .env && docker compose up -d`)

    console.log('>>> 检查容器状态...')
    await exec(conn, `cd ${DEPLOY_DIR} && docker compose ps && ls -la site-dist | head -8`)

    console.log('\n✅ 服务器部署完成！请访问 https://vie-vibe.cn')
  } finally {
    conn.end()
  }
}

main().catch((e) => {
  console.error('部署失败:', e.message)
  process.exit(1)
})
