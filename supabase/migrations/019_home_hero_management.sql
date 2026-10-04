-- Ana sayfa Hero bölümünü tek home_content kaydı üzerinden tamamen yönetilebilir yapar.
alter table home_content
  add column if not exists hero_is_visible boolean not null default true,
  add column if not exists hero_desktop_image_url text not null default '/images/hero/academy-training.JPG',
  add column if not exists hero_mobile_image_url text,
  add column if not exists hero_overlay_opacity integer not null default 88,
  add column if not exists hero_min_height integer not null default 820,
  add column if not exists hero_content_alignment text not null default 'center',
  add column if not exists hero_overline_visible boolean not null default true,
  add column if not exists hero_headline_visible boolean not null default true,
  add column if not exists hero_lead_visible boolean not null default true,
  add column if not exists cta_primary_visible boolean not null default true,
  add column if not exists cta_primary_style text not null default 'primary',
  add column if not exists cta_secondary_visible boolean not null default true,
  add column if not exists cta_secondary_style text not null default 'outline',
  add column if not exists hero_badge_primary_visible boolean not null default true,
  add column if not exists hero_badge_primary_text text not null default 'Ücretsiz Deneme Antrenmanı',
  add column if not exists hero_badge_primary_href text default '/on-kayit',
  add column if not exists hero_badge_secondary_visible boolean not null default true,
  add column if not exists hero_badge_secondary_text text not null default '6–13 Yaş Grupları',
  add column if not exists hero_badge_secondary_href text,
  add column if not exists hero_intro_visible boolean not null default true,
  add column if not exists hero_intro_text text not null default 'Samandıra''da çocuklara yaş gruplarına uygun, gelişim odaklı futbol eğitimi sunuyoruz.',
  add column if not exists hero_anniversary_visible boolean not null default true,
  add column if not exists hero_anniversary_text text not null default '',
  add column if not exists hero_anniversary_image_url text not null default '/images/35-yil-logo.png',
  add column if not exists hero_media_visible boolean not null default true,
  add column if not exists hero_media_thumbnail_url text not null default '/images/hero/academy-training.JPG',
  add column if not exists hero_media_video_url text not null default '/videos/hero/academy-huddle.mp4',
  add column if not exists hero_media_alt text not null default 'Samandıra İdman Yurdu Akademi antrenman anı',
  add column if not exists hero_media_show_play_button boolean not null default true,
  add column if not exists hero_features jsonb not null default '[{"id":"age-groups","text":"Yaş Gruplarına Uygun Eğitim","visible":true,"sortOrder":0},{"id":"expert-team","text":"Deneyimli Antrenör Kadrosu","visible":true,"sortOrder":1},{"id":"weekend-program","text":"Düzenli Hafta Sonu Programı","visible":true,"sortOrder":2}]'::jsonb,
  add column if not exists hero_campaign_badge_visible boolean not null default true,
  add column if not exists hero_campaign_badge_text text not null default '🎉 Online Kayıtlara Özel %15 İndirim',
  add column if not exists hero_campaign_badge_href text not null default '/on-kayit',
  add column if not exists hero_campaign_badge_style text not null default 'highlight';

alter table home_content
  drop constraint if exists home_content_hero_overlay_opacity_check,
  add constraint home_content_hero_overlay_opacity_check
    check (hero_overlay_opacity between 0 and 100),
  drop constraint if exists home_content_hero_min_height_check,
  add constraint home_content_hero_min_height_check
    check (hero_min_height between 480 and 1100),
  drop constraint if exists home_content_hero_alignment_check,
  add constraint home_content_hero_alignment_check
    check (hero_content_alignment in ('left', 'center', 'right')),
  drop constraint if exists home_content_cta_primary_style_check,
  add constraint home_content_cta_primary_style_check
    check (cta_primary_style in ('primary', 'secondary', 'outline')),
  drop constraint if exists home_content_cta_secondary_style_check,
  add constraint home_content_cta_secondary_style_check
    check (cta_secondary_style in ('primary', 'secondary', 'outline')),
  drop constraint if exists home_content_hero_campaign_badge_style_check,
  add constraint home_content_hero_campaign_badge_style_check
    check (hero_campaign_badge_style in ('highlight', 'accent', 'outline'));
