var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxqu-1Nglmw4sHLh2X1ix0HKahOIgggBnTyOmQLC7LRTsTLBNhrhIT9WB_M8uCs68OZfA/exec'; // URL /exec del Apps Script. Vacío = vista previa: no se envía nada.
var C = window.ENCUESTA;
var FOOT = '<div class="foot"><span>BeOFF Offroad Festival · Kini Motor Park</span><span>KTM · GASGAS · Husqvarna</span></div>';

var A = {}, cur = -1, app = document.getElementById('app'), nav = document.getElementById('nav');
var $n = document.getElementById('next'), $b = document.getElementById('back'), $m = document.getElementById('msg');
var LS = 'beoff26_' + C.id;
document.getElementById('nm').textContent = C.short;
try { var d = JSON.parse(localStorage.getItem(LS + '_draft') || '{}'); if (d && typeof d === 'object') A = d; } catch (e) {}
function save(){ try { localStorage.setItem(LS + '_draft', JSON.stringify(A)); } catch (e) {} }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function vis(x){ if (!x.show) return true; var v = A[x.show[0]]; return x.show[1].indexOf(v) > -1; }
function steps(){ return C.steps.filter(vis); }
function setProg(i){ var n = steps().length; document.getElementById('pg').style.width = (n ? Math.round(i / n * 100) : 0) + '%'; document.getElementById('st').textContent = i > 0 && i <= n ? i + ' / ' + n : ''; }

function intro(){
 nav.hidden = true; setProg(0);
 var sent = false; try { sent = localStorage.getItem(LS + '_sent') === '1'; } catch(e){}
 app.innerHTML = '<p class="eyebrow">BeOFF Offroad Festival 2026 · Kini Motor Park · 14 nov</p><h1>' + C.h1 + '</h1>' +
  C.intro.map(function(p, i){ return '<p class="' + (i ? 'sub' : 'lead') + '">' + p + '</p>'; }).join('') +
  '<div class="facts">' + C.facts.map(function(f){ return '<span>' + esc(f) + '</span>'; }).join('') + '</div>' +
  (!ENDPOINT ? '<p class="note">Encuesta en preparación: todavía no se guardan las respuestas.</p>' : '') + (sent ? '<p class="note">Ya enviaste esta encuesta desde este dispositivo. ¡Gracias! Otra persona puede responder también.</p>' : '') +
  '<button type="button" class="start" id="start">Empezar →</button>' + FOOT;
 document.getElementById('start').onclick = function(){ go(0); };
}

function renderQ(x){
 if (x.grp) return '<p class="grp">' + esc(x.grp) + '</p>';
 var v = A[x.id], h = '<div class="q" data-id="' + x.id + '"><span class="t">' + esc(x.t) + (x.req ? ' *' : '') + '</span>' + (x.h ? '<span class="h">' + esc(x.h) + '</span>' : '');
 if (x.type === 'sc') {
  h += '<div class="opt sc">'; for (var i = 1; i <= 5; i++) h += '<button type="button" data-v="' + i + '" aria-pressed="' + (v === i) + '">' + i + '</button>';
  h += '</div><div class="ends"><span>Muy mal</span><span>Muy bien</span></div>';
 } else if (x.type === 'nps') {
  h += '<div class="opt nps">'; for (var j = 0; j <= 10; j++) h += '<button type="button" data-v="' + j + '" aria-pressed="' + (v === j) + '">' + j + '</button>';
  h += '</div><div class="ends"><span>Nada probable</span><span>Seguro</span></div>';
 } else if (x.type === 'ch' || x.type === 'mu') {
  var sel = x.type === 'mu' ? (v || []) : [v];
  h += '<div class="opt">' + x.opts.map(function(o){ return '<button type="button" data-v="' + esc(o) + '" aria-pressed="' + (sel.indexOf(o) > -1) + '">' + esc(o) + '</button>'; }).join('') + '</div>';
  if (x.type === 'mu') h += '<div class="ends"><span>Puedes marcar varias</span><span></span></div>';
 } else if (x.type === 'tx') {
  h += '<textarea maxlength="800" data-in>' + esc(v || '') + '</textarea>';
 } else if (x.type === 'in') {
  h += '<input type="text" maxlength="120" data-in value="' + esc(v || '') + '">';
 } else if (x.type === 'em') {
  h += '<input type="email" inputmode="email" autocomplete="email" maxlength="120" data-in value="' + esc(v || '') + '">';
 }
 return h + '</div>';
}

function go(i){
 var list = steps(); cur = i;
 if (i >= list.length) return finish();
 var st = list[i];
 nav.hidden = false; setProg(i + 1); $m.textContent = '';
 $n.textContent = i === list.length - 1 ? 'Enviar ✓' : 'Siguiente →';
 app.innerHTML = '<p class="eyebrow">Bloque ' + (i + 1) + ' de ' + list.length + ' · ' + esc(st.k) + '</p><h2>' + st.h + '</h2><p class="sub">' + esc(st.s) + '</p><div class="card">' + st.q.filter(vis).map(renderQ).join('') + '</div>';
 app.querySelectorAll('.q').forEach(function(q){
  var id = q.dataset.id, def = st.q.filter(function(x){ return x.id === id; })[0];
  q.querySelectorAll('.opt button').forEach(function(b){
   b.onclick = function(){
    var val = def.type === 'sc' || def.type === 'nps' ? Number(b.dataset.v) : b.dataset.v;
    if (def.type === 'mu') {
     var arr = (A[id] || []).slice(), k = arr.indexOf(val);
     k > -1 ? arr.splice(k, 1) : arr.push(val); A[id] = arr;
     b.setAttribute('aria-pressed', k < 0);
    } else {
     A[id] = A[id] === val ? undefined : val;
     q.querySelectorAll('.opt button').forEach(function(o){ o.setAttribute('aria-pressed', o === b && A[id] !== undefined); });
     if (def.branch) go(cur);
    }
    save();
   };
  });
  var inp = q.querySelector('[data-in]');
  if (inp) inp.oninput = function(){ A[id] = inp.value; save(); };
 });
 window.scrollTo(0, 0);
}

$b.onclick = function(){ cur <= 0 ? intro() : go(cur - 1); };
$n.onclick = function(){
 var miss = steps()[cur].q.filter(function(x){ return x.req && vis(x) && (A[x.id] === undefined || A[x.id] === ''); });
 if (miss.length) { $m.textContent = 'Responde: ' + miss[0].t; return; }
 go(cur + 1);
};

function two(n){ return (n < 10 ? '0' : '') + n; }
function payload(){
 var d = new Date(), row = {};
 row['Marca temporal'] = two(d.getDate()) + '/' + two(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds());
 C.steps.forEach(function(st){ var g = ''; st.q.forEach(function(x){
  if (x.grp) { g = x.grp; return; }
  var col = x.col || (g ? g + ' · ' : '') + x.t, v = A[x.id];
  if (!vis(st) || !vis(x)) v = '';
  if (Array.isArray(v)) v = v.join(', ');
  row[col] = v === undefined || v === null ? '' : v;
 }); });
 return { encuesta: C.id, fila: row };
}

async function finish(){
 var data = payload(), ok = true;
 $n.disabled = true; $m.textContent = 'Enviando…';
 if (ENDPOINT) {
  try { await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) }); }
  catch (e) { ok = false; }
 }
 $n.disabled = false;
 if (!ok) { $m.textContent = 'No se ha podido enviar. Revisa la conexión y vuelve a pulsar Enviar.'; return; }
 try { localStorage.setItem(LS + '_sent', '1'); localStorage.removeItem(LS + '_draft'); } catch (e) {}
 nav.hidden = true; setProg(steps().length); document.getElementById('st').textContent = '';
 app.innerHTML = '<p class="eyebrow">Respuesta recibida</p><p class="big">' + C.thanks + '</p><p class="lead">' + C.thanksText + '</p>' +
  (ENDPOINT ? '' : '<p class="note">Vista previa: esta respuesta no se ha guardado.</p>') + FOOT;
 A = {}; window.scrollTo(0, 0);
}
intro();
