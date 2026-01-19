function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            初回相談無料
          </div>

          <h1>
            あなたの<span>悩み</span>に<br />
            寄り添う法律相談
          </h1>

          <p className="hero-description">
            離婚・相続・交通事故・債務整理など、暮らしの中で起きる
            さまざまな法律問題に、経験豊富な弁護士が親身に対応いたします。
            一人で悩まず、まずはお気軽にご相談ください。
          </p>

          <div className="hero-buttons">
            <a href="#contact" className="btn btn-primary">
              📞 無料相談を予約する
            </a>
            <a href="#services" className="btn btn-secondary">
              取扱分野を見る →
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">相談実績</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15年</div>
              <div className="stat-label">の経験</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">解決率</div>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-main">
            <span className="hero-illustration">⚖️</span>
          </div>
          <div className="hero-floating-card card-1">
            <div className="floating-icon blue">📋</div>
            <div>
              <div className="floating-text">丁寧なヒアリング</div>
              <div className="floating-sub">お話をしっかり伺います</div>
            </div>
          </div>
          <div className="hero-floating-card card-2">
            <div className="floating-icon orange">🤝</div>
            <div>
              <div className="floating-text">安心のサポート</div>
              <div className="floating-sub">解決まで伴走します</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
