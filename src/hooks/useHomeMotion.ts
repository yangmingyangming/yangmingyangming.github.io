import { type RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  desktopSphereStates,
  mobileSphereStates,
  sphereMotion,
  type SphereMotion,
} from "../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type SectionRefs = Record<string, RefObject<HTMLElement | null>>;

const copyState = (state: SphereMotion) => Object.assign(sphereMotion, state);

export function useHomeMotion(sectionRefs: SectionRefs) {
  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      copyState(window.innerWidth <= 820 ? mobileSphereStates.hero : desktopSphereStates.hero);
      return;
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const install = (states: Record<string, SphereMotion>) => {
        const order = ["hero", "about", "projects", "internship", "campus", "skills"];
        const triggers: ScrollTrigger[] = [];
        copyState(states.hero);

        order.slice(1).forEach((key, index) => {
          const element = sectionRefs[key]?.current;
          if (!element) return;
          const previous = states[order[index]];
          const current = states[key];

          const trigger = ScrollTrigger.create({
            trigger: element,
            start: "top 88%",
            end: "top 18%",
            scrub: 0.65,
            onUpdate: ({ progress }) => {
              const eased = gsap.parseEase("power2.inOut")(progress);
              sphereMotion.x = gsap.utils.interpolate(previous.x, current.x, eased);
              sphereMotion.y = gsap.utils.interpolate(previous.y, current.y, eased);
              sphereMotion.scale = gsap.utils.interpolate(previous.scale, current.scale, eased);
              sphereMotion.opacity = gsap.utils.interpolate(previous.opacity, current.opacity, eased);
            },
            onLeave: () => copyState(current),
            onLeaveBack: () => copyState(previous),
          });
          triggers.push(trigger);
        });

        return () => triggers.forEach((trigger) => trigger.kill());
      };

      media.add("(min-width: 821px)", () => install(desktopSphereStates));
      media.add("(max-width: 820px)", () => install(mobileSphereStates));
    });

    return () => {
      context.revert();
      copyState(window.innerWidth <= 820 ? mobileSphereStates.hero : desktopSphereStates.hero);
    };
  }, [sectionRefs]);
}

export function useRevealMotion(container: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!container.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    }, container);

    return () => context.revert();
  }, [container]);
}
