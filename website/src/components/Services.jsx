function Services() {
  const services = [
    {
      title: '人材派遣',
      description: 'ご希望の条件に合った派遣先をご紹介。事務職から専門職まで幅広く対応しています。',
      features: ['一般事務・営業事務', '製造・軽作業', 'IT・エンジニア', 'コールセンター']
    },
    {
      title: '紹介予定派遣',
      description: '派遣期間終了後に直接雇用を前提としたサービス。働きながら職場との相性を確認できます。',
      features: ['最長6ヶ月の試用期間', '双方合意で正社員へ', '採用ミスマッチを防止']
    },
    {
      title: '人材紹介',
      description: '正社員・契約社員としての転職をサポート。非公開求人も多数取り扱っています。',
      features: ['キャリア相談', '書類添削・面接対策', '条件交渉のサポート']
    },
    {
      title: '業務委託',
      description: '事務処理やコールセンター運営など、業務の一部をお任せいただくサービスです。',
      features: ['事務処理代行', 'コールセンター運営', '業務効率化の提案']
    }
  ]

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">サービス内容</h2>
        <p className="section-subtitle">お客様のニーズに合わせた最適なサービスをご提供します</p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
