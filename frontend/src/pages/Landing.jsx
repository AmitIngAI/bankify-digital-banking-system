import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Auth.module.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: 'Bank-Grade Security',
      description: '256-bit encryption with multi-factor authentication keeps your money safe 24/7.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      title: 'Instant Transfers',
      description: 'Send money instantly to anyone, anywhere. IMPS, NEFT, RTGS all supported.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      title: 'Smart Cards',
      description: 'Virtual & physical cards with instant blocking, spending limits & rewards.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: 'Easy Loans',
      description: 'Pre-approved personal loans at competitive rates. Get funds in minutes.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
          <polyline points="7.5,19.79 7.5,14.6 3,12"/>
          <polyline points="21,12 16.5,14.6 16.5,19.79"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      title: 'Investment Hub',
      description: 'Mutual funds, fixed deposits, and recurring deposits all in one place.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: '24/7 Support',
      description: 'Round-the-clock customer support via chat, call, or email.'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '₹500Cr+', label: 'Daily Transactions' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.8★', label: 'App Rating' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'Bankify has transformed how I manage my business finances. The instant transfers and detailed analytics are game-changers.'
    },
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Best banking app I have ever used. The UI is clean, transfers are instant, and the security features give me peace of mind.'
    },
    {
      name: 'Amit Patel',
      role: 'Chartered Accountant',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      text: 'As a CA, I recommend Bankify to all my clients. The transaction history and export features are incredibly useful.'
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Navigation */}
      <nav className={`${styles.landingNav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.navLogo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
                <circle cx="12" cy="24" r="3" fill="currentColor"/>
                <path d="M20 22H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 26H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Bankify</span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#testimonials">Reviews</a>
            <a href="#contact">Contact</a>
          </div>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.navLoginBtn}>Login</Link>
            <Link to="/register" className={styles.navRegisterBtn}>Open Account</Link>
          </div>

          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#security" onClick={() => setIsMenuOpen(false)}>Security</a>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Reviews</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <div className={styles.mobileMenuActions}>
            <Link to="/login" className={styles.navLoginBtn}>Login</Link>
            <Link to="/register" className={styles.navRegisterBtn}>Open Account</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={styles.heroBgGradient}></div>
          <div className={styles.heroBgPattern}></div>
        </div>
        
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot}></span>
              Trusted by 10 Million+ Indians
            </div>
            <h1 className={styles.heroTitle}>
              Banking Made
              <span className={styles.heroGradientText}> Simple, Secure</span>
              <br />& Smart
            </h1>
            <p className={styles.heroSubtitle}>
              Experience next-generation digital banking with Bankify. 
              Open a free account in minutes, transfer money instantly, 
              and manage your finances effortlessly.
            </p>
            <div className={styles.heroCTA}>
              <Link to="/register" className={styles.primaryBtn}>
                <span>Open Free Account</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              </Link>
              <a href="#features" className={styles.secondaryBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10,8 16,12 10,16"/>
                </svg>
                <span>Watch Demo</span>
              </a>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.trustLogos}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" alt="UPI" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Rupay-Logo.png/200px-Rupay-Logo.png" alt="RuPay" />
              </div>
              <span>Secured Payment Partners</span>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardInner}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardChip}>
                    <svg viewBox="0 0 50 40" fill="none">
                      <rect x="5" y="5" width="40" height="30" rx="3" fill="#FFD700"/>
                      <rect x="10" y="10" width="10" height="20" rx="1" fill="#DAA520"/>
                      <rect x="22" y="10" width="10" height="20" rx="1" fill="#DAA520"/>
                    </svg>
                  </div>
                  <div className={styles.cardWifi}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                      <line x1="12" y1="20" x2="12.01" y2="20"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.cardNumber}>
                  <span>4532</span>
                  <span>••••</span>
                  <span>••••</span>
                  <span>8956</span>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardHolder}>
                    <span>Card Holder</span>
                    <p>PRIYA SHARMA</p>
                  </div>
                  <div className={styles.cardExpiry}>
                    <span>Expires</span>
                    <p>12/28</p>
                  </div>
                  <div className={styles.cardBrand}>
                    <svg viewBox="0 0 50 30" fill="none">
                      <circle cx="18" cy="15" r="12" fill="#EB001B" fillOpacity="0.9"/>
                      <circle cx="32" cy="15" r="12" fill="#F79E1B" fillOpacity="0.9"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className={`${styles.floatingElement} ${styles.float1}`}>
              <div className={styles.floatingCard}>
                <div className={styles.floatingIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                    <polyline points="17,6 23,6 23,12"/>
                  </svg>
                </div>
                <div className={styles.floatingText}>
                  <span>Monthly Savings</span>
                  <strong>+₹24,500</strong>
                </div>
              </div>
            </div>
            
            <div className={`${styles.floatingElement} ${styles.float2}`}>
              <div className={styles.floatingCard}>
                <div className={styles.floatingIconSuccess}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div className={styles.floatingText}>
                  <span>Transfer Complete</span>
                  <strong>₹15,000</strong>
                </div>
              </div>
            </div>
            
            <div className={`${styles.floatingElement} ${styles.float3}`}>
              <div className={styles.notificationCard}>
                <div className={styles.notifIcon}>🔔</div>
                <div className={styles.notifContent}>
                  <strong>Salary Credited</strong>
                  <span>₹85,000 received</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Features</span>
            <h2 className={styles.sectionTitle}>Everything You Need in One App</h2>
            <p className={styles.sectionSubtitle}>
              From instant transfers to smart investments, Bankify provides all the banking features you need.
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={styles.featureCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className={styles.securitySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.securityContent}>
            <div className={styles.securityText}>
              <span className={styles.sectionTag}>Security First</span>
              <h2 className={styles.sectionTitle}>Your Money, Fully Protected</h2>
              <p className={styles.sectionSubtitle}>
                We use the same security standards as the world's largest banks. Your data and money are protected 24/7.
              </p>
              
              <div className={styles.securityFeatures}>
                <div className={styles.securityFeature}>
                  <div className={styles.securityCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div>
                    <h4>256-bit SSL Encryption</h4>
                    <p>Military-grade encryption for all transactions</p>
                  </div>
                </div>
                <div className={styles.securityFeature}>
                  <div className={styles.securityCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Biometric Authentication</h4>
                    <p>Fingerprint & Face ID for secure access</p>
                  </div>
                </div>
                <div className={styles.securityFeature}>
                  <div className={styles.securityCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Real-time Fraud Detection</h4>
                    <p>AI-powered monitoring blocks suspicious activity</p>
                  </div>
                </div>
                <div className={styles.securityFeature}>
                  <div className={styles.securityCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div>
                    <h4>RBI Regulated</h4>
                    <p>Fully compliant with Reserve Bank of India guidelines</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.securityVisual}>
              <div className={styles.shieldContainer}>
                <div className={styles.shieldOuter}></div>
                <div className={styles.shieldMiddle}></div>
                <div className={styles.shieldInner}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Testimonials</span>
            <h2 className={styles.sectionTitle}>Loved by Millions</h2>
            <p className={styles.sectionSubtitle}>
              See what our customers have to say about their Bankify experience.
            </p>
          </div>
          
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Your Banking Journey?</h2>
            <p>Join 10 million+ Indians who trust Bankify for their daily banking needs.</p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimaryBtn}>
                Open Free Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              </Link>
              <Link to="/login" className={styles.ctaSecondaryBtn}>
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.landingFooter}>
        <div className={styles.footerContainer}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <div className={styles.navLogo}>
                <div className={styles.logoIcon}>
                  <svg viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
                    <circle cx="12" cy="24" r="3" fill="currentColor"/>
                  </svg>
                </div>
                <span>Bankify</span>
              </div>
              <p>Your trusted digital banking partner. Secure, fast, and reliable financial services.</p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg></a>
              </div>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerLinkGroup}>
                <h4>Products</h4>
                <a href="#">Savings Account</a>
                <a href="#">Current Account</a>
                <a href="#">Credit Cards</a>
                <a href="#">Personal Loans</a>
              </div>
              <div className={styles.footerLinkGroup}>
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
                <a href="#">Blog</a>
              </div>
              <div className={styles.footerLinkGroup}>
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQs</a>
                <a href="#">Security</a>
              </div>
              <div className={styles.footerLinkGroup}>
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Bankify. All rights reserved. Licensed by RBI.</p>
            <div className={styles.footerCerts}>
              <span>🔒 SSL Secured</span>
              <span>✓ PCI DSS</span>
              <span>✓ ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;