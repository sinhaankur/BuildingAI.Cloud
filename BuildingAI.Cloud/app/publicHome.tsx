import React from "react";
import styles from "./publicHome.module.css";

// 1. Hero Section
function HeroSection() {
  return (
    <section className={styles["hero-section"]}>
      <h1 className={styles["hero-title"]}>
        The Cloud Platform for Smart Buildings
      </h1>
      <h2 className={styles["hero-subtitle"]}>
        Manage, automate, and secure your property operations with one unified dashboard.
      </h2>
      <button className={styles["cta-btn"]}>
        Get Started Free
      </button>
    </section>
  );
}

// 2. 3-Pillar Feature Grid
function FeatureGrid() {
  const features = [
    { icon: '🚀', title: 'Deploy', desc: 'One-click model templates.' },
    { icon: '📈', title: 'Scale', desc: 'Elastic resource orchestration.' },
    { icon: '🛡️', title: 'Govern', desc: 'Built-in safety and cost guardrails.' },
  ];
  return (
    <section className={styles["feature-grid"]}>
      {features.map(f => (
        <div key={f.title} className={styles["feature-card"]}>
          <div className={styles["feature-icon"]}>{f.icon}</div>
          <h3 className={styles["feature-title"]}>{f.title}</h3>
          <p className={styles["feature-desc"]}>{f.desc}</p>
        </div>
      ))}
    </section>
  );
}

// 3. Visual Proof
function VisualProof() {
  return (
    <section className={styles["visual-proof"]}>
      <div className={styles["visual-terminal"]}>
        $ buildingai deploy --model smart-access --env production
        <br />
        $ buildingai monitor --building "Sunset Towers"
        <br />
        $ buildingai notify --event "Package Delivered"
      </div>
    </section>
  );
}

// 4. Logo Cloud
function LogoCloud() {
  const logos = [
    '/assets/img/BLogo.png',
    '/assets/img/B.png',
    '/assets/img/B.svg',
    '/assets/img/Pro.jpg',
  ];
  return (
    <section className={styles["logo-cloud"]}>
      <div className={styles["logo-cloud-label"]}>Trusted by leading properties</div>
      <div className={styles["logo-row"]}>
        {logos.map((src, i) => (
          <img key={i} src={src} alt="logo" className={styles["logo-img"]} />
        ))}
      </div>
    </section>
  );
}

// 5. Footer (minimal, no noise)
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="/download">Download</a>
        <a href="/blog">Blog</a>
        <a href="/docs">Docs</a>
        <a href="https://github.com/BuildingAI.Cloud" target="_blank" rel="noopener">GitHub</a>
        <a href="https://discord.gg/" target="_blank" rel="noopener">Discord</a>
        <a href="https://twitter.com/" target="_blank" rel="noopener">X (Twitter)</a>
        <a href="/contact">Contact</a>
      </div>
      <div className={styles.footerCopyright}>© {new Date().getFullYear()} BuildingAI.Cloud</div>
    </footer>
  );
}

// 6. Navigation
function Navigation() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 3vw', background: 'rgba(255,255,255,0.85)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.03)' }}>
      <img src="/assets/img/BLogo.png" alt="BuildingAI.Cloud Logo" style={{ height: 38 }} />
      <div style={{ display: 'flex', gap: '2.5rem', fontWeight: 500, fontSize: '1.05rem', color: '#222' }}>
        <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>Features</a>
        <a href="#proof" style={{ textDecoration: 'none', color: 'inherit' }}>How it Works</a>
        <a href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a>
      </div>
      <a href="/login" style={{ color: '#1a73e8', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1.5px solid #1a73e8', borderRadius: 8, padding: '0.5rem 1.5rem', background: '#fff', transition: 'background 0.2s' }}>Login</a>
    </nav>
  );
}

// 7. Integrations Section
function IntegrationsSection() {
  const integrations = {
    Coding: [
      { name: 'Codex', icon: '⬛' },
      { name: 'Claude Code', icon: '✴️' },
      { name: 'OpenCode', icon: '◼️' },
    ],
    'Documents & RAG': [
      { name: 'LangChain', icon: '🧩' },
      { name: 'LlamaIndex', icon: '🦙' },
      { name: 'AnythingLLM', icon: '🖥️' },
    ],
    Automation: [
      { name: 'OpenClaw', icon: '🦾' },
      { name: 'n8n', icon: '🔗' },
      { name: 'Dify', icon: '🛠️' },
    ],
    Chat: [
      { name: 'Open WebUI', icon: '🗨️' },
      { name: 'Onyx', icon: '⚫' },
      { name: 'Msty', icon: '🔷' },
    ],
  };
  return (
    <section className={styles.integrationsSection}>
      <h2 className={styles.integrationsTitle}>Over 40,000 integrations</h2>
      <div className={styles.integrationsGrid}>
        {Object.entries(integrations).map(([category, items]) => (
          <div key={category} className={styles.integrationCategory}>
            <div className={styles.integrationCategoryTitle}>{category}</div>
            {items.map((item) => (
              <div key={item.name} className={styles.integrationItem}>
                <span className={styles.integrationIcon}>{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        ))}
      </div>
      <a href="/integrations" className={styles.integrationsViewAll}>View all →</a>
    </section>
  );
}

// 8. Sign Up Section
function SignUpSection() {
  return (
    <section className={styles.signUpSection}>
      <div className={styles.signUpCard}>
        <div className={styles.signUpTitle}>Sign up for an account</div>
        <ul className={styles.signUpList}>
          <li>Receive updates when new models are released</li>
          <li>Access cloud hardware to run faster, larger models</li>
          <li>Customize & share models with others</li>
        </ul>
        <button className={styles.signUpButton}>Create account</button>
      </div>
    </section>
  );
}

export default function PublicHome() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navigation />
      <HeroSection />
      <LogoCloud />
      <FeatureGrid />
      <VisualProof />
      <IntegrationsSection />
      <SignUpSection />
      <Footer />
    </div>
  );
}
