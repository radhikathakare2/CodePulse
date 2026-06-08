import { Award, TrendingUp } from 'lucide-react'
import { getCFRankLabel, getCFRankColor } from '../../utils/formatters'
import { formatDate } from '../../utils/formatters'
import Badge from '../ui/Badge'

export default function CodeforcesStats({ stats }) {
  if (!stats) return null

  const { rating, maxRating, handle, recentContests = [] } = stats
  const rankLabel = getCFRankLabel(rating)
  const rankColor = getCFRankColor(rating)

  return (
    <div className="space-y-4">
      {/* Rating Display */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className={`text-4xl font-black font-display ${rankColor}`}>{rating || '—'}</div>
          <div className={`text-sm font-semibold ${rankColor} mt-1`}>{rankLabel}</div>
          <div className="text-xs text-gray-500 mt-0.5">Current Rating</div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-brand-400" />
              <span className="text-xs text-gray-500">Max Rating</span>
            </div>
            <p className="text-lg font-bold text-white">{maxRating || '—'}</p>
            <p className="text-xs text-gray-500">{getCFRankLabel(maxRating)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award size={13} className="text-amber-400" />
              <span className="text-xs text-gray-500">Handle</span>
            </div>
            <p className="text-sm font-bold text-white">@{handle || '—'}</p>
          </div>
        </div>
      </div>

      {/* Recent Contests */}
      {recentContests.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Contests</h4>
          <div className="space-y-2">
            {recentContests.slice(0, 4).map((contest, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{contest.contestName}</p>
                  <p className="text-xs text-gray-500">{formatDate(contest.date)}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={`text-xs font-bold ${contest.ratingChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                  </p>
                  <p className="text-xs text-gray-500">#{contest.rank}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
