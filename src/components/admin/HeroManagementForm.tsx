"use client";

import { useState } from "react";

import { saveHeroContent } from "@/app/admin/(protected)/home-content/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";
import { VideoFileUploadField } from "@/components/admin/VideoFileUploadField";
import { HeroSection, type HeroPreviewMode } from "@/components/sections/HeroSection";
import {
  heroFallbacks,
  type HeroButtonStyle,
  type HeroCampaignBadgeStyle,
  type HeroFeature,
  type ResolvedHeroContent,
} from "@/lib/hero-content";
import { cn } from "@/lib/cn";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";
const labelClass = "block text-sm font-semibold text-slate-200";
const cardClass = "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6";

function cloneHero(value: ResolvedHeroContent): ResolvedHeroContent {
  return {
    ...value,
    primaryCta: { ...value.primaryCta },
    secondaryCta: { ...value.secondaryCta },
    primaryBadge: { ...value.primaryBadge },
    secondaryBadge: { ...value.secondaryBadge },
    campaignBadge: { ...value.campaignBadge },
    features: value.features.map((feature) => ({ ...feature })),
  };
}

function Toggle({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
      <span>{label}</span>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 accent-orange-500"
      />
    </label>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <details className={cardClass} open={title === "Genel"}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
          </div>
          <span aria-hidden="true" className="text-lg text-orange-400">⌄</span>
        </div>
      </summary>
      <div className="mt-5 border-t border-slate-800 pt-5">{children}</div>
    </details>
  );
}

function ButtonFields({
  title,
  value,
  prefix,
  onChange,
}: {
  title: string;
  value: ResolvedHeroContent["primaryCta"];
  prefix: "cta_primary" | "cta_secondary";
  onChange: (value: ResolvedHeroContent["primaryCta"]) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <Toggle
        name={`${prefix}_visible`}
        label={`${title} görünür`}
        checked={value.visible}
        onChange={(visible) => onChange({ ...value, visible })}
      />
      <label className="space-y-2">
        <span className={labelClass}>Metin</span>
        <input
          name={`${prefix}_label`}
          value={value.label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Bağlantı</span>
        <input
          name={`${prefix}_href`}
          value={value.href}
          onChange={(event) => onChange({ ...value, href: event.target.value })}
          className={inputClass}
          placeholder="/on-kayit"
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Stil</span>
        <select
          name={`${prefix}_style`}
          value={value.style}
          onChange={(event) => onChange({ ...value, style: event.target.value as HeroButtonStyle })}
          className={inputClass}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
        </select>
      </label>
    </div>
  );
}

function BadgeFields({
  title,
  namePrefix,
  value,
  onChange,
}: {
  title: string;
  namePrefix: "hero_badge_primary" | "hero_badge_secondary";
  value: ResolvedHeroContent["primaryBadge"];
  onChange: (value: ResolvedHeroContent["primaryBadge"]) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <Toggle
        name={`${namePrefix}_visible`}
        label={`${title} görünür`}
        checked={value.visible}
        onChange={(visible) => onChange({ ...value, visible })}
      />
      <label className="space-y-2">
        <span className={labelClass}>Metin</span>
        <input
          name={`${namePrefix}_text`}
          value={value.text}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
          className={inputClass}
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Opsiyonel bağlantı</span>
        <input
          name={`${namePrefix}_href`}
          value={value.href}
          onChange={(event) => onChange({ ...value, href: event.target.value })}
          className={inputClass}
          placeholder="Bağlantı yoksa boş bırakın"
        />
      </label>
    </div>
  );
}

export function HeroManagementForm({ initialHero }: { initialHero: ResolvedHeroContent }) {
  const [hero, setHero] = useState(() => cloneHero(initialHero));
  const [previewMode, setPreviewMode] = useState<HeroPreviewMode>("desktop");
  const [uploadKey, setUploadKey] = useState(0);

  function updateFeature(id: string, patch: Partial<HeroFeature>) {
    setHero((current) => ({
      ...current,
      features: current.features.map((feature) =>
        feature.id === id ? { ...feature, ...patch } : feature,
      ),
    }));
  }

  function moveFeature(index: number, direction: -1 | 1) {
    setHero((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.features.length) return current;
      const features = [...current.features];
      [features[index], features[target]] = [features[target], features[index]];
      return {
        ...current,
        features: features.map((feature, sortOrder) => ({ ...feature, sortOrder })),
      };
    });
  }

  function addFeature() {
    setHero((current) => ({
      ...current,
      features: [
        ...current.features,
        {
          id: `feature-${Date.now()}`,
          text: "Yeni özellik",
          visible: true,
          sortOrder: current.features.length,
        },
      ],
    }));
  }

  function removeFeature(id: string) {
    setHero((current) => ({
      ...current,
      features: current.features
        .filter((feature) => feature.id !== id)
        .map((feature, sortOrder) => ({ ...feature, sortOrder })),
    }));
  }

  function resetToSaved() {
    setHero(cloneHero(initialHero));
    setUploadKey((value) => value + 1);
  }

  return (
    <form action={saveHeroContent} className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
      <div className="space-y-6">
        <Panel title="Genel" description="Hero görünürlüğü, arka planı ve temel yerleşim ayarları.">
          <div className="space-y-5">
            <Toggle
              name="hero_is_visible"
              label="Hero bölümü görünür"
              checked={hero.isVisible}
              onChange={(isVisible) => setHero((current) => ({ ...current, isVisible }))}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <ImageCropUploadField
                key={`desktop-${uploadKey}-${hero.desktopImageUrl}`}
                bucket="site-images"
                folder="hero/desktop"
                inputName="hero_desktop_image_url"
                label="Desktop Hero Görseli"
                value={hero.desktopImageUrl}
                preset="hero"
                onUploaded={(desktopImageUrl) =>
                  setHero((current) => ({
                    ...current,
                    desktopImageUrl: desktopImageUrl || heroFallbacks.desktopImageUrl,
                  }))
                }
              />
              <ImageCropUploadField
                key={`mobile-${uploadKey}-${hero.mobileImageUrl}`}
                bucket="site-images"
                folder="hero/mobile"
                inputName="hero_mobile_image_url"
                label="Mobil Hero Görseli"
                value={hero.mobileImageUrl}
                preset="hero"
                aspectRatio={4 / 5}
                onUploaded={(mobileImageUrl) =>
                  setHero((current) => ({
                    ...current,
                    mobileImageUrl: mobileImageUrl || current.desktopImageUrl,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className={labelClass}>Overlay Koyuluğu (%)</span>
                <input
                  name="hero_overlay_opacity"
                  type="number"
                  min={0}
                  max={100}
                  value={hero.overlayOpacity}
                  onChange={(event) => setHero((current) => ({ ...current, overlayOpacity: Number(event.target.value) }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Minimum Yükseklik (px)</span>
                <input
                  name="hero_min_height"
                  type="number"
                  min={480}
                  max={1100}
                  step={20}
                  value={hero.minHeight}
                  onChange={(event) => setHero((current) => ({ ...current, minHeight: Number(event.target.value) }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Ana Metin Hizası</span>
                <select
                  name="hero_content_alignment"
                  value={hero.alignment}
                  onChange={(event) => setHero((current) => ({ ...current, alignment: event.target.value as ResolvedHeroContent["alignment"] }))}
                  className={inputClass}
                >
                  <option value="left">Sol</option>
                  <option value="center">Orta</option>
                  <option value="right">Sağ</option>
                </select>
              </label>
            </div>
          </div>
        </Panel>

        <Panel title="Metinler" description="Ana başlıkta Enter ile eklenen satır sonları canlı Hero’da korunur.">
          <div className="space-y-5">
            <Toggle
              name="hero_overline_visible"
              label="Üst etiket görünür"
              checked={hero.overlineVisible}
              onChange={(overlineVisible) => setHero((current) => ({ ...current, overlineVisible }))}
            />
            <label className="space-y-2">
              <span className={labelClass}>Üst Etiket</span>
              <input
                name="hero_overline"
                value={hero.overline}
                onChange={(event) => setHero((current) => ({ ...current, overline: event.target.value }))}
                className={inputClass}
              />
            </label>
            <Toggle
              name="hero_headline_visible"
              label="Ana başlık görünür"
              checked={hero.headlineVisible}
              onChange={(headlineVisible) => setHero((current) => ({ ...current, headlineVisible }))}
            />
            <label className="space-y-2">
              <span className={labelClass}>Ana Başlık</span>
              <textarea
                name="hero_headline"
                rows={4}
                value={hero.headline}
                onChange={(event) => setHero((current) => ({ ...current, headline: event.target.value }))}
                className={inputClass}
              />
            </label>
            <Toggle
              name="hero_lead_visible"
              label="Açıklama / alt slogan görünür"
              checked={hero.leadVisible}
              onChange={(leadVisible) => setHero((current) => ({ ...current, leadVisible }))}
            />
            <label className="space-y-2">
              <span className={labelClass}>Açıklama / Alt Slogan</span>
              <textarea
                name="hero_lead"
                rows={3}
                value={hero.lead}
                onChange={(event) => setHero((current) => ({ ...current, lead: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Butonlar" description="Hero’nun sağ altındaki iki ana aksiyonu yönetin.">
          <div className="grid gap-4 sm:grid-cols-2">
            <ButtonFields
              title="1. Buton"
              prefix="cta_primary"
              value={hero.primaryCta}
              onChange={(primaryCta) => setHero((current) => ({ ...current, primaryCta }))}
            />
            <ButtonFields
              title="2. Buton"
              prefix="cta_secondary"
              value={hero.secondaryCta}
              onChange={(secondaryCta) => setHero((current) => ({ ...current, secondaryCta }))}
            />
          </div>
        </Panel>

        <Panel title="Badge'ler" description="Üst bilgi alanını, 35. yıl rozetini ve kampanya badge’ini yönetin.">
          <div className="space-y-5">
            <Toggle
              name="hero_intro_visible"
              label="Sağ üst açıklama görünür"
              checked={hero.introVisible}
              onChange={(introVisible) => setHero((current) => ({ ...current, introVisible }))}
            />
            <label className="space-y-2">
              <span className={labelClass}>Sağ Üst Açıklama</span>
              <textarea
                name="hero_intro_text"
                rows={3}
                value={hero.introText}
                onChange={(event) => setHero((current) => ({ ...current, introText: event.target.value }))}
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <BadgeFields
                title="1. Badge"
                namePrefix="hero_badge_primary"
                value={hero.primaryBadge}
                onChange={(primaryBadge) => setHero((current) => ({ ...current, primaryBadge }))}
              />
              <BadgeFields
                title="2. Badge"
                namePrefix="hero_badge_secondary"
                value={hero.secondaryBadge}
                onChange={(secondaryBadge) => setHero((current) => ({ ...current, secondaryBadge }))}
              />
            </div>

            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <Toggle
                name="hero_campaign_badge_visible"
                label="Orta alt kampanya badge’i görünür"
                checked={hero.campaignBadge.visible}
                onChange={(visible) => setHero((current) => ({ ...current, campaignBadge: { ...current.campaignBadge, visible } }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className={labelClass}>Kampanya Metni</span>
                  <input
                    name="hero_campaign_badge_text"
                    value={hero.campaignBadge.text}
                    onChange={(event) => setHero((current) => ({ ...current, campaignBadge: { ...current.campaignBadge, text: event.target.value } }))}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Bağlantı</span>
                  <input
                    name="hero_campaign_badge_href"
                    value={hero.campaignBadge.href}
                    onChange={(event) => setHero((current) => ({ ...current, campaignBadge: { ...current.campaignBadge, href: event.target.value } }))}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>Badge Stili</span>
                  <select
                    name="hero_campaign_badge_style"
                    value={hero.campaignBadge.style}
                    onChange={(event) => setHero((current) => ({ ...current, campaignBadge: { ...current.campaignBadge, style: event.target.value as HeroCampaignBadgeStyle } }))}
                    className={inputClass}
                  >
                    <option value="highlight">Vurgulu</option>
                    <option value="accent">Kurumsal Accent</option>
                    <option value="outline">Outline</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <Toggle
                name="hero_anniversary_visible"
                label="35. yıl alanı görünür"
                checked={hero.anniversaryVisible}
                onChange={(anniversaryVisible) => setHero((current) => ({ ...current, anniversaryVisible }))}
              />
              <label className="space-y-2">
                <span className={labelClass}>Opsiyonel Rozet Metni</span>
                <input
                  name="hero_anniversary_text"
                  value={hero.anniversaryText}
                  onChange={(event) => setHero((current) => ({ ...current, anniversaryText: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <ImageCropUploadField
                key={`anniversary-${uploadKey}-${hero.anniversaryImageUrl}`}
                bucket="site-images"
                folder="hero/anniversary"
                inputName="hero_anniversary_image_url"
                label="35. Yıl Görseli / İkonu"
                value={hero.anniversaryImageUrl}
                preset="sponsor-logo"
                mode="contain"
                onUploaded={(anniversaryImageUrl) => setHero((current) => ({ ...current, anniversaryImageUrl }))}
              />
            </div>
          </div>
        </Panel>

        <Panel title="Özellikler" description="Sol alt özellik maddelerini ekleyin, gizleyin veya sıralayın.">
          <input type="hidden" name="hero_features" value={JSON.stringify(hero.features)} readOnly />
          <div className="space-y-3">
            {hero.features.map((feature, index) => (
              <div key={feature.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={feature.visible}
                      onChange={(event) => updateFeature(feature.id, { visible: event.target.checked })}
                      className="size-4 accent-orange-500"
                      aria-label={`${feature.text} görünürlüğü`}
                    />
                    <input
                      value={feature.text}
                      onChange={(event) => updateFeature(feature.id, { text: event.target.value })}
                      className={inputClass}
                      aria-label={`${index + 1}. özellik metni`}
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveFeature(index, -1)} disabled={index === 0} className="size-10 rounded-lg border border-slate-700 text-slate-300 hover:border-orange-400 hover:text-orange-300 disabled:opacity-30" aria-label="Yukarı taşı">↑</button>
                    <button type="button" onClick={() => moveFeature(index, 1)} disabled={index === hero.features.length - 1} className="size-10 rounded-lg border border-slate-700 text-slate-300 hover:border-orange-400 hover:text-orange-300 disabled:opacity-30" aria-label="Aşağı taşı">↓</button>
                    <button type="button" onClick={() => removeFeature(feature.id)} className="min-h-10 rounded-lg border border-red-500/50 px-3 text-xs font-bold text-red-300 hover:bg-red-500/10">Sil</button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addFeature} className="min-h-11 rounded-full border border-orange-500/60 px-5 py-2 text-sm font-bold text-orange-300 transition hover:bg-orange-500/10">
              + Yeni Madde Ekle
            </button>
          </div>
        </Panel>

        <Panel title="Medya" description="Sol üst video kartını, thumbnail’i ve oynat ikonunu yönetin.">
          <div className="space-y-5">
            <Toggle
              name="hero_media_visible"
              label="Küçük medya kartı görünür"
              checked={hero.mediaVisible}
              onChange={(mediaVisible) => setHero((current) => ({ ...current, mediaVisible }))}
            />
            <Toggle
              name="hero_media_show_play_button"
              label="Oynat ikonu görünür"
              checked={hero.mediaShowPlayButton}
              onChange={(mediaShowPlayButton) => setHero((current) => ({ ...current, mediaShowPlayButton }))}
            />
            <ImageCropUploadField
              key={`media-thumbnail-${uploadKey}-${hero.mediaThumbnailUrl}`}
              bucket="videos"
              folder="hero/thumbnails"
              inputName="hero_media_thumbnail_url"
              label="Video Thumbnail"
              value={hero.mediaThumbnailUrl}
              preset="hero"
              onUploaded={(mediaThumbnailUrl) => setHero((current) => ({ ...current, mediaThumbnailUrl }))}
            />
            <label className="space-y-2">
              <span className={labelClass}>Video URL</span>
              <input
                name="hero_media_video_url"
                value={hero.mediaVideoUrl}
                onChange={(event) => setHero((current) => ({ ...current, mediaVideoUrl: event.target.value }))}
                className={inputClass}
              />
            </label>
            <VideoFileUploadField
              folder="hero/videos"
              thumbnailFolder="hero/thumbnails"
              onUploaded={(mediaVideoUrl) => setHero((current) => ({ ...current, mediaVideoUrl }))}
              onThumbnailGenerated={(result) => {
                if (result) setHero((current) => ({ ...current, mediaThumbnailUrl: result.url }));
              }}
            />
            <label className="space-y-2">
              <span className={labelClass}>Medya Açıklaması (alt metin)</span>
              <input
                name="hero_media_alt"
                value={hero.mediaAlt}
                onChange={(event) => setHero((current) => ({ ...current, mediaAlt: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>
        </Panel>

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={resetToSaved}
            className="min-h-11 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
          >
            Mevcut Kaydı Yeniden Yükle
          </button>
          <ConfirmSubmitButton>Değişiklikleri Kaydet</ConfirmSubmitButton>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 xl:sticky xl:top-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Önizleme</p>
            <h2 className="mt-1 text-lg font-bold text-white">Canlı Hero Önizleme</h2>
          </div>
          <div className="inline-flex self-start rounded-full border border-slate-700 bg-slate-950 p-1">
            {(["desktop", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  previewMode === mode ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white",
                )}
              >
                {mode === "desktop" ? "Masaüstü" : "Mobil"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-2">
          {hero.isVisible ? (
            <div
              className={cn(
                "pointer-events-none mx-auto overflow-hidden transition-[max-width] duration-200 motion-reduce:transition-none",
                previewMode === "desktop" ? "max-w-full" : "max-w-[390px]",
              )}
            >
              <HeroSection resolvedContent={hero} previewMode={previewMode} className="!bg-transparent" />
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-sm font-semibold text-slate-400">
              Hero bölümü kapalı. Canlı sitede gösterilmeyecek.
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
