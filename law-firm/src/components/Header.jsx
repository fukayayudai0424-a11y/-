import { useState, useEffect } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-solid' : 'header-transparent'}`}>
      <div className="header-container">
        <a href="#" className="logo">
          <div className="logo-icon">
            <span>青</span>
          </div>
          <div className="logo-text">
            <span className="logo-main">あおば法律事務所</span>
            <span className="logo-sub">AOBA LAW OFFICE</span>
          </div>
        </a>

        <nav className="nav">
          <a href="#home" className="nav-link">ホーム</a>
          <a href="#features" className="nav-link">私たちの強み</a>
          <a href="#practice" className="nav-link">取扱分野</a>
          <a href="#lawyers" className="nav-link">弁護士紹介</a>
          <a href="#about" className="nav-link">事務所概要</a>
          <a href="#contact" className="nav-link">お問い合わせ</a>
        </nav>

        <a href="#contact" className="header-cta">
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
