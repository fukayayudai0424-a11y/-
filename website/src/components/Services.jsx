function Services() {
  const services = [
    {
      icon: '📦',
      title: 'せどりコンサルティング',
      description: '店舗せどり・電脳せどりの基礎から応用まで。仕入れ先の開拓やリサーチ方法を徹底サポートします。',
      features: ['仕入れ先リスト提供', 'Keepa分析指導', '利益商品リサーチ']
    },
    {
      icon: '🌏',
      title: '中国輸入サポート',
      description: 'アリババ・タオバオからの仕入れ、OEM製造まで。中国輸入ビジネスをトータルサポート。',
      features: ['代行業者紹介', '品質管理アドバイス', 'OEM商品開発']
    },
    {
      icon: '🚀',
      title: 'Amazon FBA構築',
      description: 'Amazon FBAを活用した物販ビジネスの構築。出品から販売戦略まで一貫してサポート。',
      features: ['アカウント開設支援', '商品ページ最適化', '広告運用サポート']
    },
    {
      icon: '💹',
      title: 'eBay輸出コンサル',
      description: '円安を活かした海外輸出ビジネス。eBayでの販売ノウハウを伝授します。',
      features: ['出品代行', '海外発送サポート', '為替リスク管理']
    }
  ]

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">サービス</h2>
        <p className="section-subtitle">あなたの物販ビジネスを成功に導く4つのサービス</p>

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
