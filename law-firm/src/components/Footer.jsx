function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="logo-text">あおば法律事務所</div>
            <p>
              地域の皆様に信頼される法律事務所として、
              丁寧で親身な対応を心がけています。
              法律のことでお困りの際は、お気軽にご相談ください。
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📸</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>取扱分野</h4>
            <ul>
              <li><a href="#services">離婚・男女問題</a></li>
              <li><a href="#services">相続・遺言</a></li>
              <li><a href="#services">交通事故</a></li>
              <li><a href="#services">債務整理</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>事務所案内</h4>
            <ul>
              <li><a href="#about">事務所概要</a></li>
              <li><a href="#">弁護士紹介</a></li>
              <li><a href="#">アクセス</a></li>
              <li><a href="#">よくある質問</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>お問い合わせ</h4>
            <ul>
              <li><a href="tel:03-1234-5678">03-1234-5678</a></li>
              <li><a href="mailto:info@aoba-law.jp">info@aoba-law.jp</a></li>
              <li><a href="#contact">無料相談予約</a></li>
              <li><a href="#">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 あおば法律事務所 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
