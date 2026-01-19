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
    alert('お問い合わせを受け付けました。担当者より折り返しご連絡いたします。')
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
        <p className="section-subtitle">お気軽にご相談ください</p>

        <div className="contact-info-cards">
          <div className="contact-card">
            <h3>お電話でのお問い合わせ</h3>
            <p className="contact-phone">03-1234-5678</p>
            <p className="contact-hours">平日 9:00〜18:00</p>
          </div>
          <div className="contact-card">
            <h3>メールでのお問い合わせ</h3>
            <p className="contact-email">info@careerlink.jp</p>
            <p className="contact-hours">24時間受付</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3 className="form-title">お問い合わせフォーム</h3>

          <div className="form-group">
            <label htmlFor="name">お名前 <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
              <option value="job">お仕事のご相談</option>
              <option value="register">派遣登録について</option>
              <option value="company">企業様からのお問い合わせ</option>
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
