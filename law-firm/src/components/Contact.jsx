function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container contact-container">
        <div className="section-header">
          <span className="en-title">Contact</span>
          <h2>お問い合わせ</h2>
          <p className="description">
            初回相談無料。秘密厳守でご対応いたします。<br />
            まずはお気軽にご連絡ください。
          </p>
        </div>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <h3>お電話でのご相談</h3>
            <p>03-1234-5678</p>
            <small>受付時間 9:00〜18:00（平日）</small>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">📧</div>
            <h3>メールでのご相談</h3>
            <p>info@aoba-law.jp</p>
            <small>24時間受付・翌営業日回答</small>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">🕐</div>
            <h3>営業時間</h3>
            <p>平日 9:00〜18:00</p>
            <small>土日祝は事前予約制</small>
          </div>
        </div>

        <div className="contact-cta">
          <a href="tel:03-1234-5678" className="btn btn-gold">
            今すぐ無料相談を予約する
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
