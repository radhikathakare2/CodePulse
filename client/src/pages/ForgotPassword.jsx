import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error('Enter a valid email'); return }
    setIsLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
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
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-lg text-white">Code<span className="text-gradient">Pulse</span></span>
          </div>

          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading} leftIcon={Send}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold font-display text-white mb-3">Check your email!</h2>
              <p className="text-gray-400 text-sm mb-2">We've sent a password reset link to:</p>
              <p className="text-brand-400 font-semibold text-sm mb-6">{email}</p>
              <p className="text-xs text-gray-500 mb-8">Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-brand-400 hover:underline">try again</button>
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Return to Login</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
