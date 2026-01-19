function PracticeAreas() {
  const practices = [
    {
      icon: '💔',
      title: '離婚・男女問題',
      description: '離婚協議、財産分与、親権・養育費、慰謝料請求、DV問題など、ご家庭の問題を丁寧にサポートします。'
    },
    {
      icon: '📜',
      title: '相続・遺言',
      description: '遺産分割協議、遺言書作成、相続放棄、遺留分請求など、円満な相続の実現をお手伝いします。'
    },
    {
      icon: '🚗',
      title: '交通事故',
      description: '保険会社との交渉、後遺障害等級認定、損害賠償請求など、適正な賠償金獲得を目指します。'
    },
    {
      icon: '💳',
      title: '債務整理・破産',
      description: '任意整理、個人再生、自己破産など、借金問題からの再出発をサポートいたします。'
    },
    {
      icon: '👔',
      title: '労働問題',
      description: '不当解雇、残業代請求、パワハラ・セクハラ、労災など、働く方の権利を守ります。'
    },
    {
      icon: '🏢',
      title: '企業法務',
      description: '契約書作成・レビュー、顧問契約、事業承継、コンプライアンスなど、企業の法的課題を解決します。'
    }
  ];

  return (
    <section id="practice" className="practice-areas">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Practice Areas</span>
          <h2>取扱分野</h2>
          <p className="description">
            幅広い法律分野に対応し、それぞれの専門知識と経験を活かして<br />
            最善の解決策をご提案いたします。
          </p>
        </div>

        <div className="practice-grid">
          {practices.map((practice, index) => (
            <div key={index} className="practice-card">
              <div className="practice-card-image">
                {practice.icon}
              </div>
              <div className="practice-card-content">
                <h3>{practice.title}</h3>
                <p>{practice.description}</p>
                <a href="#contact" className="practice-card-link">
                  詳しく見る →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PracticeAreas;
