import { motion } from 'framer-motion'
import { RefreshCw, Link2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatRelativeTime } from '../../utils/formatters'
import { PLATFORM_COLORS } from '../../utils/constants'

const platformLogos = {
  leetcode: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange-400">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
    </svg>
  ),
  codeforces: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#3b82f6" d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9.75-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5c0-.828.672-1.5 1.5-1.5h3zm9.75 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
    </svg>
  ),
  gfg: (
    <div className="w-6 h-6 bg-green-500 rounded text-white text-xs font-bold flex items-center justify-center">G</div>
  ),
}

export default function PlatformCard({ platform, username, stats, lastSynced, onSync, isSyncing }) {
  const connected = !!username
  const colors = PLATFORM_COLORS[platform] || PLATFORM_COLORS.leetcode
  const platformName = {
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
    gfg: 'GeeksforGeeks',
  }[platform] || platform

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-white/20`}
    >
      {/* Gradient background */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${colors.gradient}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {platformLogos[platform]}
            <div>
              <h3 className="font-semibold text-white text-sm">{platformName}</h3>
              <p className={`text-xs font-medium ${connected ? colors.text : 'text-gray-500'}`}>
                {connected ? `@${username}` : 'Not connected'}
              </p>
            </div>
          </div>
          {connected ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-gray-600" />
          )}
        </div>

        {connected && stats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(stats).slice(0, 3).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-xs text-gray-500 capitalize">{key}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {lastSynced ? (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              {formatRelativeTime(lastSynced)}
            </div>
          ) : <div />}
          <Button
            variant={connected ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onSync(username)}
            loading={isSyncing}
            leftIcon={connected ? RefreshCw : Link2}
          >
            {connected ? 'Sync' : 'Connect'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
