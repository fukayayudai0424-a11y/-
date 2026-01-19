function Lawyers() {
  const lawyers = [
    {
      position: '代表弁護士',
      name: '青葉 太郎',
      nameEn: 'Taro Aoba',
      bio: '東京大学法学部卒業。大手法律事務所での経験を経て、地域に根差した法律サービスを提供するため当事務所を開設。離婚・相続問題を中心に、3,000件以上の案件を担当。',
      credentials: ['東京弁護士会所属', '法学修士', '調停委員経験']
    },
    {
      position: '弁護士',
      name: '緑川 花子',
      nameEn: 'Hanako Midorikawa',
      bio: '早稲田大学法科大学院修了。企業法務を専門とし、中小企業の顧問弁護士として多数の企業をサポート。労働問題や契約トラブルの解決に定評があります。',
      credentials: ['第二東京弁護士会所属', '社会保険労務士資格']
    }
  ];

  return (
    <section id="lawyers" className="lawyers">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Lawyers</span>
          <h2>弁護士紹介</h2>
          <p className="description">
            経験豊富な弁護士が、依頼者様の立場に立って<br />
            親身に対応いたします。
          </p>
        </div>

        <div className="lawyers-grid">
          {lawyers.map((lawyer, index) => (
            <div key={index} className="lawyer-card">
              <div className="lawyer-image">
                👤
              </div>
              <div className="lawyer-info">
                <div className="lawyer-position">{lawyer.position}</div>
                <h3 className="lawyer-name">{lawyer.name}</h3>
                <div className="lawyer-name-en">{lawyer.nameEn}</div>
                <p className="lawyer-bio">{lawyer.bio}</p>
                <div className="lawyer-credentials">
                  {lawyer.credentials.map((cred, idx) => (
                    <span key={idx} className="credential-tag">{cred}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Lawyers;
