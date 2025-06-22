import * as framerMotion from "framer-motion";
export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <framerMotion.motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </framerMotion.motion.div>
  );
}
