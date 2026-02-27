<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="landing-navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-container">
        <div class="navbar-logo">
          <img
            src="/images/transparent_longo.png"
            alt="NexaPro"
            class="logo-img"
          />
        </div>
        <div class="navbar-menu" :class="{ active: mobileMenuOpen }">
          <a href="#home" @click="scrollToSection('home')" class="nav-link"
            >Home</a
          >
          <a
            href="#features"
            @click="scrollToSection('features')"
            class="nav-link"
            >Features</a
          >
          <a
            href="#services"
            @click="scrollToSection('services')"
            class="nav-link"
            >Services</a
          >
          <a
            href="#testimonials"
            @click="scrollToSection('testimonials')"
            class="nav-link"
            >Testimonials</a
          >
          <a
            href="#contact"
            @click="scrollToSection('contact')"
            class="nav-link"
            >Contact</a
          >
        </div>
        <div class="navbar-actions">
          <VaButton preset="plain" @click="goToLogin" class="nav-btn-login"
            >Login</VaButton
          >
          <VaButton @click="getStarted" class="nav-btn-signup"
            >Get Started</VaButton
          >
        </div>
        <button
          class="mobile-menu-btn"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <VaIcon :name="mobileMenuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </nav>

    <!-- Hero Section with Video Background -->
    <section id="home" class="hero-section">
      <!-- Video Background Slider -->
      <div class="video-background">
        <video
          v-for="(video, index) in videos"
          :key="index"
          :ref="
            (el) => {
              if (el) videoRefs[index] = el as HTMLVideoElement;
            }
          "
          autoplay
          muted
          loop
          playsinline
          class="hero-video"
          :class="{ active: currentVideoIndex === index }"
        >
          <source :src="video.src" type="video/mp4" />
        </video>
        <div class="video-overlay"></div>

        <!-- Video Navigation -->
        <div class="video-controls">
          <button
            class="video-nav-btn prev"
            @click="previousVideo"
            aria-label="Previous video"
          >
            <VaIcon name="chevron_left" size="2rem" />
          </button>
          <div class="video-dots">
            <button
              v-for="(video, index) in videos"
              :key="index"
              class="video-dot"
              :class="{ active: currentVideoIndex === index }"
              @click="goToVideo(index)"
              :aria-label="`Go to video ${index + 1}`"
            ></button>
          </div>
          <button
            class="video-nav-btn next"
            @click="nextVideo"
            aria-label="Next video"
          >
            <VaIcon name="chevron_right" size="2rem" />
          </button>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content">
        <div class="container">
          <div class="hero-grid">
            <!-- Left Side - Text Content -->
            <div class="hero-text-content">
              <h1 class="hero-title">
                Modern Property<br />
                Management<br />
                <span class="hero-subtitle-inline">Made Simple</span>
              </h1>
              <p class="hero-description">
                Streamline your property operations with intelligent automation,
                real-time insights, and seamless tenant management.
              </p>
              <div class="hero-actions">
                <VaButton @click="getStarted" class="cta-primary">
                  Start Free Trial
                </VaButton>
                <VaButton class="cta-secondary" @click="watchDemo">
                  <VaIcon name="play_circle_outline" size="small" />
                  Watch Demo
                </VaButton>
              </div>
            </div>

            <!-- Right Side - Stats Cards -->
            <div class="hero-stats-side">
              <div class="stat-card">
                <div class="stat-icon">
                  <VaIcon name="home_work" size="2rem" color="#ffffff" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">500+</div>
                  <div class="stat-label">Properties Managed</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <VaIcon name="people" size="2rem" color="#ffffff" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">1,200+</div>
                  <div class="stat-label">Active Tenants</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <VaIcon name="trending_up" size="2rem" color="#ffffff" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">99.8%</div>
                  <div class="stat-label">Uptime SLA</div>
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
        <div class="section-header">
          <h2 class="section-title">Comprehensive Property Management</h2>
          <p class="section-subtitle">
            Everything you need to manage properties efficiently in one platform
          </p>
        </div>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >
            <div class="feature-icon-wrapper">
              <VaIcon :name="feature.icon" size="2rem" color="#0a0a0a" />
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
        <h2 class="section-title">Our Services</h2>
        <div class="services-grid">
          <div
            v-for="service in services"
            :key="service.title"
            class="service-card"
          >
            <VaIcon :name="service.icon" size="4rem" :color="service.color" />
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-description">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Trusted by Property Owners</h2>
          <p class="section-subtitle">See what our clients say about NexaPro</p>
        </div>
        <div class="testimonials-grid">
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="testimonial-card"
          >
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div>
                <div class="author-name">{{ testimonial.name }}</div>
                <div class="author-role">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Clients Section -->
    <section class="clients-section">
      <div class="container">
        <h2 class="section-title">Trusted By Leading Property Owners</h2>
        <div class="clients-grid">
          <div v-for="client in clients" :key="client.name" class="client-card">
            <VaIcon :name="client.icon" size="3rem" color="primary" />
            <div class="client-name">{{ client.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="contact" class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Get Started?</h2>
          <p class="cta-subtitle">
            Join hundreds of property owners managing their properties with
            NexaPro
          </p>
          <div class="cta-actions">
            <VaButton size="large" @click="getStarted" class="cta-primary">
              Start Free Trial
            </VaButton>
            <VaButton size="large" @click="contactSales" class="cta-secondary">
              Contact Sales
            </VaButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Company Info -->
          <div class="footer-column">
            <h3 class="footer-brand">NexaPro</h3>
            <p class="footer-description">
              Modern property management software for landlords and property
              managers. Streamline operations, automate workflows, and grow your
              business.
            </p>
            <div class="footer-social">
              <button class="social-btn" aria-label="Twitter">
                <VaIcon name="fa-brands fa-twitter" size="small" />
              </button>
              <button class="social-btn" aria-label="LinkedIn">
                <VaIcon name="fa-brands fa-linkedin" size="small" />
              </button>
              <button class="social-btn" aria-label="Facebook">
                <VaIcon name="fa-brands fa-facebook" size="small" />
              </button>
            </div>
          </div>

          <!-- Product Links -->
          <div class="footer-column">
            <h4 class="footer-heading">Product</h4>
            <ul class="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#updates">Updates</a></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div class="footer-column">
            <h4 class="footer-heading">Company</h4>
            <ul class="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#press">Press Kit</a></li>
            </ul>
          </div>

          <!-- Support Links -->
          <div class="footer-column">
            <h4 class="footer-heading">Support</h4>
            <ul class="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#status">System Status</a></li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div class="footer-column">
            <h4 class="footer-heading">Legal</h4>
            <ul class="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p class="footer-copyright">2024 NexaPro. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#sitemap">Sitemap</a>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Mobile menu state
const mobileMenuOpen = ref(false);

// Scroll state for navbar
const isScrolled = ref(false);

// Video slider state
const currentVideoIndex = ref(0);
const videoRefs = ref<HTMLVideoElement[]>([]);
let autoSlideInterval: number | null = null;

const videos = [
  { src: "/videos/4696041-uhd_3840_2160_24fps.mp4", name: "City Night 4K" },
  { src: "/videos/1654216-hd_1920_1080_30fps.mp4", name: "City Traffic HD" },
];

const features = [
  {
    icon: "home_work",
    title: "Property Management",
    description: "Manage multiple properties and tenants from one dashboard",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: "receipt_long",
    title: "Automated Billing",
    description: "Generate invoices and track payments automatically",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: "description",
    title: "Digital Contracts",
    description: "Create and manage contracts digitally with e-signatures",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: "analytics",
    title: "Financial Reports",
    description: "Real-time insights into revenue and expenses",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    icon: "sms",
    title: "SMS Reminders",
    description: "Automated rent reminders via SMS to tenants",
    color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    icon: "cloud_upload",
    title: "Cloud Storage",
    description: "Secure storage for documents and images",
    color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  },
];

const services = [
  {
    icon: "apartment",
    title: "Residential Management",
    description: "Complete solution for residential properties",
    color: "#667eea",
  },
  {
    icon: "business",
    title: "Commercial Properties",
    description: "Specialized tools for commercial management",
    color: "#f5576c",
  },
  {
    icon: "support_agent",
    title: "24/7 Support",
    description: "Round-the-clock support for all your needs",
    color: "#4facfe",
  },
];

const testimonials = [
  {
    name: "Maria Garcia",
    role: "Property Owner",
    text: "NexaPro has transformed how I manage my rental units. Highly recommended!",
  },
  {
    name: "John Mwangi",
    role: "Real Estate Manager",
    text: "The best property management software I've used. Complete visibility!",
  },
  {
    name: "Sarah Hassan",
    role: "Landlord",
    text: "Managing properties has never been easier. Worth every penny!",
  },
];

const clients = [
  { name: "Skyline Properties", icon: "domain" },
  { name: "Urban Estates", icon: "location_city" },
  { name: "Prime Realty", icon: "apartment" },
  { name: "Coastal Homes", icon: "home" },
  { name: "Metro Living", icon: "business" },
  { name: "Elite Properties", icon: "villa" },
];

const scrollToSection = (sectionId: string) => {
  mobileMenuOpen.value = false;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const goToLogin = () => router.push("/login");
const getStarted = () => router.push("/register");
const watchDemo = () => console.log("Watch demo");
const contactSales = () => console.log("Contact sales");

// Video slider functions
const nextVideo = () => {
  currentVideoIndex.value = (currentVideoIndex.value + 1) % videos.length;
  playCurrentVideo();
  resetAutoSlide();
};

const previousVideo = () => {
  currentVideoIndex.value =
    currentVideoIndex.value === 0
      ? videos.length - 1
      : currentVideoIndex.value - 1;
  playCurrentVideo();
  resetAutoSlide();
};

const goToVideo = (index: number) => {
  currentVideoIndex.value = index;
  playCurrentVideo();
  resetAutoSlide();
};

const playCurrentVideo = () => {
  videoRefs.value.forEach((video, index) => {
    if (video) {
      if (index === currentVideoIndex.value) {
        video.play().catch(() => {
          console.log("Video autoplay prevented");
        });
      } else {
        video.pause();
      }
    }
  });
};

// Auto-slide functionality
const startAutoSlide = () => {
  autoSlideInterval = window.setInterval(() => {
    nextVideo();
  }, 8000); // Change video every 8 seconds
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};

const resetAutoSlide = () => {
  stopAutoSlide();
  startAutoSlide();
};

// Handle scroll event for navbar
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Ensure video plays on mount and start auto-slide
onMounted(() => {
  playCurrentVideo();
  startAutoSlide();
  window.addEventListener("scroll", handleScroll);
});

// Clean up interval and scroll listener on unmount
onUnmounted(() => {
  stopAutoSlide();
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.home-page {
  width: 100%;
  overflow-x: hidden;
  background: #ffffff;
}

/* Navbar */
.landing-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
  z-index: 1000;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.landing-navbar.scrolled {
  background: var(--va-primary);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-bottom: 3px solid rgba(255, 255, 255, 0.2);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 75px;
  width: auto;
  transition: height 0.3s ease;
}

.landing-navbar.scrolled .logo-img {
  height: 55px;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.7);
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-btn-login {
  color: #ffffff !important;
}

.nav-btn-signup {
  background: #ffffff !important;
  color: #1a1a1a !important;
  font-weight: 700 !important;
  border: 2px solid #ffffff !important;
  padding: 0.5rem 1.5rem !important;
  font-size: 0.9375rem !important;
}

.nav-btn-signup:deep(.va-button__content) {
  color: #1a1a1a !important;
}

.nav-btn-signup:hover {
  background: #f0f0f0 !important;
  color: #000000 !important;
}

.nav-btn-signup:hover:deep(.va-button__content) {
  color: #000000 !important;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #ffffff;
  transition: color 0.3s;
}

/* Hero Section with Video */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #0a0a0a;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  pointer-events: none;
}

.hero-video.active {
  opacity: 1;
  pointer-events: auto;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.5) 0%,
    rgba(20, 20, 30, 0.4) 100%
  );
  z-index: 1;
}

/* Video Controls */
.video-controls {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-nav-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #ffffff;
}

.video-nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.video-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.video-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.video-dot:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.25);
}

.video-dot.active {
  background: #ffffff;
  width: 24px;
  border-radius: 4px;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 8rem 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
}

.hero-text-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-subtitle-inline {
  display: block;
  font-size: 3.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.5rem;
}

.hero-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2.5rem;
  line-height: 1.7;
  font-weight: 300;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-primary {
  background: #2563eb !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 0.625rem 1.5rem !important;
  font-size: 0.875rem !important;
  border-radius: 6px !important;
  letter-spacing: 0.01em !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
  min-height: auto !important;
  height: auto !important;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
  background: #1d4ed8 !important;
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  font-weight: 500 !important;
  padding: 0.625rem 1.5rem !important;
  font-size: 0.875rem !important;
  border-radius: 6px !important;
  letter-spacing: 0.01em !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: auto !important;
  height: auto !important;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  transform: translateY(-2px);
}

/* Stats Cards on Right Side */
.hero-stats-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
  letter-spacing: -0.03em;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

/* Section Styling */
.features-section,
.services-section,
.clients-section {
  padding: 8rem 2rem;
  background: #ffffff;
}

.services-section {
  background: #fafafa;
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 5rem;
}

.section-title {
  font-size: 2.75rem;
  font-weight: 600;
  color: #0a0a0a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #666666;
  line-height: 1.6;
  font-weight: 400;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 3rem;
}

.feature-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: #0a0a0a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0a0a0a;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: #666666;
  line-height: 1.6;
  font-size: 0.9375rem;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  text-align: center;
  transition: all 0.3s ease;
}

.service-card:hover {
  border-color: #0a0a0a;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0a0a0a;
  margin: 1.5rem 0 0.75rem;
}

.service-description {
  color: #666666;
  line-height: 1.6;
  font-size: 0.9375rem;
}

/* Testimonials Section */
.testimonials-section {
  padding: 8rem 2rem;
  background: #fafafa;
}

.testimonials-section .section-title,
.testimonials-section .section-subtitle {
  color: #0a0a0a;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
}

.testimonial-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  border-color: #0a0a0a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #0a0a0a;
  margin-bottom: 2rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
}

.author-name {
  font-weight: 600;
  color: #0a0a0a;
  font-size: 1rem;
}

.author-role {
  font-size: 0.875rem;
  color: #666666;
  margin-top: 0.25rem;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
}

/* Clients Section */
.client-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.client-card:hover {
  border-color: #0a0a0a;
}

.client-name {
  font-weight: 600;
  color: #0a0a0a;
  margin-top: 1rem;
  font-size: 0.9375rem;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem;
  background: #0a0a0a;
  color: #ffffff;
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.cta-subtitle {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

.cta-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  background: #0a0a0a;
  color: #ffffff;
  padding: 4rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.footer-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  max-width: 280px;
}

.footer-social {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.social-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

.footer-heading {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #ffffff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 2rem;
}

.footer-bottom-links a {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive Design */
@media (max-width: 968px) {
  .navbar-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .navbar-menu.active {
    display: flex;
  }

  .navbar-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-stats-side {
    order: -1;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle-inline {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-content {
    padding: 6rem 2rem 10rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .features-grid,
  .services-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .video-controls {
    bottom: 1.5rem;
    gap: 1rem;
  }

  .video-nav-btn {
    width: 40px;
    height: 40px;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .footer-description {
    max-width: 100%;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .footer-bottom-links {
    gap: 1.5rem;
  }
}
</style>
