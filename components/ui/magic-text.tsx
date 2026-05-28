"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

interface WordProps {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mt-[12px] mr-1 text-3xl font-semibold">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

export interface MagicTextLinesProps {
  lines: string[];
  className?: string;
}

export const MagicTextLines: React.FC<MagicTextLinesProps> = ({ lines, className }) => {
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
              <Word key={`${lineIdx}-${globalIndex}`} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      ))}
    </div>
  );
};
