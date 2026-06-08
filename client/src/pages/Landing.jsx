import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap, BarChart2, Brain, Trophy, Users, Star, ArrowRight, Check,
  Code, Target, ChevronDown, Github, Twitter, Linkedin, Globe,
  TrendingUp, Flame, Shield, Cpu, Activity
} from 'lucide-react'

// Animated counter hook
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useState(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  })

  return { count, ref }
}

// Counter component
function AnimCounter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  if (inView && count === 0) {
    let start = 0
    const step = end / 80
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
  }

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Feature Card
function FeatureCard({ icon: Icon, title, description, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${gradient}`} />
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2 font-display">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Pricing Card
function PricingCard({ plan, isPopular, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-3xl p-0.5 ${
        isPopular
          ? 'bg-gradient-to-b from-brand-500 via-purple-500 to-accent-500 shadow-glow-purple'
          : 'bg-white/10'
      }`}
    >
      <div className="bg-dark-50/95 backdrop-blur-xl rounded-3xl p-8 h-full flex flex-col">
        {isPopular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
            MOST POPULAR
          </div>
        )}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2 font-display">{plan.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black font-display text-white">
              {plan.price === 0 ? 'Free' : `₹${plan.price}`}
            </span>
            {plan.period && <span className="text-gray-400 text-sm">/{plan.period}</span>}
          </div>
          {plan.monthlyEquivalent && (
            <p className="text-xs text-emerald-400 mt-1">₹{plan.monthlyEquivalent}/mo · Save {plan.savings}</p>
          )}
        </div>
        <ul className="space-y-3 flex-1 mb-8">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={14} className={isPopular ? 'text-brand-400' : 'text-emerald-400'} />
              <span className="text-sm text-gray-300">{f}</span>
            </li>
          ))}
        </ul>
        <Link
          to={plan.price === 0 ? '/register' : '/subscription'}
          className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 shadow-lg hover:shadow-glow-purple'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          }`}
        >
          {plan.price === 0 ? 'Get Started Free' : 'Start Premium'}
        </Link>
      </div>
    </motion.div>
  )
}

// FAQ Item
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-5"
        >
          <p className="text-sm text-gray-400 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

const FEATURES = [
  { icon: BarChart2, title: 'Unified Dashboard', description: 'All your LeetCode, Codeforces, and GFG stats in one beautiful place. No more tab-switching.', gradient: 'from-brand-600 to-purple-500', delay: 0 },
  { icon: Brain, title: 'AI Insights', description: 'Get personalized weak topic analysis and AI-generated study roadmaps tailored to your goals.', gradient: 'from-purple-500 to-pink-500', delay: 0.1 },
  { icon: Trophy, title: 'Contest Hub', description: 'Track upcoming contests across all platforms with live countdowns, reminders, and interest tracking.', gradient: 'from-amber-500 to-orange-500', delay: 0.2 },
  { icon: Users, title: 'Peer Groups', description: 'Create or join coding groups, set weekly goals, and climb the group leaderboard together.', gradient: 'from-emerald-500 to-teal-500', delay: 0.3 },
  { icon: Star, title: 'Leaderboards', description: 'Compete globally, weekly, monthly, or just among friends. Rise through the ranks.', gradient: 'from-cyan-500 to-blue-500', delay: 0.4 },
  { icon: Target, title: 'Smart Roadmaps', description: 'AI-curated weekly study plans based on your current level, targeting your specific weak areas.', gradient: 'from-rose-500 to-brand-500', delay: 0.5 },
]

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: null,
    features: ['2 platform connections', 'Basic analytics', 'Public profile', '1 group', 'Global leaderboard', 'Contest calendar'],
  },
  {
    name: 'Premium Monthly',
    price: 99,
    period: 'month',
    features: ['All 3 platforms', 'Full analytics suite', 'AI weak topic radar', 'Personalized roadmap', 'Weekly AI reports', 'Contest predictions', 'Unlimited groups', 'Friends leaderboard', 'Export to PDF', 'Priority support'],
  },
  {
    name: 'Premium Yearly',
    price: 799,
    period: 'year',
    monthlyEquivalent: 67,
    savings: '33%',
    features: ['Everything in Monthly', '33% savings vs monthly', 'Early feature access', 'Exclusive yearly badge', 'Dedicated support'],
  },
]

const FAQS = [
  { question: 'How does CodePulse sync my coding profiles?', answer: 'CodePulse uses the official APIs and public data from LeetCode, Codeforces, and GeeksforGeeks. Simply enter your username for each platform and we handle the rest. Data refreshes automatically every few hours.' },
  { question: 'Is my data safe with CodePulse?', answer: 'Absolutely. We only access your public profile data (problems solved, ratings, contest history). We never store your passwords and use industry-standard encryption for all data.' },
  { question: 'Can I use CodePulse without connecting all platforms?', answer: 'Yes! You can connect just one platform if you prefer. The more platforms you connect, the richer your analytics will be, but it works great with just one.' },
  { question: 'What AI features are included in Premium?', answer: 'Premium includes: AI-powered weak topic analysis using your solve history, personalized study roadmaps generated weekly, contest rating predictions, and detailed performance reports with actionable insights.' },
  { question: 'How do groups work?', answer: 'Groups are collaborative spaces where you can set weekly problem-solving goals, view a shared leaderboard, chat with members, and motivate each other. Free users can join 1 group, Premium users can join unlimited groups.' },
  { question: 'Can I cancel my subscription anytime?', answer: 'Yes, you can cancel anytime from your subscription settings. You\'ll retain premium access until the end of your billing period. We also offer a 7-day refund policy for new subscribers.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-lg">Code<span className="text-gradient">Pulse</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Login</Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/30 rounded-full blur-3xl" />

        {/* Floating code particles */}
        {['O(n log n)', 'BFS', 'DP', 'Greedy', '1337', 'AC'].map((text, i) => (
          <motion.div
            key={i}
            className="absolute text-brand-500/20 font-mono font-bold text-sm select-none pointer-events-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {text}
          </motion.div>
        ))}

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-8"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-300 font-medium">Track. Analyze. Dominate.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-display leading-tight mb-6"
          >
            One Dashboard for<br />
            <span className="text-gradient">All Your Code</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Unify LeetCode, Codeforces & GeeksforGeeks. Get AI-powered insights, compete with peers, and track your competitive programming journey — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-700 hover:to-accent-600 text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-glow-purple hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 backdrop-blur-sm"
            >
              <Code size={18} />
              View Demo
            </Link>
          </motion.div>

          {/* Platform Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6"
          >
            <span className="text-xs text-gray-600 uppercase tracking-wider">Syncs with</span>
            {[
              { name: 'LeetCode', color: 'text-orange-400' },
              { name: 'Codeforces', color: 'text-blue-400' },
              { name: 'GeeksforGeeks', color: 'text-green-400' },
            ].map(({ name, color }) => (
              <span key={name} className={`text-sm font-bold ${color}`}>{name}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="py-16 bg-white/3 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: '+', label: 'Active Users', icon: Users },
              { value: 2500000, suffix: '+', label: 'Problems Tracked', icon: Code },
              { value: 500, suffix: '+', label: 'Contests Logged', icon: Trophy },
              { value: 45, suffix: ' countries', label: 'Worldwide', icon: Globe },
            ].map(({ value, suffix, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <Icon size={20} className="text-brand-400 mx-auto mb-2" />
                <div className="text-3xl font-black font-display text-white mb-1">
                  <AnimCounter end={value} suffix={suffix} />
                </div>
                <p className="text-sm text-gray-500">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">Everything you need</span>
            <h2 className="section-title font-display mt-2 mb-4">Built for Competitive Programmers</h2>
            <p className="text-gray-400 max-w-xl mx-auto">All the tools to track progress, identify weaknesses, and dominate rankings</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white/2 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title font-display mb-16">Get Started in 3 Steps</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect Profiles', description: 'Enter your usernames for LeetCode, Codeforces, and GeeksforGeeks. We fetch all your data automatically.', icon: Code },
              { step: '02', title: 'View Insights', description: 'See your unified dashboard with AI-powered weak topic analysis, contest history, and performance trends.', icon: Activity },
              { step: '03', title: 'Compete & Grow', description: 'Join groups, climb leaderboards, track upcoming contests, and follow your personalized roadmap.', icon: TrendingUp },
            ].map(({ step, title, description, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
                  <Icon size={24} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 md:top-0 md:right-8 text-4xl font-black font-display text-brand-500/20">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-display">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="section-title font-display mb-4">Loved by Developers</h2>
            <p className="text-gray-400">What competitive programmers say about CodePulse</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Arjun Sharma', role: 'SWE at Google', text: 'CodePulse transformed how I prepare for interviews. The AI weak topic radar helped me focus on graphs and DP — exactly what Google asked about!', rating: 5, color: 'from-brand-600 to-purple-500' },
            { name: 'Priya Nair', role: 'Competitive Programmer', text: 'I was using 5 different tabs before. Now everything is unified. The contest countdown and group leaderboard keep me accountable every day.', rating: 5, color: 'from-cyan-500 to-blue-500' },
            { name: 'Rohan Mehta', role: 'CS Student, IIT Bombay', text: 'The personalized roadmap feature is insane. It knew exactly what topics I was weak in and gave me a structured 12-week plan. Rating went from 1600 to 2100!', rating: 5, color: 'from-emerald-500 to-teal-500' },
          ].map(({ name, role, text, rating, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(rating)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-white/2 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="section-title font-display mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-400">Start free, upgrade when you're ready to level up</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} isPopular={i === 1} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="section-title font-display mb-4">Frequently Asked Questions</h2>
          </motion.div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6">
          {FAQS.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative overflow-hidden bg-gradient-to-br from-brand-900/80 to-accent-900/40 backdrop-blur-xl border border-brand-500/30 rounded-3xl p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-accent-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Zap size={40} className="text-brand-400 mx-auto mb-6" fill="currentColor" />
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
              Join 10,000+ Programmers
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Start your competitive programming journey today. Track, analyze, and dominate your coding goals.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-accent-500 text-white px-10 py-4 rounded-2xl font-bold text-base hover:from-brand-700 hover:to-accent-600 transition-all duration-300 shadow-glow-purple hover:scale-105"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-white">CodePulse</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200">
                  <Icon size={16} className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center">
            <p className="text-xs text-gray-600">© 2026 CodePulse. Built with ❤️ for competitive programmers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
