function Features() {
  const features = [
    {
      icon: '💬',
      title: '初回相談無料',
      description: 'まずはお気軽にご相談ください。初回のご相談は無料で承っております。費用のことも事前にご説明いたします。',
      color: 'blue'
    },
    {
      icon: '🏠',
      title: '駅から徒歩3分',
      description: 'アクセス便利な立地。お仕事帰りやお買い物のついでにもお立ち寄りいただけます。',
      color: 'orange'
    },
    {
      icon: '📅',
      title: '土日・夜間対応',
      description: '平日お忙しい方のために、事前予約制で土日・夜間のご相談も承っております。',
      color: 'green'
    },
    {
      icon: '🔒',
      title: '秘密厳守',
      description: 'ご相談内容は弁護士の守秘義務により厳重に管理。プライバシーを守ります。',
      color: 'blue'
    },
    {
      icon: '📝',
      title: 'わかりやすい説明',
      description: '専門用語を避け、図や資料を使いながら、どなたにもわかりやすくご説明いたします。',
      color: 'orange'
    },
    {
      icon: '💰',
      title: '明確な費用体系',
      description: '弁護士費用は事前に詳しくご説明。分割払いのご相談も承っております。',
      color: 'green'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-title">
          <span className="label">FEATURES</span>
          <h2>当事務所が選ばれる理由</h2>
          <p>地域の皆様に信頼される法律事務所を目指し、<br />きめ細やかなサービスを心がけています。</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon ${feature.color}`}>
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
