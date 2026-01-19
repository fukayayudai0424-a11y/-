function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-text">
                <span className="logo-main">あおば法律事務所</span>
                <span className="logo-sub">AOBA LAW OFFICE</span>
              </div>
            </div>
            <p>
              地域の皆様に信頼される法律事務所として、
              依頼者様に寄り添った丁寧な法律サービスを提供しています。
              法律のことでお困りの際は、お気軽にご相談ください。
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">X</a>
              <a href="#" className="social-link">in</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>取扱分野</h4>
            <ul>
              <li><a href="#practice">離婚・男女問題</a></li>
              <li><a href="#practice">相続・遺言</a></li>
              <li><a href="#practice">交通事故</a></li>
              <li><a href="#practice">債務整理・破産</a></li>
              <li><a href="#practice">労働問題</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>事務所案内</h4>
            <ul>
              <li><a href="#about">事務所概要</a></li>
              <li><a href="#lawyers">弁護士紹介</a></li>
              <li><a href="#fees">料金案内</a></li>
              <li><a href="#access">アクセス</a></li>
              <li><a href="#results">解決実績</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>お問い合わせ</h4>
            <ul>
              <li><a href="tel:03-1234-5678">03-1234-5678</a></li>
              <li><a href="mailto:info@aoba-law.jp">info@aoba-law.jp</a></li>
              <li><a href="#contact">無料相談予約</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 あおば法律事務所 All Rights Reserved.</p>
          <div className="footer-links">
            <a href="#">プライバシーポリシー</a>
            <a href="#">利用規約</a>
            <a href="#">サイトマップ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
