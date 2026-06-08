import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, Eye, EyeOff, AtSign, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Platforms', 'Done']

export default function Register() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
    leetcode: '', codeforces: '', gfg: '', terms: false,
  })
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validateStep0 = () => {
    if (!form.name.trim()) return 'Name is required'
    if (!form.username.trim()) return 'Username is required'
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) return 'Username must be 3-20 chars, letters/numbers/underscore only'
    if (!form.email.includes('@')) return 'Valid email required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleNext = () => {
    if (step === 0) {
      const err = validateStep0()
      if (err) { toast.error(err); return }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!form.terms) { toast.error('Please accept the terms'); return }
    setIsLoading(true)
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        platforms: {
          leetcode: form.leetcode,
          codeforces: form.codeforces,
          gfg: form.gfg,
        },
      })
      await login({ email: form.email, password: form.password })
      toast.success('Account created! Welcome to CodePulse! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 bg-mesh">
      <div className="absolute inset-0 bg-mesh" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center shadow-glow-sm">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl">Code<span className="text-gradient">Pulse</span></span>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs transition-all duration-300 ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-500 text-white shadow-glow-purple' : 'bg-white/10 text-gray-500'
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`ml-2 text-xs font-medium ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-300 ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold font-display text-white mb-1">Create your account</h2>
                <p className="text-gray-400 text-sm">Start your competitive programming journey</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" icon={User} placeholder="Arjun Sharma" value={form.name} onChange={e => update('name', e.target.value)} required />
                <Input label="Username" icon={AtSign} placeholder="arjun_codes" value={form.username} onChange={e => update('username', e.target.value.toLowerCase())} required />
              </div>
              <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                rightIcon={showPass ? EyeOff : Eye}
                onRightIconClick={() => setShowPass(p => !p)}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                hint="Must be at least 8 characters"
                required
              />
              <Input
                label="Confirm Password"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                error={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ''}
                required
              />
              <Button variant="primary" size="lg" className="w-full mt-2" onClick={handleNext}>
                Continue <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold font-display text-white mb-1">Connect Platforms</h2>
                <p className="text-gray-400 text-sm">Optional — you can add these later in settings</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'leetcode', label: 'LeetCode Username', placeholder: 'your-leetcode-username', color: 'text-orange-400' },
                  { key: 'codeforces', label: 'Codeforces Handle', placeholder: 'your-cf-handle', color: 'text-blue-400' },
                  { key: 'gfg', label: 'GeeksforGeeks Username', placeholder: 'your-gfg-username', color: 'text-green-400' },
                ].map(({ key, label, placeholder, color }) => (
                  <div key={key}>
                    <label className={`text-xs font-semibold ${color} uppercase tracking-wider mb-1.5 block`}>{label}</label>
                    <input
                      className="input-field"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => update(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={handleNext}>Continue <ArrowRight size={16} /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold font-display text-white mb-1">Almost there! 🚀</h2>
                <p className="text-gray-400 text-sm">Review and accept to create your account</p>
              </div>

              {/* Summary */}
              <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Username', value: `@${form.username}` },
                  { label: 'Email', value: form.email },
                  form.leetcode && { label: 'LeetCode', value: form.leetcode },
                  form.codeforces && { label: 'Codeforces', value: form.codeforces },
                  form.gfg && { label: 'GFG', value: form.gfg },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={e => update('terms', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-brand-500"
                />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-brand-400 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} loading={isLoading}>
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
