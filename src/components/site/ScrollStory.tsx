"use client";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import styles from "./ScrollStory.module.css";

export function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const productY = useTransform(scrollYProgress, [0, 1], [48, -56]);
  const productScale = useTransform(scrollYProgress, [0, 1], [0.92, 1.06]);
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.86, 1],
    [0, 1, 1, 0],
  );
  const copyY = useTransform(scrollYProgress, [0, 0.18, 1], [28, 0, -18]);

  const motionStyle = shouldReduceMotion
    ? undefined
    : { y: productY, scale: productScale };
  const copyStyle = shouldReduceMotion
    ? undefined
    : { opacity: copyOpacity, y: copyY };

  return (
    <section
      ref={sectionRef}
      className={styles.story}
      aria-labelledby="scroll-story-title"
    >
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.glow} />
        <motion.img
          className={styles.product}
          src="/images/solar-panel.webp"
          alt=""
          width={1400}
          height={1000}
          loading="lazy"
          decoding="async"
          style={motionStyle}
        />
        <motion.div className={styles.copy} style={copyStyle}>
          <p className={styles.eyebrow}>UMA NOVA EXPERIÊNCIA</p>
          <h2>Feito para ir mais longe.</h2>
          <p>
            Apresente em poucas palavras o benefício principal do seu produto ou serviço.
          </p>
        </motion.div>
        <motion.div
          className={styles.progress}
          style={
            shouldReduceMotion ? undefined : { scaleX: scrollYProgress }
          }
        />
      </div>

      <div className={styles.srOnly}>
        <h2 id="scroll-story-title">Feito para ir mais longe.</h2>
        <p>
          Apresente em poucas palavras o benefício principal do seu produto ou serviço.
        </p>
      </div>
    </section>
  );
}