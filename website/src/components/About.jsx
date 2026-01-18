function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">会社概要</h2>

        <div className="about-content">
          <div className="about-text">
            <div className="greeting">
              <h3 className="greeting-title">ごあいさつ</h3>
              <p className="about-lead">
                「人と企業の架け橋となり、<br />
                働く喜びを届けたい」
              </p>
              <p>
                私たちキャリアリンクは、求職者の皆様お一人おひとりと丁寧に向き合い、
                企業様の人材ニーズにお応えすることで、双方にとって最良の出会いを
                創出してまいりました。
              </p>
              <p>
                これからも地域に根ざした人材サービス会社として、
                皆様の「働く」を支え続けてまいります。
              </p>
              <p className="greeting-sign">代表取締役 田中 太郎</p>
            </div>
          </div>

          <div className="company-info">
            <table className="info-table">
              <tbody>
                <tr>
                  <th>会社名</th>
                  <td>株式会社キャリアリンク</td>
                </tr>
                <tr>
                  <th>設立</th>
                  <td>2015年4月</td>
                </tr>
                <tr>
                  <th>代表者</th>
                  <td>代表取締役 田中 太郎</td>
                </tr>
                <tr>
                  <th>所在地</th>
                  <td>〒100-0001<br />東京都千代田区○○1-2-3 ○○ビル5F</td>
                </tr>
                <tr>
                  <th>事業内容</th>
                  <td>
                    労働者派遣事業（派00-000000）<br />
                    有料職業紹介事業（00-ユ-000000）<br />
                    業務委託事業
                  </td>
                </tr>
                <tr>
                  <th>資本金</th>
                  <td>3,000万円</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="access">
          <h3 className="access-title">アクセス</h3>
          <div className="access-info">
            <p>〒100-0001 東京都千代田区○○1-2-3 ○○ビル5F</p>
            <p>JR「東京駅」丸の内北口より徒歩5分</p>
          </div>
          <div className="map-placeholder">
            <p>Google Map</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
