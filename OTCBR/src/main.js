import './style.css'
import './reg.css'
import './schedule.css'
import danceIcon from './assets/dance.svg'
import  './User.js'
import { Adatkezeles } from './Adatkezeles.js'
import { ScheduleManager } from './schedule.js'

// Adatkezelés inicializálása
const adatkezeles = new Adatkezeles()

let betoltottAdatok = []
const sessionKey = 'otcbrUser'
const loginLogKey = 'otcbrLoginLogs'

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

function logoutAndRefresh() {
  setSessionUser(null)
  window.location.reload()
}

function appendLoginLog(user) {
  if (!user) return

  const role = String(user.role || '').toLowerCase()
  if (role !== 'admin' && role !== 'teacher') return

  const entry = {
    name: user.name || 'Ismeretlen',
    email: user.email || '',
    role,
    at: new Date().toISOString(),
  }

  try {
    const current = JSON.parse(localStorage.getItem(loginLogKey) || '[]')
    const logs = Array.isArray(current) ? current : []
    logs.unshift(entry)
    localStorage.setItem(loginLogKey, JSON.stringify(logs.slice(0, 500)))
  } catch (error) {
    console.warn('Could not save login log:', error)
  }
}




document.querySelector('#app').innerHTML = `
<main id="fooldal" class="page-shell">
  <header class="banner">
    <div class="brand">
      <span class="eyebrow">OTCBR</span>
      <h1>OTCBR - A hivatalos Oktogon Tánc Centrum Beléptető Rendszer</h1>
      <p class="subtitle">Üdvözlünk az Oktogon Tánc Centrumban. Ez a főoldal a beléptető alkalmazás részleteit mutatja.</p>
    </div>
    <img class="hero-image" src="${danceIcon}" alt="Táncos illusztráció" />
  </header>

  <section id="orarend" class="cta-panel">
    <div class="mini-schedule">
      <div class="schedule-title">
        <strong>Rövid Órarend</strong>
        <span class="small-muted"> — az órai létesítmény</span>
      </div>
      <div class="schedule-grid">
        <div class="day">Hétfő</div>
        <div class="day">Kedd</div>
        <div class="day">Szerda</div>

        <div class="slot empty">—</div>
        <div class="slot empty">—</div>
        <div class="slot empty">—</div>
      </div>
    </div>
    <div class="school-info">
      <div>
        <h2>Oktogon Tánc Centrum</h2>
        <p>Stílus: lila, világoslila és elegáns táncos atmoszféra.</p>
      </div>
      <div class="team">
        <h3>Csapat</h3>
        <p>ANNA / BENCE / CSABA</p>
      </div>
    </div>
  </section>

  <section class="details">
    <article>
      <h2>Beléptető rendszer</h2>
      <p>A beléptetési felület az iskolai projekt keretében készült. A cél, hogy a táncosok és oktatók egyszerűen tudjanak belépni a rendszerbe.</p>
      <ul>
        <li>Bejelentkezés gomb a gyors hozzáféréshez</li>
        <li>Elérhetőségek részletes linkkel</li>
        <li>Projekt neve és fájl hivatkozások egyértelműen megjelenítve</li>
      </ul>
    </article>

    <aside id="kapcsolat" class="links">
      <h3>Linkek és hivatkozások</h3>
      <p><strong>Facebook:</strong> <a href="https://www.facebook.com/OktogonTancCentrum" target="_blank" rel="noreferrer">Oktogon Tánc Centrum Facebook</a></p>
      <p><strong>Fájlok:</strong> <code>index.html</code>, <code>src/main.js</code>, <code>src/style.css</code></p>
      <p><strong>Projekt:</strong> OTCBR - A hivatalos Oktogon Tánc Centrum Beléptető Rendszer</p>
    </aside>
  </section>
</main>
<div id="login-modal" class="auth-modal hidden">
  <div class="auth-card">
    <div class="auth-header">
      <h2>Bejelentkezés</h2>
      <button id="close-login" type="button" class="auth-close">×</button>
    </div>
    <p id="login-status" class="auth-status"></p>
    <form id="login-form" class="auth-form">
      <label>
        E-mail
        <input id="login-email" type="email" name="email" placeholder="email@pelda.hu" required>
      </label>
      <label>
        Jelszó
        <input id="login-password" type="password" name="password" placeholder="Jelszó" required>
      </label>
      <div class="auth-actions">
        <button type="button" id="cancel-login" class="secondary">Mégse</button>
        <button type="submit" class="primary">Belépés</button>
      </div>
    </form>
  </div>
</div>
`
// CTA gombok csak akkor kötődnek, ha léteznek (a navigáció tetején is vannak gombok)
const ctaLogin = document.querySelector('#login')
if (ctaLogin) ctaLogin.addEventListener('click', () => {
  alert('Bejelentkezés gomb megnyomva. A beléptető rendszer hamarosan aktiválva lesz.');
})
const ctaContact = document.querySelector('#contact')
if (ctaContact) ctaContact.addEventListener('click', () => {
  window.location.href = 'mailto:info@oktogon-tanc.hu'
})

// Adatok betöltése az oldal megnyitásakor
window.addEventListener('load', async () => {
  console.log('Oldal betöltése - Adatkezeles inicializálása...')
  betoltottAdatok = await adatkezeles.adatLekeres()
  if (betoltottAdatok) {
    console.log('Kapcsolat sikeres, betöltött adatok:', betoltottAdatok)
  }

  // Schedule Manager inicializálása és megjelenítése
  const scheduleManager = new ScheduleManager('app')
  scheduleManager.render()
  scheduleManager.attachEventListeners()

  // Create a centered sticky navigation (logo + status left, links center, auth buttons right)
  const app = document.querySelector('#app')
  const nav = document.createElement('nav')
  nav.className = 'top-nav'
  nav.innerHTML = `
    <div class="nav-inner">
      <div class="left">
        <div class="logo">OTCBR</div>
        <div class="nav-status offline"><span class="status-dot"></span><span class="status-text">Státusz</span></div>
      </div>
      <div class="center">
        <div class="nav-links">
          <a href="#fooldal">Főoldal</a>
          <a href="#orarend">Órarend</a>
          <a href="#kapcsolat">Kapcsolat</a>
        </div>
      </div>
      <div class="right" id="nav-session-actions"></div>
    </div>
  `
  app.prepend(nav)

  const sessionActions = nav.querySelector('#nav-session-actions')
  const renderSessionActions = () => {
    const currentUser = getSessionUser()

    if (!sessionActions) return

    if (!currentUser) {
      sessionActions.innerHTML = `
        <button id="nav-register" class="secondary" type="button">Regisztráció</button>
        <button id="nav-login" class="primary" type="button">Bejelentkezés</button>
      `
    } else {
      const isAdmin = currentUser.role === 'admin'
      sessionActions.innerHTML = `
        <div class="nav-user-badge">${currentUser.name || 'Felhasználó'} (${currentUser.role || 'student'})</div>
        ${isAdmin ? '<button id="nav-log" class="secondary" type="button">Log</button>' : ''}
        ${isAdmin ? '<button id="nav-admin" class="secondary" type="button">Admin panel</button>' : ''}
        <button id="nav-logout" class="primary" type="button">Kijelentkezés</button>
      `
    }
  }

  renderSessionActions()

  // Hook auth buttons (top-right) to existing behaviour
  const loginModal = document.querySelector('#login-modal')
  const loginForm = document.querySelector('#login-form')
  const loginStatus = document.querySelector('#login-status')
  const closeLogin = document.querySelector('#close-login')
  const cancelLogin = document.querySelector('#cancel-login')
  const topLogin = () => document.querySelector('#nav-login')
  const topRegister = () => document.querySelector('#nav-register')
  const topLogout = () => document.querySelector('#nav-logout')
  const topLog = () => document.querySelector('#nav-log')
  const topAdmin = () => document.querySelector('#nav-admin')

  const openLoginModal = () => {
    if (loginModal) {
      loginModal.classList.remove('hidden')
      if (loginStatus) loginStatus.textContent = ''
    }
  }

  const hideLoginModal = () => {
    if (loginModal) {
      loginModal.classList.add('hidden')
    }
  }

  const bindNavActions = () => {
    const loginBtn = topLogin()
    const registerBtn = topRegister()
    const logoutBtn = topLogout()
    const logBtn = topLog()
    const adminBtn = topAdmin()

    if (loginBtn) loginBtn.addEventListener('click', openLoginModal)
    if (registerBtn) registerBtn.addEventListener('click', () => {
      window.location.href = 'Regisztáció.html'
    })
    if (logoutBtn) logoutBtn.addEventListener('click', logoutAndRefresh)
    if (logBtn) logBtn.addEventListener('click', () => {
      window.location.href = 'log.html'
    })
    if (adminBtn) adminBtn.addEventListener('click', () => {
      window.location.href = 'admin.html'
    })
  }

  bindNavActions()

  if (closeLogin) closeLogin.addEventListener('click', hideLoginModal)
  if (cancelLogin) cancelLogin.addEventListener('click', hideLoginModal)

  if (loginModal) {
    loginModal.addEventListener('click', (event) => {
      if (event.target === loginModal) {
        hideLoginModal()
      }
    })
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(loginForm)
      const email = formData.get('email')
      const password = formData.get('password')

      if (loginStatus) {
        loginStatus.textContent = 'Belépés ellenőrzése...'
      }

      const eredmeny = await adatkezeles.bejelentkezes(email, password)

      if (eredmeny.sikeres) {
        if (loginStatus) loginStatus.textContent = eredmeny.uzenet
        const sessionUser = {
          name: eredmeny.user.name,
          email: eredmeny.user.email,
          id: eredmeny.user.id || null,
          role: eredmeny.user.role || 'student',
        }
        setSessionUser(sessionUser)
        appendLoginLog(sessionUser)
        hideLoginModal()
        renderSessionActions()
        bindNavActions()
        if ((eredmeny.user.role || 'student') === 'admin') {
          window.location.href = 'admin.html'
          return
        }
        alert(`Sikeres belépés: ${eredmeny.user.name}`)
      } else {
        if (loginStatus) loginStatus.textContent = eredmeny.uzenet
      }
    })
  }

  // Status check for API reachability (updates small dot)
  const navStatus = nav.querySelector('.nav-status')
  const navStatusText = navStatus.querySelector('.status-text')
  async function updateNavStatus() {
    try {
      const res = await fetch(adatkezeles.apiUrl, { method: 'GET' })
      if (res.ok) {
        navStatus.classList.remove('offline')
        navStatus.classList.add('online')
        navStatusText.textContent = 'Elérhető'
      } else {
        navStatus.classList.remove('online')
        navStatus.classList.add('offline')
        navStatusText.textContent = `Hiba (${res.status})`
      }
    } catch (err) {
      navStatus.classList.remove('online')
      navStatus.classList.add('offline')
      navStatusText.textContent = 'Nem elérhető'
      console.warn('Status check failed:', err)
    }
  }

  // initial check and periodic checks (every 15s)
  updateNavStatus()
  setInterval(updateNavStatus, 15000)
})
