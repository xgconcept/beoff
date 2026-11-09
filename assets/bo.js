/* BeOFF · web del equipo · utilidades comunes (clave, API, refresco en vivo) */
window.MB = (function () {
var API = 'https://script.google.com/macros/s/AKfycbzpUsrelj7JG3gqtZ0YzYBtLo_hnwJWal-yzv87WOPHhPiGk2nVQi75k_VV7e4hC6Yn6Q/exec';
var LS = 'bo_key';
function getKey() { try { return localStorage.getItem(LS) || ''; } catch (e) { return ''; } }
function setKey(k) { try { k ? localStorage.setItem(LS, k) : localStorage.removeItem(LS); } catch (e) {} }

async function call(action, data) {
var body = Object.assign({ action: action, key: getKey() }, data || {});
var r = await fetch(API, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' });
var j = await r.json();
if (!j.ok) { var e = new Error(j.msg || j.error || 'error'); e.code = j.error; throw e; }
return j;
}

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function toast(t) {
var e = document.getElementById('mb-toast');
if (!e) { e = document.createElement('div'); e.id = 'mb-toast'; e.className = 'mb-toast'; document.body.appendChild(e); }
e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true; }, 2600);
}

// Pide la clave (need: 'gestion' | 'any'). Resuelve con el rol.
function gate(opts) {
opts = opts || {};
var need = opts.need || 'any';
return new Promise(function (resolve) {
var ov = document.createElement('div');
ov.className = 'mb-gate';
ov.innerHTML = '<form class="mb-gate-box" autocomplete="off">' +
'<div class="mb-logo"></div>' +
'<p class="mb-gate-k">BeOFF · acceso</p>' +
'<h2>' + esc(opts.title || 'Clave') + '</h2>' +
'<label for="mb-pw">' + esc(opts.label || (need === 'gestion' ? 'Clave de gestión' : 'Clave del equipo o de voluntarios')) + '</label>' +
'<input id="mb-pw" type="text" autocapitalize="characters" spellcheck="false" placeholder="CLAVE">' +
'<p class="mb-gate-err" aria-live="polite"></p>' +
'<div class="mb-gate-row"><a href="../">← Menú</a><button type="submit">Entrar</button></div>' +
'<p class="mb-gate-hint">Se recuerda en este dispositivo. Los cambios que hagas los ve todo el equipo al momento.</p></form>';
var pw = ov.querySelector('#mb-pw'), err = ov.querySelector('.mb-gate-err'), f = ov.querySelector('form');
var slowT = null;
function clearSlowTimer(){ if (slowT) { clearTimeout(slowT); slowT = null; } }
async function tryKey(k, silent) {
setKey(k);
try {
var j = await call('login');
clearSlowTimer();
if (need === 'gestion' && j.role !== 'gestion') { setKey(''); if (!silent) err.textContent = 'Esta clave no abre la parte de gestión.'; return false; }
ov.remove(); resolve(j.role); return true;
} catch (e) {
clearSlowTimer();
setKey('');
if (!silent) err.textContent = e.code === 'clave' ? 'Clave incorrecta.' : 'No se puede conectar. Revisa la conexión y prueba otra vez.';
return false;
}
}
f.addEventListener('submit', function (ev) {
ev.preventDefault();
var k = pw.value.trim().toUpperCase();
if (!k) { err.textContent = 'Escribe la clave.'; return; }
err.textContent = 'Comprobando…';
clearSlowTimer();
slowT = setTimeout(function () { err.textContent = 'Comprobando… puede tardar unos segundos si hay poca cobertura.'; }, 1800);
tryKey(k);
});
var saved = getKey();
if (saved) {
tryKey(saved, true).then(function (ok) { if (!ok) { document.body.appendChild(ov); pw.focus(); } });
} else { document.body.appendChild(ov); setTimeout(function () { pw.focus(); }, 30); }
});
}

function logout() { setKey(''); location.reload(); }

// Refresco periódico (solo con la pestaña visible)
function poll(fn, ms) {
var t = null;
function tick() { if (!document.hidden) fn(); }
t = setInterval(tick, ms || 30000);
document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); });
return function () { clearInterval(t); };
}

function hm(ts) { var d = new Date(ts); return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }
function slug(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'sin-nombre'; }

return { call: call, gate: gate, logout: logout, poll: poll, toast: toast, esc: esc, hm: hm, slug: slug, getKey: getKey };
})();

/* Botón MAPA DE UBICACIONES en la portada de «¿Cuándo me toca?» */
(function () {
function go() {
var nav = document.querySelector('nav.tabs');
if (!nav || document.querySelector('.mapbtn')) return;
var st = document.createElement('style');
st.textContent = '.mapbtn{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:13px 16px;border-radius:12px;background:#1d5fd1;color:#fff;text-decoration:none;box-shadow:0 2px 0 rgba(0,0,0,.18)}.mapbtn svg{width:26px;height:26px;flex:none;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.mapbtn b{display:block;font-size:15px;letter-spacing:.04em}.mapbtn span{display:block;font-size:12.5px;opacity:.92}.mapbtn:after{content:"\\203A";margin-left:auto;font-size:26px;line-height:1}';
document.head.appendChild(st);
var a = document.createElement('a');
a.className = 'mapbtn'; a.href = '../mapa/';
a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5z"/><path d="M9 4v14M15 6.5v14"/></svg><div><b>MAPA DE UBICACIONES</b><span>Toca para ver dónde está cada zona del recinto</span></div>';
nav.parentNode.insertBefore(a, nav.nextSibling);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();

/* Áreas NO visibles para voluntarios: se ocultan de la pestaña Áreas */
(function () {
var HIDE = ['A01', 'A08', 'A09', 'A11', 'A12', 'A24'];
function go() {
var tiles = [].slice.call(document.querySelectorAll('.atile'));
if (!tiles.length) return;
tiles.forEach(function (t) {
var m = (t.textContent || '').match(/A\d{2}/);
if (m && HIDE.indexOf(m[0]) >= 0) t.style.display = 'none';
});
[].slice.call(document.querySelectorAll('.grp')).forEach(function (g) {
var vis = [].slice.call(g.querySelectorAll('.atile')).filter(function (t) { return t.style.display !== 'none'; });
if (g.querySelector('.atile') && !vis.length) g.style.display = 'none';
});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
