import { useEffect, useRef, useState, type FormEvent, type PointerEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Check, Copy, Download, Menu, Plus, X } from "lucide-react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { downloadCV } from "./lib/cv";

const EMAIL = "aimsfaiz27@gmail.com";
const socials = [
  { label: "GitHub", href: "https://github.com/m-faizkhan" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/faiz-khan-877a1835b" },
  { label: "WhatsApp", href: "https://wa.me/923062573751" },
];
const navItems = [
  { label: "About", id: "about" },
  { label: "Expertise", id: "expertise" },
  { label: "Experience", id: "experience" },
];
const expertise = [
  {
    title: "Frontend development",
    description: "Responsive interfaces, API integrations and the little interactions that make a website feel right.",
    tools: "HTML / CSS / JavaScript / React / Tailwind CSS",
  },
  {
    title: "Backend development",
    description: "Dynamic pages, connected databases and practical application logic. The parts you do not see, but rely on.",
    tools: "PHP / MySQL / Node.js",
  },
  {
    title: "Interface design",
    description: "Clear layouts, simple navigation and a consistent experience from the smallest screen to the largest.",
    tools: "UI design / Responsive layouts / Bootstrap",
  },
];
type JourneyItem = { id: string; title: string; organization: string; date: string; description: string };
const experience: JourneyItem[] = [
  {
    id: "webixus",
    title: "Web Developer",
    organization: "Webixus",
    date: "June 2026",
    description: "Building responsive websites with React and Tailwind CSS. Working on API integrations, performance improvements and clean, maintainable code in Karachi.",
  },
  {
    id: "aims",
    title: "Web Development Intern",
    organization: "AIMS Advertising",
    date: "Oct to Dec 2025",
    description: "Developed responsive interfaces and dynamic pages with HTML, CSS, JavaScript, PHP and MySQL. Contributed to frontend tasks and feature delivery.",
  },
  {
    id: "uiux",
    title: "UI/UX & Web Development Intern",
    organization: "UIUX",
    date: "Oct to Dec 2025",
    description: "An internship in Karachi focused on interface design and web development, bringing design decisions and implementation closer together.",
  },
];
const education: JourneyItem[] = [
  {
    id: "aptech",
    title: "Aptech Institute",
    organization: "Diploma in Web Development",
    date: "2021 to 2025",
    description: "Diploma in Web Development, January 2021 to December 2025. A practical foundation in frontend development, backend programming and databases.",
  },
  {
    id: "mehran",
    title: "Mehran Degree College",
    organization: "Intermediate",
    date: "2021 to 2024",
    description: "Completed intermediate studies at Mehran Degree College.",
  },
  {
    id: "happy-palace",
    title: "Happy Palace Grammar School",
    organization: "Matriculation",
    date: "2020",
    description: "Completed matriculation at Happy Palace Grammar School.",
  },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  icon = "up",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  icon?: "up" | "down";
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 420, damping: 28 });
  const springY = useSpring(y, { stiffness: 420, damping: 28 });
  const move = (event: PointerEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.07);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
  };
  const reset = () => { x.set(0); y.set(0); };
  const Icon = icon === "down" ? ArrowDownRight : ArrowUpRight;
  const content = (
    <>
      <span className="button-fill" aria-hidden="true" />
      <span className="button-text">{children}</span>
      <span className={`button-icon ${icon === "down" ? "button-icon-down" : ""}`} aria-hidden="true">
        <Icon className="arrow-first" size={18} strokeWidth={1.6} />
        <Icon className="arrow-next" size={18} strokeWidth={1.6} />
      </span>
    </>
  );
  const props = {
    className: `animated-button ${className}`,
    style: { x: springX, y: springY },
    onPointerMove: move,
    onPointerLeave: reset,
    onBlur: reset,
    whileTap: { scale: reduceMotion ? 1 : 0.97 },
    onClick,
  };
  return href ? <motion.a href={href} {...props}>{content}</motion.a> : <motion.button type={type} {...props}>{content}</motion.button>;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    const container = document.querySelector("dialog[open]") ?? document.body;
    container.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    previousFocus?.focus({ preventScroll: true });
    if (!copied) throw new Error("Copy is unavailable");
  }
}

function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (open && !ref.current?.open) {
      setDraft("");
      setCopied(false);
      setCopyError(false);
      ref.current?.showModal();
    } else if (!open && ref.current?.open) {
      ref.current.close();
    }
  }, [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const project = String(data.get("project") ?? "A website");
    const message = String(data.get("message") ?? "").trim();
    const body = `Hi Faiz,\n\n${message}\n\nProject: ${project}\nFrom: ${name}\nEmail: ${email}`;
    setDraft(body);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${project} enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      aria-labelledby="contact-dialog-title"
      data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-content">
        <button className="dialog-close" aria-label="Close contact form" onClick={onClose}><X size={22} /></button>
        <p className="section-label">A CONVERSATION STARTS HERE</p>
        <h2 id="contact-dialog-title">{draft ? "Over to your inbox." : "Tell me about it."}</h2>
        {draft ? (
          <div className="draft-confirmation">
            <div className="confirmation-icon"><Check size={27} strokeWidth={1.4} /></div>
            <p>Your email app will open with your message filled in. Send it there to get in touch.</p>
            <p className="muted">No email app set up? Copy your message and send it to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
            <button
              className="text-button"
              onClick={async () => {
                try { await copyText(draft); setCopied(true); setCopyError(false); }
                catch { setCopyError(true); }
              }}
            >
              {copied ? "Message copied" : "Copy your message"}{copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <p className="form-feedback" role="status">{copyError ? "Copy is unavailable in this browser. Please email me directly." : copied ? "Ready to paste into your email." : ""}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="dialog-intro">A new website, an opportunity or something else. I am all ears.</p>
            <div className="form-columns">
              <label>Your name<input name="name" placeholder="Your name" autoComplete="name" required maxLength={100} /></label>
              <label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required maxLength={150} /></label>
            </div>
            <label>What do you have in mind?
              <select name="project" defaultValue="A website">
                <option>A website</option><option>A web application</option><option>A job opportunity</option><option>Something else</option>
              </select>
            </label>
            <label>A few details<textarea name="message" placeholder="Tell me a little about it..." rows={3} required minLength={10} maxLength={4000} /></label>
            <AnimatedButton type="submit" className="form-submit">Open email draft</AnimatedButton>
            <p className="form-note">This opens your email app. Nothing is sent automatically.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}

function Expertise() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  return (
    <div id="expertise" className="expertise-list">
      {expertise.map((item, index) => (
        <div key={item.title} className={`expertise-item ${expanded === index ? "is-open" : ""}`}>
          <button
            className="expertise-toggle"
            aria-expanded={expanded === index}
            aria-controls={`expertise-detail-${index}`}
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <span className="item-number">0{index + 1}</span>
            <span className="expertise-title">{item.title}</span>
            <span className="expand-icon"><Plus size={20} strokeWidth={1.3} /></span>
          </button>
          <AnimatePresence initial={false}>
            {expanded === index && (
              <motion.div
                id={`expertise-detail-${index}`}
                className="accordion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="expertise-detail"><p>{item.description}</p><p className="tools">{item.tools}</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function Journey() {
  const [tab, setTab] = useState<"experience" | "education">("experience");
  const [expanded, setExpanded] = useState<string | null>("webixus");
  const reduceMotion = useReducedMotion();
  const items = tab === "experience" ? experience : education;
  const changeTab = (next: "experience" | "education") => {
    setTab(next);
    setExpanded(next === "experience" ? experience[0].id : education[0].id);
  };
  return (
    <div className="journey">
      <div className="journey-tabs" role="tablist" aria-label="Experience and education">
        {(["experience", "education"] as const).map((item) => (
          <button
            key={item}
            role="tab"
            id={`journey-tab-${item}`}
            aria-controls="journey-panel"
            aria-selected={tab === item}
            tabIndex={tab === item ? 0 : -1}
            className={tab === item ? "active" : ""}
            onClick={() => changeTab(item)}
            onKeyDown={(event) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const next = event.key === "Home" ? "experience" : event.key === "End" ? "education" : tab === "experience" ? "education" : "experience";
                changeTab(next);
                document.getElementById(`journey-tab-${next}`)?.focus();
              }
            }}
          >
            {item === "experience" ? "Experience" : "Education"}
            {tab === item && <motion.span className="tab-line" layoutId="journey-tab-line" transition={{ duration: reduceMotion ? 0 : 0.28 }} />}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="journey-panel" aria-labelledby={`journey-tab-${tab}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
            {items.map((item) => (
              <div key={item.id} className={`journey-item ${expanded === item.id ? "is-open" : ""}`}>
                <button className="journey-toggle" aria-expanded={expanded === item.id} aria-controls={`journey-detail-${item.id}`} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <span className="journey-heading"><span className="journey-title">{item.title}</span><span className="journey-organization">{item.organization}</span></span>
                  <span className="journey-date">{item.date}</span>
                  <span className="expand-icon"><Plus size={18} strokeWidth={1.3} /></span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded === item.id && (
                    <motion.div id={`journey-detail-${item.id}`} className="accordion-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }}>
                      <p className="journey-description">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [emailCopied, setEmailCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(heroProgress, [0, 1], [0, 65]);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, anchors: { offset: -90 }, smoothWheel: true });
    lenisRef.current = lenis;
    return () => { lenis.destroy(); lenisRef.current = null; };
  }, []);

  useEffect(() => {
    if (contactOpen) {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lenisRef.current?.start();
    }
    return () => { document.body.style.overflow = ""; };
  }, [contactOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    ["home", "about", "expertise", "experience", "contact"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => { if (copyTimeout.current) clearTimeout(copyTimeout.current); }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("mobile-menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const openContact = () => { setMenuOpen(false); setContactOpen(true); };
  const copyEmail = async () => {
    try {
      await copyText(EMAIL);
      setEmailCopied(true);
      setCopyError(false);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setEmailCopied(false), 2400);
    } catch { setCopyError(true); }
  };

  return (
    <>
      <a className="skip-link" href="#about" onClick={() => document.getElementById("about")?.focus({ preventScroll: true })}>Skip to content</a>
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <header className="site-header">
        <nav className="shell nav-inner" aria-label="Main navigation">
          <a className="wordmark" href="#home" aria-label="Faiz Khan home" onClick={() => setMenuOpen(false)}>fk<span>.</span></a>
          <div className="desktop-nav">
            {navItems.map((item) => <a key={item.id} href={`#${item.id}`} className={`nav-link ${activeSection === item.id ? "active" : ""}`} aria-current={activeSection === item.id ? "location" : undefined}>{item.label}</a>)}
          </div>
          <AnimatedButton onClick={openContact} className="nav-contact">Get in touch</AnimatedButton>
          <button id="mobile-menu-toggle" className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}</button>
        </nav>
        <AnimatePresence>
          {menuOpen && <motion.div id="mobile-navigation" className="mobile-navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
            {navItems.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span className="item-number">0{index + 1}</span>{item.label}<ArrowUpRight size={22} /></a>)}
            <button onClick={openContact}>Get in touch<ArrowUpRight size={22} /></button>
          </motion.div>}
        </AnimatePresence>
      </header>

      <main>
        <section id="home" className="hero" ref={heroRef} aria-labelledby="hero-title">
          <motion.div className="hero-media" style={{ y: reduceMotion ? 0 : imageY }} aria-hidden="true">
            <img src="https://images.pexels.com/photos/5465156/pexels-photo-5465156.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="" width={1200} height={627} fetchPriority="high" decoding="async" />
          </motion.div>
          <div className="shell hero-inner">
            <motion.p className="hero-label" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>WEB DEVELOPER</motion.p>
            <h1 id="hero-title" className="hero-title" aria-label="Faiz Khan">
              <span className="word-reveal"><motion.span initial={reduceMotion ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>Faiz</motion.span></span>{" "}
              <span className="word-reveal"><motion.span initial={reduceMotion ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>Khan<span className="hero-dot">.</span></motion.span></span>
            </h1>
            <motion.div className="hero-summary" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <h2>Thoughtful design.<br />Dependable code.</h2>
              <p>I build responsive websites with React and PHP.<br className="desktop-break" /> Based in Karachi, with an eye for the details.</p>
              <div className="hero-actions">
                <AnimatedButton href="#about" icon="down">Explore my portfolio</AnimatedButton>
                <button className="text-button cv-button" onClick={downloadCV}>Download CV<Download size={16} strokeWidth={1.5} /></button>
              </div>
            </motion.div>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to about section"><ArrowDown size={17} strokeWidth={1.3} /></a>
        </section>

        <section id="about" className="about-section" aria-labelledby="about-title" tabIndex={-1}>
          <div className="shell about-grid">
            <Reveal className="about-intro">
              <p className="section-label">01 / ABOUT & EXPERTISE</p>
              <h2 id="about-title">Good websites.<br />No unnecessary noise.</h2>
              <p className="about-copy">I am M. Faiz Khan, a web developer in Karachi. My full stack internship gave me a hands on start with React, PHP and MySQL. Now I put that experience into websites that look clear and work well.</p>
              <a href={socials[0].href} target="_blank" rel="noreferrer" className="text-link">A little more on GitHub<ArrowUpRight size={16} strokeWidth={1.5} /></a>
            </Reveal>
            <Reveal className="expertise-column" delay={0.08}><Expertise /></Reveal>
          </div>
        </section>

        <section id="experience" className="experience-section" aria-labelledby="experience-title">
          <div className="shell experience-grid">
            <Reveal className="experience-intro">
              <p className="section-label">02 / THE JOURNEY</p>
              <h2 id="experience-title">Learning by<br />building.</h2>
              <p>From classroom fundamentals<br />to getting things done with real teams.</p>
              <div className="journey-mark" aria-hidden="true"><ArrowDownRight size={72} strokeWidth={0.75} /></div>
            </Reveal>
            <Reveal className="journey-column" delay={0.08}><Journey /></Reveal>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="shell">
            <div className="contact-grid">
              <Reveal>
                <p className="section-label">03 / YOUR NEXT IDEA</p>
                <h2 id="contact-title">Something in mind?<br /><span>Build it together.</span></h2>
              </Reveal>
              <Reveal className="contact-details" delay={0.1}>
                <p className="availability"><span />Open to work and good conversations</p>
                <AnimatedButton onClick={openContact}>Start a conversation</AnimatedButton>
                <div className="email-row"><a href={`mailto:${EMAIL}`}>{EMAIL}</a><button className="copy-email" onClick={copyEmail} aria-label={emailCopied ? "Email address copied" : "Copy email address"}>{emailCopied ? <Check size={16} /> : <Copy size={16} strokeWidth={1.4} />}</button></div>
                <p className="copy-feedback" role="status">{emailCopied ? "Email copied" : copyError ? "Please select and copy the email address." : ""}</p>
              </Reveal>
            </div>
            <footer className="site-footer">
              <a className="wordmark" href="#home" aria-label="Back to Faiz Khan home">fk<span>.</span></a>
              <p className="footer-credit">M. Faiz Khan <span>/</span> 2026</p>
              <div className="footer-socials">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label}<ArrowUpRight size={13} strokeWidth={1.5} /></a>)}</div>
              <a href="#home" className="back-top">Back to top<ArrowUp size={15} strokeWidth={1.5} /></a>
            </footer>
          </div>
        </section>
      </main>
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
