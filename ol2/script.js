// Firebase talab qilinmaydi. Ma'lumotlar faqat shu brauzer qurilmasida saqlanadi.
const STORE = 'kollej-neon-offline-v1';
const LETTERS = 'ABCD';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {tests:[],results:[]}; } catch { return {tests:[],results:[]}; } };
const save = () => localStorage.setItem(STORE, JSON.stringify(data));
let data = read();
let student = JSON.parse(sessionStorage.getItem('kollej-student') || 'null');
let screen = 'start', adminMode = false, logoTaps = 0, draft = {title:'',group:'all',questions:[]}, selected = [];

function groups() {
  return [1,2].flatMap(year => Array.from({length:year===1?17:13},(_,i)=>`${i+1}/${year===1?26:25}`));
}
function show(name) { screen=name; render(); }
function setStudent(name, group) {
  student = {name:name.trim(),group};
  sessionStorage.setItem('kollej-student', JSON.stringify(student));
  show('home');
}
function logoTap() {
  logoTaps++;
  if (logoTaps >= 5) { logoTaps=0; adminMode=true; show('admin'); }
  setTimeout(()=>logoTaps=0,2500);
}
function homeView() {
  const tests=data.tests.filter(t=>t.group==='all'||t.group===student.group);
  return `<div class="gl"><div class="row"><h2>Salom, ${esc(student.name)}!</h2><button onclick="sessionStorage.removeItem('kollej-student');student=null;show('start')">Chiqish</button></div><p class="mu">Guruh: ${esc(student.group)}</p></div>
  <h3>📝 Testlar</h3>${tests.length?tests.map(t=>`<div class="gl row"><div><b>${esc(t.title)}</b><div class="mu">${t.questions.length} ta savol</div></div><button class="p" onclick="startTest('${t.id}')">Boshlash</button></div>`).join(''):'<div class="gl mu">Hozircha test yo‘q.</div>'}`;
}
function startTest(id) { const t=data.tests.find(x=>x.id===id); if(!t)return; selected=[]; screen='test'; render(t); }
function testView(t) {
  return `<div class="gl"><h2>${esc(t.title)}</h2>${t.questions.map((q,i)=>`<section class="gl"><h3>${i+1}. ${esc(q.q)}</h3>${q.options.map((o,j)=>`<label class="r"><input type="radio" name="q${i}" value="${j}" onchange="selected[${i}]=${j}"> ${LETTERS[j]}) ${esc(o)}</label>`).join('')}</section>`).join('')}<button class="p" onclick="finishTest('${t.id}')">Testni yakunlash</button><button onclick="show('home')">Bekor qilish</button></div>`;
}
function finishTest(id) {
  const t=data.tests.find(x=>x.id===id); if(!t)return;
  const score=t.questions.reduce((n,q,i)=>n+(selected[i]===q.correct?1:0),0);
  const result={name:student.name,group:student.group,title:t.title,score,total:t.questions.length,date:Date.now()};
  data.results.push(result); save();
  screen='result'; render(result);
}
function adminView() {
  return `<div class="gl"><h2>⚙️ Test boshqaruvi</h2><p class="mu">Bu ma’lumotlar faqat ushbu brauzerda saqlanadi.</p><input id="test-title" placeholder="Test nomi" value="${esc(draft.title)}"><select id="test-group"><option value="all">Barcha guruhlar</option>${groups().map(g=>`<option value="${g}" ${draft.group===g?'selected':''}>${g}</option>`).join('')}</select><h3>Savol qo‘shish</h3><input id="question" placeholder="Savol matni">${LETTERS.split('').map((l,i)=>`<label class="r"><input id="option-${i}" placeholder="${l} varianti"></label>`).join('')}<label class="r">To‘g‘ri javob: <select id="correct">${LETTERS.split('').map((l,i)=>`<option value="${i}">${l}</option>`).join('')}</select></label><button onclick="addQuestion()">+ Savol qo‘shish</button><div class="mu">Savollar: ${draft.questions.length}</div><button class="p" onclick="saveTest()">Testni saqlash</button><button onclick="adminMode=false;show(student?'home':'start')">Orqaga</button></div>
  ${draft.questions.length?`<div class="gl">${draft.questions.map((q,i)=>`<div class="row">${i+1}. ${esc(q.q)} <button onclick="draft.questions.splice(${i},1);render()">O‘chirish</button></div>`).join('')}</div>`:''}
  <div class="gl"><h3>Mavjud testlar</h3>${data.tests.length?data.tests.map(t=>`<div class="row"><span>${esc(t.title)} · ${esc(t.group)}</span><button onclick="deleteTest('${t.id}')">O‘chirish</button></div>`).join(''):'<p class="mu">Testlar hali yo‘q.</p>'}</div>
  <div class="gl"><h3>Natijalar</h3>${data.results.slice().reverse().map(r=>`<div class="row"><span>${esc(r.name)} (${esc(r.group)}) · ${esc(r.title)}</span><b>${r.score}/${r.total}</b></div>`).join('')||'<p class="mu">Natijalar hali yo‘q.</p>'}</div>`;
}
function addQuestion() {
  const q=$('#question').value.trim(), options=LETTERS.split('').map((_,i)=>$(`#option-${i}`).value.trim()), correct=Number($('#correct').value);
  if(!q||options.some(x=>!x)) { alert('Savol va 4 ta variantni kiriting.'); return; }
  if(draft.questions.length>=20) { alert('Bitta testga ko‘pi bilan 20 ta savol qo‘shiladi.'); return; }
  draft.title=$('#test-title').value.trim(); draft.group=$('#test-group').value;
  draft.questions.push({q,options,correct}); render();
}
function saveTest() {
  draft.title=$('#test-title').value.trim(); draft.group=$('#test-group').value;
  if(!draft.title||!draft.questions.length) { alert('Test nomi va kamida bitta savol kerak.'); return; }
  data.tests.push({id:`t${Date.now()}`,title:draft.title,group:draft.group,questions:draft.questions}); save();
  draft={title:'',group:'all',questions:[]}; render();
}
function deleteTest(id) { data.tests=data.tests.filter(t=>t.id!==id); save(); render(); }
function render(payload) {
  let content='';
  if(screen==='start') content=`<div class="gl auth"><div class="ico">🎓</div><h2>Xush kelibsiz</h2><p class="mu c">Ismingiz va guruhingizni tanlang.</p><form onsubmit="event.preventDefault();const n=$('#student-name').value.trim();if(n)setStudent(n,$('#student-group').value)"><label class="f">👤<input id="student-name" placeholder="Ism familiya" required></label><label class="f">🏫<select id="student-group">${groups().map(g=>`<option value="${g}">${g}</option>`).join('')}</select></label><button class="p w" type="submit">Davom etish</button></form></div>`;
  else if(screen==='home') content=homeView();
  else if(screen==='test') content=testView(data.tests.find(t=>t.id===payload) || data.tests.find(t=>t.title));
  else if(screen==='admin') content=adminView();
  else if(screen==='result') content=`<div class="gl"><div class="big">${payload.score===payload.total?'🏆':'✅'}</div><h2>Test yakunlandi</h2><p class="c">${payload.score} / ${payload.total} (${Math.round(payload.score/payload.total*100)}%)</p><button class="p" onclick="show('home')">Bosh sahifa</button></div>`;
  $('#app').innerHTML=`<div class="logo" onclick="logoTap()">✦ KOLLEJ NEON ✦</div>${content}`;
}
// Give startTest and render a stable test ID without exposing backend configuration.
const originalStartTest=startTest;
startTest=function(id){ const t=data.tests.find(x=>x.id===id); if(!t)return; selected=[]; screen='test'; $('#app').innerHTML=`<div class="logo" onclick="logoTap()">✦ KOLLEJ NEON ✦</div>${testView(t)}`; };
if(student) screen='home';
render();
