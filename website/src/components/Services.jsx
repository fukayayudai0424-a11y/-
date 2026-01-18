function Services() {
  const services = [
    {
      icon: '👥',
      title: '人材派遣',
      description: '必要な時に必要な人材を。お客様のニーズに合わせて、即戦力となるスタッフを派遣いたします。',
      features: ['一般事務・営業事務', '製造・軽作業', 'IT・エンジニア', 'コールセンター']
    },
    {
      icon: '🤝',
      title: '紹介予定派遣',
      description: '正社員・契約社員への直接雇用を前提とした派遣サービス。ミスマッチを防ぎ、安心の採用をサポートします。',
      features: ['最長6ヶ月の派遣期間', '双方合意で直接雇用', '採用コスト削減', 'お試し期間で適性判断']
    },
    {
      icon: '🎯',
      title: '人材紹介',
      description: '正社員・契約社員の採用をサポート。豊富な登録者データベースから最適な人材をご紹介いたします。',
      features: ['完全成功報酬型', '経験豊富なキャリアアドバイザー', '非公開求人多数', '入社後フォローあり']
    },
    {
      icon: '📋',
      title: '業務委託・アウトソーシング',
      description: 'バックオフィス業務からコールセンター運営まで、業務の効率化とコスト削減を実現します。',
      features: ['事務処理代行', 'コールセンター運営', 'データ入力・集計', '業務プロセス改善']
    }
  ]

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">サービス内容</h2>
        <p className="section-subtitle">求職者様・企業様それぞれのニーズにお応えします</p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
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
