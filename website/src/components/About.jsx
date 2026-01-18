function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">会社概要</h2>

        <div className="about-content">
          <div className="about-text">
            <div className="greeting">
              <h3 className="greeting-title">ご挨拶</h3>
              <p className="about-lead">
                「働く喜びをすべての人に届けたい」<br />
                その想いを胸に、私たちは人材サービスを提供しています。
              </p>
              <p>
                キャリアリンクは、求職者の皆様一人ひとりのキャリアに真摯に向き合い、
                企業様の人材ニーズに的確にお応えすることで、
                双方にとって最適なマッチングを実現してまいりました。
              </p>
              <p>
                これからも「人」を大切にする企業として、
                地域社会の発展と皆様の幸せな働き方の実現に貢献してまいります。
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
                  <td>2015年4月1日</td>
                </tr>
                <tr>
                  <th>代表者</th>
                  <td>代表取締役 田中 太郎</td>
                </tr>
                <tr>
                  <th>所在地</th>
                  <td>〒100-0001<br />東京都千代田区〇〇1-2-3 〇〇ビル5F</td>
                </tr>
                <tr>
                  <th>事業内容</th>
                  <td>
                    労働者派遣事業（許可番号：派00-000000）<br />
                    有料職業紹介事業（許可番号：00-ユ-000000）<br />
                    業務委託・アウトソーシング事業
                  </td>
                </tr>
                <tr>
                  <th>資本金</th>
                  <td>3,000万円</td>
                </tr>
                <tr>
                  <th>従業員数</th>
                  <td>50名（派遣スタッフ含む 約800名）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="access">
          <h3 className="access-title">アクセス</h3>
          <div className="access-info">
            <p>〒100-0001 東京都千代田区〇〇1-2-3 〇〇ビル5F</p>
            <p>JR「東京駅」丸の内北口より徒歩5分 / 地下鉄「大手町駅」C1出口より徒歩3分</p>
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
