export default function Home() {
return (
<main
style={{
minHeight: "100vh",
background:
"linear-gradient(135deg, #081120 0%, #0f172a 100%)",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "24px",
color: "white",
fontFamily: "Arial, sans-serif",
textAlign: "center",
}}
>
<div
style={{
width: "100%",
maxWidth: "600px",
padding: "48px 28px",
borderRadius: "28px",
background: "rgba(255,255,255,0.06)",
border: "1px solid rgba(255,255,255,0.08)",
backdropFilter: "blur(12px)",
}}
>
<h1
style={{
fontSize: "42px",
marginBottom: "18px",
lineHeight: 1.2,
}}
>
Samandıra İdman Yurdu S.K.
</h1>

    <p
      style={{
        fontSize: "24px",
        color: "#ef4444",
        fontWeight: 700,
        marginBottom: "18px",
      }}
    >
      Web Sitemiz Yapım Aşamasındadır
    </p>

    <p
      style={{
        fontSize: "17px",
        lineHeight: 1.7,
        color: "#cbd5e1",
      }}
    >
      Yeni web sitemiz çok yakında yayında olacaktır.
    </p>

    <a
      href="https://wa.me/905448548005"
      target="_blank"
      style={{
        display: "inline-block",
        marginTop: "28px",
        padding: "14px 24px",
        borderRadius: "999px",
        background: "#ef4444",
        color: "white",
        textDecoration: "none",
        fontWeight: 700,
      }}
    >
      WhatsApp İletişim
    </a>
  </div>
</main>

);
}
