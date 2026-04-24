// ═══════════════ DATA ═══════════════
const defaultNews = [
  {id:1,date:"20.04.2026",time:"10:00",title:"Maktabimiz o'quvchilari viloyat olimpiadasida g'olib bo'ldi",excerpt:"Farg'ona viloyati matematika olimpiadasida maktabimiz o'quvchilari 3 ta oltin, 2 ta kumush medal qozondi.",img:"https://picsum.photos/seed/news1/400/260"},
  {id:2,date:"15.04.2026",time:"09:00",title:"Navro'z bayrami maktabimizda ulug'vor o'tkazildi",excerpt:"Maktabimizda Navro'z bayrami tantanasi o'quvchilar, o'qituvchilar va ota-onalar ishtirokida nishonlandi.",img:"https://picsum.photos/seed/news2/400/260"},
  {id:3,date:"10.04.2026",time:"11:00",title:"Yangi IT xona foydalanishga topshirildi",excerpt:"30 ta zamonaviy kompyuterdan iborat yangi IT xona rasman foydalanishga berildi.",img:"https://picsum.photos/seed/news3/400/260"},
  {id:4,date:"05.04.2026",time:"14:00",title:"Robototexnika to'garagi g'alabasini nishonladi",excerpt:"Maktabimiz robototexnika to'garagi a'zolari respublika musobaqasida 2-o'rinni qo'lga kiritdi.",img:"https://picsum.photos/seed/news4/400/260"},
  {id:5,date:"01.04.2026",time:"09:30",title:"2026-2027 o'quv yiliga qabul boshlandi",excerpt:"Yangi o'quv yiliga 1-sinfga o'quvchilar qabuli rasman boshlandi. Hujjatlar 31-avgustgacha qabul qilinadi.",img:"https://picsum.photos/seed/news5/400/260"},
];

const defaultAnn = [
  {id:1,date:"22.04.2026",title:"Ota-onalar majlisi o'tkaziladi",text:"25-aprel, soat 18:00 da ota-onalar umumiy majlisi bo'lib o'tadi. Barcha ota-onalar taklif etiladi.",badge:"Muhim"},
  {id:2,date:"18.04.2026",title:"Olimpiada materiallari tayyorlash",text:"Viloyat matematika olimpiadasiga tayyorgarlik uchun qo'shimcha mashg'ulotlar 28-apreldan boshlanadi.",badge:"Olimpiada"},
  {id:3,date:"12.04.2026",title:"Kasb tanlash kuni",text:"30-aprel kuni maktabimizda kasb tanlash kuni bo'lib o'tadi. O'n sakkizdan ortiq kasb vakillari taklif qilingan.",badge:"Tadbir"},
];

let newsData = [...defaultNews];
let annData = [...defaultAnn];
let messagesData = [];

const annColors = {Muhim:'#c0392b',Tadbir:'#2471a3',Majlis:'#8e44ad',To_garak:'#27ae60',Olimpiada:'#c8922a'};

// ═══════════════ FIREBASE FUNKSIYALAR ═══════════════
async function fbLoadNews(){
  if(!window.FB) return newsData;
  try {
    const {db,collection,getDocs,query,orderBy} = window.FB;
    const q = query(collection(db,'news'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    if(snap.empty) return newsData;
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ return newsData; }
}

async function fbLoadAnn(){
  if(!window.FB) return annData;
  try {
    const {db,collection,getDocs,query,orderBy} = window.FB;
    const q = query(collection(db,'announcements'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    if(snap.empty) return annData;
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ return annData; }
}

async function fbAddNews(data){
  if(!window.FB) { newsData.unshift({id:Date.now(),...data}); return true; }
  try {
    const {db,collection,addDoc,serverTimestamp} = window.FB;
    await addDoc(collection(db,'news'), {...data, createdAt:serverTimestamp()});
    return true;
  } catch(e){ console.error(e); return false; }
}

async function fbAddAnn(data){
  if(!window.FB) { annData.unshift({id:Date.now(),...data}); return true; }
  try {
    const {db,collection,addDoc,serverTimestamp} = window.FB;
    await addDoc(collection(db,'announcements'), {...data, createdAt:serverTimestamp()});
    return true;
  } catch(e){ return false; }
}

async function fbDeleteNews(id){
  if(!window.FB) { newsData = newsData.filter(n=>n.id!=id); return true; }
  try {
    const {db,doc,deleteDoc} = window.FB;
    await deleteDoc(doc(db,'news',id));
    return true;
  } catch(e){ return false; }
}

async function fbDeleteAnn(id){
  if(!window.FB) { annData = annData.filter(a=>a.id!=id); return true; }
  try {
    const {db,doc,deleteDoc} = window.FB;
    await deleteDoc(doc(db,'announcements',id));
    return true;
  } catch(e){ return false; }
}

async function fbSaveMessage(data){
  if(!window.FB) { messagesData.push({id:Date.now(),...data}); return true; }
  try {
    const {db,collection,addDoc,serverTimestamp} = window.FB;
    await addDoc(collection(db,'messages'), {...data, createdAt:serverTimestamp(), read:false});
    return true;
  } catch(e){ return false; }
}

async function fbLoadMessages(){
  if(!window.FB) return messagesData;
  try {
    const {db,collection,getDocs,query,orderBy} = window.FB;
    const q = query(collection(db,'messages'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ return messagesData; }
}

// ═══════════════ AUTH ═══════════════
function openLogin(){ document.getElementById('loginOverlay').classList.add('open'); }
function closeLogin(){ document.getElementById('loginOverlay').classList.remove('open'); }

async function doLogin(){
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');

  if(!email||!pass){ showErr('Email va parol kiriting!'); return; }

  btn.disabled = true; btn.textContent = 'Tekshirilmoqda...';
  err.style.display = 'none';

  if(!window.FB){
    // Demo login (Firebase ulanganda olib tashlanadi)
    if(email==='admin@maktab6.uz' && pass==='admin123'){
      window.currentUser = {email};
      window.onAuthChange && window.onAuthChange({email});
      closeLogin();
      showToast('✅ Muvaffaqiyatli kirdingiz!');
    } else {
      showErr('Email yoki parol noto\'g\'ri!');
    }
    btn.disabled=false; btn.textContent='🔐 Kirish';
    return;
  }

  try {
    const {auth,signInWithEmailAndPassword} = window.FB;
    await signInWithEmailAndPassword(auth, email, pass);
    closeLogin();
    showToast('✅ Muvaffaqiyatli kirdingiz!');
  } catch(e){
    const msgs = {
      'auth/user-not-found':'Bunday foydalanuvchi topilmadi.',
      'auth/wrong-password':'Parol noto\'g\'ri.',
      'auth/invalid-email':'Email noto\'g\'ri formatda.',
      'auth/too-many-requests':'Juda ko\'p urinish. Keyinroq urinib ko\'ring.',
    };
    showErr(msgs[e.code]||'Xatolik yuz berdi: '+e.message);
  } finally {
    btn.disabled=false; btn.textContent='🔐 Kirish';
  }
}

function showErr(msg){
  const err = document.getElementById('loginError');
  err.textContent = msg;
  err.style.display = 'block';
}

async function doLogout(){
  if(!confirm('Chiqmoqchimisiz?')) return;
  if(window.FB){ try{ await window.FB.auth.signOut(); }catch(e){} }
  window.currentUser = null;
  window.onAuthChange && window.onAuthChange(null);
  nav('home');
  showToast('Tizimdan chiqildi.');
}

window.onAuthChange = function(user){
  const loginBtn = document.getElementById('loginTopBtn');
  const logoutBtn = document.getElementById('logoutTopBtn');
  const adminBtn = document.getElementById('adminTopBtn');
  const userInfo = document.getElementById('userInfoSpan');

  if(user){
    loginBtn.style.display = 'none';
    logoutBtn.style.display = '';
    adminBtn.style.display = '';
    userInfo.style.display = '';
    userInfo.textContent = '👤 ' + (user.email||'Admin');
    document.getElementById('admin-login-required').style.display = 'none';
    document.getElementById('admin-panel-content').style.display = 'block';
    const emailEl = document.getElementById('admin-user-email');
    if(emailEl) emailEl.textContent = user.email||'Admin';
    loadAdminStats();
  } else {
    loginBtn.style.display = '';
    logoutBtn.style.display = 'none';
    adminBtn.style.display = 'none';
    userInfo.style.display = 'none';
    document.getElementById('admin-login-required').style.display = 'block';
    document.getElementById('admin-panel-content').style.display = 'none';
  }
};

// ═══════════════ NAVIGATION ═══════════════
const sections = ['home','school','staff','news','announcements','gallery','schedule','circles','teachers','students','parents','documents','symbols','contact','admin'];
const rendered = {};

function showSection(id){
  sections.forEach(s=>{
    const el = document.getElementById('sec-'+s);
    if(el) el.classList.toggle('active', s===id);
  });
  window.scrollTo({top:0,behavior:'smooth'});
  if(!rendered[id]){ rendered[id]=true; renderSection(id); }
}

function nav(secId, sub){
  showSection(secId);
  if(sub) setTimeout(()=>{ const el=document.getElementById(`${secId[0]}${secId.slice(1,3)}-${sub}`) || document.getElementById(`sch-${sub}`) || document.getElementById(`teach-${sub}`) || document.getElementById(`stud-${sub}`) || document.getElementById(`par-${sub}`); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }, 200);
}

async function renderSection(id){
  if(id==='home') await renderHome();
  else if(id==='news') await renderNews();
  else if(id==='announcements') await renderAnnouncements();
  else if(id==='school'||id==='teachers'||id==='students'||id==='parents'||id==='contact') renderSidebar(id);
}

// ═══════════════ RENDER HOME ═══════════════
async function renderHome(){
  const news = await fbLoadNews();
  const ann = await fbLoadNews().then(()=>fbLoadAnn());

  // Fresh load
  const freshNews = await fbLoadNews();
  const freshAnn = await fbLoadAnn();
  newsData = freshNews;
  annData = freshAnn;

  const nh = document.getElementById('home-news');
  if(nh) nh.innerHTML = freshNews.slice(0,5).map(n=>`
    <div class="news-card" onclick="nav('news')">
      <div class="ni"><img src="${n.img||'https://picsum.photos/seed/'+n.id+'/400/260'}" loading="lazy"/></div>
      <div class="nb">
        <div class="nd">📅 ${n.date||''} ${n.time?'· '+n.time:''}</div>
        <div class="nt">${n.title}</div>
        <div class="ne">${n.excerpt||n.text||''}</div>
        <span class="rm">Batafsil →</span>
      </div>
    </div>`).join('');

  const ah = document.getElementById('home-ann');
  if(ah) ah.innerHTML = freshAnn.slice(0,3).map(a=>`
    <div class="ann-item">
      <span class="badge" style="background:${annColors[a.badge]||'#7f8c8d'};white-space:nowrap;margin-top:2px">${a.badge||'E\'lon'}</span>
      <div style="flex:1"><div style="font-weight:700;font-size:13.5px;margin-bottom:2px">${a.title}</div><div style="font-size:12.5px;color:var(--muted)">${a.text||''}</div></div>
      <span style="font-size:11px;color:var(--muted);white-space:nowrap;flex-shrink:0">${a.date||''}</span>
    </div>`).join('');

  const gh = document.getElementById('home-gallery');
  if(gh) gh.innerHTML = [1,2,3,4,5,6].map(i=>`
    <div class="photo-item" onclick="openLB('https://picsum.photos/seed/school${i}/800/600')">
      <img src="https://picsum.photos/seed/school${i}/400/300" loading="lazy"/>
      <div class="ov"><span>🔍</span><p>Maktab surati ${i}</p></div>
    </div>`).join('');

  renderSidebarEl('home-sidebar');
  document.getElementById('home-useful').innerHTML = buildUseful();
}

// ═══════════════ RENDER NEWS ═══════════════
let allNews = [], newsPage = 1;
const NEWS_PP = 6;

async function renderNews(){
  allNews = await fbLoadNews();
  newsData = allNews;
  filterNews();
  renderSidebarEl('news-sidebar');
}

function filterNews(){
  const q = (document.getElementById('news-q')||{}).value||'';
  const filtered = allNews.filter(n=>!q || n.title.toLowerCase().includes(q.toLowerCase()) || (n.excerpt||'').toLowerCase().includes(q.toLowerCase()));
  newsPage = 1;
  renderNewsPage(filtered);
}

function renderNewsPage(list){
  const nl = document.getElementById('news-list');
  const pg = document.getElementById('news-pag');
  if(!nl) return;
  const slice = list.slice((newsPage-1)*NEWS_PP, newsPage*NEWS_PP);
  nl.innerHTML = slice.length ? slice.map(n=>`
    <div class="news-card">
      <div class="ni"><img src="${n.img||'https://picsum.photos/seed/'+n.id+'/400/260'}" loading="lazy"/></div>
      <div class="nb">
        <div class="nd">📅 ${n.date||''} ${n.time?'· '+n.time:''}</div>
        <div class="nt">${n.title}</div>
        <div class="ne">${n.excerpt||n.text||''}</div>
      </div>
    </div>`).join('') : '<p style="color:var(--muted);padding:20px">Yangilik topilmadi.</p>';

  const pages = Math.ceil(list.length/NEWS_PP);
  if(pg) pg.innerHTML = Array.from({length:pages},(_,i)=>`<a href="#" onclick="newsPage=${i+1};renderNewsPage(window._filteredNews||allNews)" class="${i+1===newsPage?'active':''}">${i+1}</a>`).join('');
  window._filteredNews = list;
}

// ═══════════════ RENDER ANNOUNCEMENTS ═══════════════
async function renderAnnouncements(){
  const list = await fbLoadAnn();
  annData = list;
  const el = document.getElementById('ann-list');
  if(el) el.innerHTML = list.map(a=>`
    <div class="ann-item">
      <span class="badge" style="background:${annColors[a.badge]||'#7f8c8d'};white-space:nowrap;margin-top:2px">${a.badge||'E\'lon'}</span>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;margin-bottom:3px">${a.title}</div>
        <div style="font-size:13px;color:var(--muted)">${a.text||''}</div>
      </div>
      <span style="font-size:11px;color:var(--muted);white-space:nowrap;flex-shrink:0">${a.date||''}</span>
    </div>`).join('');
  renderSidebarEl('ann-sidebar');
}

// ═══════════════ SIDEBAR ═══════════════
const sidebarMap = {
  school:'school-sidebar', teachers:'teach-sidebar', students:'stud-sidebar',
  parents:'par-sidebar', contact:'cont-sidebar'
};

function renderSidebar(id){ renderSidebarEl(sidebarMap[id]||id+'-sidebar'); }

function renderSidebarEl(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-header">📢 Oxirgi e'lonlar</div>
      <ul>${annData.slice(0,4).map(a=>`
        <li style="border-bottom:1px solid var(--border)">
          <a href="#" onclick="nav('announcements')" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 14px;font-size:12px;color:var(--text)">
            <span>📌 ${a.title.slice(0,42)}</span>
            <span style="font-size:10.5px;color:var(--muted);white-space:nowrap">${a.date||''}</span>
          </a>
        </li>`).join('')}
      </ul>
      <div style="padding:9px 14px;border-top:1px solid var(--border)"><a href="#" onclick="nav('announcements')" style="font-size:12.5px;color:var(--gold);font-weight:700">Barcha e'lonlar →</a></div>
    </div>
    <div class="card">
      <div class="card-header">🔗 Tezkor havolalar</div>
      <ul class="sb-links">
        <li><a href="#" onclick="nav('gallery')">🖼 Fotogalereya</a></li>
        <li><a href="#" onclick="nav('schedule')">📅 Dars jadvali</a></li>
        <li><a href="#" onclick="nav('circles')">🎨 To'garaklar</a></li>
        <li><a href="#" onclick="nav('documents')">📁 Normativ hujjatlar</a></li>
        <li><a href="#" onclick="nav('symbols')">🇺🇿 Davlat ramzlari</a></li>
      </ul>
    </div>
    <div class="card">
      <div class="card-header">📍 Aloqa</div>
      <div style="padding:13px">
        <div class="contact-row"><span class="ci">📍</span><span style="font-size:12.5px">Furqat tumani, Markaziy ko'cha 12</span></div>
        <div class="contact-row"><span class="ci">📞</span><a href="tel:+998735400606" style="color:var(--green);font-size:12.5px">+998 73 540-06-06</a></div>
        <div class="contact-row"><span class="ci">✉️</span><a href="mailto:furqat6maktab@edu.uz" style="color:var(--green);font-size:12.5px">furqat6maktab@edu.uz</a></div>
      </div>
    </div>`;
}

function buildUseful(){
  const links=[
    {url:'https://edu.uz',icon:'🎓',title:"Xalq ta'limi vazirligi"},
    {url:'https://uzedu.uz',icon:'📚',title:"UzEdu portali"},
    {url:'https://student.uzedu.uz',icon:'👨‍🎓',title:"Talaba portali"},
    {url:'https://emaktab.uz',icon:'🏫',title:"E-Maktab tizimi"},
    {url:'https://ziyonet.uz',icon:'🌐',title:"ZiyoNet"},
    {url:'https://kitob.uz',icon:'📖',title:"Elektron kutubxona"},
    {url:'https://kun.uz',icon:'📰',title:"Kun.uz yangiliklar"},
    {url:'https://gov.uz',icon:'🏛️',title:"gov.uz portali"},
  ];
  return `<section class="useful-sec"><div class="container"><div class="sec-head"><h2 class="sec-title">Foydali havolalar</h2></div><div class="useful-grid">${links.map(l=>`<a href="${l.url}" target="_blank" class="ul-link"><span class="ul-icon">${l.icon}</span>${l.title}</a>`).join('')}</div></div></section>`;
}

// ═══════════════ ADMIN ═══════════════
async function loadAdminStats(){
  const n = await fbLoadNews();
  const a = await fbLoadAnn();
  const m = await fbLoadMessages();
  document.getElementById('stat-news').textContent = n.length;
  document.getElementById('stat-ann').textContent = a.length;
  document.getElementById('stat-msg').textContent = m.length;
}

async function adminTab(type){
  const cont = document.getElementById('admin-content');
  if(!cont) return;

  if(type==='yangilik'){
    const news = await fbLoadNews();
    newsData = news;
    cont.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header">📰 Yangilik qo'shish</div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label>Sarlavha *</label><input type="text" id="adm-t" placeholder="Yangilik sarlavhasi"/></div>
            <div class="form-group"><label>Sana</label><input type="text" id="adm-d" placeholder="DD.MM.YYYY" value="${new Date().toLocaleDateString('ru')}"/></div>
          </div>
          <div class="form-group"><label>Rasm URL</label><input type="text" id="adm-i" placeholder="https://..."/></div>
          <div class="form-group"><label>Qisqa matn</label><textarea id="adm-e" placeholder="Qisqa tavsif..."></textarea></div>
          <button class="btn btn-green" onclick="addNews()">➕ Qo'shish</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">📋 Mavjud yangiliklar (${news.length} ta)</div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>Sana</th><th>Sarlavha</th><th>Amal</th></tr></thead>
          <tbody>${news.map(n=>`
            <tr>
              <td style="white-space:nowrap">${n.date||''}</td>
              <td style="max-width:280px">${(n.title||'').slice(0,60)}</td>
              <td><button class="btn btn-sm btn-danger" onclick="deleteNews('${n.id}')">O'chirish</button></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`;

  } else if(type==='elon'){
    const ann = await fbLoadAnn();
    cont.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header">📢 E'lon qo'shish</div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label>Sarlavha *</label><input type="text" id="ann-t" placeholder="E'lon sarlavhasi"/></div>
            <div class="form-group"><label>Tur</label>
              <select id="ann-b" style="width:100%;padding:9px 13px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit">
                <option>Muhim</option><option>Tadbir</option><option>Majlis</option><option>To_garak</option><option>Olimpiada</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Matn</label><textarea id="ann-tx" placeholder="E'lon matni..."></textarea></div>
          <button class="btn btn-green" onclick="addAnn()">➕ Qo'shish</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">📋 Mavjud e'lonlar (${ann.length} ta)</div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>Sana</th><th>Sarlavha</th><th>Amal</th></tr></thead>
          <tbody>${ann.map(a=>`
            <tr>
              <td style="white-space:nowrap">${a.date||''}</td>
              <td>${(a.title||'').slice(0,50)}</td>
              <td><button class="btn btn-sm btn-danger" onclick="deleteAnn('${a.id}')">O'chirish</button></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`;

  } else if(type==='murojaatlar'){
    cont.innerHTML = `<div class="loading"><div class="spinner"></div>Yuklanmoqda...</div>`;
    const msgs = await fbLoadMessages();
    cont.innerHTML = msgs.length ? `
      <div class="card">
        <div class="card-header">📬 Murojaatlar (${msgs.length} ta)</div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>Ism</th><th>Mavzu</th><th>Matn</th><th>Sana</th></tr></thead>
          <tbody>${msgs.map(m=>`
            <tr>
              <td style="white-space:nowrap;font-weight:700">${m.name||''}</td>
              <td>${m.subject||''}</td>
              <td style="max-width:200px;font-size:12px;color:var(--muted)">${(m.message||'').slice(0,60)}</td>
              <td style="white-space:nowrap;font-size:11px;color:var(--muted)">${m.createdAt?.toDate?m.createdAt.toDate().toLocaleDateString('ru'):(m.date||'')}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>` :
      `<div class="card"><div class="card-body" style="text-align:center;padding:36px;color:var(--muted)">📭 Hozircha murojaatlar yo'q</div></div>`;
  }
}

async function addNews(){
  const t = (document.getElementById('adm-t')||{}).value||'';
  if(!t.trim()){ alert('Sarlavha kiriting!'); return; }
  const data = {
    title: t,
    date: (document.getElementById('adm-d')||{}).value||new Date().toLocaleDateString('ru'),
    time: '09:00',
    img: (document.getElementById('adm-i')||{}).value||`https://picsum.photos/seed/${Date.now()}/400/260`,
    excerpt: (document.getElementById('adm-e')||{}).value||''
  };
  const ok = await fbAddNews(data);
  if(ok){ showToast('✅ Yangilik qo\'shildi!'); rendered.home=false; rendered.news=false; adminTab('yangilik'); }
  else { alert('Xatolik yuz berdi!'); }
}

async function deleteNews(id){
  if(!confirm('O\'chirishni tasdiqlaysizmi?')) return;
  const ok = await fbDeleteNews(id);
  if(ok){ showToast('🗑 O\'chirildi'); rendered.home=false; rendered.news=false; adminTab('yangilik'); }
}

async function addAnn(){
  const t = (document.getElementById('ann-t')||{}).value||'';
  if(!t.trim()){ alert('Sarlavha kiriting!'); return; }
  const data = {
    title: t,
    text: (document.getElementById('ann-tx')||{}).value||'',
    badge: (document.getElementById('ann-b')||{}).value||'Muhim',
    date: new Date().toLocaleDateString('ru')
  };
  const ok = await fbAddAnn(data);
  if(ok){ showToast('✅ E\'lon qo\'shildi!'); rendered.home=false; rendered.announcements=false; adminTab('elon'); }
}

async function deleteAnn(id){
  if(!confirm('O\'chirishni tasdiqlaysizmi?')) return;
  const ok = await fbDeleteAnn(id);
  if(ok){ showToast('🗑 O\'chirildi'); rendered.home=false; rendered.announcements=false; adminTab('elon'); }
}

// ═══════════════ CONTACT FORM ═══════════════
async function sendMsg(){
  const nm = (document.getElementById('fn')||{}).value||'';
  const msg = (document.getElementById('fmsg')||{}).value||'';
  if(!nm.trim()){ alert('Ism-familiya kiriting!'); return; }
  if(!msg.trim()){ alert('Murojaat matni kiriting!'); return; }

  const data = {
    name: nm,
    phone: (document.getElementById('fph')||{}).value||'',
    email: (document.getElementById('fem')||{}).value||'',
    subject: (document.getElementById('fsub')||{}).value||'',
    message: msg,
    date: new Date().toLocaleDateString('ru')
  };

  const ok = await fbSaveMessage(data);
  if(ok){
    showToast('✅ Murojaatingiz yuborildi!');
    ['fn','fph','fem','fsub','fmsg'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  } else {
    alert('Xatolik yuz berdi. Qayta urinib ko\'ring.');
  }
}

// ═══════════════ UTILITIES ═══════════════
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

function showTab(id, btn){
  const scope = btn.closest('.tab-btns');
  scope.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const parent = scope.parentElement;
  parent.querySelectorAll('.tab-c').forEach(t=>t.classList.remove('active'));
  const target = document.getElementById('tab-'+id);
  if(target) target.classList.add('active');
}

function showDocTab(id, btn){
  document.querySelectorAll('#sec-documents .tab-c').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('#sec-documents .tab-btn').forEach(b=>b.classList.remove('active'));
  const t = document.getElementById('tab-d'+id);
  if(t) t.classList.add('active');
  btn.classList.add('active');
}

function openLB(src){ document.getElementById('lb').classList.add('open'); document.getElementById('lb-img').src=src; }
function closeLB(){ document.getElementById('lb').classList.remove('open'); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeLB(); closeLogin(); } });

function toggleNav(){ document.getElementById('main-nav').classList.toggle('open'); }
document.addEventListener('click',e=>{ const nav=document.getElementById('main-nav'); if(nav&&!nav.contains(e.target)&&!e.target.closest('.hamburger')) nav.classList.remove('open'); });

window.addEventListener('scroll',()=>{ const btn=document.getElementById('scroll-top'); if(btn) btn.classList.toggle('show',window.scrollY>300); });

function doSearch(){
  const q = (document.getElementById('hdr-q')||{}).value||'';
  if(q.trim()){ nav('news'); setTimeout(()=>{ const inp=document.getElementById('news-q'); if(inp){ inp.value=q; filterNews(); } },300); }
}

// ═══════════════ FOOTER ═══════════════
document.getElementById('shared-footer').innerHTML = `
<footer>
  <div class="footer-top">
    <div>
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
        <div style="width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,var(--green),var(--gold));display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;flex-shrink:0">6</div>
        <div style="color:#fff;font-weight:700;font-size:14px;line-height:1.3">6-son Umumta'lim Maktabi<br><span style="font-size:11px;font-weight:400;opacity:.6">Farg'ona viloyati, Furqat tumani</span></div>
      </div>
      <p>Bilim — kelajak poydevorimiz</p>
      <p style="margin-top:5px;font-size:11.5px;opacity:.5">Maktab tashkil topgan yil: 1962</p>
      <div class="ft-soc">
        <a href="https://t.me/furqat6maktab" target="_blank">✈</a>
        <a href="https://facebook.com/" target="_blank">f</a>
        <a href="https://instagram.com/" target="_blank">📷</a>
        <a href="https://youtube.com/" target="_blank">▶</a>
      </div>
    </div>
    <div>
      <h5>Tezkor havolalar</h5>
      <ul>
        <li><a href="#" onclick="nav('school')">Maktab direktori</a></li>
        <li><a href="#" onclick="nav('staff')">O'qituvchilar jamoasi</a></li>
        <li><a href="#" onclick="nav('schedule')">Dars jadvali</a></li>
        <li><a href="#" onclick="nav('circles')">To'garaklar</a></li>
        <li><a href="#" onclick="nav('news')">Yangiliklar</a></li>
        <li><a href="#" onclick="nav('gallery')">Fotogalereya</a></li>
        <li><a href="#" onclick="nav('announcements')">E'lonlar</a></li>
        <li><a href="#" onclick="nav('documents')">Normativ hujjatlar</a></li>
      </ul>
    </div>
    <div>
      <h5>Bog'lanish</h5>
      <p>📍 Farg'ona viloyati, Furqat tumani, Markaziy ko'cha 12</p>
      <p style="margin-top:7px">📞 <a href="tel:+998735400606" style="color:rgba(255,255,255,.7)">+998 73 540-06-06</a></p>
      <p style="margin-top:5px">✉️ <a href="mailto:furqat6maktab@edu.uz" style="color:rgba(255,255,255,.7)">furqat6maktab@edu.uz</a></p>
      <div style="margin-top:14px;padding:11px;background:rgba(255,255,255,.06);border-radius:8px;font-size:11.5px">
        <b style="color:#fff">Qabul vaqti:</b><br>Dush–Juma: 09:00–18:00<br>Shanba: 09:00–13:00
      </div>
    </div>
  </div>
  <div class="footer-bot">© ${new Date().getFullYear()} Farg'ona viloyati Furqat tumani 6-son umumta'lim maktabi · Barcha huquqlar himoyalangan</div>
</footer>`;

// ═══════════════ INIT ═══════════════
showSection('home');

/* Dinamik Firebase qo'shimcha: real-time bo'limlar + universal admin editor */
const DYN={unsub:[],settings:{"schoolName": "6-sonli umumiy o'rta ta'lim maktabi", "region": "Farg'ona viloyati Furqat tumani", "slogan": "Bilim — kelajak poydevorimiz", "phone": "+998 73 540-06-06", "email": "furqat6maktab@edu.uz", "address": "Farg'ona viloyati, Furqat tumani", "telegram": "https://t.me/furqat6maktab", "directorName": "Turdaliyeva Zeboxon Xolmatovna", "directorRole": "Farg'ona viloyati Furqat tumani 6-sonli umumiy o'rta ta'lim maktabi direktori", "directorBio": "6-sonli umumiy o‘rta ta’lim maktabi rahbari.", "statsStudents": "1200+", "statsTeachers": "47", "statsRooms": "42", "statsWinners": "18"},staff:[],circles:[],gallery:[],documents:[]};
const sampleStaff=[{"name": "To‘g‘onova Saboxon Odiljon Qizi", "subject": "Matematika", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Ahmadjonova Maftunaxon Raxmatjon Qizi", "subject": "Rus tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Olimova Umidaxon No‘’monjon Qizi", "subject": "Ingliz tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Akbarova Xurshida Shuxrat Qizi", "subject": "Musiqa madaniyati", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Baxodirova Maxoratxon Shuxratovna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Qurbonova Madinabonu Faxriddin Qizi", "subject": "Ona tili va adabiyot", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Dexqonova Shoxnozaxon Yigitaliyevna", "subject": "Kutubxona mudiri", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Subxonov Bexzodjon Zafarjon O‘g‘li", "subject": "Rus tili", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "G‘aniyeva Oyjamol Mexmonaliyevna", "subject": "Секретарь-делопроизводитель", "category": "Kotibiyat", "icon": "👩‍🏫"}, {"name": "Ergashev Sardorbek Akbarjon O‘g‘li", "subject": "Informatika va axborot texnologiyalari", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Yuldasheva Xolisxon Umarovna", "subject": "Заместитель директора по хозяйственныой работе", "category": "Rahbariyat", "icon": "👩‍💼"}, {"name": "Turdaliyev Bayozxon Saydazimovich", "subject": "Сторож", "category": "Xodim", "icon": "👨‍🏫"}, {"name": "Ismoilova Yoqutxon Rapiqjon Qizi", "subject": "Уборщик территорий", "category": "Xodim", "icon": "👩‍🏫"}, {"name": "Dexqonova Vasila Saxabidillayevna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Turdaliyeva Zeboxon Xolmatovna", "subject": "Директор школы", "category": "Rahbariyat", "icon": "👩‍💼"}, {"name": "Nasirdinova Zuxra Ergashaliyevna", "subject": "Умумий ўрта типдаги таълим муассасаси психологи", "category": "Psixolog", "icon": "👩‍🏫"}, {"name": "Rashidova Oltinoy Maxamataliyevna", "subject": "Заместитель директора по духовной и просветительской работе", "category": "Rahbariyat", "icon": "👩‍💼"}, {"name": "O‘rinboyev Ravshanjon Murodilovich", "subject": "Руководитель допризывной подготовки учащихся", "category": "Ma'muriyat", "icon": "👨‍🏫"}, {"name": "Kenjaboyev Ravshan Avazbekovich", "subject": "Заместитель директора по учебной методической работе", "category": "Rahbariyat", "icon": "👨‍💼"}, {"name": "Kenjaboyeva O‘g‘iloy Ibroximovna", "subject": "Texnologiya", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Raxmonqulova Mamura Dexqonovna", "subject": "Ona tili va adabiyot (O‘zb)", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Farmonova Maxfuzaxon Kuldashevna", "subject": "Ona tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Kenjayeva Gulira Turg‘unovna", "subject": "Matematika", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Azimova Feruzabonu G‘oyibullo Qizi", "subject": "Rus tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Yusupova Nilufar Soliyevna", "subject": "Tarix", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Sarimsakov Lazizbek Xolmatovich", "subject": "Texnologiya", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Eshmatov Dostonbek Suyunbekovich", "subject": "Физическое воспитание", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Abdullayeva Shaxnoza Ibroximjonovna", "subject": "Musiqa madaniyati", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "To‘ychiyeva Vaziraxon Foziljon Qizi", "subject": "Biologiya", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Alimova Xusnidaxon Rustamovna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Azamatov Xursanali Imomaliyevich", "subject": "Geografiya", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Usmonova Gulxayoxon Akramovna", "subject": "Biologiya", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Dexqonova E’zozxon Yigitaliyevna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Begmurodova Matluba Zoxirovna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Yuldasheva Munisaxon Axrorovna", "subject": "Ingliz tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Ubaydullayeva Maxliyoxon Qovuljonovna", "subject": "Ona tili", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Sultonov Avazbek Raximovich", "subject": "Tarbiya", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Kenjaboyeva Zulfira Avazbekovna", "subject": "Tasviriy san’at", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Mamajonova Nargizaxon Muqimovna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Mamajonov Ikboljon Maxamadaliyevich", "subject": "Ingliz tili", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "O‘sarova Xurshida Baxtiyorovna", "subject": "Kimyo", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Jo‘rayeva Muattarxon Jamoldinovna", "subject": "Fizika", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Begaliyeva Feruza Sultonaliyevna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Dexkonov Otabek Ergashevich", "subject": "Физическое воспитание", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Xaydarov Kamoliddin Rapiqovich", "subject": "Tarix", "category": "Pedagog", "icon": "👨‍🏫"}, {"name": "Farmonova Musharrafxon Qo‘ldashovna", "subject": "Boshlang'ich ta'lim", "category": "Pedagog", "icon": "👩‍🏫"}, {"name": "Abdullayeva Maftuna Ismoiljon Qizi", "subject": "Matematika", "category": "Pedagog", "icon": "👩‍🏫"}];
const sampleCircles=[{name:"Robototexnika",teacher:"Botirov K.",time:"Sesh, Pay: 15:00–17:00",count:"32 o'quvchi",icon:"🤖"},{name:"Matematika",teacher:"Rahimova D.",time:"Dush, Chor: 15:00–16:30",count:"28 o'quvchi",icon:"📐"},{name:"Ingliz tili+",teacher:"Yusupov Sh.",time:"Juma: 14:00–16:00",count:"24 o'quvchi",icon:"🌐"}];
const sampleGallery=[1,2,3,4,5,6].map(i=>({title:`Maktab surati ${i}`,img:`https://picsum.photos/seed/school${i}/800/600`,category:"Maktab"}));
const sampleDocuments=[{title:"Ta'lim to'g'risida qonun",meta:"Normativ hujjat",url:"#",icon:"📜"},{title:"Maktab nizomi",meta:"Ichki tartib",url:"#",icon:"📋"}];

function esc(v){return String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function dynFallback(c){return {staff:sampleStaff,circles:sampleCircles,gallery:sampleGallery,documents:sampleDocuments}[c]||[];}
async function dbSet(c,id,data){if(!window.FB)return false;await window.FB.setDoc(window.FB.doc(window.FB.db,c,id),{...data,updatedAt:window.FB.serverTimestamp()},{merge:true});return true;}
async function dbAdd(c,data){if(!window.FB)return false;await window.FB.addDoc(window.FB.collection(window.FB.db,c),{...data,createdAt:window.FB.serverTimestamp(),updatedAt:window.FB.serverTimestamp()});return true;}
async function dbDel(c,id){if(!window.FB)return false;await window.FB.deleteDoc(window.FB.doc(window.FB.db,c,id));return true;}
function listenColl(c,fallback,cb){if(!window.FB){cb(fallback.map((x,i)=>({id:i+1,...x})));return;}try{const q=window.FB.query(window.FB.collection(window.FB.db,c),window.FB.orderBy('createdAt','desc'));DYN.unsub.push(window.FB.onSnapshot(q,snap=>cb(snap.empty?fallback.map((x,i)=>({id:i+1,...x,_fallback:true})):snap.docs.map(d=>({id:d.id,...d.data()}))),()=>cb(fallback.map((x,i)=>({id:i+1,...x,_fallback:true})))));}catch(e){cb(fallback.map((x,i)=>({id:i+1,...x,_fallback:true})));}}
function listenSettings(){if(!window.FB){applySettings();return;}DYN.unsub.push(window.FB.onSnapshot(window.FB.doc(window.FB.db,'site','settings'),snap=>{if(snap.exists())DYN.settings={...DYN.settings,...snap.data()};applySettings();},()=>applySettings()));}
function startRealtime(){listenSettings();listenColl('news',defaultNews,a=>{newsData=allNews=a;refreshVisible();});listenColl('announcements',defaultAnn,a=>{annData=a;refreshVisible();});['staff','circles','gallery','documents'].forEach(c=>listenColl(c,dynFallback(c),a=>{DYN[c]=a;renderDyn(c);refreshAdminStatsQuick();}));}
function refreshVisible(){const a=document.querySelector('.section.active')?.id?.replace('sec-','');if(a==='home')renderHome();if(a==='news')renderNews();if(a==='announcements')renderAnnouncements();['home-sidebar','news-sidebar','ann-sidebar','school-sidebar','teach-sidebar','stud-sidebar','par-sidebar','cont-sidebar'].forEach(renderSidebarEl);refreshAdminStatsQuick();}
function applySettings(){const s=DYN.settings;document.querySelectorAll('.logo-text .ln1').forEach(e=>e.textContent=s.schoolName);document.querySelectorAll('.logo-text .ln2').forEach(e=>e.textContent=`${s.region} ${s.schoolName}`);document.querySelectorAll('.hdr-phone').forEach(e=>e.textContent=s.phone);let h=document.querySelector('#sec-home .hero-text h1');if(h)h.textContent=`${s.region} ${s.schoolName}`;let sub=document.querySelector('#sec-home .hero-text .sub');if(sub)sub.textContent=s.slogan;document.querySelectorAll('#sec-home .hstat-n').forEach((e,i)=>e.textContent=[s.statsStudents,s.statsTeachers,s.statsRooms,s.statsWinners][i]||e.textContent);document.querySelectorAll('.director-card .dir-info h3').forEach(e=>e.textContent=s.directorName);document.querySelectorAll('.director-card .dir-info .dr').forEach(e=>e.textContent=s.directorRole);document.querySelectorAll('.director-card .dir-info .db').forEach(e=>e.textContent=s.directorBio);}
fbLoadNews=async()=>newsData?.length?newsData:defaultNews;fbLoadAnn=async()=>annData?.length?annData:defaultAnn;fbAddNews=async data=>dbAdd('news',data);fbAddAnn=async data=>dbAdd('announcements',data);fbDeleteNews=async id=>dbDel('news',id);fbDeleteAnn=async id=>dbDel('announcements',id);fbLoadMessages=async()=>{if(!window.FB)return messagesData;try{const snap=await window.FB.getDocs(window.FB.query(window.FB.collection(window.FB.db,'messages'),window.FB.orderBy('createdAt','desc')));return snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){return messagesData;}};
function renderDyn(c){if(c==='staff')renderDynamicStaff();if(c==='circles')renderDynamicCircles();if(c==='gallery')renderDynamicGallery();if(c==='documents')renderDynamicDocs();}
function renderDynamicStaff(){const w=document.querySelector('#sec-staff .staff-grid');if(!w)return;w.innerHTML=(DYN.staff.length?DYN.staff:sampleStaff).map(x=>`<div class="staff-card"><div class="staff-avatar">${esc(x.icon||'👩‍🏫')}</div><h4>${esc(x.name)}</h4><div class="sr">${esc(x.subject)}</div><div class="ssub">${esc(x.category)}</div></div>`).join('');}
function renderDynamicCircles(){const w=document.querySelector('#sec-circles .circles-grid');if(!w)return;w.innerHTML=(DYN.circles.length?DYN.circles:sampleCircles).map(x=>`<div class="circle-card"><div class="cc-icon">${esc(x.icon||'🎯')}</div><div class="cc-name">${esc(x.name)}</div><div class="cc-meta">Rahbar: ${esc(x.teacher)} · ${esc(x.time)}</div><div class="cc-count">${esc(x.count)}</div></div>`).join('');}
function renderDynamicGallery(){const html=(DYN.gallery.length?DYN.gallery:sampleGallery).map(x=>`<div class="photo-item" onclick="openLB('${esc(x.img)}')"><img src="${esc(x.img)}" loading="lazy"/><div class="ov"><span>🔍</span><p>${esc(x.title)}</p></div></div>`).join('');document.querySelectorAll('#sec-gallery .photo-grid,#home-gallery').forEach(g=>g.innerHTML=html);}
function renderDynamicDocs(){const w=document.querySelector('#sec-documents #tab-d1 .doc-list');if(!w)return;w.innerHTML=(DYN.documents.length?DYN.documents:sampleDocuments).map(x=>`<div class="doc-item"><span class="doc-icon">${esc(x.icon||'📄')}</span><div class="doc-info"><h4>${esc(x.title)}</h4><p>${esc(x.meta)}</p></div><a href="${esc(x.url||'#')}" target="_blank" class="btn btn-sm btn-og">Ko'rish</a></div>`).join('');}
function refreshAdminStatsQuick(){Object.entries({'stat-news':newsData.length,'stat-ann':annData.length,'stat-msg':messagesData.length}).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});}
loadAdminStats=async function(){messagesData=await fbLoadMessages();refreshAdminStatsQuick();};
const oldOnAuthChange=window.onAuthChange;window.onAuthChange=function(user){oldOnAuthChange&&oldOnAuthChange(user);if(user)setTimeout(()=>{enhanceAdminHome();loadAdminStats();},100);};
function enhanceAdminHome(){const cards=document.querySelector('#admin-panel-content > div:nth-of-type(3)');if(!cards||cards.dataset.enhanced)return;cards.dataset.enhanced='1';cards.insertAdjacentHTML('beforeend',`<div class="card" style="border-top:4px solid #16a085;cursor:pointer" onclick="adminTab('site')"><div class="card-body" style="text-align:center"><div style="font-size:34px;margin-bottom:7px">🏫</div><h4 style="color:var(--green)">Sayt sozlamalari</h4><p style="font-size:12px;color:var(--muted)">Logo, aloqa, direktor, statistika</p></div></div><div class="card" style="border-top:4px solid #8e44ad;cursor:pointer" onclick="adminTab('staff')"><div class="card-body" style="text-align:center"><div style="font-size:34px;margin-bottom:7px">👥</div><h4 style="color:var(--green)">Jamoa</h4><p style="font-size:12px;color:var(--muted)">O'qituvchilar</p></div></div><div class="card" style="border-top:4px solid #2471a3;cursor:pointer" onclick="adminTab('circles')"><div class="card-body" style="text-align:center"><div style="font-size:34px;margin-bottom:7px">🎯</div><h4 style="color:var(--green)">To'garaklar</h4><p style="font-size:12px;color:var(--muted)">Mashg'ulotlar</p></div></div><div class="card" style="border-top:4px solid #d35400;cursor:pointer" onclick="adminTab('gallery')"><div class="card-body" style="text-align:center"><div style="font-size:34px;margin-bottom:7px">🖼</div><h4 style="color:var(--green)">Galereya</h4><p style="font-size:12px;color:var(--muted)">Rasmlar</p></div></div><div class="card" style="border-top:4px solid #2c3e50;cursor:pointer" onclick="adminTab('documents')"><div class="card-body" style="text-align:center"><div style="font-size:34px;margin-bottom:7px">📁</div><h4 style="color:var(--green)">Hujjatlar</h4><p style="font-size:12px;color:var(--muted)">Fayl havolalari</p></div></div>`);}
const oldAdminTab=adminTab;adminTab=async function(type){const cont=document.getElementById('admin-content');if(!cont)return;if(['yangilik','elon','murojaatlar'].includes(type))return oldAdminTab(type);if(type==='site')return renderSiteEditor(cont);if(type==='staff')return renderManager(cont,'staff',DYN.staff,sampleStaff,[['icon','Belgi'],['name','Ism familiya'],['subject','Fan/lavozim'],['category','Toifa']]);if(type==='circles')return renderManager(cont,'circles',DYN.circles,sampleCircles,[['icon','Belgi'],["name","To\'garak nomi"],['teacher','Rahbar'],['time','Vaqti'],["count","O\'quvchi soni"]]);if(type==='gallery')return renderManager(cont,'gallery',DYN.gallery,sampleGallery,[['title','Rasm nomi'],['img','Rasm URL'],['category','Kategoriya']]);if(type==='documents')return renderManager(cont,'documents',DYN.documents,sampleDocuments,[['icon','Belgi'],['title','Hujjat nomi'],['meta','Izoh'],['url','Fayl URL']]);};
function inputHTML(id,label,val){return `<div class="form-group"><label>${label}</label><input id="${id}" value="${esc(val)}"/></div>`;}
function renderSiteEditor(cont){const s=DYN.settings;cont.innerHTML=`<div class="card"><div class="card-header">🏫 Sayt umumiy sozlamalari</div><div class="card-body"><div class="form-row">${inputHTML('set-schoolName','Maktab nomi',s.schoolName)}${inputHTML('set-region','Hudud',s.region)}</div>${inputHTML('set-slogan','Shior',s.slogan)}<div class="form-row">${inputHTML('set-phone','Telefon',s.phone)}${inputHTML('set-email','Email',s.email)}</div>${inputHTML('set-address','Manzil',s.address)}${inputHTML('set-telegram','Telegram havola',s.telegram)}<div class="form-row">${inputHTML('set-directorName','Direktor F.I.Sh.',s.directorName)}${inputHTML('set-directorRole','Direktor lavozimi',s.directorRole)}</div><div class="form-group"><label>Direktor haqida</label><textarea id="set-directorBio">${esc(s.directorBio)}</textarea></div><div class="form-row">${inputHTML('set-statsStudents','O\'quvchilar',s.statsStudents)}${inputHTML('set-statsTeachers','O\'qituvchilar',s.statsTeachers)}</div><div class="form-row">${inputHTML('set-statsRooms','Sinf xonalari',s.statsRooms)}${inputHTML('set-statsWinners','G\'oliblar',s.statsWinners)}</div><button class="btn btn-green" onclick="saveSettings()">💾 Saqlash</button><p style="font-size:12px;color:var(--muted);margin-top:10px">Saqlangandan so'ng o'zgarishlar real-time ko'rinadi.</p></div></div>`;}
async function saveSettings(){const keys=['schoolName','region','slogan','phone','email','address','telegram','directorName','directorRole','directorBio','statsStudents','statsTeachers','statsRooms','statsWinners'];const data={};keys.forEach(k=>{const e=document.getElementById('set-'+k);if(e)data[k]=e.value;});await dbSet('site','settings',data);showToast('✅ Sozlamalar saqlandi');}
function renderManager(cont,coll,arr,fallback,fields){const list=(arr&&arr.length?arr:fallback.map((x,i)=>({id:i+1,...x,_fallback:true})));cont.innerHTML=`<div class="card" style="margin-bottom:16px"><div class="card-header">➕ ${coll} qo'shish</div><div class="card-body">${fields.map(([k,l])=>`<div class="form-group"><label>${l}</label><input id="${coll}-${k}" placeholder="${l}"/></div>`).join('')}<button class="btn btn-green" onclick="addManaged('${coll}')">➕ Qo'shish</button></div></div><div class="card"><div class="card-header">📋 Mavjud elementlar</div><div class="tbl-wrap"><table><thead><tr>${fields.slice(0,3).map(f=>`<th>${f[1]}</th>`).join('')}<th>Amal</th></tr></thead><tbody>${list.map(x=>`<tr>${fields.slice(0,3).map(([k])=>`<td>${esc(x[k]||'')}</td>`).join('')}<td style="white-space:nowrap"><button class="btn btn-sm btn-og" onclick="editManaged('${coll}','${x.id}')" ${x._fallback?'disabled':''}>Tahrir</button> <button class="btn btn-sm btn-danger" onclick="deleteManaged('${coll}','${x.id}')" ${x._fallback?'disabled':''}>O'chirish</button></td></tr>`).join('')}</tbody></table></div></div>`;window._managerFields=window._managerFields||{};window._managerFields[coll]=fields;}
async function addManaged(coll){const fields=window._managerFields[coll];const data={};fields.forEach(([k])=>data[k]=(document.getElementById(`${coll}-${k}`)||{}).value||'');if(!Object.values(data).some(v=>String(v).trim()))return alert('Kamida bitta ma\'lumot kiriting!');await dbAdd(coll,data);showToast('✅ Qo\'shildi');adminTab(coll);}
async function editManaged(coll,id){const fields=window._managerFields[coll];const src=(DYN[coll]||[]).find(x=>String(x.id)===String(id));if(!src)return;const data={};for(const [k,l] of fields){const val=prompt(l,src[k]||'');if(val===null)return;data[k]=val;}await dbSet(coll,id,data);showToast('✅ Yangilandi');adminTab(coll);}
async function deleteManaged(coll,id){if(!confirm('O\'chirishni tasdiqlaysizmi?'))return;await dbDel(coll,id);showToast('🗑 O\'chirildi');adminTab(coll);}
setTimeout(()=>{startRealtime();applySettings();renderDynamicStaff();renderDynamicCircles();renderDynamicGallery();renderDynamicDocs();enhanceAdminHome();},600);

/* Excel fayllardan kiritilgan aniq ma'lumotlar */
const EXCEL_SCHEDULE=[{"className": "1A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Begalieva Feruza"}, "Seshanba": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Chorshanba": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Payshanba": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Juma": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Seshanba": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Chorshanba": {"subject": "Tarbiya", "teacher": "Begalieva Feruza"}, "Payshanba": {"subject": "Tabiiy Fan", "teacher": "Begalieva Feruza"}, "Juma": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Seshanba": {"subject": "O'qish", "teacher": "Begalieva Feruza"}, "Chorshanba": {"subject": "Informatika", "teacher": "Begalieva Feruza"}, "Payshanba": {"subject": "O'qish", "teacher": "Begalieva Feruza"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Seshanba": {"subject": "O'qish", "teacher": "Begalieva Feruza"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Payshanba": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Juma": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "", "teacher": ""}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "O'qish", "teacher": "Begalieva Feruza"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "1B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Bahodirova Maxorat"}, "Seshanba": {"subject": "Matematika", "teacher": "Bahodirova Maxorat"}, "Chorshanba": {"subject": "Tarbiya", "teacher": "Bahodirova Maxorat"}, "Payshanba": {"subject": "Matematika", "teacher": "Bahodirova Maxorat"}, "Juma": {"subject": "Matematika", "teacher": "Bahodirova Maxorat"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "O'qish", "teacher": "Bahodirova Maxorat"}, "Seshanba": {"subject": "O'qish", "teacher": "Bahodirova Maxorat"}, "Chorshanba": {"subject": "Matematika", "teacher": "Bahodirova Maxorat"}, "Payshanba": {"subject": "O'qish", "teacher": "Bahodirova Maxorat"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Bahodirova Maxorat"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Chorshanba": {"subject": "ona tili", "teacher": "Bahodirova Maxorat"}, "Payshanba": {"subject": "Tabiiy Fan", "teacher": "Mamajonova Nargiza"}, "Juma": {"subject": "ona tili", "teacher": "Bahodirova Maxorat"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Matematika", "teacher": "Bahodirova Maxorat"}, "Seshanba": {"subject": "ona tili", "teacher": "Bahodirova Maxorat"}, "Chorshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Payshanba": {"subject": "Informatika", "teacher": "Mamajonova Nargiza"}, "Juma": {"subject": "O'qish", "teacher": "Bahodirova Maxorat"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "", "teacher": ""}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "2A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Begmurodova Matluba"}, "Seshanba": {"subject": "ona tili", "teacher": "Begmurodova Matluba"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa"}, "Payshanba": {"subject": "ona tili", "teacher": "Begmurodova Matluba"}, "Juma": {"subject": "O'qish", "teacher": "Begmurodova Matluba"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "ona tili", "teacher": "Begmurodova Matluba"}, "Seshanba": {"subject": "O'qish", "teacher": "Begmurodova Matluba"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Payshanba": {"subject": "O'qish", "teacher": "Begmurodova Matluba"}, "Juma": {"subject": "Matematika", "teacher": "Begmurodova Matluba"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Matematika", "teacher": "Begmurodova Matluba"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Begmurodova Matluba"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Payshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Juma": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Seshanba": {"subject": "Matematika", "teacher": "Begmurodova Matluba"}, "Chorshanba": {"subject": "ona tili", "teacher": "Begmurodova Matluba"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Tabiiy Fan", "teacher": "Begmurodova Matluba"}, "Seshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Chorshanba": {"subject": "Matematika", "teacher": "Begmurodova Matluba"}, "Payshanba": {"subject": "Matematika", "teacher": "Begmurodova Matluba"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Begmurodova Matluba"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "2B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Farmonova Musharraf"}, "Seshanba": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Chorshanba": {"subject": "O'qish", "teacher": "Farmonova Musharraf"}, "Payshanba": {"subject": "O'qish", "teacher": "Farmonova Musharraf"}, "Juma": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Seshanba": {"subject": "O'qish", "teacher": "Farmonova Musharraf"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Juma": {"subject": "Matematika", "teacher": "Farmonova Musharraf"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Farmonova Musharraf"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Payshanba": {"subject": "Matematika", "teacher": "Farmonova Musharraf"}, "Juma": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Matematika", "teacher": "Farmonova Musharraf"}, "Seshanba": {"subject": "Matematika", "teacher": "Farmonova Musharraf"}, "Chorshanba": {"subject": "Matematika", "teacher": "Farmonova Musharraf"}, "Payshanba": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Juma": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Farmonova Musharraf"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa"}, "Payshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Farmonova Musharraf"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "3A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Dehqonova Vasila"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa | Olimova Umida"}, "Chorshanba": {"subject": "ona tili", "teacher": "Dehqonova Vasila"}, "Payshanba": {"subject": "O'qish", "teacher": "Dehqonova Vasila"}, "Juma": {"subject": "ona tili", "teacher": "Dehqonova Vasila"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "O'qish", "teacher": "Dehqonova Vasila"}, "Seshanba": {"subject": "Matematika", "teacher": "Dehqonova Vasila"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Yuldasheva Munisa | Olimova Umida"}, "Payshanba": {"subject": "ona tili", "teacher": "Dehqonova Vasila"}, "Juma": {"subject": "O'qish", "teacher": "Dehqonova Vasila"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Chorshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Payshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Juma": {"subject": "Matematika", "teacher": "Dehqonova Vasila"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "ona tili", "teacher": "Dehqonova Vasila"}, "Seshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Chorshanba": {"subject": "Matematika", "teacher": "Dehqonova Vasila"}, "Payshanba": {"subject": "Matematika", "teacher": "Dehqonova Vasila"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Dehqonova Vasila"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Dehqonova Vasila"}, "Seshanba": {"subject": "Informatika", "teacher": "Mamajonova Nargiza"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Payshanba": {"subject": "Tarbiya", "teacher": "Dehqonova Vasila"}, "Juma": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "3B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Mamajonova Nargiza"}, "Seshanba": {"subject": "ona tili", "teacher": "Mamajonova Nargiza"}, "Chorshanba": {"subject": "O'qish", "teacher": "Mamajonova Nargiza"}, "Payshanba": {"subject": "ona tili", "teacher": "Mamajonova Nargiza"}, "Juma": {"subject": "ona tili", "teacher": "Mamajonova Nargiza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "O'qish", "teacher": "Mamajonova Nargiza"}, "Seshanba": {"subject": "Matematika", "teacher": "Mamajonova Nargiza"}, "Chorshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Payshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Juma": {"subject": "O'qish", "teacher": "Mamajonova Nargiza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Mamajonova Nargiza"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Juma": {"subject": "Matematika", "teacher": "Mamajonova Nargiza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Seshanba": {"subject": "Informatika", "teacher": "Mamajonova Nargiza"}, "Chorshanba": {"subject": "Matematika", "teacher": "Mamajonova Nargiza"}, "Payshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Juma": {"subject": "Tarbiya", "teacher": "Mamajonova Nargiza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Mamajonova Nargiza"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Payshanba": {"subject": "Matematika", "teacher": "Mamajonova Nargiza"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Mamajonova Nargiza"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "4A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Dehqonova E'zoza"}, "Seshanba": {"subject": "ona tili", "teacher": "Dehqonova E'zoza"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Payshanba": {"subject": "O'qish", "teacher": "Dehqonova E'zoza"}, "Juma": {"subject": "ona tili", "teacher": "Dehqonova E'zoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Seshanba": {"subject": "O'qish", "teacher": "Dehqonova E'zoza"}, "Chorshanba": {"subject": "ona tili", "teacher": "Dehqonova E'zoza"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Juma": {"subject": "O'qish", "teacher": "Dehqonova E'zoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Chorshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Payshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Juma": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Dehqonova E'zoza"}, "Chorshanba": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Payshanba": {"subject": "ona tili", "teacher": "Dehqonova E'zoza"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Dehqonova E'zoza"}, "Chorshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Payshanba": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Dehqonova E'zoza"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "4B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Alimova Xusnida"}, "Seshanba": {"subject": "ona tili", "teacher": "Alimova Xusnida"}, "Chorshanba": {"subject": "ona tili", "teacher": "Alimova Xusnida"}, "Payshanba": {"subject": "ona tili", "teacher": "Alimova Xusnida"}, "Juma": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Matematika", "teacher": "Alimova Xusnida"}, "Seshanba": {"subject": "O'qish", "teacher": "Alimova Xusnida"}, "Chorshanba": {"subject": "O'qish", "teacher": "Alimova Xusnida"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Juma": {"subject": "O'qish", "teacher": "Alimova Xusnida"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Seshanba": {"subject": "Matematika", "teacher": "Alimova Xusnida"}, "Chorshanba": {"subject": "Matematika", "teacher": "Alimova Xusnida"}, "Payshanba": {"subject": "Tabiiy Fan", "teacher": "Alimova Xusnida"}, "Juma": {"subject": "ona tili", "teacher": "Alimova Xusnida"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Chorshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Payshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Juma": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Alimova Xusnida"}, "Chorshanba": {"subject": "Tarbiya", "teacher": "Alimova Xusnida"}, "Payshanba": {"subject": "Matematika", "teacher": "Alimova Xusnida"}, "Juma": {"subject": "Matematika", "teacher": "Alimova Xusnida"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "5A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Oʻsarova Hurshida"}, "Seshanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Chorshanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Payshanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Juma": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Shanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Chorshanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Payshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy | Sarimsaiov Lazizbek"}, "Juma": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Subxonov Bekzod"}, "Shanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Payshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy | Sarimsaiov Lazizbek"}, "Juma": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Payshanba": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Juma": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Ahmadjonova Maftuna"}, "Shanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}, "Payshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Juma": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "", "teacher": ""}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "", "teacher": ""}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Yuldasheva Munisa"}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "6A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Kenjaboeva Zulfira"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Chorshanba": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Payshanba": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Juma": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Shanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Juma": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Shanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek"}, "Seshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Chorshanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Payshanba": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Juma": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Shanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Payshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Juma": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Shanba": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Seshanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Payshanba": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Juma": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "", "teacher": ""}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Chorshanba": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "6B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Ubaydullaeva Maxliyo"}, "Seshanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Chorshanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Payshanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Juma": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Tabiiy Fan", "teacher": "Azamatov Xursanali"}, "Seshanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek | Kenjaboeva Oʻgʻiloy"}, "Chorshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Payshanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Juma": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Shanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Seshanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek | Kenjaboeva Oʻgʻiloy"}, "Chorshanba": {"subject": "Rus tili | Informatika", "teacher": "Ahmadjonova Maftuna | Ergashev Sardor"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Shanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Seshanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "ona tili", "teacher": "Ubaydullaeva Maxliyo"}, "Payshanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}, "Juma": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Seshanba": {"subject": "Tarix", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Rus tili", "teacher": "Ahmadjonova Maftuna | Subxonov Bekzod"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Subxonov Bekzod"}, "Payshanba": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "7A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Yusupova Nilufar"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Chorshanba": {"subject": "ona tili", "teacher": "Qurbonova Madina"}, "Payshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Juma": {"subject": "ona tili", "teacher": "Qurbonova Madina"}, "Shanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Seshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Qurbonova Madina"}, "Payshanba": {"subject": "Rus tili", "teacher": "Azimova Feruza | Subxonov Bekzod"}, "Juma": {"subject": "Adabiyot", "teacher": "Qurbonova Madina"}, "Shanba": {"subject": "Rus tili | Informatika", "teacher": "Azimova Feruza | Ergashev Sardor"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Seshanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Chorshanba": {"subject": "Musiqa", "teacher": "Abdullayeva Shahnoza"}, "Payshanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Juma": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Shanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy | Sarimsaiov Lazizbek"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Chorshanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Juma": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Shanba": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Subxonov Bekzod"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy | Sarimsaiov Lazizbek"}, "Seshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Chorshanba": {"subject": "ona tili", "teacher": "Qurbonova Madina"}, "Payshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Seshanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon | Olimova Umida"}, "Payshanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}, "Juma": {"subject": "Tasviriy san'at", "teacher": "Kenjaboeva Zulfira"}, "Shanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}}]}, {"className": "8A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Farmonova Mahfuza"}, "Seshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Juma": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Seshanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Chorshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Payshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Juma": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Shanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Seshanba": {"subject": "Geografiya / Iqtisod", "teacher": "Azamatov Xursanali / Azamatov Xursanali"}, "Chorshanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Payshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Juma": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Shanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Chorshanba": {"subject": "Chizmachilik", "teacher": "Kenjaboeva Zulfira"}, "Payshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Juma": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Shanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Chorshanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Payshanba": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Juma": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Shanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "8B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Kenjaeva Gulira"}, "Seshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Chorshanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Payshanba": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Juma": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Shanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "Iqtisod / Geografiya", "teacher": "Azamatov Xursanali / Azamatov Xursanali"}, "Juma": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Shanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Biologiya", "teacher": "Alimova Xusnida"}, "Seshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Juma": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Shanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Seshanba": {"subject": "Biologiya", "teacher": "Alimova Xusnida"}, "Chorshanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Payshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Juma": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Shanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Seshanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Chorshanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Seshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy"}, "Chorshanba": {"subject": "Chizmachilik", "teacher": "Kenjaboeva Zulfira"}, "Payshanba": {"subject": "Rus tili", "teacher": "Azimova Feruza"}, "Juma": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "9A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Raxmonqulova Mamuraxon"}, "Seshanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Chorshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Payshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Juma": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Shanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Seshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Chorshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Payshanba": {"subject": "Chizmachilik", "teacher": "Kenjaboeva Zulfira"}, "Juma": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Shanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}, "Seshanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Chorshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Payshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Juma": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Seshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Payshanba": {"subject": "Texnologiya", "teacher": "Sarimsaiov Lazizbek"}, "Juma": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Shanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Seshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Chorshanba": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Juma": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}, "Payshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Juma": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Iqtisod / Geografiya", "teacher": "Azamatov Xursanali / Azamatov Xursanali"}}]}, {"className": "9B", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Xaydarov Kamoldin"}, "Seshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Chorshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Payshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Juma": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Seshanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Payshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Juma": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Shanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Geometriya", "teacher": "Kenjaeva Gulira"}, "Seshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Chorshanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Juma": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Subxonov Bekzod"}, "Shanba": {"subject": "Informatika | Rus tili", "teacher": "Ergashev Sardor | Subxonov Bekzod"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Geografiya / Iqtisod", "teacher": "Azamatov Xursanali / Azamatov Xursanali"}, "Seshanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}, "Chorshanba": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek | Dexqonov Otabek"}, "Juma": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Matematika", "teacher": "Kenjaeva Gulira"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Seshanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Chorshanba": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Payshanba": {"subject": "Texnologiya", "teacher": "Kenjaboeva Oʻgʻiloy | Sarimsaiov Lazizbek"}, "Juma": {"subject": "Rus tili | Informatika", "teacher": "Azimova Feruza | Ergashev Sardor"}, "Shanba": {"subject": "Rus tili | Informatika", "teacher": "Azimova Feruza | Ergashev Sardor"}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Chizmachilik", "teacher": "Kenjaboeva Zulfira"}, "Seshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida | Yuldasheva Munisa"}, "Chorshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek | Dexqonov Otabek"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "Adabiyot", "teacher": "Farmonova Mahfuza"}, "Shanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}}]}, {"className": "10A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Azamatov Xursanali"}, "Seshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}, "Payshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Juma": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Shanba": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}, "Seshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Chorshanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Payshanba": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Juma": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}, "Shanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Seshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "Geometriya", "teacher": "Toʻgʻonova Saboxon"}, "Payshanba": {"subject": "Adabiyot", "teacher": "Ubaydullaeva Maxliyo"}, "Juma": {"subject": "Geometriya", "teacher": "Toʻgʻonova Saboxon"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Mamajonov Iqboljon"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Seshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Chorshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Payshanba": {"subject": "Biologiya", "teacher": "Usmonova Gulxayo"}, "Juma": {"subject": "ona tili", "teacher": "Farmonova Mahfuza"}, "Shanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Seshanba": {"subject": "CHQBT", "teacher": "Oʻrinboev Ravshan"}, "Chorshanba": {"subject": "CHQBT", "teacher": "Oʻrinboev Ravshan"}, "Payshanba": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Juma": {"subject": "Matematika", "teacher": "Toʻgʻonova Saboxon"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Seshanba": {"subject": "Geografiya", "teacher": "Azamatov Xursanali"}, "Chorshanba": {"subject": "", "teacher": ""}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "Jismoniy tarbiya", "teacher": "Dexqonov Otabek"}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "11A", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Kelajak Soati", "teacher": "Eshmatov Dostonbek"}, "Seshanba": {"subject": "Geometriya", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}, "Payshanba": {"subject": "Astranomiya", "teacher": "Abdullaeva Maftuna"}, "Juma": {"subject": "Biologiya", "teacher": "Alimova Xusnida"}, "Shanba": {"subject": "O'zbekiston tarixi", "teacher": "Xaydarov Kamoldin"}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Chorshanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}, "Payshanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}, "Juma": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Shanba": {"subject": "Ingiliz tili", "teacher": "Olimova Umida"}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Tadbirkorlik a", "teacher": "Azamatov Xursanali"}, "Seshanba": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Chorshanba": {"subject": "ona tili", "teacher": "Raxmonqulova Mamuraxon"}, "Payshanba": {"subject": "Xuquq", "teacher": "Yusupova Nilufar"}, "Juma": {"subject": "Tarbiya", "teacher": "Sultonov Avazbek"}, "Shanba": {"subject": "Geometriya", "teacher": "Abdullaeva Maftuna"}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Biologiya", "teacher": "Alimova Xusnida"}, "Seshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Chorshanba": {"subject": "Jahon tarix", "teacher": "Xaydarov Kamoldin"}, "Payshanba": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Juma": {"subject": "Rus tili", "teacher": "Subxonov Bekzod"}, "Shanba": {"subject": "Matematika", "teacher": "Abdullaeva Maftuna"}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "Adabiyot", "teacher": "Raxmonqulova Mamuraxon"}, "Seshanba": {"subject": "Jismoniy tarbiya", "teacher": "Eshmatov Dostonbek"}, "Chorshanba": {"subject": "Informatika", "teacher": "Ergashev Sardor"}, "Payshanba": {"subject": "CHQBT", "teacher": "Oʻrinboev Ravshan"}, "Juma": {"subject": "Kimyo", "teacher": "Oʻsarova Hurshida"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 6, "time": "12:30-13:15", "Dushanba": {"subject": "CHQBT", "teacher": "Oʻrinboev Ravshan"}, "Seshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Chorshanba": {"subject": "Fizika", "teacher": "Abdullaeva Maftuna"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "2-a uy ta'limi", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "", "teacher": ""}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "O'qish", "teacher": "Begmurodova Matluba"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "Tabiiy Fan / Texnologiya", "teacher": "Begmurodova Matluba / Begmurodova Matluba"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "Matematika", "teacher": "Begalieva Feruza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "O'qish", "teacher": "Begmurodova Matluba"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "ona tili", "teacher": "Begalieva Feruza"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Informatika / Tasviriy san'at", "teacher": "Begmurodova Matluba / Begmurodova Matluba"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "", "teacher": ""}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}, {"className": "2-b uy ta'lim", "lessons": [{"no": 1, "time": "08:00-08:45", "Dushanba": {"subject": "Rus tili / Ingiliz tili", "teacher": "Subxonov Bekzod / Mamajonov Iqboljon"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "Matematika", "teacher": "Dehqonova E'zoza"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 2, "time": "08:50-09:35", "Dushanba": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "O'qish", "teacher": "Farmonova Musharraf"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 3, "time": "09:40-10:25", "Dushanba": {"subject": "Informatika / Tabiiy Fan", "teacher": "Dehqonova E'zoza / Dehqonova E'zoza"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "Texnologiya / Tasviriy san'at", "teacher": "Dehqonova E'zoza / Dehqonova E'zoza"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 4, "time": "10:50-11:35", "Dushanba": {"subject": "Matematika /", "teacher": "Dehqonova E'zoza /"}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "", "teacher": ""}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "ona tili", "teacher": "Farmonova Musharraf"}, "Shanba": {"subject": "", "teacher": ""}}, {"no": 5, "time": "11:40-12:25", "Dushanba": {"subject": "", "teacher": ""}, "Seshanba": {"subject": "", "teacher": ""}, "Chorshanba": {"subject": "O'qish /", "teacher": "Farmonova Musharraf /"}, "Payshanba": {"subject": "", "teacher": ""}, "Juma": {"subject": "", "teacher": ""}, "Shanba": {"subject": "", "teacher": ""}}]}];
const EXCEL_DEPUTIES=[{"name": "Yuldasheva Xolisxon Umarovna", "role": "Заместитель директора по хозяйственныой работе"}, {"name": "Rashidova Oltinoy Maxamataliyevna", "role": "Заместитель директора по духовной и просветительской работе"}, {"name": "Kenjaboyev Ravshan Avazbekovich", "role": "Заместитель директора по учебной методической работе"}];
const EXCEL_PSYCHOLOG={"name": "Nasirdinova Zuxra Ergashaliyevna", "role": "Maktab psixologi"};
function renderExcelSchedule(){
  const page=document.querySelector('#sec-schedule .page-full');
  if(!page||page.dataset.excelReady)return;
  page.dataset.excelReady='1';
  page.innerHTML=`<div class="schedule-toolbar">
    <select id="classSelect" onchange="drawClassSchedule(this.value)"></select>
    <input id="scheduleSearch" placeholder="Fan yoki o'qituvchi bo'yicha qidirish..." oninput="drawClassSchedule(document.getElementById('classSelect').value)"/>
  </div>
  <div class="schedule-note">Dars jadvali yuklangan Excel fayl asosida avtomatik joylandi. Har bir katakda fan va o'qituvchi ko'rsatiladi.</div>
  <div id="scheduleBox"></div>`;
  const sel=document.getElementById('classSelect');
  sel.innerHTML=EXCEL_SCHEDULE.map((s,i)=>`<option value="${i}">${esc(s.className)} sinf</option>`).join('');
  drawClassSchedule(0);
}
function drawClassSchedule(idx){
  const s=EXCEL_SCHEDULE[Number(idx)]||EXCEL_SCHEDULE[0];
  const q=(document.getElementById('scheduleSearch')?.value||'').toLowerCase();
  const days=['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
  const rows=s.lessons.map(l=>`<tr><td class="bell-num">${l.no}</td><td class="bell-time">${esc(l.time)}</td>${days.map(d=>{const c=l[d]||{};const txt=((c.subject||'')+' '+(c.teacher||'')).toLowerCase();const hide=q&&!txt.includes(q);return `<td class="schedule-cell">${hide?'<span class="schedule-empty">—</span>':(c.subject?`<div class="subject">${esc(c.subject)}</div><div class="teacher">${esc(c.teacher||'')}</div>`:'<span class="schedule-empty">—</span>')}</td>`;}).join('')}</tr>`).join('');
  document.getElementById('scheduleBox').innerHTML=`<div class="sec-head"><h2 class="sec-title">${esc(s.className)} sinf dars jadvali</h2></div><div class="card"><div class="tbl-wrap"><table><thead><tr><th>#</th><th>Vaqt</th>${days.map(d=>`<th>${d}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function addStaffToolbar(){
  const wrap=document.querySelector('#sec-staff .page-full');
  const grid=document.querySelector('#sec-staff .staff-grid');
  if(!wrap||!grid||document.getElementById('staffSearch'))return;
  grid.insertAdjacentHTML('beforebegin',`<div class="staff-toolbar"><input id="staffSearch" placeholder="O'qituvchi yoki fan bo'yicha qidirish..." oninput="renderDynamicStaff()"><button class="btn btn-og" onclick="document.getElementById('staffSearch').value='';renderDynamicStaff()">Tozalash</button></div>`);
}
const prevRenderDynamicStaff=renderDynamicStaff;
renderDynamicStaff=function(){
  addStaffToolbar();
  const w=document.querySelector('#sec-staff .staff-grid');if(!w)return;
  const q=(document.getElementById('staffSearch')?.value||'').toLowerCase();
  const data=(DYN.staff.length?DYN.staff:sampleStaff).filter(x=>!q||String(x.name+' '+x.subject+' '+x.category).toLowerCase().includes(q));
  w.innerHTML=data.map(x=>`<div class="staff-card"><div class="staff-avatar">${esc(x.icon||'👩‍🏫')}</div><h4>${esc(x.name)}</h4><div class="sr">${esc(x.subject)}</div><div class="ssub">${esc(x.category)}</div></div>`).join('');
};
function patchLeadership(){
  const deputyBox=document.querySelector('#sch-director .card .card-body > div');
  if(deputyBox&&EXCEL_DEPUTIES.length)deputyBox.innerHTML=EXCEL_DEPUTIES.map(d=>`<div style="background:var(--green-l);border-radius:8px;padding:13px"><div style="font-weight:700;color:var(--green)">${esc(d.name)}</div><div style="font-size:12px;color:var(--muted)">${esc(d.role)}</div></div>`).join('');
  const ps=document.querySelector('#stud-psix h3');
  if(ps&&EXCEL_PSYCHOLOG)ps.textContent=EXCEL_PSYCHOLOG.name;
}
const oldShowSectionExcel=showSection;
showSection=function(id){oldShowSectionExcel(id);if(id==='schedule')setTimeout(renderExcelSchedule,20);if(id==='staff')setTimeout(renderDynamicStaff,20);if(id==='school'||id==='students')setTimeout(patchLeadership,50);};
setTimeout(()=>{renderExcelSchedule();renderDynamicStaff();patchLeadership();applySettings();},900);
