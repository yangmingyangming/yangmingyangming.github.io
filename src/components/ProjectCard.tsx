import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../data/portfolio";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link
      className={`project-card project-card-${index + 1} is-${project.cardTone}`}
      to={`/work/${project.slug}`}
      data-reveal
      data-testid="project-card"
      aria-label={`查看项目：${project.title}`}
    >
      <figure className="project-card-media">
        <img
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
        />
        <span className="project-card-shade" />
        <div className="project-card-copy">
          <h3>{project.title}</h3>
          <p data-testid="project-card-teaser">{project.teaser}</p>
        </div>
        <span className="project-card-mark" aria-hidden="true">
          <img className="project-card-cross" src="./cross-mark.webp" alt="" />
          <ArrowRight className="project-card-arrow" size={36} strokeWidth={1.6} />
        </span>
      </figure>
    </Link>
  );
}
