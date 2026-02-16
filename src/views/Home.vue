<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-image"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="container hero-container">
          <div class="hero-text-content">
            <h1 class="hero-title">
              Manage Your Properties with
              <span class="gradient-text">Confidence</span>
            </h1>
            <p class="hero-subtitle">
              NexaPro is the complete property management solution for modern
              landlords.
            </p>
            <div class="hero-actions">
              <VaButton size="large" @click="getStarted" class="cta-button">
                Get Started Free
              </VaButton>
              <VaButton size="large" preset="secondary" @click="watchDemo">
                <VaIcon name="play_circle" class="mr-2" />
                Watch Demo
              </VaButton>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Properties</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">1,200+</div>
                <div class="stat-label">Tenants</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">99.8%</div>
                <div class="stat-label">Uptime</div>
              </div>
            </div>
          </div>
          <div class="hero-image-container">
            <img
              src="/images/nexapro_hero.png"
              alt="NexaPro Dashboard"
              class="hero-right-image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Everything You Need</h2>
        <p class="section-subtitle">
          Powerful features for property management
        </p>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >
            <div class="feature-icon" :style="{ background: feature.color }">
              <VaIcon :name="feature.icon" size="large" color="#ffffff" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section">
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
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">What Our Clients Say</h2>
        <div class="testimonials-grid">
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="testimonial-card"
          >
            <div class="testimonial-rating">
              <VaIcon
                v-for="i in 5"
                :key="i"
                name="star"
                color="warning"
                size="small"
              />
            </div>
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <VaIcon name="person" size="large" />
              </div>
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
    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Ready to Transform Your Property Management?</h2>
        <p class="cta-subtitle">
          Join hundreds of property owners who trust NexaPro
        </p>
        <div class="cta-actions">
          <VaButton size="large" @click="getStarted">Start Free Trial</VaButton>
          <VaButton size="large" preset="secondary" @click="contactSales"
            >Contact Sales</VaButton
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

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

const getStarted = () => router.push("/register");
const watchDemo = () => console.log("Watch demo");
const contactSales = () => console.log("Contact sales");
</script>

<style scoped>
.home-page {
  width: 100%;
  overflow-x: hidden;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #1a202c;
}

.hero-bg-image {
  position: absolute;
  inset: 0;
  background: url("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop")
    center/cover no-repeat;
  z-index: 0;
  animation: kenburns 20s ease-in-out infinite alternate;
}

@keyframes kenburns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.5) 0%,
    rgba(118, 75, 162, 0.6) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-text-content {
  max-width: 600px;
}

.hero-image-container {
  position: relative;
  z-index: 2;
}

.hero-right-image {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: floatImage 6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes floatImage {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.02);
  }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.gradient-text {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.cta-button {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4) !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease !important;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6) !important;
}

.demo-button {
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2) !important;
}

.hero-stats {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: fit-content;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.hero-animation {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  height: 60%;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  padding: 0 2rem 2rem;
}

.building {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px 8px 0 0;
  animation: buildingFloat 3s ease-in-out infinite;
}

.building-1 {
  width: 60px;
  height: 200px;
  animation-delay: 0s;
}
.building-2 {
  width: 80px;
  height: 280px;
  animation-delay: 0.5s;
}
.building-3 {
  width: 70px;
  height: 320px;
  animation-delay: 1s;
}
.building-4 {
  width: 90px;
  height: 240px;
  animation-delay: 1.5s;
}
.building-5 {
  width: 65px;
  height: 180px;
  animation-delay: 2s;
}

@keyframes buildingFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.features-section,
.services-section,
.clients-section {
  padding: 6rem 2rem;
  background: #f7fafc;
}

.services-section {
  background: #ffffff;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #718096;
  text-align: center;
  margin-bottom: 4rem;
}

.features-grid,
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card,
.service-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover,
.service-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-title,
.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 1rem 0 0.75rem;
}

.feature-description,
.service-description {
  color: #718096;
  line-height: 1.6;
}

.testimonials-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.testimonials-section .section-title {
  color: #ffffff;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.testimonial-rating {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-name {
  font-weight: 600;
}

.author-role {
  font-size: 0.875rem;
  opacity: 0.8;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
}

.client-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.client-card:hover {
  transform: scale(1.05);
}

.client-name {
  font-weight: 600;
  color: #2d3748;
  margin-top: 1rem;
}

.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.125rem;
  margin-bottom: 2.5rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-image-container {
    order: -1;
  }

  .hero-right-image {
    max-width: 400px;
    margin: 0 auto;
    display: block;
  }

  .hero-text-content {
    text-align: center;
    max-width: 100%;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    margin: 0 auto;
  }
}
</style>
