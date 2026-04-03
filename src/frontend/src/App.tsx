import { ExternalLink, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import {
  AnimatePresence,
  type Variants,
  motion,
  useInView,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { FloatingParticles } from "./components/FloatingParticles";
import { ParticleBackground } from "./components/ParticleBackground";

// Force dark mode on mount
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const SKILLS = [
  "WordPress",
  "JavaScript",
  "React",
  "Bootstrap",
  "TypeScript",
  "Django",
  "Tailwind CSS",
  "Flask",
  "Shopify",
  "Next.js",
  "Git",
  "MongoDB",
  "Headless WordPress",
  "Express.js",
  "Python",
  "Node.js",
  "HTML5",
  "Vue.js",
  "CSS3",
  "Technical SEO",
];

type ProjectCategory = "All" | "E-Commerce" | "SaaS" | "Portfolio" | "Business";

interface Project {
  name: string;
  description: string;
  url: string | null;
  category: Exclude<ProjectCategory, "All">;
  status?: "live" | "not-in-dev";
}

const PROJECTS: Project[] = [
  {
    name: "efone.app",
    description:
      "Modern communication platform with real-time features and SaaS architecture.",
    url: "https://efone.app/",
    category: "SaaS",
  },
  {
    name: "Sonic Accountants",
    description:
      "Professional accounting services website with clean UX and client portal.",
    url: "https://sonicaccountants.com/",
    category: "Business",
  },
  {
    name: "Custom Boxes Canada",
    description:
      "Custom packaging e-commerce store with product configurator and checkout.",
    url: "https://www.customboxescanada.ca/",
    category: "E-Commerce",
  },
  {
    name: "Elite Horizon Tourism",
    description:
      "Premium tourism & travel platform showcasing destinations and tour packages.",
    url: "https://www.elitehorizontourism.com/",
    category: "Business",
  },
  {
    name: "Premium Packaging America",
    description:
      "High-end packaging solutions e-commerce platform for US market.",
    url: "https://premiumpackagingamerica.com/",
    category: "E-Commerce",
  },
  {
    name: "Prime Appliance Parts",
    description:
      "Appliance parts e-commerce store with inventory management for AU market.",
    url: "https://primeapplianceparts.com.au/",
    category: "E-Commerce",
  },
  {
    name: "Peeraan Pret Studio",
    description:
      "Elegant fashion & clothing studio website with lookbook and collection showcase.",
    url: "https://peeraan.com/",
    category: "Business",
  },
  {
    name: "Osama Mehmood Portfolio",
    description:
      "Sleek developer portfolio site built with modern web technologies.",
    url: "https://osama-mehmood-1-r3qv.vercel.app/",
    category: "Portfolio",
  },
  {
    name: "The Vertex Technologies",
    description:
      "Technology company website showcasing services, team, and tech solutions.",
    url: "https://thevertextechnologies.com/",
    category: "Business",
  },
  {
    name: "My Trusted Telecom",
    description:
      "Telecom services website with service listings and customer acquisition flow.",
    url: "http://mytrustedtelecom.com/",
    category: "Business",
  },
  {
    name: "Haris Real Estate",
    description:
      "Real estate platform with property listings, search, and agent profiles.",
    url: "http://harisrealestate.com/",
    category: "Business",
  },
  {
    name: "ChorBazar.Pk",
    description:
      "Online marketplace for classified listings and second-hand goods in Pakistan.",
    url: "https://chorbazar.pk/",
    category: "E-Commerce",
  },
  {
    name: "TransVision Immigration",
    description:
      "Immigration consultancy services site with visa guidance and appointment booking.",
    url: "https://www.transvisionimmigration.com/",
    category: "Business",
  },
  {
    name: "Lazzat Grill & Shakes",
    description:
      "Restaurant website for Lazzat Grill and Shakes in Brampton with menu and ordering.",
    url: "https://lazzat.ca/",
    category: "Business",
    status: "not-in-dev",
  },
  {
    name: "OneVision",
    description:
      "Workforce Harmony SaaS platform for team management and operational alignment.",
    url: "https://onevision.io/",
    category: "SaaS",
  },
];

const EXPERIENCE = [
  {
    company: "Octet Solutions & Institute",
    role: "Lead Developer",
    period: "Sept 2025 – Present",
    description:
      "MERN Stack Instructor and Web Developer, focusing on practical skills and industry-standard workflows. Developing and maintaining web applications, collaborating with teams to build scalable, performance-driven solutions.",
    current: true,
  },
  {
    company: "The Vertex Technologies",
    role: "Chief Technology Officer (CTO) & Lead Developer",
    period: "Mar 2023 – Present",
    description:
      "Defining the company's technical vision, leading development teams, and delivering scalable, high-performance software solutions. Overseeing system architecture, technology selection, code quality, and security standards.",
    current: true,
  },
  {
    company: "PAC College 55T, Gulberg",
    role: "AI Instructor (Part-Time)",
    period: "Feb 2024 – Sept 2024",
    description:
      "Teaching artificial intelligence concepts and practical applications to college students.",
    current: false,
  },
  {
    company: "Peak Solutions College",
    role: "Python Instructor (Part-time)",
    period: "Aug 2023 – Nov 2024",
    description:
      "Delivering Python programming courses with focus on practical, industry-relevant skills.",
    current: false,
  },
  {
    company: "Azad Chaiwala Institute",
    role: "Sr Django Instructor",
    period: "Jul 2021 – Dec 2024",
    description:
      "Senior instructor for Django framework, mentoring students from fundamentals to advanced backend development.",
    current: false,
  },
  {
    company: "Fiverr",
    role: "Freelancer / Web Developer",
    period: "Feb 2021 – Feb 2023",
    description:
      "Delivered full-stack web development projects for international clients across various industries.",
    current: false,
  },
  {
    company: "Solution Geeks",
    role: "Front End Developer / HTML Developer",
    period: "Aug 2016 – Aug 2018",
    description:
      "Built responsive front-end interfaces and HTML templates for client projects.",
    current: false,
  },
  {
    company: "University of South Asia",
    role: "Social Media Manager",
    period: "During Studies",
    description:
      "Managed social media presence and digital communications for the university.",
    current: false,
  },
];

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

// ─────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// ─────────────────────────────────────────────
// Reusable Section Wrapper
// ─────────────────────────────────────────────

function SectionReveal({
  children,
  id,
  className = "",
}: { children: React.ReactNode; id?: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-dark shadow-neon" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-heading text-2xl font-bold tracking-widest text-neon-red neon-glow"
          whileHover={{ scale: 1.05 }}
          data-ocid="nav.link"
        >
          MR
        </motion.button>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => handleNav(link.href)}
                className="text-sm font-medium tracking-wider text-foreground/70 hover:text-neon-red transition-colors duration-200 uppercase"
                data-ocid="nav.link"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-foreground/80 hover:text-neon-red transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-primary/20"
            data-ocid="nav.dropdown_menu"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNav(link.href)}
                    className="text-base font-medium tracking-wider text-foreground/80 hover:text-neon-red transition-colors w-full text-left uppercase"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────

function Hero() {
  const handleScroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(221,34,0,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-red/20 to-transparent animate-scan-line"
          style={{ opacity: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p
            variants={fadeUp}
            className="text-neon-red text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-6"
          >
            Lead Full Stack Developer
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground neon-glow mb-6"
            style={{
              textShadow:
                "0 0 30px rgba(221,34,0,0.6), 0 0 60px rgba(221,34,0,0.3), 0 0 120px rgba(221,34,0,0.15)",
            }}
          >
            MOEED
            <br />
            <span className="text-neon-red">RIZWAN</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            7+ Years Building Modern Apps, Powerful Backends &amp;
            High-Performance E-Commerce Systems
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              type="button"
              onClick={() => handleScroll("#projects")}
              className="px-8 py-3.5 bg-neon-red text-white font-semibold tracking-wider uppercase text-sm rounded-sm shadow-neon hover:bg-neon-red-bright transition-all duration-300 hover:shadow-neon-lg"
              data-ocid="hero.primary_button"
            >
              View Projects
            </button>
            <button
              type="button"
              onClick={() => handleScroll("#contact")}
              className="px-8 py-3.5 border border-neon-red/60 text-foreground font-semibold tracking-wider uppercase text-sm rounded-sm hover:border-neon-red hover:text-neon-red transition-all duration-300 neon-border-hover"
              data-ocid="hero.secondary_button"
            >
              Contact Me
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator removed */}
    </section>
  );
}

// ─────────────────────────────────────────────
// About Section
// ─────────────────────────────────────────────

function About() {
  return (
    <SectionReveal id="about" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left: heading */}
        <div>
          <p className="text-neon-red text-sm tracking-[0.3em] uppercase mb-4">
            About Me
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            Crafting Digital
            <br />
            <span className="text-neon-red">Experiences</span>
          </h2>
          <div
            className="w-16 h-0.5 bg-neon-red mb-8"
            style={{ boxShadow: "0 0 10px rgba(221,34,0,0.8)" }}
          />
          <div className="flex gap-4 text-foreground/50 text-sm">
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-neon-red" /> Lahore, Pakistan
            </span>
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-neon-red" /> Available for Work
            </span>
          </div>
        </div>

        {/* Right: glass card */}
        <div className="glass rounded-sm p-8 neon-border">
          <p className="text-foreground/80 leading-relaxed mb-6 text-base">
            Full Stack Developer with{" "}
            <span className="text-neon-red font-semibold">7+ years</span> of
            experience building modern apps, powerful backends, and
            high-performing e-commerce systems. I specialize in{" "}
            <span className="text-neon-red font-semibold">
              Python (Django/Flask/REST)
            </span>
            , MERN, WordPress, and Shopify.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-6 text-base">
            Proven track record delivering end-to-end solutions for
            international clients. I also teach development professionally,
            helping beginners and teams master Python frameworks and MERN
            technologies.
          </p>
          <div className="border-t border-primary/20 pt-5 flex flex-col gap-2">
            <a
              href="mailto:moeedmoody96@gmail.com"
              className="flex items-center gap-3 text-foreground/60 hover:text-neon-red transition-colors text-sm"
            >
              <Mail size={15} className="text-neon-red" />
              moeedmoody96@gmail.com
            </a>
            <span className="flex items-center gap-3 text-foreground/60 text-sm">
              <MapPin size={15} className="text-neon-red" />
              Lahore, Punjab, Pakistan
            </span>
            <p className="text-foreground/40 text-xs mt-3">
              Interests: Hiking · Gaming · Reading · Fitness · Football
            </p>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

// ─────────────────────────────────────────────
// Skills Section
// ─────────────────────────────────────────────

function Skills() {
  return (
    <SectionReveal id="skills" className="py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={stagger}>
          <motion.p
            variants={fadeUp}
            className="text-neon-red text-sm tracking-[0.3em] uppercase mb-4 text-center"
          >
            Expertise
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold text-foreground text-center mb-4"
          >
            Technical <span className="text-neon-red">Skills</span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="w-16 h-0.5 bg-neon-red mx-auto mb-14"
            style={{ boxShadow: "0 0 10px rgba(221,34,0,0.8)" }}
          />

          <motion.div
            variants={stagger}
            className="flex flex-wrap gap-3 justify-center"
          >
            {SKILLS.map((skill, i) => (
              <motion.span
                key={skill}
                variants={fadeUp}
                custom={i}
                whileHover={{
                  scale: 1.08,
                  boxShadow:
                    "0 0 20px rgba(221,34,0,0.6), 0 0 40px rgba(221,34,0,0.2)",
                }}
                className="px-5 py-2.5 glass text-foreground/80 text-sm font-medium tracking-wide rounded-sm border border-primary/20 hover:border-neon-red hover:text-neon-red transition-all duration-200 cursor-default"
                data-ocid={`skills.item.${i + 1}`}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}

// ─────────────────────────────────────────────
// Projects Section
// ─────────────────────────────────────────────

const PROJECT_CATEGORIES: ProjectCategory[] = [
  "All",
  "E-Commerce",
  "SaaS",
  "Portfolio",
  "Business",
];

const CATEGORY_COLORS: Record<Exclude<ProjectCategory, "All">, string> = {
  SaaS: "#dd2200",
  "E-Commerce": "#ff4400",
  Business: "#aa1a00",
  Portfolio: "#ff6633",
};

// ─────────────────────────────────────────────
// IframePreview — live site preview with fallback
// ─────────────────────────────────────────────

function IframePreview({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);

  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // keep original url string
  }

  return (
    <div
      className="relative w-full overflow-hidden group/preview"
      style={{ height: "180px" }}
    >
      {/* CRT scanlines overlay */}
      <div
        className="absolute inset-0 crt-scanlines z-20 pointer-events-none opacity-[0.05]"
        aria-hidden="true"
      />

      {/* Neon border wrapper */}
      <div
        className="absolute inset-0 border border-neon-red/30 group-hover/preview:border-neon-red/70 transition-all duration-300 pointer-events-none z-10"
        style={{ boxShadow: "inset 0 0 0 1px transparent" }}
      />

      {failed ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-full h-full bg-black/60 backdrop-blur-sm gap-3 group/link"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(221,34,0,0.15) 2px, rgba(221,34,0,0.15) 4px)",
            }}
            aria-hidden="true"
          />
          <span
            className="text-neon-red font-mono text-sm font-bold tracking-widest uppercase relative z-10"
            style={{ textShadow: "0 0 12px rgba(221,34,0,0.9)" }}
          >
            {domain}
          </span>
          <span className="text-foreground/30 text-xs tracking-wider flex items-center gap-1.5 relative z-10 group-hover/link:text-neon-red/60 transition-colors">
            <ExternalLink size={10} />
            Open Site
          </span>
        </a>
      ) : (
        <>
          <iframe
            src={url}
            title={name}
            loading="lazy"
            scrolling="no"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              border: "none",
              transform: "scale(1)",
              transformOrigin: "top left",
            }}
            onError={() => setFailed(true)}
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-20 cursor-pointer"
            aria-label={`Open ${name} in new tab`}
          >
            <span className="sr-only">Open {name} in new tab</span>
          </a>
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(5,5,10,0.85) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover/preview:opacity-100 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(221,34,0,0.04) 0%, transparent 60%)",
              boxShadow: "inset 0 0 30px rgba(221,34,0,0.08)",
            }}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const catColor = CATEGORY_COLORS[project.category] ?? "#dd2200";
  const sysId = `SYS-${String(index + 1).padStart(2, "0")}`;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, x: -24, y: 16 },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.55, ease: "easeOut", delay: index * 0.07 },
        },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={
        isHovered
          ? {
              y: -6,
              boxShadow:
                "0 0 30px rgba(221,34,0,0.4), 0 0 60px rgba(221,34,0,0.18)",
            }
          : {
              y: 0,
              boxShadow: "0 0 0px rgba(221,34,0,0)",
            }
      }
      className="relative flex flex-col overflow-hidden group/card transition-colors duration-300"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        background: "oklch(0.12 0 0 / 80%)",
        backdropFilter: "blur(12px)",
        border: isHovered
          ? "1px solid rgba(221,34,0,0.6)"
          : "1px solid rgba(221,34,0,0.2)",
      }}
      data-ocid={`projects.item.${index + 1}`}
    >
      {/* Category stripe — top bar */}
      <div
        className="w-full flex-shrink-0"
        style={{
          height: "6px",
          background: catColor,
          boxShadow: `0 0 8px ${catColor}80`,
        }}
      />

      {/* Glowing red dot — top-left */}
      <div
        className="absolute top-3 left-3 w-[6px] h-[6px] rounded-full animate-dot-pulse z-20"
        style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }}
        aria-hidden="true"
      />

      {/* SYS-XX label — top-right */}
      <div
        className="absolute top-2.5 right-3 font-mono text-[10px] tracking-widest z-20 transition-opacity duration-300"
        style={{
          color: "rgba(221,34,0,0.35)",
          opacity: isHovered ? 0.85 : 0.25,
          textShadow: isHovered ? "0 0 8px rgba(221,34,0,0.6)" : "none",
        }}
        aria-hidden="true"
      >
        {sysId}
      </div>

      {/* Laser scan line on hover */}
      <div
        className="card-laser-scan absolute inset-0 z-30 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />

      {/* Iframe preview — only for live projects */}
      {project.url && project.status !== "not-in-dev" && (
        <IframePreview url={project.url} name={project.name} />
      )}

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2 mt-1">
          <h3
            className="font-heading text-base font-semibold text-foreground line-clamp-2 transition-all duration-200"
            style={
              isHovered
                ? { textShadow: "0 0 8px rgba(221,34,0,0.5)", color: "#ff4422" }
                : {}
            }
          >
            {project.name}
          </h3>
        </div>

        <p className="text-foreground/55 text-sm leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Action row */}
        {project.status === "not-in-dev" && project.url ? (
          <div className="flex items-center justify-between gap-3 mt-1">
            {/* OFFLINE badge */}
            <span
              className="font-mono text-[11px] tracking-widest px-2.5 py-1 border"
              style={{
                borderColor: "rgba(251,191,36,0.4)",
                color: "rgba(251,191,36,0.85)",
                background: "rgba(251,191,36,0.06)",
                clipPath:
                  "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              }}
            >
              [[ OFFLINE ]]
            </span>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-widest text-foreground/40 hover:text-neon-red/70 transition-colors duration-200 flex items-center gap-1"
              data-ocid={`projects.link.${index + 1}`}
            >
              VIEW LINK <ExternalLink size={10} />
            </a>
          </div>
        ) : project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn flex items-center gap-0 mt-1 w-fit transition-all duration-200"
            style={{
              borderLeft: "2px solid #dd2200",
              borderBottom: "2px solid #dd2200",
              padding: "4px 10px",
              paddingLeft: "8px",
            }}
            data-ocid={`projects.link.${index + 1}`}
          >
            <span
              className="font-mono text-[11px] tracking-[0.18em] text-neon-red font-medium"
              style={{ textShadow: "0 0 6px rgba(221,34,0,0.5)" }}
            >
              [ LAUNCH
            </span>
            <span
              className="font-mono text-[11px] text-neon-red transition-transform duration-200 group-hover/btn:translate-x-1 ml-1"
              style={{ textShadow: "0 0 6px rgba(221,34,0,0.5)" }}
            >
              &gt; ]
            </span>
          </a>
        ) : (
          <span className="text-foreground/30 font-mono text-[11px] tracking-widest mt-1">
            {"// IN DEVELOPMENT"}
          </span>
        )}
      </div>
    </motion.article>
  );
}

// Animated count badge for filter tabs
function CountBadge({
  count,
  animate: shouldAnimate,
}: { count: number; animate: boolean }) {
  const [key, setKey] = useState(0);

  // Re-trigger animation when shouldAnimate fires
  useState(() => {
    if (shouldAnimate) setKey((k) => k + 1);
  });

  return (
    <span
      key={key}
      className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded-none"
      style={{
        background: "rgba(221,34,0,0.15)",
        color: "rgba(221,34,0,0.8)",
        border: "1px solid rgba(221,34,0,0.3)",
        animation: shouldAnimate
          ? "count-flash 0.4s ease-out forwards"
          : "none",
      }}
    >
      {count}
    </span>
  );
}

// Scan sweep line — triggers once on inView
function ScanSweepLine({ inView }: { inView: boolean }) {
  const [triggered, setTriggered] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (inView && !triggered) {
      setTriggered(true);
      setKey((k) => k + 1);
    }
  }, [inView, triggered]);

  if (!triggered) return null;

  return (
    <div
      className="relative w-full h-px my-6 overflow-visible"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-neon-red/10" />
      <div
        key={key}
        className="absolute top-0 h-full w-16 animate-scan-sweep"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(221,34,0,0.9), transparent)",
          boxShadow: "0 0 12px rgba(221,34,0,0.7), 0 0 24px rgba(221,34,0,0.3)",
        }}
      />
    </div>
  );
}

function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");
  const [prevFilter, setPrevFilter] = useState<ProjectCategory>("All");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const filtered =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeFilter);

  const getCategoryCount = (cat: ProjectCategory) =>
    cat === "All"
      ? PROJECTS.length
      : PROJECTS.filter((p) => p.category === cat).length;

  const handleFilter = (cat: ProjectCategory) => {
    setPrevFilter(activeFilter);
    setActiveFilter(cat);
  };

  return (
    <motion.section
      id="projects"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-28 px-6 md:px-10"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* Terminal-style label */}
          <motion.p
            variants={fadeUp}
            className="font-mono text-neon-red text-xs tracking-[0.25em] mb-4 text-center flex items-center justify-center gap-2"
          >
            <span style={{ textShadow: "0 0 8px rgba(221,34,0,0.7)" }}>
              &gt; SYSTEM.PROJECTS
            </span>
            <span
              className="inline-block w-2 h-3.5 animate-blink-cursor"
              style={{
                background: "#dd2200",
                boxShadow: "0 0 6px rgba(221,34,0,0.9)",
              }}
              aria-hidden="true"
            />
          </motion.p>

          {/* Glitch title */}
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold text-foreground text-center mb-4"
          >
            Featured{" "}
            <span
              className="animate-glitch inline-block"
              style={{ color: "#dd2200" }}
            >
              Projects
            </span>
          </motion.h2>

          {/* Scan sweep rule */}
          <motion.div variants={fadeUp}>
            <ScanSweepLine inView={inView} />
          </motion.div>

          {/* HUD-style filter tabs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat;
              const count = getCategoryCount(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className="relative px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "#dd2200",
                          color: "#ffffff",
                          border: "1px solid #dd2200",
                          clipPath:
                            "polygon(8px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 8px)",
                          boxShadow:
                            "0 0 14px rgba(221,34,0,0.5), 0 0 28px rgba(221,34,0,0.2)",
                          textShadow: "0 0 6px rgba(255,255,255,0.4)",
                        }
                      : {
                          background: "transparent",
                          color: "rgba(255,255,255,0.45)",
                          borderLeft: "2px solid rgba(221,34,0,0.5)",
                          borderBottom: "2px solid rgba(221,34,0,0.5)",
                          borderTop: "1px solid transparent",
                          borderRight: "1px solid transparent",
                        }
                  }
                  data-ocid="projects.filter.tab"
                >
                  {cat}
                  <CountBadge
                    count={count}
                    animate={prevFilter !== cat && activeFilter === cat}
                  />
                </button>
              );
            })}
          </motion.div>

          {/* Cards grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((project, i) => (
                <ProjectCard key={project.name} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Footer record count */}
          <motion.div
            variants={fadeUp}
            className="mt-12 text-center font-mono text-[11px] tracking-[0.2em]"
            style={{ color: "rgba(221,34,0,0.3)", opacity: 0.7 }}
          >
            {"// END OF RECORDS — "}
            {filtered.length}
            {" PROJECTS LOADED"}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Experience Timeline
// ─────────────────────────────────────────────

function Experience() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      id="experience"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-28 px-6 md:px-10"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-neon-red text-sm tracking-[0.3em] uppercase mb-4 text-center"
          >
            Career
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold text-foreground text-center mb-4"
          >
            Work <span className="text-neon-red">Experience</span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="w-16 h-0.5 bg-neon-red mx-auto mb-16"
            style={{ boxShadow: "0 0 10px rgba(221,34,0,0.8)" }}
          />

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 md:left-8 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(221,34,0,0.8), rgba(221,34,0,0.1))",
              }}
            />

            <div className="flex flex-col gap-10">
              {EXPERIENCE.map((exp, i) => (
                <motion.div
                  key={exp.company}
                  variants={fadeUp}
                  className="relative pl-14 md:pl-20"
                  data-ocid={`experience.item.${i + 1}`}
                >
                  {/* Node */}
                  <div
                    className={`absolute left-1.5 md:left-5 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      exp.current
                        ? "border-neon-red bg-neon-red/20 animate-pulse-glow"
                        : "border-neon-red/50 bg-background"
                    }`}
                    style={
                      exp.current
                        ? { boxShadow: "0 0 12px rgba(221,34,0,0.7)" }
                        : {}
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${exp.current ? "bg-neon-red" : "bg-neon-red/40"}`}
                    />
                  </div>

                  <div className="glass rounded-sm p-6 border border-primary/20 hover:border-neon-red/40 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {exp.company}
                        </h3>
                        <p className="text-neon-red text-sm font-medium">
                          {exp.role}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-sm border shrink-0 tracking-wider ${
                          exp.current
                            ? "border-neon-red/60 text-neon-red bg-neon-red/10"
                            : "border-primary/30 text-foreground/50"
                        }`}
                      >
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Certifications Section
// ─────────────────────────────────────────────

function Certifications() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-16 px-6 md:px-10"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-neon-red text-sm tracking-[0.3em] uppercase mb-4 text-center"
          >
            Achievements
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-10"
          >
            <span className="text-neon-red">Certifications</span>
          </motion.h2>

          <motion.div variants={fadeUp}>
            <div className="glass rounded-sm p-6 border border-primary/20 neon-border flex items-center gap-6">
              <div
                className="w-12 h-12 rounded-sm border border-neon-red/60 bg-neon-red/10 flex items-center justify-center shrink-0"
                style={{ boxShadow: "0 0 15px rgba(221,34,0,0.4)" }}
              >
                <span className="text-neon-red text-xl font-bold font-heading">
                  ✦
                </span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  DevOps Certification
                </h3>
                <p className="text-neon-red text-sm font-medium">MindLabs</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Contact Section
// ─────────────────────────────────────────────

function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      id="contact"
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-28 px-6 md:px-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-neon-red text-sm tracking-[0.3em] uppercase mb-4"
          >
            Let&apos;s Talk
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            Get In <span className="text-neon-red">Touch</span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="w-16 h-0.5 bg-neon-red mx-auto mb-8"
            style={{ boxShadow: "0 0 10px rgba(221,34,0,0.8)" }}
          />
          <motion.p
            variants={fadeUp}
            className="text-foreground/60 text-base leading-relaxed mb-12 max-w-xl mx-auto"
          >
            Have a project in mind or want to collaborate? I&apos;m always open
            to discussing new opportunities and exciting ideas.
          </motion.p>

          {/* Contact info */}
          <motion.div
            variants={stagger}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
          >
            <motion.a
              variants={fadeIn}
              href="mailto:moeedmoody96@gmail.com"
              className="flex items-center gap-3 text-foreground/70 hover:text-neon-red transition-colors text-sm group"
            >
              <Mail size={16} className="text-neon-red" />
              moeedmoody96@gmail.com
            </motion.a>
            <motion.span
              variants={fadeIn}
              className="flex items-center gap-3 text-foreground/70 text-sm"
            >
              <Phone size={16} className="text-neon-red" />
              3350472139
            </motion.span>
            <motion.span
              variants={fadeIn}
              className="flex items-center gap-3 text-foreground/70 text-sm"
            >
              <MapPin size={16} className="text-neon-red" />
              Lahore, Punjab, Pakistan
            </motion.span>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUp}>
            <a
              href="mailto:moeedmoody96@gmail.com"
              className="inline-flex items-center gap-3 px-10 py-4 bg-neon-red text-white font-semibold tracking-widest uppercase text-sm rounded-sm shadow-neon hover:shadow-neon-lg hover:bg-neon-red-bright transition-all duration-300"
              data-ocid="contact.primary_button"
            >
              <Mail size={16} />
              Send Me an Email
            </a>
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center gap-6 mt-10"
          >
            <a
              href="https://github.com/moeedrizwan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-sm border border-primary/30 hover:border-neon-red flex items-center justify-center text-foreground/50 hover:text-neon-red transition-all duration-200 neon-border-hover"
              aria-label="GitHub"
              data-ocid="contact.link"
            >
              <SiGithub size={18} />
            </a>
            <a
              href="https://linkedin.com/in/moeedrizwan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-sm border border-primary/30 hover:border-neon-red flex items-center justify-center text-foreground/50 hover:text-neon-red transition-all duration-200 neon-border-hover"
              aria-label="LinkedIn"
              data-ocid="contact.link"
            >
              <SiLinkedin size={18} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 px-6 border-t border-primary/20 glass-dark">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-foreground/40 text-sm">
        <span className="font-heading font-bold text-neon-red tracking-widest">
          MOEED RIZWAN
        </span>
        <span>
          &copy; {year}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-red/70 hover:text-neon-red transition-colors"
          >
            caffeine.ai
          </a>
        </span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <ParticleBackground />
      <FloatingParticles />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
