import { Adatkezeles } from './Adatkezeles.js'

const sessionKey = 'otcbrUser'
const adatkezeles = new Adatkezeles()

const adminForm = document.querySelector('#admin-user-form')
const adminStatus = document.querySelector('#admin-status')
const adminList = document.querySelector('#admin-list')
const adminSession = document.querySelector('#admin-session')
const adminLogout = document.querySelector('#admin-logout')
const navLog = document.querySelector('#nav-log')
const adminSearch = document.querySelector('#admin-search')
const adminSearchInfo = document.querySelector('#admin-search-info')
const adminFormTitle = document.querySelector('#admin-form-title')
const adminFormDesc = document.querySelector('#admin-form-desc')
const adminSubmitBtn = document.querySelector('#admin-submit-btn')
const adminCancelEditBtn = document.querySelector('#admin-cancel-edit-btn')
const adminDeleteBtn = document.querySelector('#admin-delete-btn')
const adminOpenBtn = document.querySelector('#admin-open-btn')
const adminPasswordLabel = document.querySelector('#admin-password-label')
const navStatus = document.querySelector('.nav-status')
const navStatusText = document.querySelector('.nav-status .status-text')

const editModal = document.querySelector('#edit-modal')
const editForm = document.querySelector('#edit-user-form')
const editStatus = document.querySelector('#edit-status')
const editClose = document.querySelector('#edit-close')
const editCancel = document.querySelector('#edit-cancel')

let allUsers = []
let editingUserId = null

function normalizeId(id) {
  return String(id ?? '').trim()
}

function findUserById(id) {
  const targetId = normalizeId(id)
  return allUsers.find((user) => normalizeId(user.id) === targetId)
}

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

function setStatus(text, isError = false) {
  if (!adminStatus) return
  adminStatus.textContent = text
  adminStatus.style.color = isError ? '#9c201c' : 'var(--muted)'
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
    console.warn('Admin status check failed:', error)
  }
}

function roleLabel(role) {
  const normalizaltRole = role || 'student'
  if (normalizaltRole === 'teacher') return 'Tanár'
  if (normalizaltRole === 'admin') return 'Admin'
  return 'Diák'
}

function isProtectedAdminUser(user) {
  if (!user) return false
  const role = String(user.role || '').trim().toLowerCase()
  const email = String(user.email || '').trim().toLowerCase()
  const id = String(user.id || '').trim().toLowerCase()
  return role === 'admin' || email === 'admin@admin' || id === 'admin'
}

function openEditModal(userId) {
  const user = findUserById(userId)
  if (!user) return

  editingUserId = normalizeId(userId)
  document.querySelector('#edit-name').value = user.name || ''
  document.querySelector('#edit-email').value = user.email || ''
  document.querySelector('#edit-phone').value = user.phone || ''
  document.querySelector('#edit-birth').value = user.birth || ''
  document.querySelector('#edit-role').value = user.role || 'student'
  document.querySelector('#edit-password').value = ''
  editStatus.textContent = ''
  editModal.style.display = 'flex'
}

function selectUserForEdit(userId) {
  const user = findUserById(userId)
  if (!user) {
    console.error('User not found:', userId)
    return
  }

  editingUserId = normalizeId(userId)
  
  // Select form elements directly
  const form = document.querySelector('#admin-user-form')
  if (!form) {
    console.error('Form element not found!')
    return
  }
  
  // Set values by name attribute
  const nameField = form.querySelector('input[name="name"]')
  const emailField = form.querySelector('input[name="email"]')
  const phoneField = form.querySelector('input[name="phone"]')
  const birthField = form.querySelector('input[name="birth"]')
  const roleField = form.querySelector('select[name="role"]')
  
  if (nameField) nameField.value = user.name || ''
  if (emailField) emailField.value = user.email || ''
  if (phoneField) phoneField.value = user.phone || ''
  if (birthField) birthField.value = user.birth || ''
  if (roleField) roleField.value = user.role || 'student'
  
  // Hide password label
  const passwordLabel = document.querySelector('#admin-password-label')
  if (passwordLabel) {
    passwordLabel.style.display = 'none'
  }
  
  // Update form title and buttons
  const title = document.querySelector('#admin-form-title')
  const desc = document.querySelector('#admin-form-desc')
  const submitBtn = document.querySelector('#admin-submit-btn')
  const deleteBtn = document.querySelector('#admin-delete-btn')
  const openBtn = document.querySelector('#admin-open-btn')
  
  if (title) title.textContent = 'Felhasználó módosítása'
  if (desc) desc.textContent = `Szerkesztés: ${user.name} (${user.email})`
  if (submitBtn) submitBtn.textContent = 'Módosítás'
  if (adminCancelEditBtn) adminCancelEditBtn.style.display = 'inline-flex'
  if (deleteBtn) deleteBtn.style.display = 'inline-block'
  if (openBtn) openBtn.style.display = 'inline-block'
  
  // Highlight selected row
  const rows = adminList.querySelectorAll('.admin-row')
  rows.forEach(row => row.classList.remove('selected'))
  
  const selectedRow = adminList.querySelector(`[data-id="${normalizeId(userId)}"]`)
  if (selectedRow) {
    selectedRow.classList.add('selected')
  }
}

function clearUserForm() {
  editingUserId = null
  adminForm.reset()
  
  // Show password field for new user
  if (adminPasswordLabel) {
    adminPasswordLabel.style.display = 'grid'
  }
  
  adminFormTitle.textContent = 'Új felhasználó'
  adminFormDesc.textContent = 'Az admin tud tanárt vagy diákot hozzáadni. A jelszó itt is titkosítva kerül a Retool API-ba.'
  adminSubmitBtn.textContent = 'Mentés'
  if (adminCancelEditBtn) adminCancelEditBtn.style.display = 'none'
  adminDeleteBtn.style.display = 'none'
  adminOpenBtn.style.display = 'none'
  adminStatus.textContent = ''
  
  // Remove highlight
  adminList.querySelectorAll('.admin-row').forEach(row => {
    row.classList.remove('selected')
  })
}

function closeEditModal() {
  editModal.style.display = 'none'
  editingUserId = null
  editForm.reset()
  editStatus.textContent = ''
}

function renderFilteredUsers(searchQuery = '') {
  if (!adminList) return

  const currentUser = getSessionUser()
  const query = String(searchQuery || '').toLowerCase().trim()
  const filteredUsers = allUsers.filter(user => {
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  })

  if (!filteredUsers.length) {
    adminList.innerHTML = '<p class="small-muted">Nem található felhasználó a kereséshez.</p>'
    if (adminSearchInfo) {
      adminSearchInfo.textContent = `0 / ${allUsers.length}`
    }
    return
  }

  adminList.innerHTML = filteredUsers.map((user) => {
    const isAdmin = isProtectedAdminUser(user)
    const isSelf = normalizeId(user.id) === normalizeId(currentUser?.id)
    const canDelete = !isAdmin && !isSelf

    return `
    <div class="admin-row" data-id="${user.id || ''}">
      <div>
        <strong>${user.name || 'Név nélkül'}</strong><br>
        <span class="small-muted">${user.email || '-'}</span>
      </div>
      <div>
        <div class="role-pill ${user.role || 'student'}">${roleLabel(user.role)}</div>
        <div class="small-muted">${user.phone || ''}</div>
      </div>
      <button 
        class="secondary admin-delete" 
        data-id="${user.id || ''}" 
        type="button"
        ${!canDelete ? 'disabled title="Nem törölhető"' : ''}
      >
        ${isAdmin ? '🔒 Védett' : isSelf ? '👤 Saját' : 'Törlés'}
      </button>
    </div>
  `
  }).join('')

  adminList.querySelectorAll('.admin-row').forEach((row) => {
    const rowId = row.getAttribute('data-id')
    
    row.addEventListener('click', (event) => {
      // Don't select if clicking the delete button
      if (event.target.closest('.admin-delete')) {
        return
      }
      
      // Single click - select user for form editing
      if (rowId) {
        selectUserForEdit(rowId)
      }
    })

    row.addEventListener('dblclick', (event) => {
      // Don't open modal if double-clicking the delete button
      if (event.target.closest('.admin-delete')) {
        return
      }
      
      // Double click - open modal
      if (rowId) {
        openEditModal(rowId)
      }
    })
  })

  adminList.querySelectorAll('.admin-delete').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id')
      if (!id) return

      const userToDelete = findUserById(id)
      const currentUser = getSessionUser()

      if (isProtectedAdminUser(userToDelete)) {
        setStatus('Az admin felhasználókat nem lehet törölni.', true)
        return
      }

      if (userToDelete && normalizeId(userToDelete.id) === normalizeId(currentUser?.id)) {
        setStatus('Nem tudsz önmagad törölni.', true)
        return
      }

      if (!confirm('Biztosan törlöd ezt a felhasználót?')) return

      const ok = await adatkezeles.felhasznaloTorles(id)
      if (ok) {
        setStatus('Felhasználó törölve.')
        renderUsers()
      } else {
        setStatus('A törlés nem sikerült.', true)
      }
    })
  })

  if (adminSearchInfo) {
    adminSearchInfo.textContent = `${filteredUsers.length} / ${allUsers.length}`
  }
}

async function renderUsers() {
  const users = await adatkezeles.adatLekeresDekodolt()
  if (!Array.isArray(users)) {
    adminList.innerHTML = '<p class="small-muted">Nem sikerült betölteni a felhasználókat.</p>'
    return
  }
  
  allUsers = users
  if (!users.length) {
    adminList.innerHTML = '<p class="small-muted">Még nincs feltöltött felhasználó.</p>'
    if (adminSearchInfo) {
      adminSearchInfo.textContent = '0 / 0'
    }
    return
  }

  const activeQuery = adminSearch ? adminSearch.value : ''
  renderFilteredUsers(activeQuery)
}

const currentUser = requireAdmin()
if (!currentUser) {
  throw new Error('Admin access required')
}

if (adminSession) {
  adminSession.textContent = `Bejelentkezve: ${currentUser.name} (${currentUser.email})`
}

if (adminLogout) {
  adminLogout.addEventListener('click', () => {
    localStorage.removeItem(sessionKey)
    window.location.href = 'index.html'
  })
}

if (navLog) {
  navLog.addEventListener('click', () => {
    window.location.href = 'log.html'
  })
}

if (adminSearch) {
  adminSearch.addEventListener('input', (event) => {
    renderFilteredUsers(event.target.value)
  })
}

if (editClose) {
  editClose.addEventListener('click', closeEditModal)
}

if (editCancel) {
  editCancel.addEventListener('click', closeEditModal)
}

if (editModal) {
  editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
      closeEditModal()
    }
  })
}

if (editForm) {
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!editingUserId) return

    const formData = new FormData(editForm)
    const payload = Object.fromEntries(formData.entries())

    // Remove password field if empty
    if (!payload.password) {
      delete payload.password
    } else {
      // Encrypt new password if provided
      payload.password = adatkezeles.jelszoKodolas(payload.password)
    }

    // Find the current user data to get the encoded password if not changing it
    const currentUserData = findUserById(editingUserId)
    if (!payload.password && currentUserData) {
      payload.password = currentUserData.password
    }

    editStatus.textContent = 'Mentés...'
    editStatus.style.color = 'var(--muted)'

    const result = await adatkezeles.adatFrissites(editingUserId, payload)

    if (result) {
      editStatus.textContent = 'Sikeresen mentve!'
      editStatus.style.color = 'var(--muted)'
      setTimeout(() => {
        closeEditModal()
        renderUsers()
      }, 1500)
    } else {
      editStatus.textContent = 'A mentés nem sikerült.'
      editStatus.style.color = '#9c201c'
    }
  })
}

if (adminForm) {
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(adminForm)
    const payload = Object.fromEntries(formData.entries())

    if (editingUserId) {
      // Editing existing user
      setStatus('Felhasználó módosítása...')
      
      // Remove password field if empty
      if (!payload.password) {
        delete payload.password
      } else {
        payload.password = adatkezeles.jelszoKodolas(payload.password)
      }

      // Keep existing password if not changed
      const currentUserData = findUserById(editingUserId)
      if (!payload.password && currentUserData) {
        payload.password = currentUserData.password
      }

      const result = await adatkezeles.adatFrissites(editingUserId, payload)
      if (result) {
        setStatus('Felhasználó sikeresen módosítva.')
        setTimeout(() => {
          clearUserForm()
          renderUsers()
        }, 1500)
      } else {
        setStatus('A módosítás nem sikerült.', true)
      }
    } else {
      // Creating new user
      setStatus('Felhasználó mentése...')
      const result = await adatkezeles.felhasznaloLetrehozas(payload)
      if (result) {
        setStatus('Felhasználó sikeresen mentve.')
        adminForm.reset()
        renderUsers()
      } else {
        setStatus('A mentés nem sikerült.', true)
      }
    }
  })
}

if (adminCancelEditBtn) {
  adminCancelEditBtn.addEventListener('click', () => {
    clearUserForm()
  })
}

if (adminDeleteBtn) {
  adminDeleteBtn.addEventListener('click', async () => {
    if (!editingUserId) return

    const userToDelete = findUserById(editingUserId)
    const currentUser = getSessionUser()

    if (isProtectedAdminUser(userToDelete)) {
      setStatus('Az admin felhasználókat nem lehet törölni.', true)
      return
    }

    if (userToDelete && normalizeId(userToDelete.id) === normalizeId(currentUser?.id)) {
      setStatus('Nem tudsz önmagad törölni.', true)
      return
    }

    if (!confirm('Biztosan törlöd ezt a felhasználót?')) return

    const ok = await adatkezeles.felhasznaloTorles(editingUserId)
    if (ok) {
      setStatus('Felhasználó törölve.')
      clearUserForm()
      renderUsers()
    } else {
      setStatus('A törlés nem sikerült.', true)
    }
  })
}

if (adminOpenBtn) {
  adminOpenBtn.addEventListener('click', () => {
    if (!editingUserId) return
    openEditModal(editingUserId)
  })
}

updateNavStatus()
setInterval(updateNavStatus, 15000)
renderUsers().then(() => {
  clearUserForm()
})
