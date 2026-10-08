import type { Transition, Variants } from "framer-motion";

export const springBounce: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const scaleBounce: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const tabTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const chatMessageEntrance: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export const tagPopIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
};
