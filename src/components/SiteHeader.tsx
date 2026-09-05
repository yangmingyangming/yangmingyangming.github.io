import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  ["about", "关于"],
  ["projects", "作品"],
  ["internship", "实习"],
  ["campus", "校园"],
  ["skills", "技能"],
  ["contact", "联系"],
] as const;

export default function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const onHome = location.pathname === "/";

  useEffect(() => {
    setMenuOpen(false);
    if (!onHome) return;
    const sections = links
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.25, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome]);

  const destination = (id: string) => `/?section=${id}`;

  return (
    <header className="site-header">
      <Link className="brand-link" to="/" aria-label="返回首页">
        YANG MING<span>.</span>
      </Link>
      <div className="header-status" aria-hidden="true">
        <span className="status-dot" />
        SHANGHAI · CN
      </div>
      <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="主导航">
        {links.map(([id, label]) => (
          <Link
            key={id}
            to={destination(id)}
            className={active === id ? "is-active" : ""}
            onClick={() => {
              setMenuOpen(false);
              if (onHome) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link className="contact-pill" to={destination("contact")}>CONTACT</Link>
      <button
        className="menu-button"
        type="button"
        aria-label={menuOpen ? "关闭导航" : "打开导航"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
