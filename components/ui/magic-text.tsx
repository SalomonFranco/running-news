"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react"
import { useRef } from "react"

interface WordProps {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  className?: string;
  wordClassNames?: Record<string, string>;
}

const Word: React.FC<WordProps> = ({ children, progress, range, className, wordClassNames }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const [revealed, setRevealed] = React.useState(false);

  useMotionValueEvent(opacity, "change", (v) => {
    if (v >= 1) setRevealed(true);
  });

  // Match by stripping punctuation so "curated," matches key "curated"
  const key = children.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const wordCls = wordClassNames?.[key] ?? className ?? '';

  return (
    <span className={`relative mt-[12px] mr-1 text-3xl font-semibold${wordCls ? ` ${wordCls}` : ''}`}>
      <motion.span style={{ opacity: revealed ? 1 : opacity }}>{children}</motion.span>
    </span>
  );
};

export interface MagicTextLinesProps {
  lines: string[];
  className?: string;
  lineClassNames?: string[];
  wordClassNames?: Record<string, string>;
}

export const MagicTextLines: React.FC<MagicTextLinesProps> = ({ lines, className, lineClassNames, wordClassNames }) => {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });

  // Build flat word list with global ranges so line 1 finishes before line 2 starts
  const allWords = lines.map(line => line.split(" "));
  const totalWords = allWords.reduce((sum, words) => sum + words.length, 0);

  let globalIndex = 0;

  return (
    <div ref={container} className={className}>
      {allWords.map((words, lineIdx) => (
        <p key={lineIdx} className="flex flex-wrap justify-center leading-[0.5] px-4 py-1">
          {words.map((word) => {
            const start = globalIndex / totalWords;
            const end = (globalIndex + 1) / totalWords;
            globalIndex++;
            return (
              <Word key={`${lineIdx}-${globalIndex}`} progress={scrollYProgress} range={[start, end]} className={lineClassNames?.[lineIdx]} wordClassNames={wordClassNames}>
                {word}
              </Word>
            );
          })}
        </p>
      ))}
    </div>
  );
};
