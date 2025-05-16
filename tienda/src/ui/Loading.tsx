
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-950 to-black flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Círculos animados */}
        <div className="relative w-32 h-32">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 border-4 border-red-500 rounded-full"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Texto animado */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-white mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Cargando
          </motion.h2>
          <motion.div 
            className="flex gap-1 justify-center"
          >
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{
                  y: [-2, 2, -2],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Barra de progreso */}
        <motion.div 
          className="w-48 h-1 bg-red-800 rounded-full mt-6 overflow-hidden"
        >
          <motion.div
            className="h-full bg-red-500"
            animate={{
              x: [-192, 192]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;