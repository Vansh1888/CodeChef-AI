"use client";

import { motion } from "framer-motion";
import { TABS, type TabId } from "@/lib/constants";
import { springBounce } from "@/lib/animations";

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springBounce, delay: 0.24 }}
      className="flex justify-center pb-2"
    >
      <nav className="flex gap-1.5 p-1.5 glass-strong rounded-2xl shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-terracotta rounded-xl shadow-lg shadow-terracotta/20"
                  transition={springBounce}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-warm-brown-light hover:text-warm-brown"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}
