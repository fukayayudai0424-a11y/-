import { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <a href="#" className="logo">
          <div className="logo-icon">⚖️</div>
          <div>
            <div className="logo-text">あおば法律事務所</div>
            <div className="logo-sub">Aoba Law Office</div>
          </div>
        </a>

        <nav className="nav">
          <a href="#home" className="nav-link">ホーム</a>
          <a href="#features" className="nav-link">私たちの強み</a>
          <a href="#services" className="nav-link">取扱分野</a>
          <a href="#about" className="nav-link">事務所概要</a>
          <a href="#contact" className="nav-link">お問い合わせ</a>
        </nav>

        <a href="#contact" className="btn btn-primary header-cta">
          無料相談予約
        </a>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
