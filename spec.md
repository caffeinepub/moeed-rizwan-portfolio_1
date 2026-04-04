# Moeed Rizwan Portfolio

## Current State
The portfolio is a traditional single-page scrolling layout with:
- Top fixed navbar (MR logo + nav links)
- Full-page sections stacked vertically: Hero, About, Skills, Projects, Contact, Footer
- Animated WebGL shader background (FBM neon red blobs)
- Floating particles canvas layer
- All sections always visible via scrolling

## Requested Changes (Diff)

### Add
- Fixed left sidebar matching p5aholic.me layout exactly: name at top, role label, nav items with dot indicators
- Thin decorative frame lines on all 4 screen edges (like p5aholic.me)
- Copyright text fixed at bottom-left
- Intro/enter view with name + "Portfolio" text that animates out on load
- Page-based navigation: each nav item (Home, About, Skills, Projects, Contact) reveals that page's content; only one page visible at a time
- Animated page transitions (fade/slide in when nav is clicked)
- Active nav item highlighted with neon red dot indicator

### Modify
- Remove old scrolling navbar, hero section, and footer
- Remove FloatingParticles layer (keep ParticleBackground WebGL shader)
- Convert all sections into "pages" that appear/disappear based on active nav state
- Home page: shows the about-me bio text in p5aholic style (centered, large, flowing text)
- Projects page: keep existing HUD-style project cards but inside the page layout
- Skills page: existing skill badges inside page layout
- Contact page: existing contact info inside page layout
- All pages float over the animated background (transparent/semi-transparent panels)

### Remove
- Scrolling layout (no more scroll-based reveal)
- Top navbar
- Hero section (replaced by sidebar + home page)
- Footer (replaced by copyright text in bottom-left)
- FloatingParticles component usage

## Implementation Plan
1. Rewrite App.tsx with:
   - `EnterView` component: full-screen intro overlay with name + "Portfolio" that fades out after ~1.5s
   - `Frame` component: 4 thin decorative lines on screen edges using fixed positioning
   - `SideHeader` component: fixed left sidebar with name, role, nav items with dot + active state
   - `Copyright` component: fixed bottom-left copyright
   - `PageContent` component: full-screen content area (left of sidebar) that renders active page
   - Pages: Home (bio text), About (glass card), Skills (badges), Projects (HUD cards), Contact (contact info)
   - State: `activePage` controls which page is shown
   - Nav items: Home, About, Skills, Projects, Contact
   - Transitions: AnimatePresence with fade for page changes
2. Style sidebar to be minimal: fixed left, vertically centered nav, neon red dots and active highlighting with #dd2200
3. Keep ParticleBackground WebGL shader as always-on background
4. Make all page content panels transparent/glass over the shader
5. Remove FloatingParticles from render tree
