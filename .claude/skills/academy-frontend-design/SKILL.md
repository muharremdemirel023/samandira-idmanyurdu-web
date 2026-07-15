---
name: academy-frontend-design
description: Samandıra İdmanyurdu Futbol Akademisi public web sitesinin tasarım/görsel işleri için kullanılır — tema, renk, sayfa düzeni, header, mobil menü, ana sayfa, akademi sayfaları, SSS, iletişim, ön kayıt formu arayüzü, footer, Akademi Asistanı chatbot arayüzü ve 35. yıl açılış animasyonu. "Tasarımı düzenle", "temayı değiştir", "responsive yap", "sayfayı güzelleştir" gibi taleplerde yükle. Admin paneli ve backend işlerinde KULLANILMAZ.
---

# Academy Frontend Design — Samandıra İdmanyurdu

Bu skill yalnızca **public web sitesinin tasarımı** için geçerlidir. Backend, admin ve veri katmanına dokunulmaz.

## Kapsam (yalnızca bu alanlarda çalış)

- Public header ve mobil menü: `src/components/layout/Header.tsx`, `src/components/navigation/*`
- Ana sayfa: `src/app/(site)/page.tsx` + `src/components/sections/*`
- Akademi sayfaları: `src/app/(site)/akademi/**` (akademi, yaş grupları, antrenörler/teknik kadro, antrenman programı/antrenman-modeli, sık sorulan sorular) + `src/components/sections/academy/*`
- İletişim: `src/app/(site)/iletisim/page.tsx`
- Ön kayıt (yalnızca görünüm): `src/app/(site)/on-kayit/page.tsx`, `PreRegistrationForm.tsx` — form alanları, alan adları ve submit akışı DEĞİŞMEZ; sadece stil/yerleşim.
- Footer: `src/components/layout/Footer.tsx`
- Akademi Asistanı chatbot arayüzü: `src/components/chatbot/AcademyAssistant.tsx`
- 35. yıl açılış animasyonu (varsa/eklenirse): public layout altında, `framer-motion` ile, `prefers-reduced-motion`'a saygılı.
- Tema/tipografi: `src/app/globals.css` (CSS değişkenleri tek kaynak), `src/components/ui/*`

## Kesinlikle dokunma

- `src/app/admin/**` (login dahil)
- `src/lib/supabase/**`, auth, veritabanı, RLS, migration
- Server action iş mantıkları (`actions.ts` dosyalarının davranışı)
- Ön kayıt backend akışı (`src/app/(site)/on-kayit/actions.ts`, `src/lib/email/*`)
- `package.json` — **yeni paket yükleme yok.** Mevcut Next.js + Tailwind v4 + Framer Motion yeterlidir.

## Tasarım ilkeleri

- Modern, profesyonel, **veli odaklı**: güven veren, sade, ciddi ton. Hedef kitle çocuğunu akademiye yazdıracak veli.
- **Mobile-first**: önce 320–430px tasarla, sonra `sm/md/lg` ile genişlet.
- Marka renkleri: **bordo + turuncu + beyaz.** Renkler yalnızca `globals.css` içindeki CSS değişkenlerinden gelir (`--accent` turuncu, bordo yüzeyler); bileşenlere yeni hex gömme.
- **Beyaz ağırlıklı, ferah** sayfa düzeni: bol boşluk, geniş satır aralığı; bordo/turuncu vurgu olarak kullanılır, zemin boğulmaz.
- Büyük, okunabilir başlıklar; `globals.css` içindeki `type-*` utility'lerini kullan, ad-hoc `clamp()` yazma.
- Net bilgi hiyerarşisi: overline → başlık → kısa açıklama → CTA sırası.
- **Ön Kayıt ve WhatsApp her sayfadan kolay erişilir** olmalı (header CTA, kapanış bandı, chatbot fallback). Telefon/WhatsApp değerleri daima `src/config/site.ts` üzerinden alınır, bileşene sabit yazılmaz.
- Yasak: abartılı gradient, neon, sert glow, gereksiz/dekoratif animasyon. Animasyon varsa kısa, amaçlı ve `motion-reduce` uyumlu.
- **320px ve üzeri hiçbir ekranda yatay taşma yok.** Geniş içerik kendi kapsayıcısında `overflow-x-auto` alır.
- Mobilde tek sütun; dokunmatik hedefler en az `min-h-[2.75rem]` (44px).
- Mevcut logo (`/Samandiralogo.png`, `/images/35-yil-logo.png`), Türkçe içerik ve dinamik veriler (duyurular, SSS, ön kayıt) korunur; metinler `src/config/site.ts`'ten beslenmeye devam eder.

## Her tasarım görevinden sonra zorunlu kontrol

1. **Responsive kontrol**: değişen sayfaları 320px, 375px, 768px, 1280px genişliklerde gözden geçir (dev server + tarayıcı/araç). Yatay scroll, taşan başlık, kırılan grid var mı bak.
2. **Production build**: `npm run build` çalıştır ve hatasız bittiğini doğrula. Build kırıksa görev bitmemiş sayılır.
