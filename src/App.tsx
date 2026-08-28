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

const priorityLabels: Record<Priority, string> = {
  CRITICAL: 'KRIITTINEN',
  HIGH: 'KORKEA',
  MEDIUM: 'KESKITASO',
}

const filterLabels: Record<QueueFilter, string> = {
  ALL: 'Kaikki',
  ATTENTION: 'Huomiota vaativat',
  ACTIVE: 'Aktiiviset',
  LEARNED: 'Opit',
}

const initialActions: GrowthAction[] = [
  {
    id: 'GA-001',
    title: 'Hakukyselydatan kattavuus',
    status: 'BLOCKED',
    priority: 'CRITICAL',
    problem:
      'Search Consolesta noudettu query-data on vajaa, joten selittämätöntä klikkieroa ei pidä tulkita anonymisoiduksi hakuliikenteeksi.',
    evidence:
      'Viimeisin raporttiajo täsmää sivutason klikkitiedot, mutta query-tason kattavuustarkistus epäonnistuu. Sivutuksen valmistumista ei vielä voida todentaa deterministisesti.',
    hypothesis:
      'Query-datan kattavuuden korjaus ja validointi ehkäisevät virheellisiä SEO-priorisointeja.',
    owner: 'Analytiikka',
    baseline: 'Kattavuustila: vajaa; noudettujen query-rivien kattamat klikit: 78 %',
    target: 'Kaikki API:n palautettavissa olevat näkyvät query-rivit noudettu; kattavuustila validoitu',
    measures: ['Query-datan kattavuustila', 'Noudettujen rivien klikkikattavuus'],
    nextAction: 'Toteuta deterministinen sivutus ja datan laatuportti',
    nextDecision: '2.9.2026',
    updated: 'Tänään, 09.12',
    learning: '',
    activity: [
      {
        id: 'ga001-1',
        message: 'Kattavuuspoikkeama toistettiin viimeisimmässä raporttiajossa',
        timestamp: 'Tänään, 09.12',
      },
      {
        id: 'ga001-2',
        message: 'Havainto yhdistettiin pysyvään tunnukseen GA-001',
        timestamp: '26.8., 15.40',
      },
    ],
  },
  {
    id: 'GA-002',
    title: 'Talousmittarin näkyvyyskokeilu',
    status: 'ESCALATED',
    priority: 'HIGH',
    problem:
      'Talousmittariin liittyvä mahdollisuus on noussut raporteissa toistuvasti ilman omistettua kokeilua.',
    evidence:
      'Sama mahdollisuus näkyi kolmessa peräkkäisessä viikkoraportissa, mutta toteutuksen omistajaa tai päätöspäivää ei kirjattu.',
    hypothesis:
      'Talousmittarin näkyvämpi esittäminen valituilla yrityssivuilla parantaa laadukkaan hakuliikenteen ja raporttipolun sitoutumista.',
    owner: 'Kasvu',
    baseline: 'Valitut sivut: CTR 3,1 % ja 12,4 raportin avausta / 1 000 istuntoa',
    target: '+10 % CTR ja +15 % raportin avauksia ilman ostokonversion heikkenemistä',
    measures: ['CTR', 'Raportin avaukset', 'Raporttiostot / laadukkaat laskeutumissessiot'],
    nextAction: 'Hyväksy sivukohortti ja varaa toteutuskapasiteetti',
    nextDecision: '1.9.2026',
    updated: 'Eilen, 16.05',
    learning: '',
    activity: [
      {
        id: 'ga002-1',
        message: 'Nostettiin ESCALATED-tilaan kolmannen raportointikerran jälkeen ilman päätöstä',
        timestamp: 'Eilen, 16.05',
      },
      {
        id: 'ga002-2',
        message: 'Kasvutiimi otti omistajuuden',
        timestamp: '25.8., 11.20',
      },
    ],
  },
  {
    id: 'GA-003',
    title: 'Hakumääritteiden validointi',
    status: 'MEASURING',
    priority: 'MEDIUM',
    problem:
      'Lyhyet talousalan hakumääritteet voivat tuottaa virheosumia osamerkkijonohaussa.',
    evidence:
      'Manuaalitarkistus löysi mahdollisuusjoukosta taloustermejä osana asiaan liittymättömiä pidempiä sanoja.',
    hypothesis:
      'Sanarajoihin perustuva validoitu luokittelu parantaa mahdollisuuksien priorisoinnin laatua.',
    owner: 'SEO',
    baseline: 'Kelvollisten osumien osuus: 71 %; laadukkaat näyttökerrat: 42 000/kk',
    target: 'Vähintään 95 % kelvollisia osumia ja laadukkaiden näyttökertojen määrä ennallaan',
    measures: ['Kelvollisten osumien osuus', 'Laadukkaat näyttökerrat', 'CTR'],
    nextAction: 'Arvioi ensimmäinen kahden viikon mittauskohortti',
    nextDecision: '8.9.2026',
    updated: '27.8., 14.30',
    learning: '',
    activity: [
      {
        id: 'ga003-1',
        message: 'Validoidun luokittelijan mittausjakso käynnistyi',
        timestamp: '27.8., 14.30',
      },
      {
        id: 'ga003-2',
        message: 'Toteutus julkaistiin raportointityönkulkuun',
        timestamp: '24.8., 10.15',
      },
    ],
  },
  {
    id: 'GA-004',
    title: 'Yrityssivun raportti-CTA',
    status: 'NEW',
    priority: 'HIGH',
    problem:
      'Yritystietosivujen liikenne ei välttämättä etene johdonmukaisesti maksulliseen luottoriskiraporttiin.',
    evidence:
      'Laadukkaat yrityssivuistunnot sitoutuvat hyvin, mutta raporttipolku jää visuaalisesti toissijaiseksi ja vaihtelee sivupohjittain.',
    hypothesis:
      'Selkeä, kontekstiin sidottu raportti-CTA lisää raportin avauksia laadukkaista yrityssivuistunnoista.',
    owner: 'Tuote',
    baseline: 'Raportin avaukset: 8,6 % laadukkaista istunnoista; ostokonversio: 2,1 %',
    target: '+20 % raportin avauksia, ostokonversio vähintään 2,1 %',
    measures: ['Raportin avaukset / laadukkaat istunnot', 'Ostokonversio'],
    nextAction: 'Päätä kokeilukohortti, teksti ja onnistumisraja',
    nextDecision: '4.9.2026',
    updated: '26.8., 12.10',
    learning: '',
    activity: [
      {
        id: 'ga004-1',
        message: 'Havainto nostettiin omistetuksi toimenpiteeksi',
        timestamp: '26.8., 12.10',
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
    if (!Array.isArray(parsed) || parsed.length !== initialActions.length) return initialActions

    return initialActions.map((action) => {
      const persisted = parsed.find((candidate) => candidate.id === action.id)
      if (!persisted) return action

      const statusChanges = persisted.activity
        .filter((entry) => entry.id.startsWith(`${action.id}-`))
        .map((entry) => ({
          ...entry,
          message: entry.message.replace(
            /^Status changed from (\w+) to (\w+)$/,
            'Tila vaihdettiin: $1 → $2',
          ),
          timestamp: entry.timestamp === 'Just now' ? 'Juuri nyt' : entry.timestamp,
        }))

      return {
        ...action,
        status: persisted.status,
        learning: persisted.learning,
        updated: persisted.updated === 'Just now' ? 'Juuri nyt' : action.updated,
        activity: [...statusChanges, ...action.activity],
      }
    })
  } catch {
    return initialActions
  }
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
          updated: 'Juuri nyt',
          activity: [
            {
              id: `${action.id}-${Date.now()}`,
              message: `Tila vaihdettiin: ${action.status} → ${status}`,
              timestamp: 'Juuri nyt',
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
        action.id === selected.id ? { ...action, learning, updated: 'Juuri nyt' } : action,
      ),
    )
  }

  function resetPrototype() {
    setActions(initialActions)
    setSelectedId(initialActions[0].id)
    setFilter('ALL')
  }

  const summaryItems = [
    { label: 'Avoimet toimet', value: counts.active },
    { label: 'Odottaa päätöstä', value: counts.attention },
    { label: 'Mittauksessa', value: counts.measuring },
    { label: 'Valmiit / opit', value: counts.learned },
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
            <h1>Kasvutoimet</h1>
          </div>
        </div>
        <p className="subtitle">Raporttihavainnoista mitattaviksi kokeiluiksi</p>
        <button
          className="icon-button"
          type="button"
          onClick={resetPrototype}
          title="Palauta esimerkkidata"
          aria-label="Palauta esimerkkidata"
        >
          <RotateCcw size={16} />
        </button>
      </header>

      <main>
        <section className="summary-grid" aria-label="Toimien yhteenveto">
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
                <p className="eyebrow">Toimenpidejono</p>
                <h2>Prioriteetit</h2>
              </div>
              <span className="queue-count">{visibleActions.length}</span>
            </div>

            <div className="segmented-control" aria-label="Suodata toimenpiteitä">
              {(['ALL', 'ATTENTION', 'ACTIVE', 'LEARNED'] as QueueFilter[]).map((item) => (
                <button
                  className={filter === item ? 'is-selected' : ''}
                  type="button"
                  key={item}
                  onClick={() => setFilter(item)}
                >
                  {filterLabels[item]}
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
                        {priorityLabels[action.priority]}
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
                  <p>Tässä näkymässä ei ole toimenpiteitä.</p>
                  <button type="button" onClick={() => setFilter('ALL')}>
                    Näytä kaikki toimenpiteet
                  </button>
                </div>
              )}
            </div>
          </aside>

          <article className="detail-panel" key={selected.id}>
            <div className="detail-heading">
              <div className="detail-title">
                <p className="eyebrow">{selected.id} · Päivitetty {selected.updated}</p>
                <h2>{selected.title}</h2>
                <div className="badge-row">
                  <span className={`priority priority-${selected.priority.toLowerCase()}`}>
                    {priorityLabels[selected.priority]}
                  </span>
                  <span className={`status status-${selected.status.toLowerCase()}`}>
                    {attentionStatuses.has(selected.status) && <span className="status-dot" />}
                    {selected.status}
                  </span>
                </div>
              </div>

              <label className="status-control">
                <span>Päivitä tila</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus(event.target.value as Status)}
                  aria-label={`Päivitä tila: ${selected.title}`}
                >
                  <optgroup label="Elinkaari">
                    {workflowStatuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Poikkeustilat">
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
                  <strong>Tila {selected.status} vaatii toimenpiteen</strong>
                  <span>{selected.nextAction}</span>
                </div>
              </div>
            )}

            <div className="detail-body">
              <section className="narrative-section">
                <div className="section-label">Ongelma ja näyttö</div>
                <p className="lead-copy">{selected.problem}</p>
                <p className="evidence-copy">{selected.evidence}</p>
              </section>

              <section className="hypothesis-band">
                <Target size={19} />
                <div>
                  <div className="section-label">Hypoteesi</div>
                  <p>{selected.hypothesis}</p>
                </div>
              </section>

              <section className="measurement-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Mittaussuunnitelma</div>
                    <h3>Lähtötasosta tavoitteeseen</h3>
                  </div>
                  <BarChart3 size={19} />
                </div>
                <div className="metric-comparison">
                  <div>
                    <span>Lähtötaso</span>
                    <p>{selected.baseline}</p>
                  </div>
                  <ArrowRight size={18} />
                  <div>
                    <span>Tavoite</span>
                    <p>{selected.target}</p>
                  </div>
                </div>
                <div className="measure-list" aria-label="Mittarit">
                  {selected.measures.map((measure) => (
                    <span key={measure}>{measure}</span>
                  ))}
                </div>
              </section>

              <section className="decision-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Vastuu</div>
                    <h3>Seuraava päätös</h3>
                  </div>
                  <Clock3 size={19} />
                </div>
                <dl className="decision-grid">
                  <div>
                    <dt>Omistaja</dt>
                    <dd>{selected.owner}</dd>
                  </div>
                  <div>
                    <dt>Päätöspäivä</dt>
                    <dd>{selected.nextDecision}</dd>
                  </div>
                  <div className="next-action-cell">
                    <dt>Seuraava toimenpide</dt>
                    <dd>{selected.nextAction}</dd>
                  </div>
                </dl>
              </section>

              <section className="learning-section">
                <div className="section-header-inline">
                  <div>
                    <div className="section-label">Tulos ja oppi</div>
                    <h3>Hyödynnettävä oppi</h3>
                  </div>
                  {completedStatuses.has(selected.status) && <CheckCircle2 size={19} />}
                </div>
                <label>
                  <span className="sr-only">Oppi: {selected.title}</span>
                  <textarea
                    value={selected.learning}
                    onChange={(event) => updateLearning(event.target.value)}
                    placeholder={
                      completedStatuses.has(selected.status)
                        ? 'Kirjaa muutos, mitattu tulos ja jatkossa hyödynnettävä oppi.'
                        : 'Kirjaa tulos päätöksen jälkeen, jotta oppi säilyy seuraavaa priorisointia varten.'
                    }
                    rows={3}
                  />
                </label>
                <p className="autosave-note">Tallennettu tähän selaimeen</p>
              </section>

              <section className="activity-section">
                <div className="section-label">Viimeisimmät tapahtumat</div>
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
