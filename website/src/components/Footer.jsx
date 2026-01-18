function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">キャリアリンク</span>
            <p className="footer-tagline">働く人と企業を確かな信頼で結ぶ</p>
            <div className="footer-license">
              <p>労働者派遣事業 許可番号：派00-000000</p>
              <p>有料職業紹介事業 許可番号：00-ユ-000000</p>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>サービス</h4>
              <ul>
                <li><a href="#services">人材派遣</a></li>
                <li><a href="#services">紹介予定派遣</a></li>
                <li><a href="#services">人材紹介</a></li>
                <li><a href="#services">業務委託</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>お仕事をお探しの方</h4>
              <ul>
                <li><a href="#contact">派遣登録</a></li>
                <li><a href="#features">キャリアリンクの特長</a></li>
                <li><a href="#contact">お仕事相談</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>企業の方</h4>
              <ul>
                <li><a href="#contact">人材のご依頼</a></li>
                <li><a href="#services">サービス内容</a></li>
                <li><a href="#about">会社概要</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>お問い合わせ</h4>
              <ul>
                <li>TEL: 03-1234-5678</li>
                <li>平日 9:00〜18:00</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <a href="#privacy">プライバシーポリシー</a>
            <a href="#terms">利用規約</a>
          </div>
          <p>&copy; {currentYear} キャリアリンク</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
