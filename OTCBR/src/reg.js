import { Adatkezeles } from './Adatkezeles.js'

const adatkezeles = new Adatkezeles()
const sessionKey = 'otcbrUser'

const form = document.querySelector('#registration-form')
const statusText = document.querySelector('#registration-status')
const navStatus = document.querySelector('.nav-status')
const navStatusText = document.querySelector('.nav-status .status-text')
const sessionActions = document.querySelector('#nav-session-actions')

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null')
  } catch (error) {
    console.warn('Invalid session data:', error)
    return null
  }
}

function setSessionUser(user) {
  if (user) {
    localStorage.setItem(sessionKey, JSON.stringify(user))
  } else {
    localStorage.removeItem(sessionKey)
  }
}

function renderSessionActions() {
  const currentUser = getSessionUser()
  if (!sessionActions) return

  if (!currentUser) {
    sessionActions.innerHTML = `
      <button id="nav-login" class="primary" type="button">Bejelentkezés</button>
    `
  } else {
    const isAdmin = currentUser.role === 'admin'
    sessionActions.innerHTML = `
      <div class="nav-user-badge">${currentUser.name || 'Felhasználó'} (${currentUser.role || 'student'})</div>
      ${isAdmin ? '<button id="nav-admin" class="secondary" type="button">Admin panel</button>' : ''}
      <button id="nav-logout" class="primary" type="button">Kijelentkezés</button>
    `
  }
}

function bindSessionActions() {
  const loginButton = document.querySelector('#nav-login')
  const logoutButton = document.querySelector('#nav-logout')
  const adminButton = document.querySelector('#nav-admin')

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      window.location.href = 'index.html'
    })
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      setSessionUser(null)
      window.location.href = 'index.html'
    })
  }

  if (adminButton) {
    adminButton.addEventListener('click', () => {
      window.location.href = 'admin.html'
    })
  }
}

async function updateNavStatus() {
  if (!navStatus || !navStatusText) return

  try {
    const response = await fetch(adatkezeles.apiUrl, { method: 'GET' })
    if (response.ok) {
      navStatus.classList.remove('offline')
      navStatus.classList.add('online')
      navStatusText.textContent = 'Elérhető'
    } else {
      navStatus.classList.remove('online')
      navStatus.classList.add('offline')
      navStatusText.textContent = `Hiba (${response.status})`
    }
  } catch (error) {
    navStatus.classList.remove('online')
    navStatus.classList.add('offline')
    navStatusText.textContent = 'Nem elérhető'
    console.warn('Registration page status check failed:', error)
  }
}

renderSessionActions()
bindSessionActions()

updateNavStatus()
setInterval(updateNavStatus, 15000)

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    if (statusText) {
      statusText.textContent = 'Regisztráció küldése...'
    }

    const result = await adatkezeles.regisztracioMentese(payload)

    if (result) {
      form.reset()
      if (statusText) {
        statusText.textContent = 'Sikeres regisztráció.'
      }
      const currentUser = getSessionUser()
      if (currentUser && currentUser.role) {
        renderSessionActions()
        bindSessionActions()
      }
      alert('A regisztráció sikeresen feltöltésre került a Retool API-ba.')
    } else {
      if (statusText) {
        statusText.textContent = 'A regisztráció nem sikerült.'
      }
      alert('Nem sikerült feltölteni az adatokat a Retool API-ba.')
    }
  })
}
