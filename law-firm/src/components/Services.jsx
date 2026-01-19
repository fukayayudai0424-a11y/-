function Services() {
  const services = [
    {
      number: '01',
      title: '離婚・男女問題',
      description: '離婚協議、慰謝料請求、親権・養育費、財産分与、DV被害など。感情的になりやすい問題だからこそ、冷静な第三者の視点が必要です。',
    },
    {
      number: '02',
      title: '相続・遺言',
      description: '遺産分割協議、遺言書作成、相続放棄、遺留分侵害請求など。ご家族の大切な財産を守り、円満な相続をサポートします。',
    },
    {
      number: '03',
      title: '交通事故',
      description: '保険会社との交渉、後遺障害認定、慰謝料請求など。適正な賠償を受けられるよう、被害者の方を全力でサポートします。',
    },
    {
      number: '04',
      title: '債務整理・借金問題',
      description: '任意整理、個人再生、自己破産など。借金のお悩みは一人で抱え込まず、早めにご相談ください。',
    },
    {
      number: '05',
      title: '労働問題',
      description: '不当解雇、残業代請求、ハラスメント、労災など。働く人の権利を守るために、法的観点からアドバイスいたします。',
    },
    {
      number: '06',
      title: '不動産トラブル',
      description: '賃貸借契約、建物明渡し、境界紛争、欠陥住宅など。不動産に関するさまざまな問題を解決します。',
    },
  ];

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-title">
          <span className="label">SERVICES</span>
          <h2>取扱分野</h2>
          <p>暮らしの中で起きるさまざまな法律問題に対応。<br />まずはお気軽にご相談ください。</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-number">{service.number}</div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#contact" className="service-link">
                  詳しく相談する →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
