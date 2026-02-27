<template>
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-logo">
          <img src="/images/logo.png" alt="NexaPro" class="logo-img" />
        </div>
        <div class="navbar-menu" :class="{ active: mobileMenuOpen }">
          <a href="#home" @click="scrollToSection('home')" class="nav-link"
            >Home</a
          >
          <a href="#about" @click="scrollToSection('about')" class="nav-link"
            >About</a
          >
          <a
            href="#features"
            @click="scrollToSection('features')"
            class="nav-link"
            >Features</a
          >
          <a
            href="#mission"
            @click="scrollToSection('mission')"
            class="nav-link"
            >Mission</a
          >
          <a href="#vision" @click="scrollToSection('vision')" class="nav-link"
            >Vision</a
          >
          <a
            href="#contact"
            @click="scrollToSection('contact')"
            class="nav-link"
            >Contact</a
          >
        </div>
        <div class="navbar-actions">
          <VaButton preset="plain" @click="goToLogin">Login</VaButton>
          <VaButton color="primary" @click="goToSignup">Get Started</VaButton>
        </div>
        <button
          class="mobile-menu-btn"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <VaIcon :name="mobileMenuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Complete Property Management Solutions for
            <span class="highlight">Tanzania Businesses</span>
          </h1>
          <p class="hero-subtitle">
            Manage properties, tenants, and finances effortlessly. Perfect for
            property owners, landlords, and real estate managers ready to scale.
          </p>
          <div class="hero-actions">
            <VaButton size="large" class="btn-primary" @click="goToSignup">
              Start Free Trial Today
            </VaButton>
            <VaButton
              size="large"
              class="btn-secondary"
              @click="scrollToSection('contact')"
            >
              Talk To An Expert
            </VaButton>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <VaIcon name="trending_up" class="stat-icon" />
              <div class="stat-content">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime Reliability</div>
              </div>
            </div>
            <div class="stat-item">
              <VaIcon name="home_work" class="stat-icon" />
              <div class="stat-content">
                <div class="stat-value">5,000+</div>
                <div class="stat-label">Properties Managed</div>
              </div>
            </div>
            <div class="stat-item">
              <VaIcon name="speed" class="stat-icon" />
              <div class="stat-content">
                <div class="stat-value">98.5%</div>
                <div class="stat-label">Collection Rate</div>
              </div>
            </div>
            <div class="stat-item">
              <VaIcon name="support_agent" class="stat-icon" />
              <div class="stat-content">
                <div class="stat-value">24/7</div>
                <div class="stat-label">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave"></div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
      <div class="section-container">
        <h2 class="section-title">About NexaPro</h2>
        <p class="section-subtitle">
          Your trusted partner in property management
        </p>
        <div class="about-content">
          <div class="about-text">
            <p>
              NexaPro is a comprehensive property management solution designed
              to simplify the way you manage your properties, tenants, and
              finances. Built with modern technology and user experience in
              mind, we help property owners and managers save time and increase
              efficiency.
            </p>
            <p>
              Whether you manage a single property or a large portfolio, NexaPro
              provides the tools you need to stay organized, communicate
              effectively with tenants, and keep your finances in order.
            </p>
          </div>
          <div class="about-image">
            <VaIcon name="apartment" size="10rem" color="primary" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="section-container">
        <h2 class="section-title">Powerful Features</h2>
        <p class="section-subtitle">
          Everything you need to manage your properties efficiently
        </p>
        <div class="features-grid">
          <div class="feature-card">
            <VaIcon
              name="home"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>Property Management</h3>
            <p>
              Easily manage multiple properties, units, and locations from one
              dashboard.
            </p>
          </div>
          <div class="feature-card">
            <VaIcon
              name="people"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>Tenant Management</h3>
            <p>
              Keep track of tenant information, leases, and communication
              history.
            </p>
          </div>
          <div class="feature-card">
            <VaIcon
              name="receipt"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>Billing & Invoicing</h3>
            <p>
              Generate bills, track payments, and manage financial records
              effortlessly.
            </p>
          </div>
          <div class="feature-card">
            <VaIcon
              name="payment"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>Payment Processing</h3>
            <p>
              Accept payments via mobile money and track all transactions in
              real-time.
            </p>
          </div>
          <div class="feature-card">
            <VaIcon
              name="notifications"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>SMS Notifications</h3>
            <p>
              Send automated reminders and notifications to tenants via SMS.
            </p>
          </div>
          <div class="feature-card">
            <VaIcon
              name="analytics"
              size="3rem"
              color="primary"
              class="feature-icon"
            />
            <h3>Reports & Analytics</h3>
            <p>
              Get insights into your property performance with detailed reports.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section id="mission" class="mission-section">
      <div class="section-container">
        <div class="mission-content">
          <div class="mission-text">
            <h2 class="section-title">Our Mission</h2>
            <p>
              To empower property owners and managers with innovative technology
              that simplifies property management, enhances tenant
              relationships, and drives business growth. We are committed to
              providing reliable, user-friendly solutions that make property
              management accessible to everyone.
            </p>
            <p>
              We believe that managing properties should be simple, efficient,
              and stress-free. Our mission is to eliminate the complexities of
              property management through automation, smart features, and
              exceptional customer support.
            </p>
          </div>
          <div class="mission-icon">
            <VaIcon name="flag" size="8rem" color="primary" />
          </div>
        </div>
      </div>
    </section>

    <!-- Vision Section -->
    <section id="vision" class="vision-section">
      <div class="section-container">
        <div class="vision-content">
          <div class="vision-icon">
            <VaIcon name="visibility" size="8rem" color="primary" />
          </div>
          <div class="vision-text">
            <h2 class="section-title">Our Vision</h2>
            <p>
              To become the leading property management platform in Africa,
              transforming how properties are managed through technology and
              innovation. We envision a future where every property owner has
              access to professional-grade management tools that were once only
              available to large enterprises.
            </p>
            <p>
              By 2030, we aim to serve over 100,000 properties across Africa,
              helping property owners maximize their returns while providing
              tenants with better living experiences.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
      <div class="section-container">
        <h2 class="section-title">Get In Touch</h2>
        <p class="section-subtitle">
          Have questions? We'd love to hear from you
        </p>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <VaIcon name="email" size="2rem" color="primary" />
              <div>
                <h4>Email</h4>
                <p>support@nexapro.com</p>
              </div>
            </div>
            <div class="contact-item">
              <VaIcon name="phone" size="2rem" color="primary" />
              <div>
                <h4>Phone</h4>
                <p>+255 788 822 289</p>
              </div>
            </div>
            <div class="contact-item">
              <VaIcon name="location_on" size="2rem" color="primary" />
              <div>
                <h4>Address</h4>
                <p>Dar es Salaam, Tanzania</p>
              </div>
            </div>
          </div>
          <div class="contact-form">
            <VaInput v-model="contactForm.name" label="Name" class="mb-4" />
            <VaInput
              v-model="contactForm.email"
              label="Email"
              type="email"
              class="mb-4"
            />
            <VaTextarea
              v-model="contactForm.message"
              label="Message"
              class="mb-4"
              :min-rows="4"
            />
            <VaButton color="primary" @click="submitContact"
              >Send Message</VaButton
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>NexaPro</h4>
            <p>Professional property management made simple.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="footer-section">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div class="footer-section">
            <h4>Follow Us</h4>
            <div class="social-links">
              <VaIcon name="facebook" />
              <VaIcon name="twitter" />
              <VaIcon name="linkedin" />
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 NexaPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";

const router = useRouter();
const { success } = useAppToast();

const mobileMenuOpen = ref(false);
const contactForm = ref({
  name: "",
  email: "",
  message: "",
});

const scrollToSection = (sectionId: string) => {
  mobileMenuOpen.value = false;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const goToLogin = () => {
  router.push({ name: "login" });
};

const goToSignup = () => {
  router.push({ name: "login" });
};

const submitContact = () => {
  if (
    contactForm.value.name &&
    contactForm.value.email &&
    contactForm.value.message
  ) {
    success("Thank you for your message! We will get back to you soon.");
    contactForm.value = { name: "", email: "", message: "" };
  }
};
</script>

<style scoped>
.landing-page {
  width: 100%;
  overflow-x: hidden;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-bottom: 3px solid #4299e1;
}

.navbar-container {
  max-width: 1200px;
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
  height: 40px;
  width: auto;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover {
  color: #4299e1;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #0a3d2c 0%, #0d5940 50%, #0a3d2c 100%);
  color: white;
  padding: 8rem 2rem 8rem;
  margin-top: 70px;
  overflow: hidden;
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 700px;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.highlight {
  color: #48bb78;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.stat-icon {
  color: #48bb78;
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.3;
}

.btn-primary {
  background: #48bb78 !important;
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 8px;
}

.btn-primary:hover {
  background: #38a169 !important;
}

.btn-secondary {
  background: transparent !important;
  border: 2px solid white;
  color: white !important;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 8px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: white;
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
}

/* Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #2d3748;
}

.section-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: #718096;
  margin-bottom: 3rem;
}

/* About Section */
.about-section {
  background: #f7fafc;
}

.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text p {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.about-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Features Section */
.features-section {
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(66, 153, 225, 0.2);
}

.feature-icon {
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

/* Mission Section */
.mission-section {
  background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
  color: white;
}

.mission-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.mission-text p {
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.mission-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mission-section .section-title {
  color: white;
  text-align: left;
}

/* Vision Section */
.vision-section {
  background: #f7fafc;
}

.vision-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: center;
}

.vision-text p {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.vision-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.vision-section .section-title {
  text-align: left;
}

/* Contact Section */
.contact-section {
  background: white;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.contact-item h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.contact-item p {
  color: #718096;
}

.contact-form {
  background: #f7fafc;
  padding: 2rem;
  border-radius: 12px;
}

/* Footer */
.footer {
  background: #2d3748;
  color: white;
  padding: 3rem 2rem 1rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-section p {
  color: #cbd5e0;
  line-height: 1.6;
}

.footer-section a {
  display: block;
  color: #cbd5e0;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #4299e1;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding-top: 1.5rem;
  text-align: center;
  color: #cbd5e0;
}

/* Responsive */
@media (max-width: 768px) {
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

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .about-content,
  .mission-content,
  .vision-content,
  .contact-content {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
