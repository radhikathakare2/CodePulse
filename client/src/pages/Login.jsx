import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Code } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login({ email: form.email, password: form.password })
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-dark to-accent-900/30" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-float-slow" />

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-purple">
              <Zap size={36} className="text-white" fill="white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black font-display text-white mb-4"
          >
            Welcome Back to<br /><span className="text-gradient">CodePulse</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mb-12"
          >
            Track. Analyze. Dominate.<br />Your journey continues here.
          </motion.p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex -space-x-3 justify-center mb-3">
              {['A', 'R', 'P', 'S', 'M'].map((initial, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm border-2 border-dark"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-300 font-medium">Trusted by <span className="text-brand-400 font-bold">10,000+</span> programmers</p>
            <p className="text-xs text-gray-500 mt-1">from Google, Meta, Amazon & top universities</p>
          </motion.div>

          {/* Code snippet decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-left bg-dark-200/60 rounded-xl p-4 border border-white/5 font-mono text-xs"
          >
            <div className="text-brand-400">// Your coding stats today</div>
            <div className="text-gray-300 mt-1">streak: <span className="text-amber-400">🔥 47 days</span></div>
            <div className="text-gray-300">rating: <span className="text-cyan-400">1847</span></div>
            <div className="text-gray-300">rank: <span className="text-emerald-400">#1,234</span></div>
          </motion.div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-mesh opacity-30" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-lg">Code<span className="text-gradient">Pulse</span></span>
          </Link>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-display text-white mb-1">Sign in</h2>
              <p className="text-gray-400 text-sm">Welcome back! Continue your journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                rightIcon={showPass ? EyeOff : Eye}
                onRightIconClick={() => setShowPass(p => !p)}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm(p => ({ ...p, remember: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-brand-500"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Sign In
                <ArrowRight size={16} />
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
