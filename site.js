// Menu do celular, cabeçalho com fundo ao rolar e entrada suave das seções.
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // modo escuro: o botão alterna e guarda a escolha (o <head> já aplica antes de pintar)
  document.querySelectorAll('.theme-toggle').forEach(function (b) {
    function rotulo() {
      var esc = root.getAttribute('data-theme') === 'dark';
      b.setAttribute('aria-pressed', String(esc));
      b.title = esc ? 'Modo claro' : 'Modo escuro';
    }
    rotulo();
    b.addEventListener('click', function () {
      var esc = root.getAttribute('data-theme') !== 'dark';
      if (esc) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('sorten-tema', esc ? 'dark' : 'light'); } catch (e) {}
      rotulo();
    });
  });

  // faixa de conformidade como esteira contínua: duplica os itens para o laço não ter emenda
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.compliance ul').forEach(function (ul) {
      Array.prototype.slice.call(ul.children).forEach(function (li) {
        var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c);
      });
      ul.classList.add('marquee');
      var vp = document.createElement('div'); vp.className = 'marquee-vp';
      ul.parentNode.insertBefore(vp, ul); vp.appendChild(ul);
    });
  }
  var header = document.querySelector('[data-header]');
  var button = document.querySelector('.menu-button');
  var nav = document.querySelector('.main-nav');

  if (button && nav) {
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        button.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cena guiada pela rolagem: o passo no meio da tela escolhe a tela do sistema.
  document.querySelectorAll('[data-scene]').forEach(function (scene) {
    var steps = scene.querySelectorAll('[data-step]');
    var screens = scene.querySelectorAll('[data-sc]');
    var dots = scene.querySelectorAll('.pg-dots i');
    function show(i) {
      scene.setAttribute('data-active', String(i));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      screens.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    if (!('IntersectionObserver' in window)) return;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(Number(e.target.getAttribute('data-step'))); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { so.observe(s); });
  });

  // Prestação de contas do estado do visitante: o texto mostra o sistema do Tribunal dele.
  var TCE = {
    CE: { sistema: 'SIM', tribunal: 'TCE-CE', nome: 'Ceará' },
    PB: { sistema: 'SAGRES', tribunal: 'TCE-PB', nome: 'Paraíba' },
    PE: { sistema: 'SAGRES', tribunal: 'TCE-PE', nome: 'Pernambuco' },
    RN: { sistema: 'SIAI', tribunal: 'TCE-RN', nome: 'Rio Grande do Norte' },
    PI: { sistema: 'SAGRES', tribunal: 'TCE-PI', nome: 'Piauí' }
  };
  var NOMES = { 'ceara': 'CE', 'paraiba': 'PB', 'pernambuco': 'PE', 'rio grande do norte': 'RN', 'piaui': 'PI' };
  function setUF(uf, manual) {
    var t = TCE[uf]; if (!t) return;
    document.querySelectorAll('[data-tce="sistema"]').forEach(function (e) { e.textContent = t.sistema; });
    document.querySelectorAll('[data-tce="tribunal"]').forEach(function (e) { e.textContent = t.tribunal; });
    document.querySelectorAll('[data-uf-pick]').forEach(function (b) {
      var on = b.getAttribute('data-uf-pick') === uf; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.ne-map .st').forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-uf') === uf); });
    var map = document.querySelector('.ne-map'); if (map) map.classList.toggle('has-pick', !!manual);
    if (manual) { try { localStorage.setItem('sorten-uf', uf); } catch (e) {} }
  }
  document.querySelectorAll('[data-uf-pick]').forEach(function (b) {
    b.addEventListener('click', function () { setUF(b.getAttribute('data-uf-pick'), true); });
  });
  document.querySelectorAll('.ne-map .st').forEach(function (g) {
    g.addEventListener('click', function () { setUF(g.getAttribute('data-uf'), true); });
  });
  var salvo = null; try { salvo = localStorage.getItem('sorten-uf'); } catch (e) {}
  setUF(salvo && TCE[salvo] ? salvo : 'CE');
  if (!salvo && window.fetch) {
    // localização aproximada pelo endereço de internet (só o estado; nada é guardado)
    fetch('https://get.geojs.io/v1/ip/geo.json').then(function (r) { return r.json(); }).then(function (g) {
      var reg = (g && g.region || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      if (NOMES[reg]) setUF(NOMES[reg]);
    }).catch(function () {});
  }
  document.querySelectorAll('.ne-map .m.on').forEach(function (c, i) { c.style.setProperty('--i', i); });

  // números da vitrine contando até o valor
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var alvo = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1400, atraso = 700;
      function passo(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, Math.max(0, (t - t0 - atraso) / dur)); p = 1 - Math.pow(1 - p, 3);
        el.textContent = (alvo * p).toFixed(2).replace('.', ',');
        if (p < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  items.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();
