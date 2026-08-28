import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Target,
  UserRound,
} from 'lucide-react'

type Status =
  | 'NEW'
  | 'APPROVED'
  | 'IMPLEMENTED'
  | 'MEASURING'
  | 'WON'
  | 'LOST'
  | 'CLOSED'
  | 'BLOCKED'
  | 'STALE'
  | 'ESCALATED'

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM'
type QueueFilter = 'ALL' | 'ATTENTION' | 'ACTIVE' | 'LEARNED'

interface LogEntry {
  id: string
  message: string
  timestamp: string
}

interface GrowthAction {
  id: string
  title: string
  status: Status
  priority: Priority
  problem: string
  evidence: string
  hypothesis: string
  owner: string
  baseline: string
  target: string
  measures: string[]
  nextAction: string
  nextDecision: string
  updated: string
  learning: string
  activity: LogEntry[]
}

const workflowStatuses: Status[] = [
  'NEW',
  'APPROVED',
  'IMPLEMENTED',
  'MEASURING',
  'WON',
  'LOST',
  'CLOSED',
]

const exceptionStatuses: Status[] = ['BLOCKED', 'STALE', 'ESCALATED']
const attentionStatuses = new Set<Status>(['BLOCKED', 'STALE', 'ESCALATED'])
const completedStatuses = new Set<Status>(['WON', 'LOST', 'CLOSED'])

const initialActions: GrowthAction[] = [
  {
    id: 'GA-001',
    title: 'Query coverage reliability',
    status: 'BLOCKED',
    priority: 'CRITICAL',
    problem:
      'Search Console query retrieval is incomplete, so the unexplained click gap should not be treated as anonymized search traffic.',
    evidence:
      'The latest reporting run reconciles page-level clicks but fails its query-level coverage check. Pagination completion is not yet deterministic.',
    hypothesis:
      'Fixing query coverage and validation will prevent incorrect SEO priorities.',
    owner: 'Analytics',
    baseline: 'Query coverage status: incomplete; fetched-click coverage: 78%',
    target: 'Validated complete retrieval and at least 98% fetched-click coverage',
    measures: ['Query coverage status', 'Fetched-click coverage'],
    nextAction: 'Complete deterministic pagination and data-quality gate',
    nextDecision: '02 Sep 2026',
    updated: 'Today, 09:12',
    learning: '',
    activity: [
      {
        id: 'ga001-1',
        message: 'Coverage mismatch reproduced in the latest reporting run',
        timestamp: 'Today, 09:12',
      },
      {
        id: 'ga001-2',
        message: 'Action consolidated under persistent ID GA-001',
        timestamp: '26 Aug, 15:40',
      },
    ],
  },
  {
    id: 'GA-002',
    title: 'Talousmittari visibility experiment',
    status: 'ESCALATED',
    priority: 'HIGH',
    problem:
      'A finance-metric opportunity has repeatedly appeared in reporting without being converted into an owned experiment.',
    evidence:
      'The same opportunity appeared in three consecutive weekly reports, but no implementation owner or decision date was recorded.',
    hypothesis:
      'Showing the relevant financial metric more prominently on selected company pages improves qualified search and report-path engagement.',
    owner: 'Growth',
    baseline: 'Selected pages: 3.1% CTR and 12.4 report opens per 1,000 sessions',
    target: '+10% CTR and +15% report opens without reducing purchase conversion',
    measures: ['CTR', 'Report opens', 'Report purchases / qualified landing sessions'],
    nextAction: 'Approve page cohort and assign implementation capacity',
    nextDecision: '01 Sep 2026',
    updated: 'Yesterday, 16:05',
    learning: '',
    activity: [
      {
        id: 'ga002-1',
        message: 'Escalated after third report appearance without a decision',
        timestamp: 'Yesterday, 16:05',
      },
      {
        id: 'ga002-2',
        message: 'Growth accepted ownership',
        timestamp: '25 Aug, 11:20',
      },
    ],
  },
  {
    id: 'GA-003',
    title: 'Modifier validation',
    status: 'MEASURING',
    priority: 'MEDIUM',
    problem:
      'Short finance modifiers may generate false positives through substring matching.',
    evidence:
      'Manual review found finance terms embedded inside unrelated longer words in the opportunity set.',
    hypothesis:
      'Validated word-boundary modifier classification improves opportunity ranking quality.',
    owner: 'SEO',
    baseline: 'Valid-match rate: 71%; qualified impressions: 42k / month',
    target: 'At least 95% valid-match rate with stable qualified impression coverage',
    measures: ['Valid-match rate', 'Qualified impressions', 'CTR'],
    nextAction: 'Review the first two-week measurement cohort',
    nextDecision: '08 Sep 2026',
    updated: '27 Aug, 14:30',
    learning: '',
    activity: [
      {
        id: 'ga003-1',
        message: 'Measurement window started for validated classifier',
        timestamp: '27 Aug, 14:30',
      },
      {
        id: 'ga003-2',
        message: 'Implementation released to the reporting workflow',
        timestamp: '24 Aug, 10:15',
      },
    ],
  },
  {
    id: 'GA-004',
    title: 'Company page report CTA',
    status: 'NEW',
    priority: 'HIGH',
    problem:
      'Company-information traffic may not consistently progress toward a paid credit-risk report.',
    evidence:
      'Qualified company-page sessions show strong engagement, but the report path is visually secondary and varies by template.',
    hypothesis:
      'A clearer context-specific report CTA increases report opens from qualified company-page sessions.',
    owner: 'Product',
    baseline: 'Report opens: 8.6% of qualified sessions; purchase conversion: 2.1%',
    target: '+20% report opens while maintaining at least 2.1% purchase conversion',
    measures: ['Report opens / qualified sessions', 'Purchase conversion'],
    nextAction: 'Decide experiment cohort, copy, and success threshold',
    nextDecision: '04 Sep 2026',
    updated: '26 Aug, 12:10',
    learning: '',
    activity: [
      {
        id: 'ga004-1',
        message: 'Finding promoted from observation to owned action',
        timestamp: '26 Aug, 12:10',
      },
    ],
  },
]

const storageKey = 'luottoriskit-growth-actions-v1'

function restoreActions(): GrowthAction[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return initialActions
    const parsed = JSON.parse(saved) as GrowthAction[]
    return Array.isArray(parsed) && parsed.length === initialActions.length
      ? parsed
      : initialActions
  } catch {
    return initialActions
  }
}

function formatStatus(status: Status) {
  return status.toLowerCase().replace('_', ' ')
}

function App() {
  const [actions, setActions] = useState<GrowthAction[]>(restoreActions)
  const [selectedId, setSelectedId] = useState(initialActions[0].id)
  const [filter, setFilter] = useState<QueueFilter>('ALL')

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(actions))
  }, [actions])

  const selected = actions.find((action) => action.id === selectedId) ?? actions[0]

  const counts = useMemo(
    () => ({
      active: actions.filter((action) => !completedStatuses.has(action.status)).length,
      attention: actions.filter((action) =>
        attentionStatuses.has(action.status) || action.status === 'NEW',
      ).length,
      measuring: actions.filter((action) => action.status === 'MEASURING').length,
      learned: actions.filter((action) => completedStatuses.has(action.status)).length,
    }),
    [actions],
  )

  const visibleActions = useMemo(() => {
    if (filter === 'ATTENTION') {
      return actions.filter(
        (action) => attentionStatuses.has(action.status) || action.status === 'NEW',
      )
    }
    if (filter === 'ACTIVE') {
      return actions.filter((action) => !completedStatuses.has(action.status))
    }
    if (filter === 'LEARNED') {
      return actions.filter((action) => completedStatuses.has(action.status))
    }
    return actions
  }, [actions, filter])

  function updateStatus(status: Status) {
    setActions((current) =>
      current.map((action) => {
        if (action.id !== selected.id || action.status === status) return action
        return {
          ...action,
          status,
          updated: 'Just now',
          activity: [
            {
              id: `${action.id}-${Date.now()}`,
              message: `Status changed from ${action.status} to ${status}`,
              timestamp: 'Just now',
            },
            ...action.activity,
          ],
        }
      }),
    )
  }

  function updateLearning(learning: string) {
    setActions((current) =>
      current.map((action) =>
        action.id === selected.id ? { ...action, learning, updated: 'Just now' } : action,
      ),
    )
  }

  function resetPrototype() {
    setActions(initialActions)
    setSelectedId(initialActions[0].id)
    setFilter('ALL')
  }

  const summaryItems = [
    { label: 'Active experiments', value: counts.active },
    { label: 'Needs decision', value: counts.attention },
    { label: 'Measuring', value: counts.measuring },
    { label: 'Completed / learned', value: counts.learned },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            LR
          </div>
          <div>
            <p className="brand-name">Luottoriskit.fi</p>
            <h1>Growth Actions</h1>
          </div>
        </div>
        <p className="subtitle">From report findings to measurable experiments</p>
        <button
          className="icon-button"
          type="button"
          onClick={resetPrototype}
          title="Restore mock data"
          aria-label="Restore mock data"
        >
          <RotateCcw size={16} />
        </button>
      </header>

      <main>
        <section className="summary-grid" aria-label="Action summary">
          {summaryItems.map((item, index) => (
            <div className="summary-item" key={item.label}>
              <span className={`summary-icon summary-icon-${index}`}>
                {index === 0 && <Activity size={17} />}
                {index === 1 && <AlertTriangle size={17} />}
                {index === 2 && <BarChart3 size={17} />}
                {index === 3 && <CheckCircle2 size={17} />}
              </span>
              <span>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </span>
            </div>
          ))}
        </section>

        <section className="workspace">
          <aside className="queue-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Action queue</p>
                <h2>Priorities</h2>
              </div>
              <span className="queue-count">{visibleActions.length}</span>
            </div>

            <div className="segmented-control" aria-label="Filter actions">
              {(['ALL', 'ATTENTION', 'ACTIVE', 'LEARNED'] as QueueFilter[]).map((item) => (
                <button
                  className={filter === item ? 'is-selected' : ''}
                  type="button"
                  key={item}
                  onClick={() => setFilter(item)}
                >
                  {item === 'ATTENTION' ? 'Attention' : item.toLowerCase()}
                </button>
              ))}
            </div>

            <div className="action-list">
              {visibleActions.length > 0 ? (
                visibleActions.map((action) => (
                  <button
                    type="button"
                    className={`action-card ${selected.id === action.id ? 'is-selected' : ''} ${attentionStatuses.has(action.status) ? 'needs-attention' : ''}`}
                    key={action.id}
                    onClick={() => setSelectedId(action.id)}
                  >
                    <div className="card-topline">
                      <span className="action-id">{action.id}</span>
                      <span className={`priority priority-${action.priority.toLowerCase()}`}>
                        {action.priority}
                      </span>
                    </div>
                    <h3>{action.title}</h3>
                    <p>{action.problem}</p>
                    <div className="card-footer">
                      <span className={`status status-${action.status.toLowerCase()}`}>
                        {attentionStatuses.has(action.status) && <span className="status-dot" />}
                        {action.status}
                      </span>
                      <span className="owner">
                        <UserRound size={13} /> {action.owner}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={22} />
                  <p>No actions in this view.</p>
                  <button type="button" onClick={() => setFilter('ALL')}>
                    Show all actions
                  </button>
                </div>
              )}
            </div>
          </aside>

          <article className="detail-panel" key={selected.id}>
            <div className="detail-heading">
              <div className="detail-title">
                <p className="eyebrow">{selected.id} · Updated {selected.updated}</p>
                <h2>{selected.title}</h2>
                <div className="badge-row">
                  <span className={`priority priority-${selected.priority.toLowerCase()}`}>
                    {selected.priority}
                  </span>
                  <span className={`status status-${selected.status.toLowerCase()}`}>
                    {attentionStatuses.has(selected.status) && <span className="status-dot" />}
                    {selected.status}
                  </span>
                </div>
              </div>

              <label className="status-control">
                <span>Update status</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus(event.target.value as Status)}
                  aria-label={`Update status for ${selected.title}`}
                >
                  <optgroup label="Lifecycle">
                    {workflowStatuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Exceptions">
                    {exceptionStatuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            </div>

            {attentionStatuses.has(selected.status) && (
              <div className={`attention-banner attention-${selected.status.toLowerCase()}`}>
                <AlertTriangle size={18} />
                <div>
                  <strong>{formatStatus(selected.status)} action</strong>
                  <span>{selected.nextAction}</span>
                </div>
              </div>
            )}

            <div className="detail-body">
              <section className="narrative-section">
                <div className="section-label">Problem & evidence</div>
                <p className="lead-copy">{selected.problem}</p>
                <p className="evidence-copy">{selected.evidence}</p>
              </section>

              <section className="hypothesis-band">
                <Target size={19} />
                <div>
                  <div className="section-label">Hypothesis</div>
                  <p>{selected.hypothesis}</p>
                </div>
              </section>

              <section className="measurement-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Measurement contract</div>
                    <h3>Baseline to target</h3>
                  </div>
                  <BarChart3 size={19} />
                </div>
                <div className="metric-comparison">
                  <div>
                    <span>Baseline</span>
                    <p>{selected.baseline}</p>
                  </div>
                  <ArrowRight size={18} />
                  <div>
                    <span>Target</span>
                    <p>{selected.target}</p>
                  </div>
                </div>
                <div className="measure-list" aria-label="Measures">
                  {selected.measures.map((measure) => (
                    <span key={measure}>{measure}</span>
                  ))}
                </div>
              </section>

              <section className="decision-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Accountability</div>
                    <h3>Next decision</h3>
                  </div>
                  <Clock3 size={19} />
                </div>
                <dl className="decision-grid">
                  <div>
                    <dt>Owner</dt>
                    <dd>{selected.owner}</dd>
                  </div>
                  <div>
                    <dt>Decision date</dt>
                    <dd>{selected.nextDecision}</dd>
                  </div>
                  <div className="next-action-cell">
                    <dt>Next action</dt>
                    <dd>{selected.nextAction}</dd>
                  </div>
                </dl>
              </section>

              <section className="learning-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Result & learning</div>
                    <h3>Reusable evidence</h3>
                  </div>
                  {completedStatuses.has(selected.status) && <CheckCircle2 size={19} />}
                </div>
                <label>
                  <span className="sr-only">Learning for {selected.title}</span>
                  <textarea
                    value={selected.learning}
                    onChange={(event) => updateLearning(event.target.value)}
                    placeholder={
                      completedStatuses.has(selected.status)
                        ? 'Record what changed, the measured result, and what the team should reuse.'
                        : 'Capture the result when a decision is made so future reports can reuse the learning.'
                    }
                    rows={3}
                  />
                </label>
                <p className="autosave-note">Saved in this browser</p>
              </section>

              <section className="activity-section">
                <div className="section-label">Recent activity</div>
                <div className="timeline">
                  {selected.activity.slice(0, 3).map((entry) => (
                    <div className="timeline-entry" key={entry.id}>
                      <span className="timeline-marker" />
                      <div>
                        <p>{entry.message}</p>
                        <time>{entry.timestamp}</time>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
