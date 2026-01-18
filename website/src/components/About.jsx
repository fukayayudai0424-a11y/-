function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">会社概要</h2>

        <div className="about-content">
          <div className="about-text">
            <p className="about-lead">
              BuppanProは、物販ビジネスの可能性を信じ、
              一人でも多くの方に副業・本業としての成功を
              お届けすることを使命としています。
            </p>
            <p>
              私たちは3年以上にわたり、500名以上の方々の物販ビジネス立ち上げを
              サポートしてきました。せどり、中国輸入、Amazon FBA、eBay輸出など、
              様々な販路でのノウハウを蓄積し、初心者の方でも着実に成果を
              出せるプログラムを提供しています。
            </p>
          </div>

          <div className="company-info">
            <table className="info-table">
              <tbody>
                <tr>
                  <th>会社名</th>
                  <td>株式会社BuppanPro</td>
                </tr>
                <tr>
                  <th>設立</th>
                  <td>2022年4月</td>
                </tr>
                <tr>
                  <th>代表者</th>
                  <td>山田 太郎</td>
                </tr>
                <tr>
                  <th>所在地</th>
                  <td>東京都渋谷区〇〇1-2-3</td>
                </tr>
                <tr>
                  <th>事業内容</th>
                  <td>物販ビジネスコンサルティング<br />EC運営サポート<br />輸入代行サービス</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
