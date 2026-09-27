import React from "react";
import { X } from "lucide-react";

/**
 * ReturnEvidenceModal - High-resolution defect photo lightbox for RMA inspection.
 */
export default function ReturnEvidenceModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="High-Res Defect Evidence"
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
        />
      </div>
    </div>
  );
}
