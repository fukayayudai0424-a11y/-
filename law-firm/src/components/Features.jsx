function Features() {
  const features = [
    {
      number: '01',
      icon: '💬',
      title: '初回相談無料',
      description: 'まずはお気軽にご相談ください。費用面のご不安を解消し、最適な解決方法をご提案いたします。'
    },
    {
      number: '02',
      icon: '👤',
      title: '専任弁護士制',
      description: '案件開始から解決まで、同じ弁護士が一貫して担当。信頼関係を大切にした対応を行います。'
    },
    {
      number: '03',
      icon: '📅',
      title: '土日・夜間対応',
      description: '平日お忙しい方のために、事前予約制で土日・夜間のご相談も承っております。'
    },
    {
      number: '04',
      icon: '🔒',
      title: '秘密厳守',
      description: 'ご相談内容は弁護士の守秘義務により厳重に管理。完全個室でプライバシーを守ります。'
    },
    {
      number: '05',
      icon: '📝',
      title: 'わかりやすい説明',
      description: '専門用語を避け、図や資料を使いながら、どなたにもわかりやすくご説明いたします。'
    },
    {
      number: '06',
      icon: '💰',
      title: '明確な費用体系',
      description: '弁護士費用は事前に詳しくご説明。分割払いや法テラス利用のご相談も承ります。'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Our Strengths</span>
          <h2>当事務所が選ばれる理由</h2>
          <p className="description">
            地域の皆様に信頼される法律事務所として、<br />
            依頼者様に寄り添った丁寧なサービスを心がけています。
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-number">POINT {feature.number}</div>
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
