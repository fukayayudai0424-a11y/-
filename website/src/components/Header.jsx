import { useState } from 'react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-text">BuppanPro</span>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニュー"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li><button onClick={() => scrollToSection('hero')}>ホーム</button></li>
            <li><button onClick={() => scrollToSection('services')}>サービス</button></li>
            <li><button onClick={() => scrollToSection('about')}>会社概要</button></li>
            <li><button onClick={() => scrollToSection('contact')}>お問い合わせ</button></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
