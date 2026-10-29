'use strict';

const START_BALANCE = 500000;
const products = [
  {id:'ak-slate',name:'AK-47 | Slate',condition:'Field-Tested',type:'Rifle',price:2400000,symbol:'➶',color:'#c7a34d',glow:'rgba(201,163,77,.25)',tag:'محبوب'},
  {id:'butterfly-tiger',name:'Butterfly Knife | Tiger Tooth',condition:'Factory New',type:'Knife',price:12000000,symbol:'⚔',color:'#f0b944',glow:'rgba(240,185,68,.28)',tag:'ویژه'},
  {id:'awp-asiimov',name:'AWP | Asiimov',condition:'Battle-Scarred',type:'Rifle',price:2800000,symbol:'➶',color:'#e8e5da',glow:'rgba(218,218,208,.2)',tag:'پرفروش'},
  {id:'de-blaze',name:'Desert Eagle | Blaze',condition:'Factory New',type:'Pistol',price:3900000,symbol:'◈',color:'#efb53f',glow:'rgba(239,181,63,.25)',tag:'کمیاب'},
  {id:'m4-howl',name:'M4A4 | Howl',condition:'Minimal Wear',type:'Rifle',price:8500000,symbol:'➶',color:'#c9573e',glow:'rgba(201,87,62,.22)',tag:'کمیاب'},
  {id:'karambit-doppler',name:'Karambit | Doppler',condition:'Factory New',type:'Knife',price:14500000,symbol:'☾',color:'#bd7be7',glow:'rgba(189,123,231,.27)',tag:'ویژه'},
  {id:'vice-gloves',name:'Sport Gloves | Vice',condition:'Minimal Wear',type:'Gloves',price:6200000,symbol:'♧',color:'#e87dbd',glow:'rgba(232,125,189,.24)',tag:'ترند'},
  {id:'m4-printstream',name:'M4A1-S | Printstream',condition:'Factory New',type:'Rifle',price:4200000,symbol:'➶',color:'#e8e5dc',glow:'rgba(232,229,220,.2)',tag:'محبوب'}
];
const cases = [
  {id:'starter',name:'Starter Case',price:99000,icon:'▣',desc:'کیس شروع'},
  {id:'gold',name:'Golden Case',price:249000,icon:'♛',desc:'کیس طلایی'},
  {id:'elite',name:'Elite Case',price:499000,icon:'✦',desc:'کیس ویژه'},
  {id:'legend',name:'Legend Case',price:999000,icon:'◇',desc:'کیس لجندری'}
];
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const formatMoney = value => `${Math.max(0, Math.round(value)).toLocaleString('fa-IR')} تومان`;
const safeRead = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
let balance = safeRead('bm_demo_balance', START_BALANCE);
let orders = safeRead('bm_demo_orders', []);
let activeFilter = 'همه';
let toastTimer;

function persist(){
  try { localStorage.setItem('bm_demo_balance', JSON.stringify(balance)); localStorage.setItem('bm_demo_orders', JSON.stringify(orders)); }
  catch { showToast('ذخیره مرورگر در دسترس نیست؛ اطلاعات ممکن است باقی نماند.'); }
}
function updateBalance(){ $('#walletBalance').innerHTML = `${Math.max(0,balance).toLocaleString('fa-IR')} <small>تومان</small>`; }
function showToast(message){ const toast=$('#toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2800); }
function openModal(html){ $('#modalContent').innerHTML=html; $('#modalBackdrop').hidden=false; document.body.style.overflow='hidden'; $('#modalClose').focus(); }
function closeModal(){ $('#modalBackdrop').hidden=true; document.body.style.overflow=''; }
function renderProducts(){
  const query=$('#searchInput').value.trim().toLowerCase();
  const filtered=products.filter(p=>(activeFilter==='همه'||p.type===activeFilter)&&(`${p.name} ${p.condition} ${p.type}`).toLowerCase().includes(query));
  const grid=$('#productGrid');
  if(!filtered.length){grid.innerHTML='<div class="empty-state">آیتمی با این مشخصات پیدا نشد.</div>';return;}
  grid.innerHTML=filtered.map(p=>`<article class="product-card"><div class="item-art" style="--item-color:${p.color};--item-glow:${p.glow}"><span class="item-tag">${p.tag}</span><button class="favorite" data-fav="${p.id}" aria-label="افزودن به علاقه‌مندی">♡</button><span class="item-symbol">${p.symbol}</span></div><div class="product-body"><div class="product-title" title="${p.name}">${p.name}</div><div class="product-condition">${p.condition}</div><div class="product-bottom"><span class="price">${formatMoney(p.price)}</span><button class="buy-button" data-buy="${p.id}">ثبت سفارش</button></div></div></article>`).join('');
}
function renderCases(){ $('#caseGrid').innerHTML=cases.map(c=>`<article class="case-card"><div class="case-icon">${c.icon}</div><h3>${c.name}</h3><p>${formatMoney(c.price)}</p><button class="button ghost" data-case="${c.id}">باز کردن کیس</button></article>`).join(''); }
function renderOrders(){
  const container=$('#recentOrders');
  if(!orders.length){container.innerHTML='<div class="empty-state">هنوز سفارشی ثبت نکرده‌ای.</div>';return;}
  container.innerHTML=orders.slice(0,3).map(order=>`<div class="order-row"><div class="order-mini">${order.kind==='case'?'▣':'✦'}</div><div class="order-main"><b>${escapeHtml(order.name)}</b><small>${escapeHtml(order.date)} · ${formatMoney(order.price)}</small></div><span class="status">${escapeHtml(order.status)}</span></div>`).join('');
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function addOrder({name,price,kind='skin',status='در انتظار تحویل'}){orders.unshift({id:`BM-${Date.now().toString().slice(-7)}`,name,price,kind,status,date:new Date().toLocaleDateString('fa-IR')});orders=orders.slice(0,50);persist();renderOrders();}
function buyProduct(id){
  const product=products.find(p=>p.id===id);if(!product)return;
  openModal(`<span class="eyebrow">تأیید سفارش</span><h2 id="modalTitle">خرید اسکین</h2><p>آیتم انتخابی و مبلغ را بررسی کن. در این نسخه فقط کیف پول آزمایشی استفاده می‌شود.</p><div class="result-card"><div class="result-art" style="color:${product.color}">${product.symbol}</div><div><h3>${escapeHtml(product.name)}</h3><small>${escapeHtml(product.condition)}</small><strong>${formatMoney(product.price)}</strong></div></div><div class="modal-message">موجودی فعلی: <b>${formatMoney(balance)}</b><br>تحویل واقعی در این نسخه انجام نمی‌شود؛ سفارش صرفاً نمونه ثبت می‌شود.</div><div class="modal-actions"><button class="button gold" id="confirmBuy" ${balance<product.price?'disabled':''}>تأیید و ثبت سفارش</button><button class="button ghost" id="cancelAction">انصراف</button></div>${balance<product.price?'<p class="form-error">موجودی کافی نیست؛ ابتدا کیف پول را شارژ کن.</p>':''}`);
  $('#confirmBuy')?.addEventListener('click',()=>{if(balance<product.price){showToast('موجودی کیف پول کافی نیست.');return;}balance-=product.price;addOrder({name:product.name,price:product.price});updateBalance();closeModal();showToast('سفارش آزمایشی ثبت شد.');});$('#cancelAction')?.addEventListener('click',closeModal);
}
function topupModal(){openModal(`<span class="eyebrow">کیف پول</span><h2 id="modalTitle">شارژ موجودی</h2><p>مبلغ شارژ را وارد کن. این فرم شبیه‌سازی است و هیچ پرداخت بانکی واقعی انجام نمی‌دهد.</p><div class="modal-message">موجودی فعلی: <b>${formatMoney(balance)}</b></div><form class="modal-form" id="topupForm"><label for="topupAmount">مبلغ شارژ (تومان)<input id="topupAmount" name="amount" type="number" min="10000" max="100000000" step="10000" value="500000" required /></label><div class="modal-actions"><button class="button gold" type="submit">شارژ آزمایشی</button><button class="button ghost" type="button" id="cancelAction">انصراف</button></div></form>`);$('#cancelAction').addEventListener('click',closeModal);$('#topupForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number($('#topupAmount').value);if(!Number.isSafeInteger(amount)||amount<10000||amount>100000000){showToast('مبلغ باید بین ۱۰ هزار تا ۱۰۰ میلیون تومان باشد.');return;}balance+=amount;persist();updateBalance();closeModal();showToast(`${formatMoney(amount)} به موجودی آزمایشی اضافه شد.`);});}
function openCase(id){
  const selected=cases.find(c=>c.id===id);if(!selected)return;
  openModal(`<span class="eyebrow">کیس نمایشی</span><h2 id="modalTitle">${escapeHtml(selected.name)}</h2><p>باز کردن کیس با پرداخت و دریافت جایزه تصادفی در این نسخه غیرفعال است. می‌توانی این بخش را به یک نمایش رایگان و بدون پول واقعی تبدیل کنی.</p><div class="modal-message">هیچ مبلغی کم نمی‌شود و هیچ آیتم تصادفی اعطا نمی‌شود.</div><div class="modal-actions"><button class="button gold" id="cancelAction">متوجه شدم</button></div>`);
  $('#cancelAction')?.addEventListener('click',closeModal);
}
function showAllOrders(){openModal(`<span class="eyebrow">حساب کاربری</span><h2 id="modalTitle">تاریخچه سفارش‌ها</h2>${orders.length?`<div class="modal-list">${orders.map(order=>`<div class="order-row"><div class="order-mini">${order.kind==='case'?'▣':'✦'}</div><div class="order-main"><b>${escapeHtml(order.name)}</b><small>${escapeHtml(order.id)} · ${escapeHtml(order.date)} · ${formatMoney(order.price)}</small></div><span class="status">${escapeHtml(order.status)}</span></div>`).join('')}</div>`:'<div class="empty-state">هنوز سفارشی ثبت نشده است.</div>'}<div class="modal-actions"><button class="button ghost" id="clearDemo">پاک‌کردن اطلاعات آزمایشی</button><button class="button gold" id="cancelAction">بستن</button></div><p class="demo-note">اطلاعات این بخش فقط در همین مرورگر ذخیره می‌شود.</p>`);$('#cancelAction').addEventListener('click',closeModal);$('#clearDemo').addEventListener('click',()=>{if(!confirm('اطلاعات آزمایشی کیف پول و سفارش‌ها پاک شود؟'))return;balance=START_BALANCE;orders=[];persist();updateBalance();renderOrders();closeModal();showToast('اطلاعات آزمایشی پاک شد.');});}

$('#productGrid').addEventListener('click',e=>{const buy=e.target.closest('[data-buy]');if(buy){buyProduct(buy.dataset.buy);return;}const fav=e.target.closest('[data-fav]');if(fav){fav.classList.toggle('saved');fav.textContent=fav.classList.contains('saved')?'♥':'♡';showToast(fav.classList.contains('saved')?'به علاقه‌مندی‌ها اضافه شد.':'از علاقه‌مندی‌ها حذف شد.');}});
$('#caseGrid').addEventListener('click',e=>{const btn=e.target.closest('[data-case]');if(btn)openCase(btn.dataset.case);});
$('#filters').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(!btn)return;activeFilter=btn.dataset.filter;$$('.filter').forEach(f=>f.classList.toggle('active',f===btn));renderProducts();});
$('#searchInput').addEventListener('input',renderProducts);
$('#topupButton').addEventListener('click',topupModal);$('#openFeaturedCase').addEventListener('click',()=>openCase('elite'));$('#ordersButton').addEventListener('click',showAllOrders);$('#viewOrders').addEventListener('click',showAllOrders);$('#profileButton').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('bm:auth-open')));
$('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modalBackdrop').hidden)closeModal();});$('#mobileMenu').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));
// Delegate profile modal actions after it has been rendered.
$('#modalContent').addEventListener('click',e=>{if(e.target.id==='profileTopup')topupModal();if(e.target.id==='cancelAction')closeModal();});
updateBalance();renderProducts();renderCases();renderOrders();
