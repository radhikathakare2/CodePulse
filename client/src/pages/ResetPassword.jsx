import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return }
    setIsLoading(true)
    try {
      await resetPassword(token, form.password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link may be expired')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 bg-mesh">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-lg text-white">Code<span className="text-gradient">Pulse</span></span>
          </div>

          {!success ? (
            <>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Set New Password</h2>
              <p className="text-gray-400 text-sm mb-8">Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type={showPass ? 'text' : 'password'}
                  icon={Lock}
                  rightIcon={showPass ? EyeOff : Eye}
                  onRightIconClick={() => setShowPass(p => !p)}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  hint="At least 8 characters"
                  required
                />
                <Input
                  label="Confirm Password"
                  type={showPass ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  error={form.confirm && form.password !== form.confirm ? "Passwords don't match" : ''}
                  required
                />
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold font-display text-white mb-3">Password Reset!</h2>
              <p className="text-gray-400 text-sm mb-6">Your password has been updated. Redirecting to login...</p>
              <Link to="/login"><Button variant="primary" className="w-full">Go to Login</Button></Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
