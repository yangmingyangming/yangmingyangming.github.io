import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { getProjectNeighbors, projects } from "../data/portfolio";
import NotFoundPage from "./NotFoundPage";

export default function ProjectPage() {
  const { slug = "" } = useParams();
  const project = projects.find((item) => item.slug === slug);
  const neighbors = getProjectNeighbors(slug);

  useEffect(() => {
    if (project) document.title = `${project.title} | 杨茗作品集`;
  }, [project]);

  if (!project || !neighbors) return <NotFoundPage />;

  return (
    <div className="project-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <header className="project-hero">
          <Link className="project-back" to="/?section=projects"><ArrowLeft size={17} /> ALL WORK</Link>
          <p className="project-number">{String(projects.indexOf(project) + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
          <h1>{project.title}</h1>
          <p className="project-english-title">{project.englishTitle}</p>
          <div className="project-overview">
            <div className="project-facts">
              <p><span>TYPE</span>{project.category}</p>
              {project.year && <p><span>PERIOD</span>{project.year}</p>}
              {project.company && <p><span>COMPANY</span>{project.company}</p>}
              {project.role && <p><span>ROLE</span>{project.role}</p>}
            </div>
            <p className="project-intro">{project.intro}</p>
          </div>
        </header>

        <section className="project-gallery" aria-label={`${project.title} 项目图片`}>
          {project.images.map((image, index) => (
            <figure key={`${image.src}-${index}`} className="project-image-frame">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </section>

        <nav className="project-neighbors" aria-label="相邻项目">
          <Link to={`/work/${neighbors.previous.slug}`}>
            <span><ArrowLeft size={17} /> PREVIOUS</span>
            <strong>{neighbors.previous.title}</strong>
          </Link>
          <Link to={`/work/${neighbors.next.slug}`}>
            <span>NEXT <ArrowRight size={17} /></span>
            <strong>{neighbors.next.title}</strong>
          </Link>
        </nav>
        <footer className="project-footer">
          <span>YANG MING · 2026</span>
          <a href="mailto:yangmingyangming@sjtu.edu.cn">GET IN TOUCH <ArrowUpRight size={16} /></a>
        </footer>
      </main>
    </div>
  );
}
