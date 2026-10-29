import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './auth-config.js';

const configured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR-PROJECT') && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentMode = 'login';
let currentUser = null;

const authStyles = `
#bmAuthLayer{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px}
#bmAuthLayer[hidden]{display:none}
.bm-auth-box{position:relative;width:min(100%,480px);max-height:90vh;overflow:auto;background:#101111;border:1px solid rgba(214,174,76,.35);border-radius:20px;padding:26px;color:#f4f1e7;box-shadow:0 25px 90px #000}
.bm-auth-box h2{margin:4px 0 10px;font-size:25px}.bm-auth-box p{color:#b8b8b0;line-height:1.9;font-size:14px}.bm-auth-close{position:absolute;left:14px;top:10px;background:none;border:0;color:#ddd;font-size:28px;cursor:pointer}
.bm-auth-box label{display:block;margin:14px 0;color:#d6cda9;font-size:13px}.bm-auth-box input{display:block;width:100%;box-sizing:border-box;margin-top:7px;padding:13px;border:1px solid #37372f;border-radius:10px;background:#080909;color:#fff;font:inherit;direction:ltr;text-align:left}
.bm-auth-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.bm-auth-actions button,.bm-auth-link{cursor:pointer;border-radius:10px;padding:11px 15px;font:inherit}.bm-auth-primary{background:#d7ad4c;color:#17130a;border:0;font-weight:800}.bm-auth-secondary{background:#202120;color:#eee;border:1px solid #444}.bm-auth-link{background:transparent;color:#e4c36f;border:0;padding:8px 0}.bm-auth-msg{margin-top:12px;padding:11px;border-radius:10px;background:#1b1b17;color:#dcd4bb;font-size:13px;line-height:1.8;overflow-wrap:anywhere}.bm-auth-msg.error{color:#ffb6a8}.bm-auth-msg.success{color:#b6f0c3}.bm-auth-user{direction:ltr;text-align:left;overflow-wrap:anywhere}
`;
const style = document.createElement('style'); style.textContent = authStyles; document.head.appendChild(style);
const layer = document.createElement('div');
layer.id = 'bmAuthLayer'; layer.hidden = true;
layer.innerHTML = `<section class="bm-auth-box" role="dialog" aria-modal="true" aria-labelledby="bmAuthTitle"><button class="bm-auth-close" type="button" aria-label="بستن">×</button><div class="eyebrow">BLACK MARKET ACCOUNT</div><h2 id="bmAuthTitle">ورود به حساب</h2><p id="bmAuthIntro">برای ادامه، وارد حساب خودت شو.</p><div id="bmAuthContent"></div><div id="bmAuthMessage" class="bm-auth-msg" hidden></div></section>`;
document.body.appendChild(layer);
const q = (s) => layer.querySelector(s);
function message(text, type='') { const el=q('#bmAuthMessage'); el.textContent=text; el.className='bm-auth-msg'+(type?' '+type:''); el.hidden=false; }
function clearMessage(){q('#bmAuthMessage').hidden=true;}
function openAuth(){layer.hidden=false;render();}
function closeAuth(){layer.hidden=true;}
function setMode(mode){currentMode=mode;render();}
function render(){
  clearMessage();
  if(!configured){
    q('#bmAuthTitle').textContent='تنظیم اتصال حساب کاربری';
    q('#bmAuthIntro').textContent='کد آماده است؛ ابتدا پروژه Supabase را بساز و دو مقدار عمومی را در auth-config.js جایگزین کن.';
    q('#bmAuthContent').innerHTML=`<div class="bm-auth-msg">این بخش تا زمانی که SUPABASE_URL و کلید publishable/anon واقعی تنظیم نشوند، کار نمی‌کند. کلید secret یا service_role را هرگز در این فایل نگذار.</div><div class="bm-auth-actions"><button class="bm-auth-secondary" id="bmAuthClose" type="button">بستن</button></div>`;
    q('#bmAuthClose').onclick=closeAuth; return;
  }
  if(currentUser){
    q('#bmAuthTitle').textContent='حساب کاربری'; q('#bmAuthIntro').textContent='وضعیت حساب شما';
    const verified=!!currentUser.email_confirmed_at;
    q('#bmAuthContent').innerHTML=`<div class="bm-auth-msg bm-auth-user">${escapeHtml(currentUser.email||'')}</div><div class="bm-auth-msg ${verified?'success':'error'}">${verified?'ایمیل تأیید شده است.':'ایمیل هنوز تأیید نشده است.'}</div><div class="bm-auth-msg">احراز هویت کارت ملی برای سفارش‌های بالای ۲ میلیون تومان هنوز فعال نیست؛ این نسخه هیچ تصویر یا شماره کارت ملی دریافت نمی‌کند.</div><div class="bm-auth-actions"><button class="bm-auth-primary" id="bmAuthSignOut" type="button">خروج از حساب</button><button class="bm-auth-secondary" id="bmAuthClose" type="button">بستن</button></div>`;
    q('#bmAuthSignOut').onclick=async()=>{const {error}=await supabase.auth.signOut();if(error)message(error.message,'error');else{currentUser=null;render();message('از حساب خارج شدی.','success');}};
    q('#bmAuthClose').onclick=closeAuth; return;
  }
  const isSignup=currentMode==='signup', isReset=currentMode==='reset';
  q('#bmAuthTitle').textContent=isSignup?'ساخت حساب':isReset?'بازیابی رمز عبور':'ورود به حساب';
  q('#bmAuthIntro').textContent=isSignup?'ایمیل معتبر و رمز عبور انتخاب کن؛ برای فعال‌شدن حساب باید ایمیل را تأیید کنی.':isReset?'لینک بازیابی رمز به ایمیلت ارسال می‌شود.':'ایمیل و رمز عبور حساب خودت را وارد کن.';
  q('#bmAuthContent').innerHTML=`<form id="bmAuthForm" novalidate>${isSignup?'<label>نام نمایشی<input name="displayName" autocomplete="name" maxlength="60" required></label>':''}<label>ایمیل<input name="email" type="email" autocomplete="email" required maxlength="254"></label>${isReset?'':'<label>رمز عبور<input name="password" type="password" autocomplete="'+(isSignup?'new-password':'current-password')+'" minlength="10" required></label>'}${isSignup?'<p>رمز عبور باید حداقل ۱۰ نویسه داشته باشد. از رمز منحصربه‌فرد استفاده کن.</p>':''}<div class="bm-auth-actions"><button class="bm-auth-primary" type="submit">${isSignup?'ثبت‌نام':isReset?'ارسال لینک بازیابی':'ورود'}</button><button class="bm-auth-secondary" id="bmAuthClose" type="button">بستن</button></div></form><div class="bm-auth-actions">${!isSignup&&!isReset?'<button class="bm-auth-link" id="bmAuthForgot" type="button">رمز را فراموش کرده‌ام</button>':''}<button class="bm-auth-link" id="bmAuthSwitch" type="button">${isSignup?'قبلاً حساب داری؟ ورود':isReset?'بازگشت به ورود':'حساب نداری؟ ثبت‌نام'}</button></div><p>با ثبت‌نام، ایمیل برای تأیید ارسال می‌شود. این سایت هنوز پرداخت واقعی یا کیف پول امن ندارد.</p>`;
  q('#bmAuthClose').onclick=closeAuth;
  q('#bmAuthSwitch').onclick=()=>setMode(isSignup?'login':'signup');
  if(q('#bmAuthForgot')) q('#bmAuthForgot').onclick=()=>setMode('reset');
  q('#bmAuthForm').onsubmit=async(e)=>{
    e.preventDefault(); clearMessage(); const fd=new FormData(e.currentTarget); const email=String(fd.get('email')||'').trim(); const password=String(fd.get('password')||'');
    const submit=q('#bmAuthForm button[type="submit"]'); submit.disabled=true; submit.textContent='لطفاً صبر کن…';
    try{
      if(isSignup){
        const displayName=String(fd.get('displayName')||'').trim();
        if(displayName.length<2) throw new Error('نام نمایشی باید حداقل ۲ نویسه باشد.');
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName},emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        if(data.session){currentUser=data.user;render();message('حساب ساخته شد.','success');}
        else message('اگر ایمیل معتبر باشد، لینک تأیید ارسال شده است. ایمیلت را بررسی کن؛ ممکن است پوشه هرزنامه باشد.','success');
      } else if(isReset){
        const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}); if(error)throw error;
        message('اگر این ایمیل حسابی داشته باشد، لینک بازیابی ارسال می‌شود.','success');
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error)throw error; currentUser=data.user; render(); message('با موفقیت وارد شدی.','success');
      }
    }catch(err){message(friendlyError(err?.message||'خطای نامشخص'),'error');}
    finally{const b=q('#bmAuthForm button[type="submit"]');if(b){b.disabled=false;b.textContent=isSignup?'ثبت‌نام':isReset?'ارسال لینک بازیابی':'ورود';}}
  };
}
function friendlyError(s){if(/Invalid login credentials/i.test(s))return 'ایمیل یا رمز عبور درست نیست.';if(/Email not confirmed/i.test(s))return 'اول ایمیلت را از طریق لینک تأیید کن.';if(/Password should be at least/i.test(s))return 'رمز عبور باید حداقل ۱۰ نویسه باشد.';return s;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window.addEventListener('bm:auth-open',openAuth);
layer.querySelector('.bm-auth-close').addEventListener('click',closeAuth);
layer.addEventListener('click',e=>{if(e.target===layer)closeAuth();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!layer.hidden)closeAuth();});
if(supabase){
  supabase.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;});
  supabase.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null; if(!layer.hidden)render();});
}
