import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LiveChatWidget from '../components/LiveChatWidget'

function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactPage, setContactPage] = useState(defaultContactPage)
  const publicApiBase = useMemo(
    () => import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api',
    [],
  )
  const menuItems = [
    { id: 'about-us', label: 'About', href: '/#about-us' },
    { id: 'big-agent-plan', label: 'Big Agent Plan', href: 'https://agents.stars777.org/' },
    { id: 'contact', label: 'Contact', href: '/contact' },
    {
      id: 'questions',
      label: 'Questions',
      dropdown: true,
      items: [
        { id: 'how-to-play', label: 'How to Play', href: '/#how-to-play' },
        { id: 'blog', label: 'Blog', href: '/blog' },
        { id: 'faq', label: 'FAQ', href: '/#faq' },
        { id: 'reviews', label: 'Reviews', href: '/#reviews' },
      ],
    },
  ]

  useEffect(() => {
    let isMounted = true

    const fetchContactPage = async () => {
      try {
        const response = await fetch(`${publicApiBase}/site-settings`)

        if (!response.ok) {
          return
        }

        const settings = await response.json()
        if (isMounted && settings?.contactPage) {
          setContactPage({ ...defaultContactPage, ...settings.contactPage })
        }
      } catch {
        // Keep the built-in contact copy if settings cannot load.
      }
    }

    fetchContactPage()

    return () => {
      isMounted = false
    }
  }, [publicApiBase])

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    setContactStatus({ type: '', message: '' })

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      firstName: String(formData.get('firstName') || ''),
      lastName: String(formData.get('lastName') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${publicApiBase}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('contact_submit_failed')
      }

      const result = await response.json()
      setContactStatus({
        type: 'success',
        message:
          result.message ||
          'Email sent, Escalated to a support specialist. You can expect a response.',
      })
      form.reset()
    } catch {
      setContactStatus({
        type: 'error',
        message: 'We could not send your message right now. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="site-shell">
      <Header
        menuItems={menuItems}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        variant="public"
        actionButton={{ href: 'https://stars777.in/apk/7d4145943d5d4e0d9dc17ceb572ab567.apk', label: 'Download App' }}
      />

      <main>
        <section id="contact" className="section-block contact-section contact-page-section">
          <div className="contact-main-grid">
            <div className="contact-form-column">
              <h2>{contactPage.title}</h2>
              <p className="lead-copy">
                {contactPage.intro}
              </p>

              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="contact-form-row">
                  <label>
                    <span>First Name *</span>
                    <input name="firstName" type="text" placeholder="First Name" required />
                  </label>
                  <label>
                    <span>Last Name *</span>
                    <input name="lastName" type="text" placeholder="Last Name" required />
                  </label>
                </div>
                <label>
                  <span>Email *</span>
                  <input name="email" type="email" placeholder="Email" required />
                </label>
                <label>
                  <span>Description *</span>
                  <textarea name="message" placeholder="Message" rows={3} required />
                </label>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
                {contactStatus.message ? (
                  <p className={`contact-form-status contact-form-status--${contactStatus.type}`}>
                    {contactStatus.message}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="contact-info-column">
              <article className="contact-info-card contact-info-card--highlight">
                <span className="contact-info-icon">A</span>
                <div>
                  <h3>Address</h3>
                  <p>{contactPage.address}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-icon">P</span>
                <div>
                  <h3>Contact</h3>
                  <p>{contactPage.phoneText}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-icon">E</span>
                <div>
                  <h3>Email</h3>
                  <p>{contactPage.emailText}</p>
                </div>
              </article>
              <article className="contact-info-card">
                <span className="contact-info-icon">H</span>
                <div>
                  <h3>Working Hours</h3>
                  <p>{contactPage.workingHours}</p>
                </div>
              </article>
            </div>
          </div>

          <div className="contact-support-grid">
            {[
              ['Press', contactPage.pressCopy],
              ['Help & Supports', contactPage.supportCopy],
              ['Sales', contactPage.salesCopy],
            ].map(([title, copy]) => (
              <article className="contact-support-card" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
                <a href="mailto:pagedone1234@gmail.com">Contact Us</a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  )
}

const defaultContactPage = {
  title: 'Contact Us',
  intro:
    'We are deeply committed to delivering unparalleled service and unwavering support to ensure your experience exceeds expectations.',
  address: '3680 Schamberger Pass, North Catarina 01894-8381',
  phoneText: 'Talk to us and see how we can work 1800-14-0147',
  emailText: "We're usually replying within 24 hours pagedone1234@gmail.com",
  workingHours: 'Mon To Sat - 10 am To 7 pm Sunday - 11am To 5 pm',
  pressCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
  supportCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
  salesCopy:
    'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
}

export default ContactPage
