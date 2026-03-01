<template>
  <div class="home-page light-theme">
    <!-- Navbar -->
    <nav class="landing-navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-container">
        <div class="navbar-logo">
          <img src="/images/transparent_longo.png" alt="NexaPro" class="logo-img" />
          <div class="logo-tagline">
            <span class="tagline-divider"></span>
            <span class="tagline-text">Made Simple</span>
          </div>
        </div>
        <div class="navbar-menu" :class="{ active: mobileMenuOpen }">
          <a v-for="link in navLinks" :key="link.id" :href="'#' + link.id" @click="scrollToSection(link.id)" class="nav-link">
            {{ link.label }}
            <span class="nav-link-underline"></span>
          </a>
        </div>
        <div class="navbar-actions flex items-center">
          <VaButton preset="secondary" @click="goToLogin" class="btn-outlined btn-secondary-outline nav-login-btn">{{ t('home.nav.login') }}</VaButton>
          <VaButton @click="getStarted" class="nav-btn-solid">
            {{ t('home.nav.getStarted') }}
          </VaButton>
        </div>
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <VaIcon :name="mobileMenuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section section-dark">
      <div class="hero-slider-bg">
        <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')"></div>
        <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')"></div>
        <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=2067&auto=format&fit=crop')"></div>
      </div>
      <div class="hero-bg-overlay">
        <div class="hero-dot-pattern"></div>
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>
      </div>

      <div class="hero-content">
        <div class="container hero-grid-main">
          <div class="hero-text-content">
            <h1 class="hero-title hero-visible">
              {{ t('home.hero.title1') }} {{ t('home.hero.title2') }}<br />
               <span class="hero-highlight">{{ t('home.hero.title3') }}</span>
            </h1>
            <p class="hero-description hero-visible">
              {{ t('home.hero.description') }}
            </p>
            <div class="hero-actions">
              <VaButton @click="getStarted" class="hero-btn-solid">
                {{ t('home.hero.startTrial') }}
              </VaButton>
              <VaButton @click="watchDemo" class="hero-btn-solid">
                {{ t('home.hero.watchDemo') }}
              </VaButton>
            </div>
            
            <div class="hero-stats-horizontal">
              <div v-for="stat in heroStats" :key="stat.label" class="h-stat-item">
                <VaIcon :name="stat.icon" size="1.25rem" color="#22c55e" />
                <div class="h-stat-info">
                  <span class="h-stat-num">{{ stat.display }}</span>
                  <span class="h-stat-lbl">{{ stat.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-visual-content hero-visible">
            <div class="hero-image-wrapper">
              <img src="/images/hero_person.png" alt="Nexapro Professional" class="hero-floating-person" />
              <div class="hero-image-glow"></div>
              
              <!-- Hero Language Switcher -->
              <div class="hero-lang-overlay">
                <div class="lang-flag-display">{{ currentLocaleFlag }}</div>
                <div class="lang-buttons">
                  <button @click="changeLanguage('en')" :class="{ active: locale === 'en' }">🇬🇧 English</button>
                  <button @click="changeLanguage('sw')" :class="{ active: locale === 'sw' }">🇹🇿 Kiswahili</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Asymmetric Curved Divider -->
      <div class="section-divider-curved">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 120L1440 120V0C1440 0 1200 120 720 120C240 120 0 0 0 0V120Z" fill="#01160d"/>
        </svg>
      </div>
    </section>

    <!-- Dashboard Showcase Section -->
    <section class="dashboard-showcase-section section-dark">
      <div class="showcase-bg">
        <div class="showcase-gradient-1"></div>
        <div class="showcase-gradient-2"></div>
        <div class="showcase-particles"></div>
      </div>
      <div class="container" style="position:relative;z-index:2">
        <div class="showcase-header">
          <h2 class="showcase-title">A Powerful Dashboard For<br/>Modern <span class="showcase-highlight">Property Management</span></h2>
          <p class="showcase-subtitle">Manage your properties, tenants and revenue with a workspace designed for speed and clarity.</p>
        </div>
        <div class="showcase-mockup">
          <div class="mockup-browser">
            <div class="browser-toolbar">
              <div class="browser-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="browser-url">app.nexapro.co.tz</div>
              <div class="browser-actions">
                <VaIcon name="notifications" size="1rem" color="rgba(255,255,255,0.5)" />
                <div class="browser-avatar">N</div>
              </div>
            </div>
            <div class="browser-content">
              <img src="/images/dasboard_mock.png" alt="NexaPro Dashboard" class="mockup-img" />
            </div>
          </div>
          <div class="mockup-shadow"></div>
        </div>
      </div>
    </section>

    <!-- NexaProperty Features - Automated System Section -->
    <section id="automation" class="automation-section section-light">
      <div class="container" style="max-width: 1300px;">
        <div class="section-header reveal" :class="{ 'reveal-visible': featuresVisible }">
          <span class="section-tag section-tag-gold">🚀 Features</span>
          <h2 class="section-title">Automated Property Management</h2>
          <p class="section-subtitle">Let our 24/7 automated system handle the details while you focus on growing your business!</p>
        </div>

        <!-- 24/7 Schedule Auto System -->
        <div class="automation-grid">
          <!-- Left: Schedule -->
          <div class="auto-schedule-panel reveal" :class="{ 'reveal-visible': featuresVisible }">
            <div class="panel-header">
              <VaIcon name="update" size="large" color="#f59e0b" class="mr-2" />
              <h3 class="panel-title">24/7 Smart Automation Schedule</h3>
            </div>
            <p class="panel-desc">We never miss anything. Here's exactly what our system does for you every single day.</p>
            
            <div class="schedule-timeline">
              <div class="timeline-item">
                <div class="time-badge">8:00 AM</div>
                <div class="time-content">
                  <div class="time-title">🏠 Contract Expiration Check</div>
                  <div class="time-desc"><strong>Finds contracts expiring in exactly 7 days</strong> and sends SMS alerts to both owners and tenants.</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="time-badge">9:00 AM</div>
                <div class="time-content">
                  <div class="time-title">💰 Rent Reminders</div>
                  <div class="time-desc"><strong>Sends rent reminders</strong> 7 days before due date AND on due date to prevent late payments.</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="time-badge">12:00 AM <small>(1st)</small></div>
                <div class="time-content">
                  <div class="time-title">📊 Monthly Bill Generation</div>
                  <div class="time-desc"><strong>Creates monthly bills</strong> automatically for all active tenancies.</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="time-badge">1:00 AM</div>
                <div class="time-content">
                  <div class="time-title">⚠️ Overdue Bill Tracking</div>
                  <div class="time-desc"><strong>Marks overdue bills</strong> and updates payment status.</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="time-badge">2:00 AM</div>
                <div class="time-content">
                  <div class="time-title">✅ Contract Auto-Complete</div>
                  <div class="time-desc"><strong>Auto-closes expired contracts</strong> and updates unit availability.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Key Features & Benefits -->
          <div class="auto-benefits-panel">
            <div class="benefit-card reveal" :class="{ 'reveal-visible': featuresVisible }" style="transition-delay: 0.1s;">
              <div class="benefit-icon bg-blue"><VaIcon name="sms" color="#ffffff" /></div>
              <div class="benefit-content">
                <h4 class="benefit-title">Smart SMS Notifications</h4>
                <p class="benefit-text">Automatic 7-day warnings for contract expirations and clear rent reminders to prevent delays.</p>
                <div class="sms-preview">
                  <span class="sms-tag">Sample Alert</span>
                  "CONTRACT EXPIRES IN 7 DAYS: John Doe at Sunrise Apartment expires on 07/03. Final bill: TZS 50,000."
                </div>
              </div>
            </div>
            
            <div class="benefit-card reveal" :class="{ 'reveal-visible': featuresVisible }" style="transition-delay: 0.2s;">
              <div class="benefit-icon bg-green"><VaIcon name="payments" color="#ffffff" /></div>
              <div class="benefit-content">
                <h4 class="benefit-title">"Set it and forget it" Billing</h4>
                <p class="benefit-text">Monthly bills created automatically on the 1st. Overdue tracking and instant payment confirmations.</p>
              </div>
            </div>

            <div class="benefit-card reveal" :class="{ 'reveal-visible': featuresVisible }" style="transition-delay: 0.3s;">
              <div class="benefit-icon bg-purple"><VaIcon name="trending_up" color="#ffffff" /></div>
              <div class="benefit-content">
                <h4 class="benefit-title">Business Impact</h4>
                <ul class="impact-list">
                  <li><VaIcon name="check_circle" size="small" color="#22c55e" /> Prevent contract lapses & revenue loss</li>
                  <li><VaIcon name="check_circle" size="small" color="#22c55e" /> Save 20+ hours per month on manual tasks</li>
                  <li><VaIcon name="check_circle" size="small" color="#22c55e" /> Scalable 24/7 coverage without extra staff</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Features Section -->

    <section id="features" class="features-section section-dark">
      <div class="container">
        <div class="section-header reveal" :class="{ 'reveal-visible': featuresVisible }">
          <span class="section-tag">{{ t('home.sections.features') }}</span>
          <h2 class="section-title">{{ t('home.sections.featuresTitle') }}</h2>
          <p class="section-subtitle">{{ t('home.sections.featuresSubtitle') }}</p>
        </div>
        <div class="features-grid">
          <div v-for="(feature, i) in features" :key="feature.title" class="feature-card reveal"
            :class="{ 'reveal-visible': featuresVisible }" :style="{ transitionDelay: i * 0.1 + 's' }">
            <div class="feature-icon-wrapper" :style="{ background: feature.color }">
              <VaIcon :name="feature.icon" size="1.75rem" color="#ffffff" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services-section section-light">
      <div class="container">
        <div class="section-header reveal" :class="{ 'reveal-visible': servicesVisible }">
          <span class="section-tag">{{ t('home.sections.services') }}</span>
          <h2 class="section-title">{{ t('home.sections.servicesTitle') }}</h2>
        </div>
        <div class="services-grid">
          <div v-for="(service, i) in services" :key="service.title" class="service-card reveal"
            :class="{ 'reveal-visible': servicesVisible }" :style="{ transitionDelay: i * 0.12 + 's' }">
            <div class="service-icon-wrap">
              <VaIcon :name="service.icon" size="3rem" :color="service.color" />
            </div>
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-description">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="testimonials-section section-dark">
      <div class="container">
        <div class="section-header reveal" :class="{ 'reveal-visible': testimonialsVisible }">
          <span class="section-tag">{{ t('home.sections.testimonials') }}</span>
          <h2 class="section-title">{{ t('home.sections.testimonialsTitle') }}</h2>
          <p class="section-subtitle">{{ t('home.sections.testimonialsSubtitle') }}</p>
        </div>
        <div class="testimonials-grid">
          <div v-for="(t, i) in testimonials" :key="t.name" class="testimonial-card reveal"
            :class="{ 'reveal-visible': testimonialsVisible }" :style="{ transitionDelay: i * 0.12 + 's' }">
            <div class="testimonial-stars">
              <VaIcon v-for="s in 5" :key="s" name="star" size="small" color="#f59e0b" />
            </div>
            <p class="testimonial-text">"{{ t.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.name.charAt(0) }}</div>
              <div>
                <div class="author-name">{{ t.name }}</div>
                <div class="author-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Clients Marquee Section -->
    <section class="clients-section section-light">
      <div class="container">
        <div class="section-header reveal" :class="{ 'reveal-visible': clientsVisible }">
          <span class="section-tag">{{ t('home.sections.partners') }}</span>
          <h2 class="section-title">{{ t('home.sections.partnersTitle') }}</h2>
        </div>
        <div class="marquee-wrap">
          <div class="marquee-track">
            <div v-for="client in [...clients, ...clients]" :key="client.name + Math.random()" class="client-card">
              <VaIcon :name="client.icon" size="2.5rem" color="primary" />
              <div class="client-name">{{ client.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="contact" class="cta-section section-dark">
      <div class="cta-bg-gradient"></div>
      <div class="container" style="position:relative;z-index:2">
        <div class="cta-content reveal" :class="{ 'reveal-visible': ctaVisible }">
          <h2 class="cta-title">{{ t('home.cta.title') }}</h2>
          <p class="cta-subtitle">{{ t('home.cta.subtitle') }}</p>
          <div class="cta-actions">
            <VaButton preset="secondary" size="large" @click="getStarted" class="btn-outlined btn-primary-outline cta-primary-glow">{{ t('home.cta.startFile') }}</VaButton>
            <VaButton preset="secondary" size="large" @click="contactSales" class="btn-outlined btn-secondary-outline">{{ t('home.cta.contactSales') }}</VaButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-gradient-line"></div>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-column">
            <h3 class="footer-brand">NexaPro</h3>
            <p class="footer-description">{{ t('home.footer.description') }}</p>
            <div class="footer-social">
              <button v-for="icon in ['fa-brands fa-twitter','fa-brands fa-linkedin','fa-brands fa-facebook']" :key="icon" class="social-btn">
                <VaIcon :name="icon" size="small" />
              </button>
            </div>
          </div>
          <div v-for="col in footerCols" :key="col.title" class="footer-column">
            <h4 class="footer-heading">{{ col.title }}</h4>
            <ul class="footer-links">
              <li v-for="link in col.links" :key="link"><a :href="'#' + link.toLowerCase().replace(/\s/g,'')">{{ link }}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">{{ t('home.footer.copyright') }}</p>
          <div class="footer-bottom-links">
            <a href="#sitemap">{{ t('home.footer.sitemap') }}</a>
            <a href="#accessibility">{{ t('home.footer.accessibility') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale as setGlobalLocale, type Locale } from "@/i18n";

const router = useRouter();
const { t, tm, locale } = useI18n({ useScope: 'global' });

const currentLocaleFlag = computed(() => locale.value === 'sw' ? '🇹🇿' : '🇬🇧');
const changeLanguage = (lang: string) => setGlobalLocale(lang as Locale);

const mobileMenuOpen = ref(false);
const isScrolled = ref(false);
const statsValues = reactive({
  properties: "0+",
  tenants: "0+",
  uptime: "0%"
});

const heroStats = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { label: t('home.stats.properties'), display: statsValues.properties, target: 500, icon: "home_work" },
    { label: t('home.stats.tenants'), display: statsValues.tenants, target: 1200, icon: "people" },
    { label: t('home.stats.uptime'), display: statsValues.uptime, target: 99.8, icon: "trending_up" },
  ];
});

// Section visibility for scroll reveals
const featuresVisible = ref(false);
const servicesVisible = ref(false);
const testimonialsVisible = ref(false);
const clientsVisible = ref(false);
const ctaVisible = ref(false);

const navLinks = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { id: "home", label: t('home.nav.home', 'Home') },
    { id: "features", label: t('home.nav.features') },
    { id: "services", label: t('home.nav.services') },
    { id: "testimonials", label: t('home.nav.testimonials') },
    { id: "contact", label: t('home.nav.contact') },
  ];
});

const features = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { icon: "home_work", title: t('home.featureList.propTitle'), description: t('home.featureList.propDesc'), color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { icon: "receipt_long", title: t('home.featureList.billTitle'), description: t('home.featureList.billDesc'), color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { icon: "description", title: t('home.featureList.contractTitle'), description: t('home.featureList.contractDesc'), color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { icon: "analytics", title: t('home.featureList.reportTitle'), description: t('home.featureList.reportDesc'), color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { icon: "sms", title: t('home.featureList.smsTitle'), description: t('home.featureList.smsDesc'), color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { icon: "cloud_upload", title: t('home.featureList.cloudTitle'), description: t('home.featureList.cloudDesc'), color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  ];
});

const services = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { icon: "apartment", title: t('home.serviceList.resTitle'), description: t('home.serviceList.resDesc'), color: "#667eea" },
    { icon: "business", title: t('home.serviceList.comTitle'), description: t('home.serviceList.comDesc'), color: "#f5576c" },
    { icon: "support_agent", title: t('home.serviceList.supTitle'), description: t('home.serviceList.supDesc'), color: "#4facfe" },
  ];
});

const testimonials = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { name: "Maria Garcia", role: t('home.testimonialList.roleOwner'), text: t('home.testimonialList.t1') },
    { name: "John Mwangi", role: t('home.testimonialList.roleManager'), text: t('home.testimonialList.t2') },
    { name: "Sarah Hassan", role: t('home.testimonialList.roleLandlord'), text: t('home.testimonialList.t3') },
  ];
});

const clients = [
  { name: "Skyline Properties", icon: "domain" },
  { name: "Urban Estates", icon: "location_city" },
  { name: "Prime Realty", icon: "apartment" },
  { name: "Coastal Homes", icon: "home" },
  { name: "Metro Living", icon: "business" },
  { name: "Elite Properties", icon: "villa" },
];

const footerCols = computed(() => [
  { title: t('home.footer.col1Title'), links: tm('home.footer.col1Links') as string[] },
  { title: t('home.footer.col2Title'), links: tm('home.footer.col2Links') as string[] },
  { title: t('home.footer.col3Title'), links: tm('home.footer.col3Links') as string[] },
  { title: t('home.footer.col4Title'), links: tm('home.footer.col4Links') as string[] },
]);

// Navigation
const scrollToSection = (id: string) => { mobileMenuOpen.value = false; document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
const goToLogin = () => router.push("/login");
const getStarted = () => router.push("/register");
const watchDemo = () => console.log("Watch demo");
const contactSales = () => console.log("Contact sales");

// Count-up animation
const animateCountUp = () => {
  const duration = 2000;
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    statsValues.properties = Math.floor(ease * 500) + "+";
    statsValues.tenants = Math.floor(ease * 1200).toLocaleString() + "+";
    statsValues.uptime = (ease * 99.8).toFixed(1) + "%";
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// Scroll observer
const handleScroll = () => { isScrolled.value = window.scrollY > 50; };
let observer: IntersectionObserver | null = null;

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  animateCountUp();

  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        if (id === "features") featuresVisible.value = true;
        else if (id === "services") servicesVisible.value = true;
        else if (id === "testimonials") testimonialsVisible.value = true;
        else if (id === "contact") ctaVisible.value = true;
        else if (e.target.classList.contains("clients-section")) clientsVisible.value = true;
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll("#features, #services, #testimonials, #contact, .clients-section").forEach((el) => observer!.observe(el));
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  observer?.disconnect();
});
</script>

<style scoped>
/* ═══════════════════════ TOKENS ═══════════════════════ */
.home-page {
  --c-bg: #021a0f;
  --c-bg-alt: #032517;
  --c-bg-2: #011c10;
  --c-bg-3: #04301e;
  --c-surface: rgba(255,255,255,0.04);
  --c-border: rgba(255,255,255,0.08);
  --c-text: #e2e8f0;
  --c-text-muted: #94a3b8;
  --c-accent: #22c55e;
  --c-accent2: #10b981;
  --grad-card: linear-gradient(135deg, rgba(34, 197, 94, .08), rgba(16, 185, 129, .05));
  --radius: 16px;
  --ease: cubic-bezier(.4,0,.2,1);
  --section-padding: 8rem 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  width: 100%; overflow-x: hidden; background: var(--c-bg); color: var(--c-text);
  transition: background 0.3s var(--ease), color 0.3s var(--ease);
}

.home-page.light-theme {
  --c-bg: #ffffff;
  --c-bg-alt: #f8fafc;
  --c-surface: rgba(0,0,0,0.02);
  --c-border: rgba(0,0,0,0.06);
  --c-text: #0f172a;
  --c-text-muted: #64748b;
  --grad-card: linear-gradient(135deg, rgba(34, 197, 94, .04), rgba(16, 185, 129, .02));
}

/* ═══════════════════════ THEMES ═══════════════════════ */
.section-light {
  background: #f8fafc !important;
  color: #0f172a !important;
  position: relative;
  z-index: 2;
  padding-top: 6rem;
}
.section-light .section-title, .section-light .feature-title, 
.section-light .service-title, .section-light .author-name, .section-light .cta-title {
  color: #0f172a !important;
}
.section-light .section-subtitle, .section-light .feature-description, 
.section-light .service-description, .section-light .author-role, .section-light .cta-subtitle {
  color: #475569 !important;
}
.section-light .container { max-width: 1300px; }
/* Wave at top of light sections (dark → light transition) */
.section-light::before {
  content: '';
  position: absolute;
  top: -79px;
  left: 0;
  width: 100%;
  height: 80px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' preserveAspectRatio='none'%3E%3Cpath d='M0 80L0 35C240 58 500 20 720 48C950 70 1200 15 1440 45L1440 80Z' fill='%23f8fafc'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 3;
}



.section-dark {
  background: #01160d !important;
  color: #fff;
  position: relative;
  z-index: 2;
  padding-top: 5rem;
}

/* Wave at the top of each dark section (light → dark transition) */
.section-dark::before {
  content: '';
  position: absolute;
  top: -79px;
  left: 0;
  width: 100%;
  height: 80px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' preserveAspectRatio='none'%3E%3Cpath d='M0 80L0 45C180 10 400 70 720 48C1000 26 1250 58 1440 35L1440 80Z' fill='%2301160d'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 3;
}

/* Do not apply wave before to hero-direct dashboard showcase (first dark after hero has the SVG divider already) */
.hero-section + .section-dark::before {
  display: none;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 10rem 8%;
  background-color: #f8fafc;
  z-index: 1; /* Lowest */
}

.home-page.light-theme .section-title,
.home-page.light-theme .feature-title,
.home-page.light-theme .service-title,
.home-page.light-theme .author-name,
.home-page.light-theme .cta-title {
  color: #0f172a;
}



/* ─── Light-theme hero overrides ─── */
.home-page.light-theme .video-overlay {
  background: none;
}

.home-page.light-theme .hero-badge {
  background: rgba(34, 197, 94, .1);
  border-color: rgba(34, 197, 94, .3);
  color: #15803d;
}

.home-page.light-theme .hero-divider {
  background: linear-gradient(90deg, #22c55e, rgba(34,197,94,.15));
}

.home-page.light-theme .hero-trust-row .trust-item {
  color: #475569;
}

.home-page.light-theme .stat-number {
  color: #0f172a;
}

.home-page.light-theme .stat-label {
  color: #475569;
}

.home-page.light-theme .stat-card {
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(34,197,94,0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  border-radius: 24px;
}

.home-page.light-theme .stat-card:hover {
  background: rgba(255,255,255,.8);
  border-color: rgba(34,197,94,.2);
  box-shadow: 0 8px 32px rgba(0,0,0,.1);
}

.home-page.light-theme .cta-secondary {
  background: rgba(0,0,0,.04) !important;
  color: #0f172a !important;
  border-color: rgba(0,0,0,.12) !important;
}

.home-page.light-theme .cta-secondary:hover {
  background: rgba(0,0,0,.08) !important;
  border-color: rgba(0,0,0,.2) !important;
}

/* ═══════════════════════ BUTTONS (OUTLINED SMALL) ═════════════ */
.btn-outlined {
  background: transparent !important;
  border-radius: 50px !important;
  font-size: 0.85rem !important;
  padding: 0.4rem 1.25rem !important;
  font-weight: 500 !important;
  transition: all 0.3s var(--ease) !important;
  text-transform: none !important;
}

.btn-primary-outline {
  color: #22c55e !important;
  border: 1px solid rgba(34, 197, 94, 0.4) !important;
}
.btn-primary-outline:hover {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: #22c55e !important;
}

.btn-secondary-outline {
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}
.btn-secondary-outline:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}

.section-light .btn-secondary-outline {
  color: #475569 !important;
  border-color: rgba(0,0,0,0.15) !important;
}
.section-light .btn-secondary-outline:hover {
  background: rgba(0,0,0,0.03) !important;
  border-color: rgba(0,0,0,0.4) !important;
}

/* ═══════════════════════ REVEAL ═══════════════════════ */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
.reveal-visible { opacity: 1;  transform: translateY(10px); }

/* ═══════════════════════ CONTAINERS ═══════════════════════ */
.container {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ═══════════════════════ AUTOMATION SECTION ═══════════════════════ */
.automation-section {
  padding: var(--section-padding);
  background: var(--c-bg-alt);
  position: relative;
  overflow: hidden;
}
.section-tag-gold {
  background: rgba(245, 158, 11, 0.1) !important;
  color: #f59e0b !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
}
.automation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 3rem;
  align-items: flex-start;
}

/* Schedule Panel */
.auto-schedule-panel {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
}
.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}
.panel-desc {
  color: var(--c-text-muted);
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  line-height: 1.5;
}

/* Timeline */
.schedule-timeline {
  position: relative;
  padding-left: 2rem;
}
.schedule-timeline::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #f59e0b, #eab308, rgba(234, 179, 8, 0.1));
  border-radius: 2px;
}
.timeline-item {
  position: relative;
  margin-bottom: 2.25rem;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -2.35rem; top: 0.25rem;
  width: 14px; height: 14px;
  background: var(--c-bg);
  border: 3px solid #f59e0b;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
}
.time-badge {
  display: inline-block;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
  margin-bottom: 0.75rem;
}
.time-content {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--c-border);
  padding: 1.25rem;
  border-radius: 12px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.time-content:hover {
  transform: translateX(5px);
  background: rgba(255,255,255,0.04);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.time-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--c-text);
  margin-bottom: 0.4rem;
}
.time-desc {
  font-size: 0.9rem;
  color: var(--c-text-muted);
  line-height: 1.5;
}
.time-desc strong {
  color: var(--c-accent3);
}

/* Benefits Panel */
.auto-benefits-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.benefit-card {
  display: flex;
  gap: 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  padding: 2rem;
  border-radius: 20px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}
.benefit-icon {
  width: 60px; height: 60px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bg-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.bg-green { background: linear-gradient(135deg, #10b981, #059669); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.benefit-content {
  flex: 1;
}
.benefit-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 0.5rem 0;
}
.benefit-text {
  font-size: 0.95rem;
  color: var(--c-text-muted);
  line-height: 1.5;
  margin: 0;
}

/* Details */
.sms-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--c-text);
  font-style: italic;
  position: relative;
}
.sms-tag {
  position: absolute;
  top: -10px; left: 1rem;
  background: #3b82f6;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-style: normal;
}
.impact-list {
  list-style: none;
  padding: 0; margin: 1rem 0 0 0;
}
.impact-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--c-text);
  font-weight: 500;
}

/* Light Theme Adjustments */
.home-page.light-theme .auto-schedule-panel,
.home-page.light-theme .benefit-card {
  background: #ffffff;
  border-color: rgba(0,0,0,0.05);
  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
}
.home-page.light-theme .time-content {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.home-page.light-theme .time-content:hover {
  background: #ffffff;
}
.home-page.light-theme .sms-preview {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #334155;
}

@media (max-width: 900px) {
  .automation-grid {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════ SERVICES ═══════════════════════ */
.landing-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #022c22; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); transition: all .4s var(--ease); border-bottom: 1px solid rgba(255,255,255,0.1); }
.navbar-container { max-width: 1400px; margin: 0 auto; padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.navbar-logo { display: flex; align-items: center; gap: 1rem; }
.logo-img { height: 60px; transition: height .3s var(--ease); }

.logo-tagline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.tagline-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
}
.tagline-text {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
}

.navbar-menu { display: flex; gap: 2.25rem; align-items: center; }
.nav-link { 
  color: #ffffff !important; 
  text-decoration: none; 
  font-weight: 700; 
  font-size: .95rem; 
  transition: all .3s; 
  position: relative; 
  cursor: pointer; 
}
.nav-link-underline { position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #22c55e; border-radius: 1px; transition: width .3s var(--ease); }
.nav-link:hover { opacity: 0.7; }
.nav-link:hover .nav-link-underline { width: 100%; }
.navbar-actions { display: flex; gap: 1rem; align-items: center; }
/* Navbar Buttons */
.nav-btn-login, .nav-btn-signup {
  /* Inherit from global outlined classes */
}
.mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: .5rem; color: #fff; }

/* ═══════════════════════ HERO ═══════════════════════ */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 10rem 8%;
  background-color: #f8fafc;
  z-index: 1;
}

/* Background Slider */
.hero-slider-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}
.hero-slider-bg .slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  animation: heroSlideFade 18s infinite;
}
.hero-slider-bg .slide:nth-child(1) { animation-delay: 0s; }
.hero-slider-bg .slide:nth-child(2) { animation-delay: 6s; }
.hero-slider-bg .slide:nth-child(3) { animation-delay: 12s; }

@keyframes heroSlideFade {
  0% { opacity: 0; transform: scale(1.05); }
  10% { opacity: 1; transform: scale(1.03); }
  33% { opacity: 1; transform: scale(1); }
  43% { opacity: 0; transform: scale(0.98); }
  100% { opacity: 0; transform: scale(0.98); }
}

.hero-bg-overlay { 
  position: absolute; 
  inset: 0; 
  z-index: 2; 
  background: linear-gradient(to right, rgba(1, 22, 13, 1) 0%, rgba(1, 22, 13, 0.95) 30%, rgba(1, 22, 13, 0.6) 70%, rgba(1, 22, 13, 0.1) 100%);
}

.hero-dot-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(34, 197, 94, 0.1) 1.5px, transparent 1.5px);
  background-size: 40px 40px;
  opacity: 0.8;
  z-index: 3;
}
.hero-glow-1 {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
  filter: blur(100px);
  z-index: 3;
}
.hero-glow-2 {
  position: absolute;
  bottom: 0%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 3;
}

.hero-grid-main {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr; /* Slightly shift balance to text */
  align-items: center;
  gap: 6rem; /* Increased gap for "all clear spaces" */
  position: relative;
  z-index: 5;
  width: 100%;
}

@media (max-width: 1024px) {
  .hero-section.dark-hero {
    padding: 8rem 5% 6rem;
  }
  .hero-grid-main {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 5rem;
  }
}

.hero-text-content { max-width: 900px; }

.hero-title {
  font-size: 5rem;
  font-weight: 850;
  color: #022c22;
  line-height: 1;
  letter-spacing: -.04em;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 10;
}
.section-dark .hero-title { color: #fff; }

@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
}
.hero-highlight {
  color: #22c55e;
  background: linear-gradient(120deg, #22c55e 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.hero-description {
  font-size: 1.45rem;
  color: #1e293b; /* Darker Slate for maximum readability */
  max-width: 680px;
  margin: 0 0 3.5rem;
  line-height: 1.6;
  font-weight: 600; /* Increased weight */
  position: relative;
  z-index: 10;
}
.section-dark .hero-description { color: #f1f5f9; }

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-start;
  margin-bottom: 5rem;
}

.hero-btn-solid {
  background-color: #22c55e !important;
  color: #01160d !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
  padding: 1rem 2.5rem !important;
  border-radius: 50px !important;
  transition: all 0.4s var(--ease) !important;
  border: none !important;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3) !important;
  text-transform: none !important;
  letter-spacing: -0.01em;
}
.hero-btn-solid:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 40px rgba(34, 197, 94, 0.5) !important;
  background-color: #26d265 !important;
}

.nav-btn-solid {
  background-color: #22c55e !important;
  color: #01160d !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  padding: 0.6rem 1.8rem !important;
  border-radius: 50px !important;
  transition: all 0.3s var(--ease) !important;
  border: none !important;
  text-transform: none !important;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}
.nav-btn-solid:hover {
  background-color: #26d265 !important;
  transform: translateY(-1px);
}

.nav-login-btn {
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  font-weight: 700 !important;
}
.nav-login-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
}

/* Divider Styles */
.section-divider-curved {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 10;
  line-height: 0;
}
.section-divider-curved svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 1024px) {
  .hero-actions {
    justify-content: center;
  }
  .hero-description {
    margin: 0 auto 3.5rem;
  }
}
/* Global Button Styling - Strictly Outlined & Small */
.btn-outlined {
  transition: all 0.3s var(--ease) !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important; /* Slightly larger */
  padding: 0.65rem 1.8rem !important;
  border-radius: 50px !important;
  text-transform: none !important;
  border: 2px solid currentColor !important;
  background: rgba(255, 255, 255, 0.12) !important; /* More visible backdrop */
  backdrop-filter: blur(12px) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1); /* Subtle shadow for text clarity */
  min-height: 0 !important;
  height: auto !important;
  line-height: normal !important;
}

.btn-primary-outline {
  color: #22c55e !important;
  border-color: #22c55e !important;
}
.btn-primary-outline:hover {
  background: rgba(34, 197, 94, 0.1) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}

.btn-secondary-outline {
  color: #334155 !important;
  border-color: rgba(51, 65, 85, 0.5) !important;
}
.section-dark .btn-secondary-outline {
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
.btn-secondary-outline:hover {
  background: rgba(100, 116, 139, 0.1) !important;
  border-color: #64748b !important;
  transform: translateY(-2px);
}
.section-dark .btn-secondary-outline:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: #ffffff !important;
}

.hero-stats-horizontal {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 3.5rem;
  width: 100%;
}

@media (max-width: 1024px) {
  .hero-stats-horizontal {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Visual Content */
.hero-visual-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 550px; /* Slightly wider to accommodate flag */
}

/* Hero Language Overlay */
.hero-lang-overlay {
  position: absolute;
  top: 5%;
  right: -5%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  width: 48px;
  height: 48px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.hero-lang-overlay:hover {
  width: 200px;
  border-radius: 24px;
  padding: 0.5rem 1rem;
  background: rgba(30, 35, 40, 0.8);
}

.lang-flag-display {
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  margin-left: 0;
  transition: all 0.3s ease;
}

.hero-lang-overlay:hover .lang-flag-display {
  display: none;
}

.lang-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  opacity: 0;
  width: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.hero-lang-overlay:hover .lang-buttons {
  opacity: 1;
  width: 100%;
  pointer-events: auto;
}

.lang-buttons button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  text-align: left;
  transition: all 0.2s ease;
  font-weight: 500;
}

.lang-buttons button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.lang-buttons button.active {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.hero-floating-person {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 50px rgba(0,0,0,0.5));
  animation: floatPerson 6s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.hero-image-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 1;
}

@keyframes floatPerson {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.h-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.h-stat-info { display: flex; flex-direction: column; align-items: flex-start; }
.h-stat-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: #022c22;
  line-height: 1.1;
}
.section-dark .h-stat-num { color: #fff; }
.h-stat-lbl {
  font-size: .85rem;
  color: #64748b;
  font-weight: 500;
}
.section-dark .h-stat-lbl { color: rgba(255,255,255,0.5); }

.hero-badge {
  background: rgba(34, 197, 94, .1);
  border: 1px solid rgba(34, 197, 94, .2);
  border-radius: 50px;
  padding: .4rem 1.1rem;
  font-size: .78rem;
  font-weight: 600;
  color: #86efac;
  margin-bottom: 1.75rem;
  letter-spacing: .04em;
  text-transform: uppercase;
}
/* Title */
.hero-title.hero-visible { opacity: 1; transform: translateY(0); }
.hero-gradient-text {
  color: #22c55e;
  display: inline-block;
  padding-bottom: 0.05em;
}

/* Descriptions and old hero styles removed */

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════ DASHBOARD SHOWCASE ═══════════════════════ */
.dashboard-showcase-section {
  position: relative;
  padding: 6rem 1rem 12rem;
  background: #020d02;
  overflow: hidden;
}
.showcase-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.showcase-gradient-1 {
  position: absolute;
  top: -200px;
  right: -100px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(34,197,94,.12) 0%, transparent 70%);
  filter: blur(80px);
  animation: float 12s ease-in-out infinite;
}
.showcase-gradient-2 {
  position: absolute;
  bottom: 0;
  left: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(16,185,129,.08) 0%, transparent 70%);
  filter: blur(60px);
  animation: float 15s ease-in-out infinite reverse;
}
.showcase-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}
.showcase-header {
  text-align: center;
  margin-bottom: 4rem;
}
.showcase-title {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -.03em;
  margin-bottom: 1.25rem;
}
.showcase-highlight {
  color: #22c55e;
}
.showcase-subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.7);
  max-width: 550px;
  margin: 0 auto;
  line-height: 1.7;
}
.showcase-mockup {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}
.mockup-browser {
  background: #0a0f1a;
  border-radius: 16px;
  overflow: hidden;
  border: 4px solid #166534;
  box-shadow:
    0 25px 80px rgba(0,0,0,.8),
    0 0 0 1px rgba(34, 197, 94, .3);
}
.browser-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem 1.25rem;
  background: #0d1117;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.browser-dots {
  display: flex;
  gap: 6px;
}
.browser-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }
.browser-url {
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.5);
  font-size: .75rem;
  padding: .35rem 1.5rem;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: .02em;
}
.browser-actions {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.browser-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--grad-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: .7rem;
  font-weight: 700;
}
.browser-content {
  position: relative;
}
.mockup-img {
  width: 100%;
  display: block;
}
.mockup-shadow {
  position: absolute;
  bottom: -40px;
  left: 5%;
  right: 5%;
  height: 80px;
  background: rgba(34,197,94,.08);
  filter: blur(40px);
  border-radius: 50%;
}
.showcase-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  z-index: 1;
}
.showcase-wave svg {
  width: 100%;
  height: 120px;
  display: block;
}

/* Dashboard Showcase specific light theme overrides removed to maintain dark green design */


/* ═══════════════════════ SECTIONS ═══════════════════════ */
.section-tag {
  display: inline-block;
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  font-size: .78rem;
  font-weight: 700;
  padding: .35rem 1rem;
  border-radius: 50px;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.section-dark .section-tag {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.3);
}
.section-light .section-tag {
  background: rgba(2, 44, 34, 0.08);
  color: #166534;
  border-color: rgba(2, 44, 34, 0.2);
}
.section-header { text-align: center; max-width: 700px; margin: 0 auto 4.5rem; }

/* Section titles adapt to background */
.section-title {
  font-size: 2.75rem;
  font-weight: 700;
  color: #0f172a; /* Default dark for light sections */
  margin-bottom: 1rem;
  letter-spacing: -.02em;
}
.section-dark .section-title { color: #ffffff; }
.section-subtitle {
  font-size: 1.1rem;
  color: #475569;
  line-height: 1.7;
}
.section-dark .section-subtitle { color: rgba(255,255,255,0.6); }

/* Features Section */
.features-section { padding: var(--section-padding); background: var(--c-bg); position: relative; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.feature-card { background: var(--grad-card); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 2.25rem; transition: all .4s var(--ease); position: relative; overflow: hidden; }
.feature-card::before { content: ''; position: absolute; inset: 0; border-radius: var(--radius); background: linear-gradient(135deg, rgba(34,197,94,.1), transparent 60%); opacity: 0; transition: opacity .4s; }
.feature-card:hover { border-color: rgba(34,197,94,.25); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.3); }
.feature-card:hover::before { opacity: 1; }
.feature-icon-wrapper { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; position: relative; z-index: 1; }
.feature-title { font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: .5rem; position: relative; z-index: 1; }
.feature-description { color: rgba(255,255,255,0.6); line-height: 1.65; font-size: .9rem; position: relative; z-index: 1; }

/* Services - light section, needs dark text */
.services-section { padding: var(--section-padding); background: var(--c-bg-alt); }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.service-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: var(--radius); padding: 2.5rem; text-align: center; transition: all .4s var(--ease); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.service-card:hover { border-color: rgba(34,197,94,.2); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.08); }
.service-icon-wrap { margin-bottom: 1.5rem; }
.service-title { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: .5rem; }
.service-description { color: #475569; line-height: 1.65; font-size: .9rem; }

/* Testimonials - dark section */
.testimonials-section { padding: var(--section-padding); background: var(--c-bg); }
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.testimonial-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); padding: 2.25rem; transition: all .4s var(--ease); }
.testimonial-card:hover { border-color: rgba(34,197,94,.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.3); }
.testimonial-stars { display: flex; gap: .15rem; margin-bottom: 1rem; }
.testimonial-text { font-size: 1.05rem; line-height: 1.75; color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: .75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.1); }
.author-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: .9rem; flex-shrink: 0; }
.author-name { font-weight: 600; color: #fff; font-size: .95rem; }
.author-role { font-size: .8rem; color: rgba(255,255,255,0.5); margin-top: .15rem; }

/* Clients Marquee */
.clients-section { padding: var(--section-padding); background: var(--c-bg-alt); overflow: hidden; }
.marquee-wrap { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
.marquee-track { display: flex; gap: 2rem; animation: marquee 25s linear infinite; width: max-content; }
.client-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 1.5rem 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem; min-width: 180px; transition: all .3s var(--ease); flex-shrink: 0; }
.client-card:hover { border-color: rgba(99,102,241,.2); }
.client-name { font-weight: 600; color: var(--c-text-muted); font-size: .85rem; }

/* CTA */
.cta-section { padding: var(--section-padding); position: relative; overflow: hidden; background: var(--c-bg); }
.cta-bg-gradient { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(34, 197, 94, .15) 0%, transparent 70%); animation: gradientPulse 6s ease-in-out infinite; }
.cta-content { text-align: center; max-width: 700px; margin: 0 auto; }
.cta-title { font-size: 3rem; font-weight: 700; margin-bottom: 1.25rem; letter-spacing: -.02em; color: #fff; }
.cta-subtitle { font-size: 1.2rem; margin-bottom: 2.5rem; color: var(--c-text-muted); font-weight: 400; }
.cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.cta-primary-glow { box-shadow: 0 0 40px rgba(34, 197, 94, .4) !important; }

/* Footer */
.footer { background: var(--c-bg-alt); color: var(--c-text); padding: 0 2rem 2rem; position: relative; }
.footer-gradient-line { height: 3px; background: var(--grad-accent); margin-bottom: 3.5rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 2.5rem; margin-bottom: 3rem; }
.footer-column { display: flex; flex-direction: column; gap: .75rem; }
.footer-brand { font-size: 1.5rem; font-weight: 800; background: var(--grad-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: .25rem; }
.footer-description { font-size: .85rem; line-height: 1.65; color: var(--c-text-muted); max-width: 280px; }
.footer-social { display: flex; gap: .5rem; margin-top: .5rem; }
.social-btn { width: 36px; height: 36px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--c-text-muted); cursor: pointer; transition: all .3s var(--ease); }
.social-btn:hover { background: rgba(99,102,241,.15); border-color: rgba(99,102,241,.3); color: #fff; transform: translateY(-2px); }
.footer-heading { font-size: .8rem; font-weight: 600; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .5rem; }
.footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .6rem; }
.footer-links a { font-size: .875rem; color: var(--c-text-muted); text-decoration: none; transition: color .3s; }
.footer-links a:hover { color: #fff; }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--c-border); }
.footer-copyright { font-size: .8rem; color: rgba(255,255,255,.4); margin: 0; }
.footer-bottom-links { display: flex; gap: 1.5rem; }
.footer-bottom-links a { font-size: .8rem; color: rgba(255,255,255,.4); text-decoration: none; transition: color .3s; }
.footer-bottom-links a:hover { color: rgba(255,255,255,.7); }

/* ═══════════════════════ KEYFRAMES ═══════════════════════ */
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes gradientPulse { 0%,100% { opacity: .6; } 50% { opacity: 1; } }

/* ═══════════════════════ RESPONSIVE ═══════════════════════ */
@media (max-width: 968px) {
  .navbar-menu { position: fixed; top: 70px; left: 0; right: 0; background: rgba(5,8,22,.97); backdrop-filter: blur(20px); flex-direction: column; padding: 2rem; gap: 1.25rem; display: none; border-bottom: 1px solid var(--c-border); }
  .navbar-menu.active { display: flex; }
  .navbar-actions { display: none; }
  .mobile-menu-btn { display: block; }
  .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero-stats-side { order: -1; flex-direction: row; flex-wrap: wrap; gap: .75rem; }
  .stat-card { flex: 1; min-width: 140px; padding: 1rem 1.25rem; }
  .hero-title { font-size: 2.5rem; }
  .hero-content { padding: 7rem 1.5rem 6rem; }
  .stat-number { font-size: 1.5rem; }
  .hero-trust-row { gap: 1rem; }
  .trust-item { font-size: .75rem; }
  .section-title { font-size: 2rem; }
  .cta-title { font-size: 2rem; }
  .features-grid, .services-grid, .testimonials-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-description { max-width: 100%; }
  .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
}
</style>
