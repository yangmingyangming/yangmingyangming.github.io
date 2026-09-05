import Lenis from "lenis";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CrossTransition from "../components/CrossTransition";
import LiquidSphere from "../components/LiquidSphere";
import ProjectCard from "../components/ProjectCard";
import SiteHeader from "../components/SiteHeader";
import Timeline from "../components/Timeline";
import {
  campusProjects,
  internships,
  projects,
  recognitions,
  skills,
} from "../data/portfolio";
import { useHomeMotion, useRevealMotion } from "../hooks/useHomeMotion";
import manifest from "../data/media-manifest.json";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const pageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const internshipRef = useRef<HTMLElement>(null);
  const campusRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const sectionRefs = useMemo(
    () => ({
      hero: heroRef,
      about: aboutRef,
      projects: projectsRef,
      internship: internshipRef,
      campus: campusRef,
      skills: skillsRef,
    }),
    [],
  );

  useHomeMotion(sectionRefs);
  useRevealMotion(pageRef);

  useEffect(() => {
    document.title = "杨茗 | Visual & Interaction Designer";
    const params = new URLSearchParams(location.search);
    const target = params.get("section");
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }));
  }, [location.search]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    const browserWindow = window as Window & { __portfolioLenis?: Lenis };
    browserWindow.__portfolioLenis = lenis;
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      delete browserWindow.__portfolioLenis;
    };
  }, []);

  const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const content = document.getElementById("main-content");
    content?.focus();
    content?.scrollIntoView();
  };

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>跳转到主要内容</a>
      <SiteHeader />
      <LiquidSphere />
      <main ref={pageRef} id="main-content" tabIndex={-1}>
        <section ref={heroRef} id="hero" className="hero-section">
          <h1 className="hero-title" aria-label="Yang Ming, visual and interaction designer">
            <span data-reveal>YANG MING</span>
            <span className="hero-title-offset" data-reveal>VISUAL &amp;</span>
            <span data-reveal>INTERACTION</span>
            <span className="hero-title-last" data-reveal>DESIGNER</span>
          </h1>
          <div className="hero-meta" data-reveal>
            <p>上海交通大学视觉传达设计学生</p>
            <p>AIGC 商业视觉 / 品牌系统 / 数字体验</p>
          </div>
          <Link className="hero-scroll" to="/?section=about" aria-label="查看关于我">
            SCROLL <ArrowDown size={15} />
          </Link>
        </section>

        <section ref={aboutRef} id="about" className="content-section about section-about">
          <div className="section-label" data-reveal><span>01</span><span>ABOUT ME</span></div>
          <div className="about-grid">
            <div className="about-statement" data-reveal>
              <h2>设计不止是<br />把东西变得好看。</h2>
              <p>我关注如何用视觉、叙事与生成式工具，把复杂需求转化为能够真实落地的体验。</p>
            </div>
            <figure className="about-portrait" data-reveal>
              <img
                src={manifest.portrait.src}
                width={manifest.portrait.width}
                height={manifest.portrait.height}
                alt="杨茗的生活照"
                loading="lazy"
              />
              <figcaption>YANG MING / SHANGHAI</figcaption>
            </figure>
            <div className="about-copy" data-reveal>
              <p>你好，我是杨茗，就读于上海交通大学视觉传达专业。我的实践横跨商业视觉、品牌与 IP、数字产品和游戏交互，并持续探索 AIGC 在真实设计流程中的应用。</p>
              <dl>
                <div><dt>EDUCATION</dt><dd>上海交通大学 · 视觉传达</dd></div>
                <div><dt>PERFORMANCE</dt><dd>GPA 3.69 · 专业前 10%</dd></div>
                <div><dt>FOCUS</dt><dd>视觉设计 · 交互设计 · AIGC</dd></div>
                <div><dt>EXPERIENCE</dt><dd>腾讯 · 滴滴 · 东方明珠</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section ref={projectsRef} id="projects" className="content-section section-projects">
          <div className="projects-intro">
            <div className="section-label" data-reveal><span>02</span><span>SELECTED WORK</span></div>
            <h2 data-reveal>FEATURED<br />WORK</h2>
            <p data-reveal>五个项目，记录从商业交付到数字体验的设计实践。</p>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        </section>

        <section ref={internshipRef} id="internship" className="content-section section-timeline">
          <div className="section-heading" data-reveal>
            <div className="section-label"><span>03</span><span>INTERNSHIP</span></div>
            <h2>REAL WORK.<br />REAL CONTEXT.</h2>
            <p>在真实业务中练习需求判断、视觉交付与多方协作。</p>
          </div>
          <Timeline entries={internships} label="实习经历" />
          <div className="impact-numbers" data-reveal>
            <div><strong>50+</strong><span>标准化视觉素材</span></div>
            <div><strong>100+</strong><span>商业视觉物料</span></div>
            <div><strong>3</strong><span>跨领域实习经历</span></div>
          </div>
        </section>

        <section ref={campusRef} id="campus" className="content-section section-timeline section-campus">
          <div className="section-heading" data-reveal>
            <div className="section-label"><span>04</span><span>CAMPUS PRACTICE</span></div>
            <h2>IDEAS INTO<br />THE WORLD.</h2>
            <p>从国家级赛事到公共艺术，让校园项目真正发生。</p>
          </div>
          <Timeline entries={campusProjects} label="校园经历" />
          <div className="recognition-band" aria-label="获奖经历">
            <div className="recognition-track">
              {[...recognitions, ...recognitions].map((recognition, index) => (
                <span key={`${recognition}-${index}`}>{recognition}<i>+</i></span>
              ))}
            </div>
          </div>
        </section>

        <section ref={skillsRef} id="skills" className="content-section section-skills">
          <div className="section-heading" data-reveal>
            <div className="section-label"><span>05</span><span>SKILLS &amp; TOOLS</span></div>
            <h2>WAYS OF<br />MAKING.</h2>
          </div>
          <div className="skills-grid">
            {skills.map((skill) => (
              <article className="skill-column" key={skill.title} data-reveal>
                <span>{skill.index}</span>
                <h3>{skill.title}</h3>
                <ul>{skill.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <CrossTransition />

        <section id="contact" className="contact-section">
          <div className="section-label" data-reveal><span>06</span><span>CONTACT</span></div>
          <div className="contact-layout">
            <h2 data-reveal>HOW ABOUT<br />WE DO A THING<br />OR TWO,<br />TO+GETHER.</h2>
            <div className="contact-links" data-reveal>
              <a href="mailto:yangmingyangming@sjtu.edu.cn">yangmingyangming@sjtu.edu.cn <ArrowUpRight size={18} /></a>
              <a href="https://github.com/yangmingyangming" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={18} /></a>
              <a href="https://xhslink.com/m/6X0szkc2JMo" target="_blank" rel="noreferrer">小红书 <ArrowUpRight size={18} /></a>
              <a href="https://v.douyin.com/bWBmFU5XDkE/" target="_blank" rel="noreferrer">抖音 <ArrowUpRight size={18} /></a>
            </div>
          </div>
          <footer>
            <span>© 2026 YANG MING</span>
            <span>VISUAL COMMUNICATION PORTFOLIO</span>
            <a href="#hero" onClick={(event) => { event.preventDefault(); document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" }); }}>BACK TO TOP ↑</a>
          </footer>
        </section>
      </main>
    </>
  );
}
