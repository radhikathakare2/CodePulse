import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react'
import { authAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function EmailVerification() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        return
      }
      try {
        await authAPI.verifyEmail(token)
        setStatus('success')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-dark bg-mesh flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full p-8 text-center space-y-6 relative overflow-hidden border-brand-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader className="w-16 h-16 text-brand-400 animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-white">Verifying your account</h2>
              <p className="text-sm text-gray-400">Please wait while we confirm your email verification token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Email Verified! 🎉</h2>
              <p className="text-sm text-gray-400">
                Your email has been successfully verified. You are now ready to sync profiles, join peer groups, and track your metrics.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-white">Verification Failed</h2>
              <p className="text-sm text-gray-400">
                The verification token is invalid, expired, or has already been used. Please request a new verification email from your settings.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
