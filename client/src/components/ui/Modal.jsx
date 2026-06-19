import { motion, AnimatePresence } from "framer-motion";

export const Modal = ({ isOpen, onClose, title, children, footer }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70"
        />
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          className="relative bg-surface border border-line rounded-2xl max-w-md w-full p-7 shadow-2xl"
        >
          {title ? <h3 className="font-display text-2xl font-semibold mb-3">{title}</h3> : null}
          <div className="text-dim leading-relaxed">{children}</div>
          {footer ? <div className="mt-7 flex gap-3 justify-end">{footer}</div> : null}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
