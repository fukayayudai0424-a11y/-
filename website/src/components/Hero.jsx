function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <p className="hero-tagline">あなたの「働く」を全力でサポート</p>
        <h1 className="hero-title">
          一人ひとりの未来に<br />
          <span className="highlight">寄り添う人材サービス</span>
        </h1>
        <p className="hero-subtitle">
          キャリアリンクは、求職者の皆様と企業様をつなぐ架け橋として、<br />
          最適なマッチングと丁寧なサポートで、双方の成功をお手伝いします。
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={scrollToContact}>
            お仕事をお探しの方
          </button>
          <button className="btn btn-secondary" onClick={scrollToContact}>
            企業様のお問い合わせ
          </button>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">1,200+</span>
          <span className="stat-label">取引企業数</span>
        </div>
        <div className="stat">
          <span className="stat-number">5,000+</span>
          <span className="stat-label">就業実績</span>
        </div>
        <div className="stat">
          <span className="stat-number">98%</span>
          <span className="stat-label">定着率</span>
        </div>
      </div>
    </section>
  )
}

export default Hero
