import { ExternalLink, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
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
  },
  {
    name: "OneVision",
    description:
      "Workforce Harmony SaaS platform for team management and operational alignment.",
    url: "https://onevision.io/",
    category: "SaaS",
  },
];

type PageId = "home" | "about" | "skills" | "projects" | "contact";

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
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

const pageTransition: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const lineStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const lineReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

// ─────────────────────────────────────────────
// Projects Sub-components
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
      {/* Category stripe */}
      <div
        className="w-full flex-shrink-0"
        style={{
          height: "6px",
          background: catColor,
          boxShadow: `0 0 8px ${catColor}80`,
        }}
      />

      {/* Glowing dot */}
      <div
        className="absolute top-3 left-3 w-[6px] h-[6px] rounded-full animate-dot-pulse z-20"
        style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }}
        aria-hidden="true"
      />

      {/* SYS-XX label */}
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

      {/* Iframe preview */}
      {project.url && project.status !== "not-in-dev" && (
        <IframePreview url={project.url} name={project.name} />
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 pt-4">
        {/* Category pill */}
        <span
          className="self-start font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 mb-3"
          style={{
            color: catColor,
            background: `${catColor}18`,
            border: `1px solid ${catColor}40`,
          }}
        >
          {project.category}
        </span>

        <h3 className="font-heading text-base font-bold text-foreground/90 mb-2 leading-tight">
          {project.name}
        </h3>
        <p className="text-foreground/50 text-xs leading-relaxed flex-1 mb-4">
          {project.description}
        </p>

        {/* CTA */}
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start group/btn flex items-center gap-1.5 mt-auto"
            aria-label={`Launch ${project.name}`}
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

function CountBadge({
  count,
  animate: shouldAnimate,
}: { count: number; animate: boolean }) {
  const [key, setKey] = useState(0);

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

function ScanSweepLine() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, []);

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

// ─────────────────────────────────────────────
// Page Components
// ─────────────────────────────────────────────

const HOME_LINES = [
  "Lead Full Stack Developer",
  "with 7+ years of experience",
  "building modern apps,",
  "powerful backends &",
  "high-performing e-commerce.",
  "I specialize in",
  "Python, Django, Flask,",
  "MERN Stack, WordPress,",
  "and Shopify solutions.",
  "Based in",
  "Lahore, Pakistan.",
];

function HomePage() {
  return (
    <motion.div
      key="home"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center min-h-full px-8 py-16"
      data-page="home"
    >
      <motion.div
        variants={lineStagger}
        initial="hidden"
        animate="visible"
        className="max-w-lg"
      >
        {HOME_LINES.map((line, i) => (
          <motion.span
            key={line}
            variants={lineReveal}
            className="block"
            style={{
              fontSize: i === 0 ? "1.9rem" : i >= 9 ? "1.4rem" : "1.6rem",
              lineHeight: "1.6",
              color:
                i === 0
                  ? "#dd2200"
                  : i === 10
                    ? "rgba(221,34,0,0.85)"
                    : "rgba(255,255,255,0.88)",
              fontFamily:
                i === 0
                  ? "Bricolage Grotesque, system-ui, sans-serif"
                  : undefined,
              fontWeight: i === 0 ? 700 : i === 10 ? 600 : 400,
              letterSpacing: i === 0 ? "0.02em" : undefined,
              textShadow:
                i === 0
                  ? "0 0 24px rgba(221,34,0,0.5), 0 0 48px rgba(221,34,0,0.2)"
                  : undefined,
            }}
          >
            {line}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function AboutPage() {
  return (
    <motion.div
      key="about"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center min-h-full px-8 py-16"
      data-page="about"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <motion.p
          variants={fadeUp}
          className="text-neon-red text-xs tracking-[0.3em] uppercase mb-3"
        >
          About Me
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-heading text-4xl font-bold text-foreground leading-tight mb-2"
        >
          Crafting Digital{" "}
          <span
            className="text-neon-red"
            style={{ textShadow: "0 0 20px rgba(221,34,0,0.5)" }}
          >
            Experiences
          </span>
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="w-12 h-px bg-neon-red mb-8"
          style={{ boxShadow: "0 0 8px rgba(221,34,0,0.8)" }}
        />

        <motion.div
          variants={fadeUp}
          className="glass rounded-sm p-8 neon-border"
        >
          <p className="text-foreground/80 leading-relaxed mb-5 text-base">
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function SkillsPage() {
  return (
    <motion.div
      key="skills"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center min-h-full px-8 py-16"
      data-page="skills"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl"
      >
        <motion.p
          variants={fadeUp}
          className="text-neon-red text-xs tracking-[0.3em] uppercase mb-3 text-center"
        >
          Expertise
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-heading text-4xl font-bold text-foreground text-center mb-2"
        >
          Technical{" "}
          <span
            className="text-neon-red"
            style={{ textShadow: "0 0 20px rgba(221,34,0,0.5)" }}
          >
            Skills
          </span>
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="w-12 h-px bg-neon-red mx-auto mb-10"
          style={{ boxShadow: "0 0 8px rgba(221,34,0,0.8)" }}
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
    </motion.div>
  );
}

function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");
  const [prevFilter, setPrevFilter] = useState<ProjectCategory>("All");

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
    <motion.div
      key="projects"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="px-8 py-12"
      data-page="projects"
    >
      <motion.div variants={stagger} initial="hidden" animate="visible">
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
          <ScanSweepLine />
        </motion.div>

        {/* HUD-style filter tabs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap gap-2 justify-center mb-10"
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
          className="mt-10 text-center font-mono text-[11px] tracking-[0.2em]"
          style={{ color: "rgba(221,34,0,0.3)", opacity: 0.7 }}
        >
          {"// END OF RECORDS — "}
          {filtered.length}
          {" PROJECTS LOADED"}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ContactPage() {
  return (
    <motion.div
      key="contact"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center min-h-full px-8 py-16"
      data-page="contact"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center"
      >
        <motion.p
          variants={fadeUp}
          className="text-neon-red text-xs tracking-[0.3em] uppercase mb-3"
        >
          Get In Touch
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-heading text-4xl font-bold text-foreground mb-2"
        >
          Let&apos;s{" "}
          <span
            className="text-neon-red"
            style={{ textShadow: "0 0 20px rgba(221,34,0,0.5)" }}
          >
            Connect
          </span>
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="w-12 h-px bg-neon-red mx-auto mb-8"
          style={{ boxShadow: "0 0 8px rgba(221,34,0,0.8)" }}
        />

        <motion.p
          variants={fadeUp}
          className="text-foreground/60 text-base leading-relaxed mb-10"
        >
          Have a project in mind or want to collaborate? I&apos;m always open to
          new opportunities.
        </motion.p>

        <motion.div
          variants={stagger}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <motion.a
            variants={fadeUp}
            href="mailto:moeedmoody96@gmail.com"
            className="flex items-center gap-3 text-foreground/70 hover:text-neon-red transition-colors text-sm"
          >
            <Mail size={16} className="text-neon-red" />
            moeedmoody96@gmail.com
          </motion.a>
          <motion.span
            variants={fadeUp}
            className="flex items-center gap-3 text-foreground/70 text-sm"
          >
            <Phone size={16} className="text-neon-red" />
            3350472139
          </motion.span>
          <motion.span
            variants={fadeUp}
            className="flex items-center gap-3 text-foreground/70 text-sm"
          >
            <MapPin size={16} className="text-neon-red" />
            Lahore, Punjab, Pakistan
          </motion.span>
        </motion.div>

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
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Intro Overlay (#EnterView)
// ─────────────────────────────────────────────

function EnterView({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      id="EnterView"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center"
      >
        <h1
          className="font-heading text-5xl sm:text-6xl font-bold tracking-widest text-white mb-3"
          style={{
            textShadow:
              "0 0 30px rgba(221,34,0,0.6), 0 0 60px rgba(221,34,0,0.25)",
          }}
        >
          MOEED{" "}
          <span
            style={{
              color: "#dd2200",
              textShadow:
                "0 0 30px rgba(221,34,0,0.8), 0 0 60px rgba(221,34,0,0.35)",
            }}
          >
            RIZWAN
          </span>
        </h1>
        <p
          className="text-sm tracking-[0.35em] uppercase"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Portfolio
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Sidebar Navigation
// ─────────────────────────────────────────────

function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        id="SiteHeader"
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50"
        style={{ width: "210px", padding: "40px 0 40px 32px" }}
      >
        {/* Site name */}
        <div className="mb-auto">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="text-left"
            data-ocid="nav.link"
          >
            <p
              className="font-heading text-sm font-bold tracking-[0.12em] uppercase"
              style={{
                color: "#dd2200",
                textShadow: "0 0 12px rgba(221,34,0,0.5)",
              }}
            >
              Moeed Rizwan
            </p>
            <p
              className="text-[10px] tracking-[0.08em] mt-0.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Lead Full Stack Developer
            </p>
          </button>
        </div>

        {/* Nav — vertically centered */}
        <nav className="flex-1 flex items-center">
          <ul className="flex flex-col gap-5">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center gap-3 group/navitem transition-all duration-200"
                    data-ocid={`nav.${item.id}.link`}
                  >
                    {/* Dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300"
                      style={{
                        background: isActive
                          ? "#dd2200"
                          : "rgba(255,255,255,0.2)",
                        boxShadow: isActive
                          ? "0 0 6px rgba(221,34,0,0.9), 0 0 12px rgba(221,34,0,0.4)"
                          : "none",
                        transform: isActive ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                    {/* Label */}
                    <span
                      className="text-xs tracking-[0.1em] uppercase transition-all duration-200"
                      style={{
                        color: isActive
                          ? "rgba(255,255,255,0.95)"
                          : "rgba(255,255,255,0.35)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Copyright bottom */}
        <div id="Copyright" className="mt-auto">
          <p
            className="text-[10px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            &copy; Moeed Rizwan
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(221,34,0,0.15)",
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="font-heading text-sm font-bold tracking-[0.12em] uppercase"
          style={{
            color: "#dd2200",
            textShadow: "0 0 10px rgba(221,34,0,0.5)",
          }}
          data-ocid="nav.link"
        >
          MR
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="text-foreground/60 hover:text-neon-red transition-colors"
          aria-label="Toggle navigation"
          data-ocid="nav.toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-14 left-0 right-0 z-40 py-4 px-5"
            style={{
              background: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(221,34,0,0.2)",
            }}
            data-ocid="nav.dropdown_menu"
          >
            <ul className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 w-full"
                      data-ocid={`nav.${item.id}.link`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: isActive
                            ? "#dd2200"
                            : "rgba(255,255,255,0.2)",
                          boxShadow: isActive
                            ? "0 0 6px rgba(221,34,0,0.9)"
                            : "none",
                        }}
                      />
                      <span
                        className="text-xs tracking-[0.1em] uppercase"
                        style={{
                          color: isActive
                            ? "rgba(255,255,255,0.95)"
                            : "rgba(255,255,255,0.45)",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// Frame Lines
// ─────────────────────────────────────────────

function FrameLines() {
  const lineColor = "rgba(221,34,0,0.2)";
  return (
    <div className="frame pointer-events-none" aria-hidden="true">
      {/* Left */}
      <div
        className="frame_line-left fixed top-0 bottom-0 z-10"
        style={{ left: 0, width: "1px", background: lineColor }}
      />
      {/* Right */}
      <div
        className="frame_line-right fixed top-0 bottom-0 z-10"
        style={{ right: 0, width: "1px", background: lineColor }}
      />
      {/* Top */}
      <div
        className="frame_line-top fixed left-6 right-6 z-10"
        style={{ top: "24px", height: "1px", background: lineColor }}
      />
      {/* Bottom */}
      <div
        className="frame_line-bottom fixed left-6 right-6 z-10"
        style={{ bottom: "24px", height: "1px", background: lineColor }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activePage, setActivePage] = useState<PageId>("home");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-foreground overflow-hidden"
      style={{ position: "fixed", inset: 0 }}
    >
      {/* WebGL Animated Background */}
      <ParticleBackground />

      {/* Decorative frame lines */}
      <FrameLines />

      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && <EnterView onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      {/* Sidebar navigation */}
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main content area — right of sidebar */}
      <div
        id="Content"
        ref={contentRef}
        className="fixed top-0 bottom-0 right-0 overflow-y-auto"
        style={{
          left: "210px",
          paddingTop: "0",
          // On mobile, left = 0 and add top padding for mobile header
        }}
      >
        {/* Mobile: full width with top padding */}
        <div className="md:hidden" style={{ height: "56px" }} />

        <AnimatePresence mode="wait">
          {activePage === "home" && <HomePage key="home" />}
          {activePage === "about" && <AboutPage key="about" />}
          {activePage === "skills" && <SkillsPage key="skills" />}
          {activePage === "projects" && <ProjectsPage key="projects" />}
          {activePage === "contact" && <ContactPage key="contact" />}
        </AnimatePresence>

        {/* Footer caffeine attribution */}
        <footer
          className="py-6 px-8 mt-8"
          style={{ borderTop: "1px solid rgba(221,34,0,0.1)" }}
        >
          <p
            className="text-[11px] text-center"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(221,34,0,0.5)" }}
              className="hover:text-neon-red transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* Mobile: full-width content override */}
      <style>{`
        @media (max-width: 767px) {
          #Content {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
