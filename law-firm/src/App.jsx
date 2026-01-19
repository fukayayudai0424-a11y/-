import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import PracticeAreas from './components/PracticeAreas'
import Lawyers from './components/Lawyers'
import Results from './components/Results'
import Fees from './components/Fees'
import About from './components/About'
import Access from './components/Access'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <PracticeAreas />
        <Lawyers />
        <Results />
        <Fees />
        <About />
        <Access />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
