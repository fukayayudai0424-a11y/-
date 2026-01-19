function Results() {
  const stats = [
    { number: '3,000', unit: '件+', label: '相談実績' },
    { number: '98', unit: '%', label: '依頼者満足度' },
    { number: '20', unit: '年', label: '弁護士経験' },
    { number: '500', unit: '件+', label: '訴訟実績' }
  ];

  const cases = [
    {
      category: '離婚問題',
      title: '財産分与と養育費の増額交渉',
      description: '専業主婦の方が離婚を決意。当初提示された条件を大幅に改善し、適正な財産分与と養育費を獲得。',
      outcome: '財産分与 800万円増額'
    },
    {
      category: '交通事故',
      title: '後遺障害等級認定と賠償金交渉',
      description: 'むち打ち症で後遺症が残った被害者の方。等級認定をサポートし、保険会社との交渉で大幅増額。',
      outcome: '賠償金 1,200万円獲得'
    },
    {
      category: '相続問題',
      title: '遺産分割調停での解決',
      description: '兄弟間で紛争となった遺産分割。調停を通じて公平な分割を実現し、円満解決に導いた事例。',
      outcome: '遺産 3,500万円獲得'
    }
  ];

  return (
    <section id="results" className="results">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Results</span>
          <h2>解決実績</h2>
          <p className="description">
            多くの依頼者様の問題解決をサポートしてまいりました。<br />
            以下は当事務所の実績の一部です。
          </p>
        </div>

        <div className="results-stats">
          {stats.map((stat, index) => (
            <div key={index} className="result-stat">
              <div className="result-stat-number">
                {stat.number}<span>{stat.unit}</span>
              </div>
              <div className="result-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="results-cases">
          {cases.map((item, index) => (
            <div key={index} className="result-case">
              <span className="result-case-category">{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <div className="result-case-outcome">
                <span className="outcome-label">解決結果</span>
                <span className="outcome-value">{item.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Results;
