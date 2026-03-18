<template>
  <div class="legal-page">
    <!-- Simple Navbar -->
    <nav class="landing-navbar">
      <div class="navbar-container">
        <div class="navbar-logo cursor-pointer" @click="router.push('/')">
          <img src="/images/log1.png" alt="NexaPro Logo" class="logo-img" />
        </div>
        <button class="btn-back" @click="router.push('/')">
          ← {{ t('home.nav.backToHome') }}
        </button>
      </div>
    </nav>

    <div class="content-wrapper">
      <header class="page-header">
        <h1 class="page-title">Privacy Policy</h1>
        <p class="last-updated">Last Updated: March 18, 2026</p>
      </header>
      
      <main class="legal-content">
        <section class="legal-section">
          <p>NexaPro ("we," "our," or "us"), operated by <strong>Quantum Vision Limited</strong>, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our property management platform.</p>
        </section>

        <section class="legal-section">
          <h2>1. Information We Collect</h2>
          <h3>1.1 Personal Data</h3>
          <p>We may collect personal information that you voluntarily provide to us when you register on the platform, including:</p>
          <ul class="legal-list">
            <li>Name and contact information (email address, phone number, physical address).</li>
            <li>Business details (company name, property details).</li>
            <li>Payment information (processed securely through mobile money providers).</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including:</p>
          <ul class="legal-list">
            <li>To provide, operate, and maintain our platform.</li>
            <li>To process transactions and send related information.</li>
            <li>To improve, personalize, and expand our platform.</li>
            <li>To communicate with you, either directly or through one of our partners.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>3. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers, and we use industry-standard encryption to protect financial transactions.</p>
        </section>

        <section class="legal-section">
          <h2>4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div class="contact-box">
            <p><strong>Email:</strong> <a href="mailto:jnichoraus3@gmail.com" class="contact-link">jnichoraus3@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+255770622045" class="contact-link">+255 770 622 045</a></p>
          </div>
        </section>
      </main>

      <footer class="simple-footer">
        <p class="footer-copyright">© 2026 NexaPro (Quantum Vision Limited). All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from "vue-i18n";

const router = useRouter()
const { t } = useI18n();
</script>

<style scoped>
/* Reuse Styles from Home.vue for consistency */
/* Simple & Readable Legal Page Styles */
.legal-page {
  --nav-height: 70px;
  --bg-color: #ffffff;
  --text-main: #1a1a1a;
  --text-muted: #666666;
  --accent-color: #022c22;
  --border-color: #eeeeee;
  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  line-height: 1.6;
}

.landing-navbar { 
  position: sticky; top: 0; z-index: 1000; 
  background: var(--accent-color); 
  color: white;
  padding: 0.5rem 0;
}
.navbar-container { 
  max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; 
  display: flex; align-items: center; justify-content: space-between; 
}
.logo-img { height: 40px; filter: brightness(0) invert(1); }

.content-wrapper { 
  max-width: 800px; margin: 0 auto; padding: 4rem 1.5rem; 
}

.page-header { 
  border-bottom: 1px solid var(--border-color); 
  margin-bottom: 3rem; 
  padding-bottom: 2rem;
}
.page-title { font-size: 2.5rem; font-weight: 800; color: var(--accent-color); margin-bottom: 0.5rem; }
.last-updated { color: var(--text-muted); font-size: 0.9rem; font-style: italic; }

.legal-section { margin-bottom: 2.5rem; }
.legal-section h2 { 
  font-size: 1.5rem; font-weight: 700; color: var(--accent-color); 
  margin-bottom: 1rem; border-left: 4px solid #22c55e; padding-left: 1rem;
}
.legal-section h3 { font-size: 1.1rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }

.legal-list { padding-left: 1.5rem; margin-bottom: 1.5rem; list-style-type: disc; }
.legal-list li { margin-bottom: 0.5rem; }

p { margin-bottom: 1.25rem; }

.contact-box { 
  background: #f9f9f9; padding: 1.5rem; border-radius: 8px; 
  border: 1px solid var(--border-color); margin-top: 3rem;
}
.contact-link { color: #22c55e; font-weight: 600; text-decoration: underline; }

.btn-back {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-back:hover { background: rgba(255,255,255,0.1); }

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
  .content-wrapper { padding: 2rem 1rem; }
}
</style>
