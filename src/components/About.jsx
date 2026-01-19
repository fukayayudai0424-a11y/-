function About() {
  return (
    <section id="about" className="about">
      <div className="container about-container">
        <div className="about-image">
          <span>👨‍⚖️</span>
        </div>

        <div className="about-content">
          <span className="label">ABOUT</span>
          <h2>事務所概要</h2>
          <p>
            あおば法律事務所は、地域の皆様に寄り添う「街の法律家」として、
            2010年に開設いたしました。「敷居の低い法律事務所」をモットーに、
            どなたでも気軽にご相談いただける環境づくりを心がけています。
          </p>

          <ul className="about-list">
            <li>
              <span className="check">✓</span>
              弁護士歴15年以上の経験豊富な弁護士が対応
            </li>
            <li>
              <span className="check">✓</span>
              年間300件以上の相談実績
            </li>
            <li>
              <span className="check">✓</span>
              複数の弁護士によるチーム体制
            </li>
            <li>
              <span className="check">✓</span>
              各種法テラス（法律扶助）対応
            </li>
          </ul>

          <a href="#contact" className="btn btn-primary">
            事務所について詳しく見る
          </a>
        </div>
      </div>
    </section>
  );
}

export default About;
