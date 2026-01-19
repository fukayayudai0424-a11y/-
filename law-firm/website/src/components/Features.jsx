function Features() {
  const features = [
    {
      number: '01',
      title: '専任担当制',
      description: '登録から就業後まで、担当者が一貫してサポート。いつでも相談できる体制を整えています。'
    },
    {
      number: '02',
      title: '豊富な求人',
      description: '事務・製造・IT・医療など幅広い業種の求人をご用意。ご希望に合った仕事をご紹介します。'
    },
    {
      number: '03',
      title: 'スキルアップ支援',
      description: 'PCスキルやビジネスマナーの研修を無料で受講可能。キャリアアップをサポートします。'
    },
    {
      number: '04',
      title: '福利厚生完備',
      description: '社会保険・有給休暇・健康診断など、安心して働ける環境を整えています。'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">選ばれる理由</h2>
        <p className="section-subtitle">キャリアリンクの特長をご紹介します</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="feature-number">{feature.number}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
