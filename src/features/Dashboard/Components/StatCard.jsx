// src/features/Dashboard/components/StatCard.jsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color, details, trend }) => (
  <motion.div 
    className="card p-6 flex flex-col justify-between group relative overflow-hidden"
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="flex items-center justify-between relative z-10">
      <p className="text-base font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <div className={`p-3 rounded-xl ${color} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">{value}</p>
      
      {(details || trend) && (
        <div className="flex items-center justify-between mt-2">
          {details && <p className="text-xs text-gray-500 dark:text-gray-400">{details}</p>}
          
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{trend.value}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  </motion.div>
);