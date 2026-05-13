import { Adatkezeles } from './Adatkezeles.js'

const sessionKey = 'otcbrUser'
const loginLogKey = 'otcbrLoginLogs'
const adatkezeles = new Adatkezeles()

const logList = document.querySelector('#log-list')
const logCount = document.querySelector('#log-count')
const logSearch = document.querySelector('#log-search')
const logClear = document.querySelector('#log-clear')
const logBack = document.querySelector('#log-back')
const logLogout = document.querySelector('#log-logout')
const navStatus = document.querySelector('.nav-status')
const navStatusText = document.querySelector('.nav-status .status-text')

let allLogs = []

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null')
  } catch (error) {
    console.warn('Invalid session data:', error)
    return null
  }
}

function requireAdmin() {
  const currentUser = getSessionUser()
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html'
    return null
  }
  return currentUser
}

function getLogs() {
  try {
    const raw = JSON.parse(localStorage.getItem(loginLogKey) || '[]')
    const logs = Array.isArray(raw) ? raw : []
    return logs.filter((item) => {
      const role = String(item.role || '').toLowerCase()
      return role === 'admin' || role === 'teacher'
    })
  } catch (error) {
    console.warn('Could not read login logs:', error)
    return []
  }
}

function formatDate(isoDate) {
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('hu-HU')
}

function renderLogs(query = '') {
  if (!logList) return

  const normalized = String(query || '').toLowerCase().trim()
  const filtered = allLogs.filter((item) => {
    const name = String(item.name || '').toLowerCase()
    const email = String(item.email || '').toLowerCase()
    return name.includes(normalized) || email.includes(normalized)
  })

  if (!filtered.length) {
    logList.innerHTML = '<p class="small-muted">Nincs találat a naplóban.</p>'
    if (logCount) {
      logCount.textContent = `0 / ${allLogs.length}`
    }
    return
  }

  logList.innerHTML = filtered.map((item) => `
    <div class="log-row">
      <div>
        <strong>${item.name || 'Ismeretlen'}</strong><br>
        <span class="small-muted">${item.email || '-'}</span>
      </div>
      <div>
        <div class="role-pill ${item.role || 'teacher'}">${item.role === 'admin' ? 'Admin' : 'Tanár'}</div>
      </div>
      <div class="small-muted">${formatDate(item.at)}</div>
    </div>
  `).join('')

  if (logCount) {
    logCount.textContent = `${filtered.length} / ${allLogs.length}`
  }
}

function setNavStatus(text, online) {
  if (!navStatus || !navStatusText) return
  navStatus.classList.toggle('online', online)
  navStatus.classList.toggle('offline', !online)
  navStatusText.textContent = text
}

async function updateNavStatus() {
  try {
    const response = await fetch(adatkezeles.apiUrl, { method: 'GET' })
    if (response.ok) {
      setNavStatus('Elérhető', true)
    } else {
      setNavStatus(`Hiba (${response.status})`, false)
    }
  } catch (error) {
    setNavStatus('Nem elérhető', false)
    console.warn('Log page status check failed:', error)
  }
}

const currentUser = requireAdmin()
if (!currentUser) {
  throw new Error('Admin access required')
}

allLogs = getLogs()
renderLogs()

if (logSearch) {
  logSearch.addEventListener('input', (event) => {
    renderLogs(event.target.value)
  })
}

if (logClear) {
  logClear.addEventListener('click', () => {
    if (!confirm('Biztosan törlöd a teljes naplót?')) return
    localStorage.setItem(loginLogKey, JSON.stringify([]))
    allLogs = []
    renderLogs(logSearch ? logSearch.value : '')
  })
}

if (logBack) {
  logBack.addEventListener('click', () => {
    window.location.href = 'admin.html'
  })
}

if (logLogout) {
  logLogout.addEventListener('click', () => {
    localStorage.removeItem(sessionKey)
    window.location.href = 'index.html'
  })
}

updateNavStatus()
setInterval(updateNavStatus, 15000)
