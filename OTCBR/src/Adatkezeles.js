import  './User.js'

export class Adatkezeles {
  constructor(apiUrl = 'https://retoolapi.dev/vxsfdG/data') {
    this.apiUrl = apiUrl
    this.adatok = []
    this.adminEmail = 'admin@admin'
    this.adminPassword = 'Admin'
    this.adminRole = 'admin'
    this.teacherRole = 'teacher'
    this.studentRole = 'student'
  }

  // Egyszerű Caesar-eltolásos kódolás a jelszavakhoz
  cezarKodolas(szoveg, eltolas = 3) {
    if (!szoveg) return ''

    return [...String(szoveg)].map((karakter) => {
      const kod = karakter.charCodeAt(0)

      // csak a nyomtatható ASCII tartományt forgatjuk
      if (kod < 32 || kod > 126) {
        return karakter
      }

      const normalizalt = kod - 32
      const kodolt = (normalizalt + eltolas) % 95
      return String.fromCharCode(kodolt + 32)
    }).join('')
  }

  // Caesar-eltolás visszafejtése
  cezarDekodolas(szoveg, eltolas = 3) {
    if (!szoveg) return ''

    return [...String(szoveg)].map((karakter) => {
      const kod = karakter.charCodeAt(0)

      if (kod < 32 || kod > 126) {
        return karakter
      }

      const normalizalt = kod - 32
      const dekodolt = (normalizalt - eltolas + 95) % 95
      return String.fromCharCode(dekodolt + 32)
    }).join('')
  }

  // Szöveg hexadecimális alakba alakítása
  szovegHexre(szoveg) {
    return [...String(szoveg)].map((karakter) => karakter.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  }

  // Hexadecimális szöveg visszaalakítása eredeti karakterlánccá
  hexrolSzovegre(hexSzoveg) {
    if (!hexSzoveg) return ''

    const normalizaltHex = String(hexSzoveg).replace(/[^0-9a-f]/gi, '')
    const parokba = normalizaltHex.match(/.{1,2}/g) || []
    return parokba.map((par) => String.fromCharCode(parseInt(par, 16))).join('')
  }

  // Jelszó kódolása: Caesar -> hex
  jelszoKodolas(jelszo, eltolas = 3) {
    const cezar = this.cezarKodolas(jelszo, eltolas)
    return this.szovegHexre(cezar)
  }

  // Jelszó visszafejtése: hex -> Caesar
  jelszoDekodolas(kodoltJelszo, eltolas = 3) {
    const cezarSzoveg = this.hexrolSzovegre(kodoltJelszo)
    return this.cezarDekodolas(cezarSzoveg, eltolas)
  }

  // Regisztrációs adatok előkészítése és mentése
  async regisztracioMentese(formData) {
    const regisztracioAdat = {
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.trim() || '',
      birth: formData.birth || '',
      password: this.jelszoKodolas(formData.password || ''),
      role: formData.role || this.studentRole,
      createdAt: new Date().toISOString(),
    }

    return this.adatKuldes(regisztracioAdat)
  }

  // Az API-ból érkező adatok visszafejtése, ha kell az olvasható jelszó
  async adatLekeresDekodolt() {
    const adatok = await this.adatLekeres()
    if (!Array.isArray(adatok)) {
      return adatok
    }

    return adatok.map((item) => ({
      ...item,
      password: this.jelszoDekodolas(item.password || ''),
    }))
  }

  // Belépés ellenőrzése email és jelszó alapján
  async bejelentkezes(email, jelszo) {
    const normalizaltEmail = String(email || '').trim().toLowerCase()

    if (normalizaltEmail === this.adminEmail && String(jelszo || '') === this.adminPassword) {
      return {
        sikeres: true,
        user: {
          id: 'admin',
          name: 'Admin',
          email: this.adminEmail,
          role: this.adminRole,
        },
        uzenet: 'Admin bejelentkezés sikeres.',
      }
    }

    const adatok = await this.adatLekeresDekodolt()
    if (!Array.isArray(adatok)) {
      return { sikeres: false, uzenet: 'Nem sikerült lekérni a felhasználókat.' }
    }

    const talaltFelhasznalo = adatok.find((item) => String(item.email || '').trim().toLowerCase() === normalizaltEmail)

    if (!talaltFelhasznalo) {
      return { sikeres: false, uzenet: 'Nincs ilyen e-mail cím a rendszerben.' }
    }

    if (String(talaltFelhasznalo.password || '') !== String(jelszo || '')) {
      return { sikeres: false, uzenet: 'Hibás jelszó.' }
    }

    return {
      sikeres: true,
      user: {
        ...talaltFelhasznalo,
        role: talaltFelhasznalo.role || this.studentRole,
      },
      uzenet: 'Sikeres bejelentkezés.',
    }
  }

  // Admin által hozzáadott felhasználó mentése
  async felhasznaloLetrehozas(userData) {
    const ujFelhasznalo = {
      name: userData.name?.trim(),
      email: userData.email?.trim(),
      phone: userData.phone?.trim() || '',
      birth: userData.birth || '',
      password: this.jelszoKodolas(userData.password || ''),
      role: userData.role || this.studentRole,
      createdAt: new Date().toISOString(),
    }

    return this.adatKuldes(ujFelhasznalo)
  }

  // Egyszerű törlési segéd admin oldalhoz
  async felhasznaloTorles(id) {
    const adatok = await this.adatLekeres()
    if (Array.isArray(adatok)) {
      const userToDelete = adatok.find((item) => String(item.id) === String(id))
      if (userToDelete) {
        const email = String(userToDelete.email || '').trim().toLowerCase()
        const role = String(userToDelete.role || '').trim().toLowerCase()
        const isProtectedAdmin = email === this.adminEmail || role === this.adminRole || String(userToDelete.id) === 'admin'

        if (isProtectedAdmin) {
          console.warn('Védett admin felhasználó nem törölhető:', userToDelete)
          return false
        }
      }
    }

    return this.adatTorles(id)
  }

  // Adatok lekérése az API-ról
  async adatLekeres() {
    try {
      const response = await fetch(this.apiUrl)
      if (!response.ok) {
        throw new Error(`API hiba: ${response.status}`)
      }
      this.adatok = await response.json()
      console.log('Retool adatok lekérve:', this.adatok)
      return this.adatok
    } catch (error) {
      console.error('Hiba az adatok lekérésekor:', error)
      return null
    }
  }

  // Adatok mentése az API-ra
  async adatKuldes(userData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      if (!response.ok) {
        throw new Error(`API hiba: ${response.status}`)
      }
      const result = await response.json()
      console.log('Adat sikeresen elküldve:', result)
      this.adatok.push(result)
      return result
    } catch (error) {
      console.error('Hiba az adatok küldésekor:', error)
      return null
    }
  }

  // Adatok frissítése
  async adatFrissites(id, userData) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      if (!response.ok) {
        throw new Error(`API hiba: ${response.status}`)
      }
      const result = await response.json()
      console.log('Adat sikeresen frissítve:', result)
      return result
    } catch (error) {
      console.error('Hiba az adatok frissítésekor:', error)
      return null
    }
  }

  // Adatok törlése
  async adatTorles(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error(`API hiba: ${response.status}`)
      }
      console.log(`Adat ${id} sikeresen törölve`)
      this.adatok = this.adatok.filter(item => item.id !== id)
      return true
    } catch (error) {
      console.error('Hiba az adatok törlésekor:', error)
      return false
    }
  }

  // Összes adat lekérése
  getAdatok() {
    return this.adatok
  }

  // Egy adat lekérése ID alapján
  getAdatById(id) {
    return this.adatok.find(item => item.id === id)
  }
}