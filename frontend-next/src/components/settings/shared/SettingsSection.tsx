import { motion } from 'framer-motion';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  gradient?: string;
}

export default function SettingsSection({ title, description, icon, children, gradient = 'from-purple-500 to-pink-500' }: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{title}</h2>
            {description && <p className="text-white/80 text-sm mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
