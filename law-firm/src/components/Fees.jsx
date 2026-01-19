function Fees() {
  const feeCards = [
    {
      title: '法律相談',
      description: '初回のご相談',
      price: '無料',
      priceNote: '初回60分まで',
      features: [
        '問題の整理と解決方針のご提案',
        '必要な手続きのご説明',
        '費用の概算見積もり',
        '今後の流れのご説明'
      ]
    },
    {
      title: '離婚事件',
      description: '協議離婚・調停・訴訟',
      price: '33万円〜',
      priceNote: '着手金（税込）',
      features: [
        '離婚協議書作成',
        '財産分与・慰謝料交渉',
        '親権・養育費の取り決め',
        '調停・訴訟代理'
      ],
      popular: true
    },
    {
      title: '債務整理',
      description: '任意整理・個人再生・破産',
      price: '22万円〜',
      priceNote: '着手金（税込）',
      features: [
        '債権者との交渉代理',
        '裁判所への申立て',
        '免責手続きサポート',
        '分割払い対応可能'
      ]
    }
  ];

  return (
    <section id="fees" className="fees">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Fee Structure</span>
          <h2>料金案内</h2>
          <p className="description">
            明確な料金体系で、安心してご依頼いただけます。<br />
            詳細は初回相談時にご説明いたします。
          </p>
        </div>

        <div className="fees-intro">
          <p>
            ※上記は目安となります。案件の難易度や内容によって異なりますので、
            詳細は初回相談時に個別にお見積りいたします。
            分割払いや法テラスの利用もご相談ください。
          </p>
        </div>

        <div className="fees-grid">
          {feeCards.map((card, index) => (
            <div key={index} className={`fee-card ${card.popular ? 'popular' : ''}`}>
              <h3>{card.title}</h3>
              <p className="fee-desc">{card.description}</p>
              <div className="fee-price">
                <div className="amount">{card.price}</div>
                <div className="note">{card.priceNote}</div>
              </div>
              <ul className="fee-features">
                {card.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="btn btn-primary" style={{width: '100%'}}>
                相談予約
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Fees;
