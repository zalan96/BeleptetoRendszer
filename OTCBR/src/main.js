import './style.css'
import danceIcon from './assets/dance.svg'

document.querySelector('#app').innerHTML = `
<main class="page-shell">
  <header class="banner">
    <div class="brand">
      <span class="eyebrow">OTCBR</span>
      <h1>OTCBR - A hivatalos Oktogon Tánc Centrum Beléptető Rendszer</h1>
      <p class="subtitle">Üdvözlünk az Oktogon Tánc Centrumban. Ez a főoldal a beléptető alkalmazás részleteit mutatja.</p>
    </div>
    <img class="hero-image" src="${danceIcon}" alt="Táncos illusztráció" />
  </header>

  <section class="cta-panel">
    <div class="buttons">
      <button id="login" class="primary">Bejelentkezés</button>
      <button id="contact" class="secondary">Elérhetőségek</button>
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

    <aside class="links">
      <h3>Linkek és hivatkozások</h3>
      <p><strong>Facebook:</strong> <a href="https://www.facebook.com/OktogonTancCentrum" target="_blank" rel="noreferrer">Oktogon Tánc Centrum Facebook</a></p>
      <p><strong>Fájlok:</strong> <code>index.html</code>, <code>src/main.js</code>, <code>src/style.css</code></p>
      <p><strong>Projekt:</strong> OTCBR - A hivatalos Oktogon Tánc Centrum Beléptető Rendszer</p>
    </aside>
  </section>
</main>
`

document.querySelector('#login').addEventListener('click', () => {
  alert('Bejelentkezés gomb megnyomva. A beléptető rendszer hamarosan aktiválva lesz.');
})

document.querySelector('#contact').addEventListener('click', () => {
  window.location.href = 'mailto:info@oktogon-tanc.hu'
})
