import { useState } from 'react'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('お問い合わせありがとうございます。担当者より折り返しご連絡いたします。')
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiry: '',
      message: ''
    })
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">お問い合わせ</h2>
        <p className="section-subtitle">まずはお気軽にご相談ください</p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">お名前 <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="山田 太郎"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">電話番号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090-1234-5678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inquiry">お問い合わせ種別 <span className="required">*</span></label>
            <select
              id="inquiry"
              name="inquiry"
              value={formData.inquiry}
              onChange={handleChange}
              required
            >
              <option value="">選択してください</option>
              <option value="sedori">せどりコンサルティング</option>
              <option value="china">中国輸入サポート</option>
              <option value="amazon">Amazon FBA構築</option>
              <option value="ebay">eBay輸出コンサル</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">お問い合わせ内容 <span className="required">*</span></label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="ご質問やご相談内容をご記入ください"
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            送信する
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
