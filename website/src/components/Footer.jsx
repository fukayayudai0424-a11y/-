function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">BuppanPro</span>
            <p className="footer-tagline">物販ビジネスの成功をサポート</p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>サービス</h4>
              <ul>
                <li><a href="#services">せどりコンサル</a></li>
                <li><a href="#services">中国輸入サポート</a></li>
                <li><a href="#services">Amazon FBA構築</a></li>
                <li><a href="#services">eBay輸出コンサル</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>会社情報</h4>
              <ul>
                <li><a href="#about">会社概要</a></li>
                <li><a href="#contact">お問い合わせ</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>お問い合わせ</h4>
              <ul>
                <li>TEL: 03-1234-5678</li>
                <li>Email: info@buppanpro.jp</li>
                <li>営業時間: 平日 10:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BuppanPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
