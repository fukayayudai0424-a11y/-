function About() {
  const officeInfo = [
    { label: '事務所名', value: 'あおば法律事務所' },
    { label: '代表弁護士', value: '青葉 太郎（東京弁護士会所属）' },
    { label: '設立', value: '2005年4月' },
    { label: '所在地', value: '東京都千代田区千代田1-1-1 あおばビル5階' },
    { label: '電話番号', value: '03-1234-5678' },
    { label: '営業時間', value: '平日 9:00〜18:00（土日祝 要予約）' }
  ];

  return (
    <section id="about" className="about">
      <div className="container about-container">
        <div className="about-image">
          <div className="about-image-main">
            🏛️
          </div>
          <div className="about-image-accent"></div>
        </div>

        <div className="about-content">
          <div className="section-label">
            <span className="line"></span>
            <span>ABOUT US</span>
          </div>
          <h2>事務所概要</h2>
          <p>
            あおば法律事務所は、2005年の開設以来、
            「依頼者様に寄り添う法律サービス」を理念として、
            地域の皆様の法的問題の解決に尽力してまいりました。
            <br /><br />
            「敷居の低い法律事務所」をモットーに、
            どなたでも気軽にご相談いただける環境づくりを心がけ、
            複雑な法律問題もわかりやすくご説明することを大切にしています。
          </p>

          <div className="about-info">
            {officeInfo.map((item, index) => (
              <div key={index} className="about-info-item">
                <span className="about-info-label">{item.label}</span>
                <span className="about-info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
