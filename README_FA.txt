BLACK MARKET — نسخه نمایشی با ثبت‌نام و ورود ایمیلی
=================================================

فایل‌ها:
- index.html / styles.css / app.js: ظاهر و تعاملات نمایشی فروشگاه
- auth.js: ثبت‌نام، ورود، خروج و بازیابی رمز با Supabase Auth
- auth-config.js: جای قرار دادن URL پروژه و کلید عمومی Supabase

راه‌اندازی احراز هویت با گوشی:
1) در Supabase یک پروژه بساز.
2) از Project Settings / API، Project URL و کلید publishable یا anon را بردار. فقط کلید عمومی را استفاده کن.
3) در auth-config.js مقادیر SUPABASE_URL و SUPABASE_ANON_KEY را جایگزین کن. کلید secret یا service_role را هرگز داخل سایت یا GitHub عمومی نگذار.
4) در Supabase بخش Authentication > URL Configuration، Site URL و Redirect URLs را روی آدرس GitHub Pages خودت تنظیم کن، مانند: https://USERNAME.github.io/REPOSITORY/
5) در Authentication > Providers مطمئن شو Email فعال و تأیید ایمیل روشن است.
6) در Authentication > Email Templates متن ایمیل تأیید و بازیابی را بررسی کن. سرویس ایمیل آزمایشی محدودیت دارد؛ برای استفاده واقعی، سرویس SMTP معتبر لازم است.
7) فایل‌های تغییرکرده را به مخزن GitHub آپلود و Commit کن؛ بعد از انتشار، ثبت‌نام آزمایشی را با ایمیل خودت تست کن.

امنیت و محدودیت‌ها:
- کلید عمومی Supabase در مرورگر قابل مشاهده است و همین طبیعی است؛ امنیت داده‌ها به تنظیمات سمت سرور و Row Level Security بستگی دارد. هرگز کلید secret/service_role را منتشر نکن.
- این بسته فقط احراز هویت ایمیلی را وصل می‌کند. هنوز پایگاه داده سفارش‌ها، کیف پول واقعی، پرداخت بانکی، پنل مدیریت امن یا بررسی هویت کارت ملی ندارد.
- هیچ تصویر یا شماره کارت ملی در این نسخه جمع‌آوری نمی‌شود. برای احراز هویت رسمی، از سرویس بررسی هویت معتبر و ذخیره‌سازی خصوصی با دسترسی محدود استفاده کن؛ فایل هویتی را در مخزن عمومی GitHub آپلود نکن.
- موجودی کیف پول و سفارش‌های نسخه فعلی هنوز نمایشی و localStorage هستند؛ برای فروش واقعی قابل استفاده نیستند.
- بخش کیس‌ها فقط در نمونه نمایشی است؛ از آن برای دریافت پول واقعی در برابر پاداش تصادفی استفاده نکن.

مستندات رسمی:
https://supabase.com/docs/guides/auth/passwords
https://supabase.com/docs/guides/auth/redirect-urls
https://supabase.com/docs/guides/auth/auth-email-templates
