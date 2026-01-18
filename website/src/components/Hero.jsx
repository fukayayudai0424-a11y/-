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
        <p className="hero-tagline">人材サービス</p>
        <h1 className="hero-title">
          働く人と企業を<br />
          <span className="highlight">確かな信頼で結ぶ</span>
        </h1>
        <p className="hero-subtitle">
          キャリアリンクは、お仕事を探している方と人材を求める企業様の間に立ち、<br />
          双方にとって最適なマッチングを実現する人材サービス会社です。
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={scrollToContact}>
            お仕事を探す
          </button>
          <button className="btn btn-secondary" onClick={scrollToContact}>
            企業様のご相談
          </button>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">1,200</span>
          <span className="stat-label">取引企業数</span>
        </div>
        <div className="stat">
          <span className="stat-number">5,000</span>
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
