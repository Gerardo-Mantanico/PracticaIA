"use client";

import React from "react";
import { Modal } from "./index";

type Size = "sm" | "md" | "lg" | "full" | "auto";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  size?: Size;
  className?: string;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

export const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  children,
  size = "md",
  className = "",
  showCloseButton = true,
  isFullscreen = false,
}) => {
  // Make modals responsive: full width on small screens (w-full) but constrained
  // by a max-width on larger screens. Provide an `auto` option to let content
  // drive the width (useful for small forms).
  const sizeClass = {
    sm: "w-full sm:max-w-sm",
    md: "w-full sm:max-w-md",
    lg: "w-full sm:max-w-lg",
    full: "w-full h-full",
    auto: "w-auto",
  }[size];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${sizeClass} ${className}`}
      showCloseButton={showCloseButton}
      isFullscreen={isFullscreen}
    >
      {/* remove fixed w-full here so the modal can size to content when using `auto` */}
      <div className="relative p-4 bg-white rounded-3xl dark:bg-gray-900">
        {title && (
          <div className="mb-4 flex items-center justify-between">
          </div>
        )}

        <div>{children}</div>
        {footer && <div className="border-t mt-4 pt-3">{footer}</div>}
      </div>
    </Modal>
  );
};
export default GenericModal;