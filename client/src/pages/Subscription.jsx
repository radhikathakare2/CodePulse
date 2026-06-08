import { useState, useEffect } from 'react'
import { Sparkles, Check, CreditCard, ChevronRight, X, AlertCircle } from 'lucide-react'
import { subscriptionAPI } from '../lib/api'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function Subscription() {
  const { user, updateUser } = useAuth()
  const [plans, setPlans] = useState([
    {
      id: 'free',
      name: 'Free Coder',
      price: '₹0',
      period: 'forever',
      desc: 'Centralize statistics and keep tabs on upcoming contests.',
      features: [
        'Connect coding profiles (LeetCode, Codeforces, GFG)',
        'Unified basic dashboard',
        'Activity contribution calendar',
        'Access upcoming contests & reminders',
        'Join peer groups & chatrooms',
        'Global & Friends Leaderboard',
      ],
      cta: 'Current Plan',
      variant: 'secondary'
    },
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: '₹99',
      period: 'month',
      desc: 'Unlock the power of Gemini AI feedback and advance your ranking.',
      features: [
        'All Free features included',
        'Gemini AI Weak Topic Detection',
        'Personalized Study Roadmap timeline',
        'Weekly AI Performance Review',
        'AI Contest Rating Prediction insights',
        'Export Advanced Analytics reports as PDF',
        'Achievement Badges & premium profile flair',
      ],
      cta: 'Subscribe Monthly',
      variant: 'premium'
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: '₹799',
      period: 'year',
      desc: 'Save 33% on elite insights and tools for long-term prep goals.',
      features: [
        'All Premium Monthly features included',
        'Priority support channel',
        'Best value - save over ₹380 per year',
        'Permanent Premium archive access',
      ],
      cta: 'Subscribe Yearly',
      variant: 'primary'
    }
  ])
  
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  const fetchSubscriptionStatus = async () => {
    try {
      setStatusLoading(true)
      const res = await subscriptionAPI.getStatus()
      setSubscriptionStatus(res.data?.data)
    } catch (err) {
      console.error('Failed to get subscription status', err)
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  // Helper to load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async (planId) => {
    if (planId === 'free') return

    try {
      setLoadingPlan(planId)
      
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Razorpay Checkout failed to load. Are you connected to the internet?')
        return
      }

      // Create Order on Backend
      const orderRes = await subscriptionAPI.createOrder(planId)
      const { id: orderId, amount, currency } = orderRes.data?.data

      // Configure checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkey', 
        amount: amount,
        currency: currency,
        name: 'CodePulse Premium',
        description: `Unlock CodePulse Premium - ${planId} plan`,
        order_id: orderId,
        handler: async (response) => {
          try {
            toast.loading('Verifying payment signature...', { id: 'payment-verifying' })
            
            const verifyRes = await subscriptionAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            })
            
            toast.dismiss('payment-verifying')
            toast.success('Welcome to CodePulse Premium! ✦')
            
            // Update User Auth Context state
            updateUser(verifyRes.data?.data?.user)
            fetchSubscriptionStatus()
          } catch (err) {
            toast.dismiss('payment-verifying')
            console.error(err)
            toast.error('Payment verification signature check failed')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#8B5CF6'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error('Failed to initialize subscription checkout')
    } finally {
      setLoadingPlan(null)
    }
  }

  const isPremium = user?.isPremium

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto py-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="text-amber-400" /> Go Elite with CodePulse Premium
        </h1>
        <p className="text-sm text-gray-400">
          Supercharge your programming journey with Gemini AI insights, custom study paths, and detailed analytics dashboards.
        </p>
      </div>

      {/* Current Subscription Status */}
      {!statusLoading && (
        <GlassCard className="p-5 max-w-xl mx-auto border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center gap-3">
            <CreditCard className="text-brand-400 w-8 h-8" />
            <div>
              <p className="text-sm font-semibold text-white">
                Status: {isPremium ? 'Premium Active ✦' : 'Free Tier Coder'}
              </p>
              {isPremium && subscriptionStatus?.expiresAt && (
                <p className="text-xs text-gray-400">
                  Renews/Expires on: {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
        {plans.map((plan) => {
          const isCurrentPlan = (plan.id === 'free' && !isPremium) || (plan.id !== 'free' && isPremium && subscriptionStatus?.plan === plan.id)
          
          return (
            <GlassCard
              key={plan.id}
              className={`p-6 flex flex-col justify-between h-[520px] relative overflow-hidden ${
                plan.id === 'monthly' ? 'border-brand-500 shadow-[0_0_25px_rgba(139,92,246,0.15)] ring-2 ring-brand-500/20' : 'border-white/10'
              }`}
            >
              {plan.id === 'monthly' && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-brand-600 to-accent-500 text-[10px] font-bold text-white uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Popular Choice
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1 py-2 border-b border-white/5">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500">/{plan.period}</span>
                </div>

                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  variant={isCurrentPlan ? 'secondary' : plan.variant}
                  className="w-full"
                  disabled={isCurrentPlan || loadingPlan !== null}
                  onClick={() => handleCheckout(plan.id)}
                  loading={loadingPlan === plan.id}
                >
                  {isCurrentPlan ? 'Current Active Tier' : plan.cta}
                </Button>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
