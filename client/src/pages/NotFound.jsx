import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bug } from 'lucide-react'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark bg-mesh flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full p-8 text-center space-y-6 relative overflow-hidden border-brand-500/30">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent-500/10 blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <motion.div
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500"
          >
            <Bug size={36} />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold text-white tracking-tighter">404</h1>
            <h2 className="text-xl font-bold text-white tracking-tight">Index Out Of Bounds!</h2>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
              The coding path you tried to execute leads to an invalid segment register. Please check the route and try again.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="primary" leftIcon={ArrowLeft} className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
