function Access() {
  const accessInfo = [
    {
      icon: '📍',
      title: '所在地',
      content: '〒100-0001\n東京都千代田区千代田1-1-1\nあおばビル5階'
    },
    {
      icon: '🚃',
      title: '最寄駅',
      content: '東京メトロ丸ノ内線「大手町駅」徒歩3分\nJR「東京駅」徒歩10分'
    },
    {
      icon: '🅿️',
      title: '駐車場',
      content: '近隣にコインパーキングあり\n（駐車料金補助制度あり）'
    }
  ];

  return (
    <section id="access" className="access">
      <div className="container">
        <div className="section-header">
          <span className="en-title">Access</span>
          <h2>アクセス</h2>
        </div>

        <div className="access-container">
          <div className="access-map">
            🗺️
            {/* 実際の実装ではGoogle Maps Embedを使用 */}
          </div>

          <div className="access-info">
            <h3>あおば法律事務所</h3>
            <div className="access-details">
              {accessInfo.map((item, index) => (
                <div key={index} className="access-item">
                  <div className="access-item-icon">{item.icon}</div>
                  <div className="access-item-content">
                    <h4>{item.title}</h4>
                    <p style={{whiteSpace: 'pre-line'}}>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Google Mapで見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Access;
