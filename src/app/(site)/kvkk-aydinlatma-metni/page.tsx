import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { PRE_REGISTRATION_PRIVACY_VERSION } from "@/lib/pre-registration/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "KVKK Aydınlatma Metni | Samandıra İY Akademi",
  description: "Akademi ön kayıt formunda işlenen kişisel verilere ilişkin aydınlatma metni.",
  path: "/kvkk-aydinlatma-metni",
  noIndex: true,
});

export default function KvkkAydinlatmaMetniPage() {
  return (
    <section className="flex-1 bg-surface-base pb-20 pt-[calc(var(--header-height)+3rem)] sm:pb-24">
      <Container>
        <article className="mx-auto max-w-3xl rounded-2xl border border-border-subtle bg-white p-6 shadow-shell sm:p-10">
          <p className="type-overline text-accent">Kişisel verilerin korunması</p>
          <h1 className="type-display mt-3 text-text-primary">KVKK Aydınlatma Metni</h1>
          <p className="type-body mt-5">
            Bu metin, akademi ön kayıt formu aracılığıyla paylaşılan kişisel verilerin 6698 sayılı
            Kişisel Verilerin Korunması Kanunu kapsamında nasıl işlendiği hakkında bilgi vermek
            amacıyla hazırlanmıştır.
          </p>

          <div className="mt-9 space-y-8 text-text-primary">
            <section>
              <h2 className="type-heading-md">1. Veri sorumlusu ve iletişim</h2>
              <p className="type-body mt-3">
                Veri sorumlusu {siteConfig.name}&apos;dir. İletişim: {siteConfig.addressLines.join(", ")};{" "}
                <a className="font-semibold text-accent underline" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>; {siteConfig.phoneDisplay}.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">2. İşlenen veriler</h2>
              <p className="type-body mt-3">
                Veli adı, telefon numarası, oyuncunun adı ve doğum yılı, isteğe bağlı açıklama,
                aydınlatma metninin kabul zamanı ile başvuru ve bildirim durumları işlenir. Güvenlik
                amacıyla IP adresinin kendisi saklanmaz; kısa süreli kötüye kullanım kontrolünde
                tek yönlü özet değeri kullanılabilir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">3. İşleme amaçları</h2>
              <p className="type-body mt-3">
                Veriler; akademi başvurusunu almak ve değerlendirmek, uygun yaş grubu veya deneme
                antrenmanı hakkında iletişim kurmak, başvuru sürecini yönetmek, hizmet güvenliğini
                sağlamak ve hukuki yükümlülükleri yerine getirmek amaçlarıyla sınırlı olarak işlenir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">4. Toplama yöntemi ve hukuki sebep</h2>
              <p className="type-body mt-3">
                Veriler elektronik ön kayıt formu üzerinden doğrudan ilgili kişiden alınır. İşleme;
                başvuru sahibinin talebi üzerine başvuru sürecinin yürütülmesi, veri sorumlusunun
                hukuki yükümlülükleri ve temel haklara zarar vermemek kaydıyla meşru menfaatleri
                çerçevesinde gerçekleştirilir. Açık rıza gereken ayrı bir işleme faaliyeti oluşursa
                ayrıca rıza istenir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">5. Aktarım ve saklama</h2>
              <p className="type-body mt-3">
                Veriler yalnızca başvuru sürecinde görevli yetkili kişilerle; barındırma, veritabanı
                ve e-posta hizmeti sunan veri işleyenlerle gerekli güvenlik önlemleri altında ve
                hukuken zorunlu hâllerde yetkili kurumlarla paylaşılabilir. Veriler başvuru süreci ve
                ilgili yasal süreler boyunca saklanır; amaç ortadan kalktığında silinir, yok edilir
                veya anonim hâle getirilir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">6. İlgili kişinin hakları</h2>
              <p className="type-body mt-3">
                KVKK&apos;nın 11. maddesi kapsamında verilerinizin işlenip işlenmediğini öğrenme,
                işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme,
                düzeltme, silme veya yok etme talep etme ve kanunda belirtilen diğer haklara
                sahipsiniz. Taleplerinizi kimliğinizi doğrulayacak bilgilerle yukarıdaki e-posta veya
                posta adresine iletebilirsiniz.
              </p>
            </section>
          </div>

          <p className="type-meta mt-10 normal-case tracking-normal">
            Metin sürümü: {PRE_REGISTRATION_PRIVACY_VERSION}
          </p>
        </article>
      </Container>
    </section>
  );
}
