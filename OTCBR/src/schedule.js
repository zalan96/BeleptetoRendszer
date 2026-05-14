export class ScheduleManager {
  constructor(containerId = 'app') {
    this.containerId = containerId
    this.container = null
    this.scheduleData = [
      { time: '09:00', monday: { type: 'latindance', name: 'Kezdő Latindance', teacher: 'Anna', level: 'kezdő' }, tuesday: { type: 'waltz', name: 'Waltz alapok', teacher: 'Bence', level: 'intermediate' }, wednesday: null, thursday: { type: 'tango', name: 'Tango Technika', teacher: 'Csaba', level: 'intermediate' }, friday: { type: 'salsa', name: 'Salsa Kezdő', teacher: 'Anna', level: 'kezdő' } },
      { time: '10:30', monday: null, tuesday: { type: 'bachata', name: 'Bachata Stílus', teacher: 'Anna', level: 'intermediate' }, wednesday: { type: 'latindance', name: 'Latin Típusok', teacher: 'Bence', level: 'intermediate' }, thursday: null, friday: { type: 'waltz', name: 'Waltz Haladó', teacher: 'Csaba', level: 'haladó' } },
      { time: '12:00', monday: { type: 'tango', name: 'Tango Haladó', teacher: 'Csaba', level: 'haladó' }, tuesday: null, wednesday: { type: 'salsa', name: 'Salsa Tánc', teacher: 'Anna', level: 'intermediate' }, thursday: { type: 'latindance', name: 'Latin Fúzió', teacher: 'Bence', level: 'haladó' }, friday: null },
      { time: '13:30', monday: { type: 'waltz', name: 'Waltz Páros', teacher: 'Anna', level: 'intermediate' }, tuesday: { type: 'salsa', name: 'Salsa Haladó', teacher: 'Csaba', level: 'haladó' }, wednesday: null, thursday: { type: 'bachata', name: 'Bachata Romantika', teacher: 'Anna', level: 'intermediate' }, friday: { type: 'tango', name: 'Tango Páros', teacher: 'Bence', level: 'intermediate' } },
      { time: '15:00', monday: null, tuesday: { type: 'latindance', name: 'Latin Show', teacher: 'Bence', level: 'haladó' }, wednesday: { type: 'tango', name: 'Tango Lépések', teacher: 'Csaba', level: 'kezdő' }, thursday: { type: 'salsa', name: 'Salsa Páros', teacher: 'Anna', level: 'intermediate' }, friday: { type: 'bachata', name: 'Bachata Alapok', teacher: 'Bence', level: 'kezdő' } },
    ]
    this.danceTypes = {
      latindance: { color: '#ff6b9d', label: 'Latin Dance' },
      waltz: { color: '#667eea', label: 'Waltz' },
      tango: { color: '#f5576c', label: 'Tango' },
      salsa: { color: '#fa709a', label: 'Salsa' },
      bachata: { color: '#30cfd0', label: 'Bachata' },
    }
  }

  render() {
    this.container = document.getElementById(this.containerId)
    if (!this.container) return

    const scheduleHTML = `
      <div class="schedule-container">
        <div class="schedule-header">
          <h2>🕐 Teljes Órarend</h2>
          <div class="schedule-controls">
            <select id="teacher-filter" class="schedule-filter">
              <option value="">Összes Oktató</option>
              <option value="Anna">Anna</option>
              <option value="Bence">Bence</option>
              <option value="Csaba">Csaba</option>
            </select>
            <button id="legend-toggle" class="schedule-legend-toggle">Jelmagyarázat</button>
          </div>
        </div>

        <div class="schedule-table-wrapper">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Idő</th>
                <th>Hétfő</th>
                <th>Kedd</th>
                <th>Szerda</th>
                <th>Csütörtök</th>
                <th>Péntek</th>
              </tr>
            </thead>
            <tbody id="schedule-body">
            </tbody>
          </table>
        </div>

        <div class="schedule-legend" id="legend">
          <div class="legend-title">Tánc Típusok</div>
          <div class="legend-items" id="legend-items">
          </div>
        </div>

        <div class="schedule-info">
          <strong>ℹ️ Információ:</strong> Az órarend hétfőtől péntekig tart, 9:00-től 16:00-ig. Kattints az órára további részletekért vagy szerkesztéshez.
        </div>
      </div>
    `

    // Beszúrás az #orarend szekció után
    const orarendSection = this.container.querySelector('#orarend')
    if (orarendSection) {
      orarendSection.insertAdjacentHTML('afterend', scheduleHTML)
    }

    this.renderScheduleBody()
    this.renderLegend()
  }

  renderScheduleBody() {
    const tbody = this.container.querySelector('#schedule-body')
    if (!tbody) return

    tbody.innerHTML = this.scheduleData.map((row) => {
      const rowHTML = `
        <tr>
          <td><strong>${row.time}</strong></td>
          ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
            const slot = row[day]
            if (!slot) {
              return `<td><div class="schedule-slot slot-empty">—</div></td>`
            }
            return `
              <td>
                <div class="schedule-slot slot-${slot.type}" data-teacher="${slot.teacher}">
                  <div><strong>${slot.name}</strong></div>
                  <div class="slot-teacher">📌 ${slot.teacher}</div>
                  <div class="slot-level">${slot.level}</div>
                </div>
              </td>
            `
          }).join('')}
        </tr>
      `
      return rowHTML
    }).join('')
  }

  renderLegend() {
    const legendItems = this.container.querySelector('#legend-items')
    if (!legendItems) return

    legendItems.innerHTML = Object.entries(this.danceTypes).map(([key, value]) => `
      <div class="legend-item">
        <div class="legend-color" style="background: linear-gradient(135deg, ${value.color}, ${this.lightenColor(value.color)});"></div>
        <div class="legend-item-text">${value.label}</div>
      </div>
    `).join('')
  }

  lightenColor(color) {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const amt = 40
    const usePound = hex[0] === '#'
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return (usePound ? '#' : '') + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)
  }

  attachEventListeners() {
    const filter = this.container?.querySelector('#teacher-filter')
    const legendToggle = this.container?.querySelector('#legend-toggle')
    const legend = this.container?.querySelector('#legend')

    if (filter) {
      filter.addEventListener('change', (e) => this.filterByTeacher(e.target.value))
    }

    if (legendToggle) {
      legendToggle.addEventListener('click', () => {
        if (legend) {
          legend.classList.toggle('legend-hidden')
          legendToggle.textContent = legend.classList.contains('legend-hidden') ? 'Jelmagyarázat ▼' : 'Jelmagyarázat ▲'
        }
      })
    }

    // Kattintás az órákra
    const slots = this.container?.querySelectorAll('.schedule-slot')
    if (slots) {
      slots.forEach((slot) => {
        slot.addEventListener('click', (e) => {
          if (e.target.closest('.schedule-slot')?.textContent.includes('—')) return
          alert(`Óra: ${e.target.closest('.schedule-slot').innerText}\n\nSzerkesztéshez admin panel szükséges.`)
        })
      })
    }
  }

  filterByTeacher(teacher) {
    const slots = this.container?.querySelectorAll('.schedule-slot')
    if (!slots) return

    slots.forEach((slot) => {
      if (!teacher || slot.getAttribute('data-teacher') === teacher || slot.textContent.includes('—')) {
        slot.style.opacity = '1'
        slot.style.pointerEvents = 'auto'
      } else {
        slot.style.opacity = '0.3'
        slot.style.pointerEvents = 'none'
      }
    })
  }
}
