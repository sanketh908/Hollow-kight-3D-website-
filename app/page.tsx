"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Compass, Gem, Map, Swords, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { AreaTitle, CountUp, FadeFromBlack, Fleur, LightRays, MenuLink } from "@/components/hk-ui";
import { cn } from "@/lib/utils";

const Scene = dynamic(() => import("@/components/scene"), { ssr: false });

const STEAM = "https://store.steampowered.com/app/367520/Hollow_Knight/";

const features = [
  {
    icon: Compass,
    title: "Explore a vast, ruined kingdom",
    body: "Twisting caverns, ancient cities and deadly wastes, all interconnected. Buy maps from Cornifer, find your way, and uncover what lies beneath.",
    img: "/hk/shell.jpg",
    alt: "A pale, horned figure beside a cracked stone shell in a grey, misty wasteland",
  },
  {
    icon: Swords,
    title: "Battle tainted creatures",
    body: "Over 130 enemies and 30 bosses. Sharpen your nail, read every tell, and stand against knights, beasts and gods.",
    img: "/hk/s6.jpg",
    alt: "The Knight striking a husk sentry beneath lamplight in a blue city street",
  },
  {
    icon: Gem,
    title: "Forge your own path",
    body: "Collect more than forty Charms, each changing how you fight and explore. Mix, match, and build a Knight that is entirely yours.",
    img: "/hk/deepnest.webp",
    alt: "The Knight standing among fallen bugs and broken nails beneath the Deepnest area title",
  },
  {
    icon: Map,
    title: "Uncover forgotten lore",
    body: "Befriend bizarre bugs, trade relics with scholars, and piece together the fall of Hallownest one whisper at a time.",
    img: "/hk/fountain.jpg",
    alt: "A horned statue atop a lily-shaped fountain in the rain-soaked blue halls of the City of Tears",
  },
];

const regions = [
  { name: "Greenpath", img: "/hk/s1.jpg" },
  { name: "Crystal Peak", img: "/hk/s3.jpg" },
  { name: "Fungal Wastes", img: "/hk/s8.jpg" },
  { name: "The Grimm Troupe", img: "/hk/s2.jpg" },
  { name: "Colosseum of Fools", img: "/hk/s0.jpg" },
  { name: "Dirtmouth", img: "/hk/s7.jpg" },
];

const stats = [
  ["40+", "Charms"],
  ["130+", "Enemies"],
  ["30+", "Bosses"],
  ["4", "Free content packs"],
];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Tilt({ children, dir = 1, className }: { children: React.ReactNode; dir?: 1 | -1; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateY = useTransform(p, [0, 0.5, 1], [28 * dir, 0, -14 * dir]);
  const rotateX = useTransform(p, [0, 0.5, 1], [14, 0, -10]);
  const scale = useTransform(p, [0, 0.5, 1], [0.82, 1, 0.94]);
  const z = useTransform(p, [0, 0.5, 1], [-120, 0, -60]);
  return (
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      <motion.div style={reduce ? undefined : { rotateY, rotateX, scale, z }} className="[transform-style:preserve-3d]">
        {children}
      </motion.div>
    </div>
  );
}

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -64 }, lerp: 0.08 });
    return () => lenis.destroy();
  }, []);
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end pt-16">
      <motion.div style={{ opacity: fade }} className="absolute inset-0">
        <LightRays />
      </motion.div>
      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8 sm:pb-28"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <h1>
            <span className="sr-only">Hollow Knight</span>
            <Image
              src="/hk/logo.png"
              alt=""
              width={640}
              height={360}
              priority
              className="hk-glow -ml-4 w-[min(100%,26rem)] sm:-ml-6 [@media(max-height:500px)]:w-60"
            />
          </h1>
          <p className="mt-2 text-xl leading-relaxed text-foreground/85 sm:text-2xl">
            Beneath the fading town of Dirtmouth sleeps an ancient, ruined kingdom.
            Many are drawn below. Few return.
          </p>
          {/* Title-screen menu: stacked entries. */}
          <motion.nav
            aria-label="Start"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
            className="mt-8 flex flex-col items-center gap-1 sm:-ml-8 sm:items-start xl:-ml-20"
          >
            {[
              { href: "#journey", label: "Descend Now" },
              { href: "#gallery", label: "See the Kingdom" },
              { href: "#journey", label: "The Journey" },
            ].map((m) => (
              <motion.div
                key={m.label}
                variants={{
                  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
                  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8 } },
                }}
              >
                <MenuLink href={m.href}>
                  {m.label}
                </MenuLink>
              </motion.div>
            ))}
          </motion.nav>
        </motion.div>
      </motion.div>
      <motion.a
        href="#journey"
        style={{ opacity: fade }}
        aria-label="Scroll to descend"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 p-2 font-heading text-sm tracking-[0.2em] text-muted-foreground transition-colors hover:text-white sm:flex"
      >
        Descend
        <ChevronDown aria-hidden className="size-4 motion-safe:animate-bounce" />
      </motion.a>
    </section>
  );
}

function Ornament() {
  return (
    <div aria-hidden className="mx-auto flex max-w-xs items-center gap-2 text-muted-foreground/60">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
      <Fleur flip className="h-3" />
      <span className="size-2 rotate-45 border border-current" />
      <Fleur className="h-3" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
    </div>
  );
}

export default function Home() {
  useSmoothScroll();
  return (
    <main className="relative">
      <FadeFromBlack />
      <Scene />
      <div className="relative z-10">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-gradient-to-b from-background/90 to-background/40 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <a
            href="#"
            className="font-heading text-lg tracking-[0.15em] text-white transition-[text-shadow] duration-300 hover:[text-shadow:0_0_14px_rgba(255,236,200,.75)]"
          >
            Hallownest
          </a>
          <div className="flex items-center">
            {[
              ["#journey", "Journey"],
              ["#gallery", "Kingdom"],
              ["#descend", "Descend"],
            ].map(([href, label]) => (
              <MenuLink key={href} href={href} size="sm" className="hidden lg:inline-flex">
                {label}
              </MenuLink>
            ))}
            <MenuLink href={STEAM} size="sm" external>
              Buy
            </MenuLink>
          </div>
        </div>
      </motion.nav>

      <Hero />

      {/* Intro */}
      <section className="px-4 py-28 text-center sm:px-8">
        <Reveal className="mx-auto max-w-3xl">
          <Ornament />
          <p className="mt-10 font-heading text-2xl leading-snug sm:text-4xl">
            An epic action adventure through a vast ruined kingdom of insects and heroes.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a
            classic, hand-drawn 2D style.
          </p>
        </Reveal>
      </section>

      {/* Features */}
      <section id="journey" className="mx-auto max-w-6xl scroll-mt-16 space-y-28 px-4 pb-28 sm:px-8">
        {features.map((f, i) => (
          <div key={f.title} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            {/* Image sits under its text on phones; alternates sides on desktop. */}
            <Tilt dir={i % 2 ? -1 : 1} className={cn("max-md:order-2", i % 2 && "md:order-2")}>
              <div className="group relative aspect-video overflow-hidden rounded-sm shadow-2xl shadow-black/60 ring-1 ring-border transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(255,226,180,.18)] hover:ring-[rgba(255,226,180,.35)]">
                <Image
                  src={f.img}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </Tilt>
            <Reveal delay={0.1}>
              <f.icon aria-hidden className="size-7 text-muted-foreground drop-shadow-[0_0_8px_rgba(255,236,200,.5)]" strokeWidth={1.25} />
              <h2 className="mt-5 font-heading text-3xl leading-tight text-white [text-shadow:0_0_20px_rgba(255,236,200,.2)] sm:text-4xl">{f.title}</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{f.body}</p>
            </Reveal>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/30 backdrop-blur-sm">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 py-16 sm:px-8 md:grid-cols-4">
          {stats.map(([n, label], i) => (
            <Reveal key={label} delay={i * 0.08} className="text-center">
              <dt className="sr-only">{label}</dt>
              <dd className="font-heading text-4xl text-white [text-shadow:0_0_18px_rgba(255,236,200,.35)] sm:text-5xl">
                <CountUp value={n} />
              </dd>
              <dd className="mt-2 font-heading text-base text-muted-foreground">{label}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-28 sm:px-8">
        <AreaTitle>The Kingdom Below</AreaTitle>
        <Reveal className="text-center">
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every corner of Hallownest is hand-drawn, each with its own light, music and dangers.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((r, i) => (
            <Tilt key={r.name} dir={i % 3 === 0 ? 1 : i % 3 === 2 ? -1 : 1}>
              <figure className="group relative aspect-video overflow-hidden rounded-sm ring-1 ring-border transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(255,226,180,.18)] hover:ring-[rgba(255,226,180,.35)]">
                <Image
                  src={r.img}
                  alt={`Screenshot of ${r.name}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-3 font-heading text-lg text-white transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_12px_rgba(255,236,200,.8)]">
                  <Fleur className="h-3 w-0 opacity-0 transition-all duration-300 group-hover:w-auto group-hover:opacity-100" />
                  {r.name}
                </figcaption>
              </figure>
            </Tilt>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="descend" className="relative flex min-h-[100svh] scroll-mt-16 items-center justify-center px-4 text-center sm:px-8">
        <Reveal className="relative mx-auto max-w-2xl">
          <AreaTitle>Your Journey Awaits</AreaTitle>
          <p className="mt-5 text-muted-foreground">
            Available on PC, Mac, Linux, Nintendo Switch, PlayStation and Xbox.
          </p>
          <MenuLink href={STEAM} external className="mt-10">
            Get Hollow Knight
          </MenuLink>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 px-4 py-10 text-center text-sm text-muted-foreground sm:px-8">
        <p>
          Fan-made showcase. Not affiliated with Team Cherry. Hollow Knight and all game art © Team
          Cherry.
        </p>
      </footer>
      </div>
    </main>
  );
}
