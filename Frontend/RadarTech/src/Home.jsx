import { useState } from 'react'
import { useEvents } from './services/events'
import './Home.css'

const categories = [
  ['Cursos', '🎓', /curso|bootcamp|aceleracao/],
  ['Hackathons', '⚙️', /hackathon/],
  ['Bolsas', '💼', /bolsa/],
  ['Palestras', '💬', /palestra|webinar/],
  ['Eventos', '📅', /evento|conferencia|meetup/],
  ['Frontend', '💻', /front[ -]?end|full[ -]?stack/],
  ['Backend', '🗄️', /back[ -]?end|full[ -]?stack/],
  ['Dados e IA', '🧠', /dados|\bdata\b|\bia\b|inteligencia artificial/],
]

const examples = [
  { titulo: 'Aceleração Frontend', tipo: 'Curso', prazo_inscricao: '2027-03-05T23:59:00-03:00' },
  { titulo: 'Hackathon IA', tipo: 'Hackathon', prazo_inscricao: '2027-03-27T23:59:00-03:00' },
  { titulo: 'Bolsa de Estudos Data', tipo: 'Bolsa', prazo_inscricao: '2027-04-08T23:59:00-03:00' },
  { titulo: 'Webinar Cyber', tipo: 'Palestra', prazo_inscricao: '2027-04-10T23:59:00-03:00' },
].map((event) => ({ ...event, preco: 0, modalidade: 'Online' }))

const bootcamp = {
  titulo: 'Bootcamp Full Stack Web: React, FastAPI e Docker',
  modalidade: 'Online',
  preco: 0,
  prazo_inscricao: '2027-03-05T23:59:00-03:00',
}
const bars = [8, 16, 23, 14, 9, 14, 20, 26, 17, 11, 8, 15, 23, 16, 8]
const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })
const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const eventPlace = (event) => [event.cidade, event.estado].filter(Boolean).join(' / ') || event.modalidade || ''

function Icon({ name }) {
  const paths = {
    search: 'm21 21-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
    profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    pin: 'M12 22s7-6 7-13a7 7 0 1 0-14 0c0 7 7 13 7 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

function Header() {
  return (
    <header className="radar-header">
      <a className="radar-logo" href="/" aria-label="RadarTech, início">
        {bars.map((height, index) => <span key={index} style={{ height }} />)}
      </a>
      <div className="radar-actions">
        <a className="radar-button radar-create" href="/oportunidades/nova">+ Cadastrar<span> oportunidade</span></a>
        <a className="radar-profile" href="/perfil" aria-label="Abrir perfil"><Icon name="profile" /></a>
      </div>
    </header>
  )
}

function Featured({ events, demo }) {
  const [slide, setSlide] = useState(0)
  const slides = demo || !events.length ? [bootcamp, ...events.slice(0, 4)] : events.slice(0, 5)
  const current = slide % slides.length
  const event = slides[current]
  const multiple = slides.length > 1

  function move(direction) {
    setSlide((current + direction + slides.length) % slides.length)
  }

  return (
    <section className="radar-feature" aria-label="Oportunidades em destaque">
      <div className="radar-stage">
        <div className="radar-stage-back" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="radar-banner">
          <div className="radar-banner-copy" aria-live="polite">
            {event === bootcamp ? (
              <div className="radar-bootcamp">Bootcamp<br />Full <em>Stack</em><span className="radar-web"> Web</span> <span className="radar-tag radar-free">Gratuito</span></div>
            ) : (
              <>
                {event.id_evento ? <a href={`/eventos/${event.id_evento}`}>{event.titulo}</a> : event.titulo}
                {event.preco != null && Number(event.preco) === 0 && <span className="radar-tag radar-free">Gratuito</span>}
              </>
            )}
          </div>
        </div>
        {multiple && (
          <>
            <button className="radar-arrow radar-prev" type="button" aria-label="Destaque anterior" onClick={() => move(-1)}>‹</button>
            <button className="radar-arrow radar-next" type="button" aria-label="Próximo destaque" onClick={() => move(1)}>›</button>
          </>
        )}
      </div>
      <div className="radar-caption">
        {multiple && (
          <div className="radar-dots">
            {slides.map((item, index) => (
              <button key={item.id_evento ?? item.titulo} type="button" aria-label={`Mostrar destaque ${index + 1}`} aria-current={current === index ? 'true' : undefined} onClick={() => setSlide(index)} />
            ))}
          </div>
        )}
        <h2>{event.titulo}</h2>
        <p>{[eventPlace(event), event.prazo_inscricao && `Inscrições até ${dateFormat.format(new Date(event.prazo_inscricao))}`].filter(Boolean).join(' · ')}</p>
      </div>
    </section>
  )
}

function OpportunityCard({ event }) {
  const date = event.prazo_inscricao || event.data_inicio
  return (
    <article className="radar-card">
      <div className="radar-card-cover" aria-hidden="true">Imagem aqui</div>
      <div className="radar-card-copy">
        <h3>{event.titulo}</h3>
        <div className="radar-card-tags">
          {event.tipo && <span className="radar-tag">{event.tipo}</span>}
          {event.preco != null && Number(event.preco) === 0 && <span className="radar-tag radar-free">Gratuito</span>}
        </div>
        {date && <p className="radar-card-date"><span aria-hidden="true">📅</span> {event.prazo_inscricao ? 'Até ' : ''}<time dateTime={date}>{dateFormat.format(new Date(date))}</time></p>}
        {event.id_evento ? (
          <a className="radar-button" href={`/eventos/${event.id_evento}`}>Inscrever-se</a>
        ) : <button className="radar-button" type="button" disabled>Inscrever-se</button>}
      </div>
    </article>
  )
}

export default function Home() {
  const { data, error } = useEvents('/api/v1/events?limit=100')
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState('')
  const [now] = useState(Date.now)
  const [category, setCategory] = useState('')
  const [showAll, setShowAll] = useState(false)
  const demo = Boolean(error || data?.length === 0)
  const events = demo ? examples : data ?? []
  const places = [...new Set(events.map(eventPlace).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const matcher = categories.find(([label]) => label === category)?.[2]
  const isFiltered = Boolean(query.trim() || place || category)
  const filtered = events.filter((event) => {
    const words = normalize([event.titulo, event.tipo, event.instituicao, ...(event.assuntos ?? [])].filter(Boolean).join(' '))
    return words.includes(normalize(query.trim())) && (!place || eventPlace(event) === place) && (!matcher || matcher.test(words))
  })
  const upcoming = filtered.filter((event) => event.prazo_inscricao && Date.parse(event.prazo_inscricao) >= now)
    .sort((a, b) => Date.parse(a.prazo_inscricao) - Date.parse(b.prazo_inscricao))
  const showingDeadlines = !showAll && !isFiltered && upcoming.length > 0
  const cards = showingDeadlines ? upcoming.slice(0, 4) : filtered

  function clearFilters() {
    setQuery('')
    setPlace('')
    setCategory('')
    setShowAll(true)
  }

  return (
    <div className="radar-home">
      <Header />
      <main className="radar-main" aria-label="Oportunidades em tecnologia">
        <div className="radar-discovery">
          <div className="radar-search" role="search">
            <Icon name="search" />
            <input type="search" aria-label="Buscar oportunidades em tecnologia" placeholder="Buscar oportunidades em tecnologia" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select id="radar-place" aria-label="Filtrar por local" value={place} onChange={(event) => setPlace(event.target.value)}>
              <option value="">Todos os lugares</option>
              {places.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <button className="radar-button radar-nearby" type="button" onClick={() => { const select = document.getElementById('radar-place'); select.focus(); select.showPicker?.() }}>
            <Icon name="pin" /> Descubra oportunidades perto de você
          </button>
        </div>

        {!isFiltered && <Featured events={events} demo={demo} />}

        <section className="radar-categories" aria-labelledby="radar-categories-title">
          <div className="radar-section-title">
            <h2 id="radar-categories-title">Explore por categoria</h2>
            <a href="#oportunidades" onClick={clearFilters}>Ver tudo</a>
          </div>
          <div className="radar-category-grid">
            {categories.map(([label, icon]) => (
              <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(category === label ? '' : label)}>
                <span aria-hidden="true">{icon}</span>{label}
              </button>
            ))}
          </div>
        </section>

        <section className="radar-opportunities" id="oportunidades" aria-labelledby="radar-opportunities-title">
          <div className="radar-section-title">
            <h2 id="radar-opportunities-title">{showingDeadlines ? 'Inscrições encerrando em breve' : isFiltered ? 'Resultados da busca' : 'Oportunidades'}</h2>
            {(isFiltered || showingDeadlines) && <button type="button" onClick={clearFilters}>Ver tudo</button>}
          </div>
          {!data && !error && <p className="radar-status" role="status">Carregando oportunidades…</p>}
          {demo && <p className="radar-status">{error ? 'Catálogo indisponível. Oportunidades abaixo são exemplos.' : 'Nenhuma oportunidade publicada. Oportunidades abaixo são exemplos.'}</p>}
          {(data || error) && !cards.length && <p className="radar-status" role="status">Nenhuma oportunidade encontrada para esses filtros.</p>}
          <div className="radar-card-grid">
            {cards.map((event) => <OpportunityCard key={event.id_evento ?? event.titulo} event={event} />)}
          </div>
        </section>
      </main>
    </div>
  )
}
