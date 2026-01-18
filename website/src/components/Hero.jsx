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
        <h1 className="hero-title">
          物販ビジネスで<br />
          <span className="highlight">新しい収入源を</span>
        </h1>
        <p className="hero-subtitle">
          初心者から上級者まで、物販・せどりビジネスの成功をサポート。<br />
          Amazon、メルカリ、eBay輸出など多彩な販路で収益化を実現します。
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={scrollToContact}>
            無料相談はこちら
          </button>
          <button className="btn btn-secondary" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
            サービスを見る
          </button>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-number">500+</span>
          <span className="stat-label">サポート実績</span>
        </div>
        <div className="stat">
          <span className="stat-number">98%</span>
          <span className="stat-label">顧客満足度</span>
        </div>
        <div className="stat">
          <span className="stat-number">3年</span>
          <span className="stat-label">運営実績</span>
        </div>
      </div>
    </section>
  )
}

export default Hero
