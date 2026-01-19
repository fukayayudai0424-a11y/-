function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2>まずはお気軽にご相談ください</h2>
        <p>初回相談無料。秘密厳守でご対応いたします。</p>

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
            <div className="contact-card-icon">📍</div>
            <h3>事務所所在地</h3>
            <p>東京都新宿区○○1-2-3</p>
            <small>○○駅徒歩3分</small>
          </div>
        </div>

        <a href="tel:03-1234-5678" className="btn contact-btn">
          📞 今すぐ電話で相談する
        </a>
      </div>
    </section>
  );
}

export default Contact;
