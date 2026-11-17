import { useEvents, formatEventDate } from './services/events'
import './Events.css'

const priceFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function registrationLink(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export function EventDetails({ eventId }) {
  const { data: event, error } = useEvents(`/api/v1/events/${eventId}`)

  return (
    <main className="event-details">
      <a className="event-back" href="/">← Voltar para os eventos</a>
      {error && <p role="alert">{error}</p>}
      {!event && !error && <p role="status">Carregando evento…</p>}
      {event && <EventInformation event={event} />}
    </main>
  )
}

function EventInformation({ event }) {
  const link = registrationLink(event.url_inscricao)
  const price = event.preco == null ? null : Number(event.preco)
  const information = [
    ['Início', formatEventDate(event.data_inicio)],
    ['Término', formatEventDate(event.data_fim)],
    ['Modalidade', event.modalidade],
    ['Local', [event.cidade, event.estado].filter(Boolean).join(' / ')],
    ['Preço', price === 0 ? 'Gratuito' : price != null && priceFormat.format(price)],
    ['Instituição', event.instituicao],
    ['Nível', event.nivel],
    ['Fonte', event.fonte_externa],
  ].filter(([, value]) => value)
  const sections = [
    ['Sobre o evento', event.descricao],
    ['Público-alvo', event.publico_alvo],
    ['Requisitos', event.requisitos],
  ]

  return (
    <article className="event-information">
      <header className="event-heading">
        {event.tipo && <p>{event.tipo}</p>}
        <h1>{event.titulo}</h1>
        {event.assuntos?.length > 0 && (
          <ul className="event-subjects" aria-label="Assuntos">
            {event.assuntos.map((subject) => <li key={subject}>{subject}</li>)}
          </ul>
        )}
      </header>

      <div className="event-body">
        <div className="event-overview">
          {sections.map(([label, value]) => value && (
            <section key={label}>
              <h2>{label}</h2>
              <p>{value}</p>
            </section>
          ))}
          {information.length > 0 && (
            <dl className="event-facts">
              {information.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}
        </div>

        <section className="event-registration">
          <h2>Inscrição</h2>
          <p>{event.prazo_inscricao ? `Até ${formatEventDate(event.prazo_inscricao)}` : 'Prazo não informado'}</p>
          {link ? <a className="event-register-link" href={link}>Ir para inscrição ↗</a> : <p>Link de inscrição indisponível.</p>}
        </section>
      </div>
    </article>
  )
}
