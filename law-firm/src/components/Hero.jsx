function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-label">
            <span className="line"></span>
            <span>AOBA LAW OFFICE</span>
          </div>

          <h1>
            あなたの<span className="highlight">権利</span>と<br />
            <span className="highlight">未来</span>を守る
          </h1>

          <p className="hero-description">
            人生の転機に寄り添い、最善の解決へと導く。
            離婚・相続・交通事故・債務整理など、
            20年以上の実績を持つ弁護士が、
            あなたの悩みに真摯に向き合います。
          </p>

          <div className="hero-buttons">
            <a href="#contact" className="btn btn-gold">
              無料相談を予約する
            </a>
            <a href="#practice" className="btn btn-outline" style={{borderColor: 'rgba(255,255,255,0.3)', color: '#fff'}}>
              取扱分野を見る
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">3,000<span>件+</span></div>
              <div className="stat-label">相談実績</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">20<span>年</span></div>
              <div className="stat-label">弁護士経験</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98<span>%</span></div>
              <div className="stat-label">依頼者満足度</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container">
            <div className="hero-image-main">
              <span className="hero-illustration">⚖️</span>
            </div>
            <div className="hero-card hero-card-1">
              <div className="hero-card-icon gold">🏛️</div>
              <h4>初回相談無料</h4>
              <p>お気軽にご相談ください</p>
            </div>
            <div className="hero-card hero-card-2">
              <div className="hero-card-icon navy">📞</div>
              <h4>土日・夜間対応</h4>
              <p>ご都合に合わせて</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
