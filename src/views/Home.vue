<template>
  <div class="home-page light-theme">
    <!-- Navbar -->
    <nav class="landing-navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-container">
        <div class="navbar-logo">
          <img src="/images/transparent_longo.png" alt="NexaPro" class="logo-img" />
        </div>
        <div class="navbar-menu" :class="{ active: mobileMenuOpen }">
          <a v-for="link in navLinks" :key="link.id" :href="'#' + link.id" @click="scrollToSection(link.id)" class="nav-link">
            {{ link.label }}
            <span class="nav-link-underline"></span>
          </a>
        </div>
        <div class="navbar-actions flex items-center">
          <LanguageSwitcher class="mr-4" />
          <VaButton preset="plain" @click="goToLogin" class="nav-btn-login">{{ t('home.nav.login') }}</VaButton>
          <VaButton @click="getStarted" class="nav-btn-signup">
            {{ t('home.nav.getStarted') }}
            <span class="btn-glow"></span>
          </VaButton>
        </div>
        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <VaIcon :name="mobileMenuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
      <div class="video-background">
        <video v-for="(video, index) in videos" :key="index"
          :ref="(el) => { if (el) videoRefs[index] = el as HTMLVideoElement; }"
          autoplay muted loop playsinline class="hero-video" :class="{ active: currentVideoIndex === index }">
          <source :src="video.src" type="video/mp4" />
        </video>
        <div class="video-overlay"></div>
        <div class="video-controls">
          <button class="video-nav-btn" @click="previousVideo"><VaIcon name="chevron_left" size="1.5rem" /></button>
          <div class="video-dots">
            <button v-for="(v, i) in videos" :key="i" class="video-dot" :class="{ active: currentVideoIndex === i }" @click="goToVideo(i)"></button>
          </div>
          <button class="video-nav-btn" @click="nextVideo"><VaIcon name="chevron_right" size="1.5rem" /></button>
        </div>
      </div>

      <!-- Floating accents -->
      <div class="hero-accent hero-accent-1"></div>
      <div class="hero-accent hero-accent-2"></div>

      <div class="hero-content">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-text-content" :class="{ 'reveal-visible': true }">
              <div class="hero-badge">
                <span class="badge-dot"></span>
                {{ t('home.hero.badge') }}
              </div>
              <h1 class="hero-title hero-visible">
                {{ t('home.hero.title1') }}<br />{{ t('home.hero.title2') }}<br />
                <span class="hero-gradient-text">{{ t('home.hero.title3') }}</span>
              </h1>
              <p class="hero-description hero-visible">
                {{ t('home.hero.description') }}
              </p>
              <div class="hero-actions">
                <VaButton @click="getStarted" class="cta-primary">
                  {{ t('home.hero.startTrial') }}
                  <VaIcon name="arrow_forward" size="small" />
                </VaButton>
                <VaButton class="cta-secondary" @click="watchDemo">
                  <VaIcon name="play_circle" size="small" />
                  {{ t('home.hero.watchDemo') }}
                </VaButton>
              </div>
            </div>
            <div class="hero-stats-side">
              <div v-for="stat in heroStats" :key="stat.label" class="stat-card">
                <div class="stat-icon-wrap">
                  <VaIcon :name="stat.icon" size="1.75rem" color="#ffffff" />
                </div>
                <div class="stat-content">
                  <div class="stat-number" :data-target="stat.target">{{ stat.display }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
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
    <section id="services" class="services-section">
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
    <section id="testimonials" class="testimonials-section">
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
    <section class="clients-section">
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
    <section id="contact" class="cta-section">
      <div class="cta-bg-gradient"></div>
      <div class="container" style="position:relative;z-index:2">
        <div class="cta-content reveal" :class="{ 'reveal-visible': ctaVisible }">
          <h2 class="cta-title">{{ t('home.cta.title') }}</h2>
          <p class="cta-subtitle">{{ t('home.cta.subtitle') }}</p>
          <div class="cta-actions">
            <VaButton size="large" @click="getStarted" class="cta-primary cta-primary-glow">{{ t('home.cta.startFile') }}</VaButton>
            <VaButton size="large" @click="contactSales" class="cta-secondary">{{ t('home.cta.contactSales') }}</VaButton>
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
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

const router = useRouter();
const { t, tm, locale } = useI18n({ useScope: 'global' });

const mobileMenuOpen = ref(false);
const isScrolled = ref(false);
const currentVideoIndex = ref(0);
const videoRefs = ref<HTMLVideoElement[]>([]);
let autoSlideInterval: number | null = null;

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

const videos = [
  { src: "/videos/4696041-uhd_3840_2160_24fps.mp4", name: "City Night 4K" },
  { src: "/videos/1654216-hd_1920_1080_30fps.mp4", name: "City Traffic HD" },
];

const statsValues = reactive({ properties: "0+", tenants: "0+", uptime: "0%" });
const heroStats = computed(() => {
  locale.value; // Explicitly track locale changes
  return [
    { icon: "home_work", target: 500, display: statsValues.properties, label: t('home.stats.properties') },
    { icon: "people", target: 1200, display: statsValues.tenants, label: t('home.stats.tenants') },
    { icon: "trending_up", target: 99.8, display: statsValues.uptime, label: t('home.stats.uptime') },
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

const scrollToSection = (id: string) => { mobileMenuOpen.value = false; document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
const goToLogin = () => router.push("/login");
const getStarted = () => router.push("/register");
const watchDemo = () => console.log("Watch demo");
const contactSales = () => console.log("Contact sales");

// Video controls
const nextVideo = () => { currentVideoIndex.value = (currentVideoIndex.value + 1) % videos.length; playCurrentVideo(); resetAutoSlide(); };
const previousVideo = () => { currentVideoIndex.value = currentVideoIndex.value === 0 ? videos.length - 1 : currentVideoIndex.value - 1; playCurrentVideo(); resetAutoSlide(); };
const goToVideo = (i: number) => { currentVideoIndex.value = i; playCurrentVideo(); resetAutoSlide(); };
const playCurrentVideo = () => { videoRefs.value.forEach((v, i) => { if (v) { i === currentVideoIndex.value ? v.play().catch(() => {}) : v.pause(); } }); };
const startAutoSlide = () => { autoSlideInterval = window.setInterval(nextVideo, 8000); };
const stopAutoSlide = () => { if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null; } };
const resetAutoSlide = () => { stopAutoSlide(); startAutoSlide(); };

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
  playCurrentVideo();
  startAutoSlide();
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
  stopAutoSlide();
  window.removeEventListener("scroll", handleScroll);
  observer?.disconnect();
});
</script>

<style scoped>
/* ═══════════════════════ TOKENS ═══════════════════════ */
.home-page {
  --c-bg: #050816;
  --c-bg-alt: #0a0f24;
  --c-surface: rgba(255,255,255,0.04);
  --c-border: rgba(255,255,255,0.08);
  --c-text: #e2e8f0;
  --c-text-muted: #94a3b8;
  --c-accent: #22c55e;
  --c-accent2: #10b981;
  --c-accent3: #34d399;
  --grad-accent: linear-gradient(135deg, #22c55e, #10b981, #34d399);
  --grad-card: linear-gradient(135deg, rgba(34, 197, 94, .08), rgba(16, 185, 129, .05));
  --radius: 16px;
  --ease: cubic-bezier(.4,0,.2,1);
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

.home-page.light-theme .hero-title,
.home-page.light-theme .section-title,
.home-page.light-theme .feature-title,
.home-page.light-theme .service-title,
.home-page.light-theme .author-name,
.home-page.light-theme .cta-title {
  color: #0f172a;
}

.home-page.light-theme .nav-link {
  color: #64748b;
}

.home-page.light-theme .nav-link:hover {
  color: #0f172a;
}

.home-page.light-theme .landing-navbar.scrolled {
  background: rgba(255,255,255,0.9);
}

.home-page.light-theme .video-overlay {
  background: linear-gradient(135deg, rgba(255,255,255,.85) 0%, rgba(248,250,252,.7) 50%, rgba(255,255,255,.85) 100%);
}

.home-page.light-theme .hero-title {
  color: #0f172a;
  text-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.home-page.light-theme .hero-description {
  color: #334155;
  font-weight: 500;
}

/* ═══════════════════════ REVEAL ═══════════════════════ */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
.reveal-visible { opacity: 1; transform: translateY(0); }

/* ═══════════════════════ NAVBAR ═══════════════════════ */
.landing-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: transparent; transition: all .4s var(--ease); border-bottom: 1px solid transparent; }
.landing-navbar.scrolled { background: rgba(5,8,22,.85); backdrop-filter: blur(20px) saturate(1.5); border-bottom-color: var(--c-border); }
.navbar-container { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.navbar-logo { display: flex; align-items: center; }
.logo-img { height: 70px; transition: height .3s var(--ease); }
.landing-navbar.scrolled .logo-img { height: 50px; }
.navbar-menu { display: flex; gap: 2.25rem; align-items: center; }
.nav-link { color: rgba(255,255,255,.75); text-decoration: none; font-weight: 500; font-size: .9rem; transition: color .3s; position: relative; cursor: pointer; }
.nav-link-underline { position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: var(--grad-accent); border-radius: 1px; transition: width .3s var(--ease); }
.nav-link:hover { color: #fff; }
.nav-link:hover .nav-link-underline { width: 100%; }
.navbar-actions { display: flex; gap: 1rem; align-items: center; }
.nav-btn-login { color: rgba(255,255,255,.8) !important; font-weight: 500 !important; }
.nav-btn-login:hover { color: #fff !important; }
.nav-btn-signup { position: relative; background: var(--c-accent) !important; color: #fff !important; font-weight: 600 !important; padding: .5rem 1.5rem !important; border: none !important; border-radius: 10px !important; overflow: hidden; }
.btn-glow { position: absolute; inset: -2px; background: var(--grad-accent); border-radius: inherit; z-index: -1; opacity: .5; filter: blur(8px); transition: opacity .3s; }
.nav-btn-signup:hover .btn-glow { opacity: .8; }
.mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: .5rem; color: #fff; }

/* ═══════════════════════ HERO ═══════════════════════ */
.hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; background: var(--c-bg); }
.video-background { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.hero-video { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; transform: translate(-50%,-50%); object-fit: cover; opacity: 0; transition: opacity 1.2s ease-in-out; pointer-events: none; }
.hero-video.active { opacity: 1; }
.video-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(5,8,22,.75) 0%, rgba(10,15,36,.6) 50%, rgba(5,8,22,.8) 100%); z-index: 1; }

.hero-accent { position: absolute; border-radius: 50%; filter: blur(120px); opacity: .15; z-index: 1; pointer-events: none; }
.hero-accent-1 { width: 600px; height: 600px; background: #22c55e; top: -200px; right: -100px; animation: float 8s ease-in-out infinite; }
.hero-accent-2 { width: 400px; height: 400px; background: #34d399; bottom: -100px; left: -50px; animation: float 10s ease-in-out infinite reverse; }

.video-controls { position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; align-items: center; gap: 1rem; background: rgba(0,0,0,.35); backdrop-filter: blur(16px); padding: .6rem 1.25rem; border-radius: 50px; border: 1px solid var(--c-border); }
.video-nav-btn { width: 36px; height: 36px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .3s var(--ease); color: #fff; }
.video-nav-btn:hover { background: rgba(255,255,255,.18); transform: scale(1.1); }
.video-dots { display: flex; gap: .4rem; }
.video-dot { width: 8px; height: 8px; background: rgba(255,255,255,.35); border: none; border-radius: 50%; cursor: pointer; transition: all .3s var(--ease); padding: 0; }
.video-dot:hover { background: rgba(255,255,255,.6); }
.video-dot.active { background: var(--c-accent); width: 28px; border-radius: 4px; box-shadow: 0 0 12px rgba(99,102,241,.5); }

.hero-content { position: relative; z-index: 2; width: 100%; padding: 8rem 2rem 6rem; }
.container { max-width: 1400px; margin: 0 auto; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.hero-text-content { max-width: 640px; }

.hero-badge { display: inline-flex; align-items: center; gap: .5rem; background: rgba(34, 197, 94, .12); border: 1px solid rgba(34, 197, 94, .25); border-radius: 50px; padding: .4rem 1rem; font-size: .8rem; font-weight: 500; color: #86efac; margin-bottom: 2rem; letter-spacing: .02em; }
.badge-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }

.hero-title { font-size: 4rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem; line-height: 1.08; letter-spacing: -.03em; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.hero-title.hero-visible { opacity: 1; transform: translateY(0); }
.hero-gradient-text { background: var(--grad-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; padding-bottom: 0.1em; }
.hero-description { font-size: 1.15rem; color: var(--c-text-muted); margin-bottom: 2.5rem; line-height: 1.75; font-weight: 400; max-width: 520px; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s; }
.hero-description.hero-visible { opacity: 1; transform: translateY(0); }

.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.cta-primary { background: var(--c-accent) !important; color: #fff !important; border: none !important; font-weight: 600 !important; padding: .75rem 1.75rem !important; font-size: .9rem !important; border-radius: 12px !important; transition: all .3s var(--ease) !important; box-shadow: 0 4px 20px rgba(34, 197, 94, .35) !important; display: inline-flex !important; align-items: center !important; gap: .5rem !important; }
.cta-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px rgba(34, 197, 94, .5) !important; background: #16a34a !important; }
.cta-secondary { background: rgba(255,255,255,.06) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.15) !important; font-weight: 500 !important; padding: .75rem 1.75rem !important; font-size: .9rem !important; border-radius: 12px !important; backdrop-filter: blur(10px) !important; transition: all .3s var(--ease) !important; display: inline-flex !important; align-items: center !important; gap: .5rem !important; }
.cta-secondary:hover { background: rgba(255,255,255,.12) !important; border-color: rgba(255,255,255,.3) !important; transform: translateY(-2px) !important; }

/* Stats */
.hero-stats-side { display: flex; flex-direction: column; gap: 1.25rem; }
.stat-card { background: rgba(255,255,255,.05); backdrop-filter: blur(24px); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 1.75rem; display: flex; align-items: center; gap: 1.25rem; transition: all .4s var(--ease); }
.stat-card:hover { background: rgba(99,102,241,.08); border-color: rgba(99,102,241,.2); transform: translateX(8px); box-shadow: 0 8px 32px rgba(99,102,241,.1); }
.stat-icon-wrap { width: 52px; height: 52px; background: var(--grad-accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-number { font-size: 2.25rem; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -.03em; }
.stat-label { font-size: .85rem; color: var(--c-text-muted); margin-top: .25rem; }

/* ═══════════════════════ SECTIONS ═══════════════════════ */
.section-tag { display: inline-block; background: rgba(99,102,241,.1); color: var(--c-accent); font-size: .75rem; font-weight: 600; padding: .35rem 1rem; border-radius: 50px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 1rem; border: 1px solid rgba(99,102,241,.2); }
.section-header { text-align: center; max-width: 700px; margin: 0 auto 4.5rem; }
.section-title { font-size: 2.75rem; font-weight: 700; color: #fff; margin-bottom: 1rem; letter-spacing: -.02em; }
.section-subtitle { font-size: 1.1rem; color: var(--c-text-muted); line-height: 1.7; }

/* Features */
.features-section { padding: 7rem 2rem; background: var(--c-bg); }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.feature-card { background: var(--grad-card); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 2.25rem; transition: all .4s var(--ease); position: relative; overflow: hidden; }
.feature-card::before { content: ''; position: absolute; inset: 0; border-radius: var(--radius); background: linear-gradient(135deg, rgba(99,102,241,.1), transparent 60%); opacity: 0; transition: opacity .4s; }
.feature-card:hover { border-color: rgba(99,102,241,.25); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.3); }
.feature-card:hover::before { opacity: 1; }
.feature-icon-wrapper { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; position: relative; z-index: 1; }
.feature-title { font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: .5rem; position: relative; z-index: 1; }
.feature-description { color: var(--c-text-muted); line-height: 1.65; font-size: .9rem; position: relative; z-index: 1; }

/* Services */
.services-section { padding: 7rem 2rem; background: var(--c-bg-alt); }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.service-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 2.5rem; text-align: center; transition: all .4s var(--ease); }
.service-card:hover { border-color: rgba(99,102,241,.2); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.25); }
.service-icon-wrap { margin-bottom: 1.5rem; }
.service-title { font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: .5rem; }
.service-description { color: var(--c-text-muted); line-height: 1.65; font-size: .9rem; }

/* Testimonials */
.testimonials-section { padding: 7rem 2rem; background: var(--c-bg); }
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.testimonial-card { background: var(--grad-card); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 2.25rem; transition: all .4s var(--ease); }
.testimonial-card:hover { border-color: rgba(99,102,241,.2); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.25); }
.testimonial-stars { display: flex; gap: .15rem; margin-bottom: 1rem; }
.testimonial-text { font-size: 1.05rem; line-height: 1.75; color: var(--c-text); margin-bottom: 1.5rem; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: .75rem; padding-top: 1.25rem; border-top: 1px solid var(--c-border); }
.author-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--grad-accent); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: .9rem; flex-shrink: 0; }
.author-name { font-weight: 600; color: #fff; font-size: .95rem; }
.author-role { font-size: .8rem; color: var(--c-text-muted); margin-top: .15rem; }

/* Clients Marquee */
.clients-section { padding: 5rem 2rem; background: var(--c-bg-alt); overflow: hidden; }
.marquee-wrap { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
.marquee-track { display: flex; gap: 2rem; animation: marquee 25s linear infinite; width: max-content; }
.client-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 1.5rem 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem; min-width: 180px; transition: all .3s var(--ease); flex-shrink: 0; }
.client-card:hover { border-color: rgba(99,102,241,.2); }
.client-name { font-weight: 600; color: var(--c-text-muted); font-size: .85rem; }

/* CTA */
.cta-section { padding: 8rem 2rem; position: relative; overflow: hidden; background: var(--c-bg); }
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
  .hero-grid { grid-template-columns: 1fr; gap: 3rem; }
  .hero-stats-side { order: -1; }
  .hero-title { font-size: 2.75rem; }
  .hero-content { padding: 7rem 1.5rem 8rem; }
  .stat-number { font-size: 1.75rem; }
  .section-title { font-size: 2rem; }
  .cta-title { font-size: 2rem; }
  .features-grid, .services-grid, .testimonials-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer-description { max-width: 100%; }
  .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
}
</style>
