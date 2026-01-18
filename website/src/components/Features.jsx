function Features() {
  const features = [
    {
      number: '01',
      title: '専任担当者による\n手厚いサポート',
      description: '登録から就業後まで、専任のコーディネーターが一貫してサポート。困った時もすぐに相談できる体制を整えています。'
    },
    {
      number: '02',
      title: '豊富な求人数と\n幅広い職種',
      description: '事務・製造・IT・医療など多彩な業種・職種の求人をご用意。あなたの希望やスキルに合ったお仕事をご紹介します。'
    },
    {
      number: '03',
      title: 'スキルアップ研修\n制度の充実',
      description: 'PCスキルやビジネスマナーなど、無料の研修プログラムをご用意。未経験からのキャリアアップを応援します。'
    },
    {
      number: '04',
      title: '安心の福利厚生\nサポート',
      description: '社会保険完備、有給休暇、健康診断など、派遣スタッフの皆様が安心して働ける環境づくりに取り組んでいます。'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">私たちの強み</h2>
        <p className="section-subtitle">キャリアリンクが選ばれる4つの理由</p>

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
