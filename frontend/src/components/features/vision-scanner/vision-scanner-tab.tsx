"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/error-message";
import { scaleBounce, staggerContainer, staggerChild, tagPopIn, springBounce, springGentle } from "@/lib/animations";
import type { FridgeAnalysisResult } from "@/lib/api";

interface VisionScannerTabProps {
  fridgeResult: FridgeAnalysisResult | null;
  loadingFridge: boolean;
  fridgeError: string;
  onScan: (file: File) => void;
  onTransferToAgents: () => void;
}

export function VisionScannerTab({
  fridgeResult,
  loadingFridge,
  fridgeError,
  onScan,
  onTransferToAgents,
}: VisionScannerTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div
        variants={scaleBounce}
        initial="initial"
        animate="animate"
        transition={springBounce}
        className="glass-strong rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="text-lg font-heading font-bold text-warm-brown flex items-center gap-2">
          <Camera className="w-5 h-5 text-terracotta" /> Fridge Visual Analysis
        </h2>

        <motion.div
          whileHover={{ borderColor: "rgba(198, 93, 62, 0.4)" }}
          className="border-2 border-dashed border-beige-300 rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center min-h-[220px] bg-beige-50/50"
        >
          {previewUrl ? (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={previewUrl}
              alt="Preview"
              className="max-h-48 rounded-lg object-cover mb-3"
            />
          ) : (
            <div className="space-y-2">
              <Camera className="w-10 h-10 text-beige-400 mx-auto" />
              <p className="text-xs text-warm-brown-light">Upload fridge or pantry photo</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs text-warm-brown-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-terracotta-muted file:text-terracotta file:font-medium hover:file:bg-terracotta/10 cursor-pointer mt-2"
          />
        </motion.div>

        {fridgeError && <ErrorMessage message={fridgeError} />}

        <Button
          onClick={() => file && onScan(file)}
          disabled={loadingFridge || !file}
          className="w-full py-3 bg-terracotta hover:bg-terracotta-light text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-terracotta/20 cursor-pointer"
        >
          {loadingFridge ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Analyze Image with Vision Model"
          )}
        </Button>
      </motion.div>

      <motion.div
        variants={scaleBounce}
        initial="initial"
        animate="animate"
        transition={{ ...springBounce, delay: 0.1 }}
        className="glass-strong rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-warm-brown-light uppercase tracking-wider">
          Detected Visual Telemetry
        </h3>

        {fridgeResult ? (
          <div className="space-y-4">
            <p className="italic text-terracotta text-sm">
              &ldquo;{fridgeResult.chef_mario_comment}&rdquo;
            </p>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-wrap gap-2"
            >
              {fridgeResult.detected_ingredients?.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={tagPopIn}
                  transition={{ ...springBounce, delay: idx * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-terracotta-muted text-terracotta border border-terracotta/20 text-xs px-3 py-1 font-medium"
                  >
                    {item.name}{" "}
                    <span className="text-warm-brown-light ml-1">({item.category})</span>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            <Button
              onClick={onTransferToAgents}
              className="w-full py-2.5 bg-sage hover:bg-sage/90 text-white font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Execute 3-Agent Workflow <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="h-[220px] rounded-xl border border-beige-300/60 flex items-center justify-center text-xs text-beige-500 bg-beige-50/40">
            Awaiting image payload...
          </div>
        )}
      </motion.div>
    </div>
  );
}
