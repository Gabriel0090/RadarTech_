import { useEffect, useState } from 'react'
import { getAccessToken, getCurrentUser, logoutUser } from './services/auth'
import { request } from './services/api'
import './Profile.css'

const iconPaths = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  mail: 'M4 5h16v14H4zM4 7l8 6 8-6',
  pin: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  briefcase: 'M3 8h18v12H3zM8 8V5h8v3m-13 5h18m-11 0v2h4v-2',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  plus: 'M12 5v14m-7-7h14',
  logout: 'M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7',
  arrow: 'M19 12H5m7 7-7-7 7-7',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z',
  external: 'M14 3h7v7m-1-6-9 9m-2-7H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  award: 'm12 15 3.5 2 1-4 3-3-4-.5L14  6l-2-4-2 4-4 3 4 .5 1 4Z M8 14l-2 8 6-3 6 3-2-8',
}

const logoBars = [8, 16, 23, 14, 19, 13, 26, 20, 29, 15, 23, 12, 21, 28, 17]
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const statusLabels = {
  pendente: 'Em análise',
  aprovado: 'Aprovado',
  rejeitado: 'Não aprovado',
}

function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}

function ProfileHeader({ user, onLogout, onEdit, isEditing }) {
  return (
    <section className="profile-summary">
      <div className="profile-summary-main">
        <div className="profile-avatar" aria-hidden="true">{user.nome?.charAt(0).toUpperCase() || <Icon name="user" size={28} />}</div>
        <div className="profile-identity">
          <span className="profile-member">✦ Membro RadarTech</span>
          <h1>{user.nome}</h1>
          <p><Icon name="briefcase" /> Perfil: {user.perfil}</p>
        </div>
        <div className="profile-summary-actions">
          <button className="profile-edit-button" type="button" onClick={onEdit}>
            <Icon name="edit" /> {isEditing ? 'Fechar edição' : 'Editar perfil'}
          </button>
          <button className="profile-logout-button" type="button" onClick={onLogout} aria-label="Sair da conta">
            <Icon name="logout" /><span>Sair</span>
          </button>
        </div>
      </div>
      <div className="profile-contact">
        <span><Icon name="mail" /> {user.email}</span>
        {user.cidade && <span><Icon name="pin" /> {user.cidade}</span>}
      </div>
    </section>
  )
}

function OpportunityCard({ event, onRemove, isRemoving }) {
  const place = [event.cidade, event.estado].filter(Boolean).join(' / ') || event.modalidade
  const deadline = event.prazo_inscricao && dateFormat.format(new Date(event.prazo_inscricao))

  return (
    <article className="profile-opportunity">
      <div className="profile-opportunity-meta">
        {event.tipo && <span className="profile-chip">{event.tipo}</span>}
        {event.preco != null && Number(event.preco) === 0 && <span className="profile-chip profile-chip-free">Gratuito</span>}
      </div>
      <h3>{event.titulo}</h3>
      <p className="profile-opportunity-details">
        {[place, deadline && `Inscrições até ${deadline}`].filter(Boolean).join(' · ') || 'Detalhes da oportunidade'}
      </p>
      <div className="profile-opportunity-actions">
        <a href={`/eventos/${event.id_evento}`}>Ver oportunidade <Icon name="external" size={14} /></a>
        <button type="button" onClick={() => onRemove(event.id_evento)} disabled={isRemoving}>
          {isRemoving ? 'Removendo…' : 'Remover'}
        </button>
      </div>
    </article>
  )
}

export default function Profile() {
  const token = getAccessToken()
  const [user, setUser] = useState(null)
  const [authState, setAuthState] = useState(token ? 'loading' : 'logged-out')
  const [authError, setAuthError] = useState('')
  const [favorites, setFavorites] = useState([])
  const [favoritesError, setFavoritesError] = useState('')
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsError, setSuggestionsError] = useState('')
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('favorites')
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ nome: '', cidade: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const accessToken = getAccessToken()
    if (!accessToken) {
      return () => { active = false }
    }

    getCurrentUser()
      .then(async (currentUser) => {
        if (!active) return
        setUser(currentUser)
        setDraft({ nome: currentUser.nome, cidade: currentUser.cidade ?? '' })
        setAuthState('ready')

        const [favoriteResult, suggestionResult] = await Promise.allSettled([
          request('/api/v1/me/favorites', { token: accessToken }),
          request('/api/v1/me/event-suggestions', { token: accessToken }),
        ])
        if (!active) return
        if (favoriteResult.status === 'fulfilled') {
          setFavorites(favoriteResult.value)
          setFavoritesError('')
        } else {
          setFavoritesError(favoriteResult.reason.message)
        }
        setFavoritesLoaded(true)
        if (suggestionResult.status === 'fulfilled') {
          setSuggestions(suggestionResult.value)
          setSuggestionsError('')
        } else {
          setSuggestionsError(suggestionResult.reason.message)
        }
        setSuggestionsLoaded(true)
      })
      .catch((error) => {
        if (active) {
          setAuthError(error.message)
          setAuthState('error')
        }
      })

    return () => { active = false }
  }, [reload])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function handleLogout() {
    logoutUser()
    window.location.assign('/login')
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      const updatedUser = await request('/api/v1/auth/me', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ nome: draft.nome, cidade: draft.cidade }),
      })
      setUser(updatedUser)
      setDraft({ nome: updatedUser.nome, cidade: updatedUser.cidade ?? '' })
      setIsEditing(false)
      setNotice('Perfil atualizado.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemoveFavorite(eventId) {
    setRemovingId(eventId)
    setFavoritesError('')
    try {
      await request(`/api/v1/events/${eventId}/favorites`, { method: 'DELETE', token })
      setFavorites((current) => current.filter((event) => event.id_evento !== eventId))
      setNotice('Oportunidade removida dos salvos.')
    } catch (error) {
      setFavoritesError(error.message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="profile-page">
      {notice && <div className="profile-toast" role="status"><Icon name="check" />{notice}</div>}
      <header className="profile-header">
        <a className="profile-logo" href="/" aria-label="RadarTech, início">
          {logoBars.map((height, index) => <span key={index} style={{ height }} />)}
        </a>
        <div className="profile-header-actions">
          <a className="profile-create-link" href="/oportunidades/nova"><Icon name="plus" /> Cadastrar oportunidade</a>
          <span className="profile-header-avatar" aria-label="Perfil"><Icon name="user" /></span>
        </div>
      </header>

      <main className="profile-main">
        <a className="profile-back" href="/"><Icon name="arrow" /> Voltar para a tela inicial</a>

        {authState === 'loading' && <p className="profile-state" role="status">Carregando perfil…</p>}

        {authState === 'logged-out' && (
          <section className="profile-logged-out">
            <div className="profile-color-stripe" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="profile-logged-out-content">
              <span className="profile-large-icon"><Icon name="user" size={30} /></span>
              <h1>Acesse seu Perfil</h1>
              <p>Entre na sua conta para acompanhar suas oportunidades salvas e sugestões enviadas.</p>
              <a className="profile-primary-link" href="/login">Entrar na minha conta</a>
              <a className="profile-secondary-link" href="/cadastro">Criar uma conta gratuita</a>
            </div>
          </section>
        )}

        {authState === 'error' && (
          <section className="profile-state profile-error" role="alert">
            <h1>Não foi possível carregar seu perfil</h1>
            <p>{authError}</p>
            <button type="button" onClick={() => {
              setAuthError('')
              setAuthState('loading')
              setReload((count) => count + 1)
            }}>Tentar novamente</button>
            <a href="/login">Ir para o login</a>
          </section>
        )}

        {authState === 'ready' && user && (
          <div className="profile-content">
            <ProfileHeader
              user={user}
              onLogout={handleLogout}
              onEdit={() => {
                if (!isEditing) setDraft({ nome: user.nome, cidade: user.cidade ?? '' })
                setIsEditing((editing) => !editing)
              }}
              isEditing={isEditing}
            />

            <div className="profile-stat-row" aria-label="Resumo da conta">
              <span><strong>{favoritesLoaded ? favorites.length : '…'}</strong> Salvas</span>
              <span><strong>{suggestionsLoaded ? suggestions.length : '…'}</strong> Sugestões enviadas</span>
            </div>

            {isEditing && (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <h2>Editar informações pessoais</h2>
                <div className="profile-edit-fields">
                  <label>
                    Nome completo
                    <input
                      value={draft.nome}
                      onChange={(event) => setDraft((current) => ({ ...current, nome: event.target.value }))}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    Cidade / Estado
                    <input
                      value={draft.cidade}
                      onChange={(event) => setDraft((current) => ({ ...current, cidade: event.target.value }))}
                      maxLength={120}
                    />
                  </label>
                </div>
                <div className="profile-edit-actions">
                  <button type="button" className="profile-cancel-button" onClick={() => setIsEditing(false)}>Cancelar</button>
                  <button type="submit" className="profile-primary-button" disabled={isSaving}>{isSaving ? 'Salvando…' : 'Salvar alterações'}</button>
                </div>
              </form>
            )}

            <nav className="profile-tabs" aria-label="Seções do perfil">
              <button type="button" className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>
                <Icon name="bookmark" /> Oportunidades salvas
              </button>
              <button type="button" className={activeTab === 'suggestions' ? 'active' : ''} onClick={() => setActiveTab('suggestions')}>
                <Icon name="plus" /> Minhas sugestões
              </button>
              <button type="button" className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>
                <Icon name="award" /> Resumo da conta
              </button>
            </nav>

            {activeTab === 'favorites' && (
              <section className="profile-tab-panel" aria-label="Oportunidades salvas">
                {favoritesError && <p className="profile-inline-error" role="alert">{favoritesError}</p>}
                {!favoritesLoaded && !favoritesError && <p className="profile-state" role="status">Carregando oportunidades salvas…</p>}
                {!favoritesError && favorites.length === 0 && (
                  favoritesLoaded && <div className="profile-empty">
                    <p>Você ainda não salvou nenhuma oportunidade.</p>
                    <a className="profile-primary-link" href="/">Explorar oportunidades na Home</a>
                  </div>
                )}
                {favorites.length > 0 && (
                  <div className="profile-opportunity-grid">
                    {favorites.map((event) => (
                      <OpportunityCard
                        key={event.id_evento}
                        event={event}
                        onRemove={handleRemoveFavorite}
                        isRemoving={removingId === event.id_evento}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'suggestions' && (
              <section className="profile-tab-panel profile-suggestions" aria-label="Minhas sugestões">
                {suggestionsError && <p className="profile-inline-error" role="alert">{suggestionsError}</p>}
                {!suggestionsLoaded && !suggestionsError && <p className="profile-state" role="status">Carregando sugestões…</p>}
                {!suggestionsError && suggestions.length === 0 && (
                  suggestionsLoaded && <div className="profile-empty">
                    <p>Você ainda não enviou sugestões de oportunidades.</p>
                    <a className="profile-primary-link" href="/oportunidades/nova">Cadastrar oportunidade</a>
                  </div>
                )}
                {suggestions.map((suggestion) => {
                  const status = suggestion.status_revisao
                  return (
                    <article className="profile-suggestion" key={suggestion.id_evento}>
                      <div>
                        <h2>{suggestion.titulo}</h2>
                        <p>Enviada em {dateTimeFormat.format(new Date(suggestion.criado_em))}</p>
                      </div>
                      <span className={`profile-status profile-status-${status}`}>
                        <Icon name={status === 'aprovado' ? 'check' : 'clock'} />
                        {statusLabels[status] ?? status}
                      </span>
                    </article>
                  )
                })}
              </section>
            )}

            {activeTab === 'about' && (
              <section className="profile-tab-panel profile-account-info" aria-label="Resumo da conta">
                <div>
                  <h2>Sobre sua conta</h2>
                  <p>Seus dados pessoais são usados para identificar sua conta no RadarTech.</p>
                </div>
                <dl>
                  <div><dt>Nome</dt><dd>{user.nome}</dd></div>
                  <div><dt>E-mail</dt><dd>{user.email}</dd></div>
                  <div><dt>Tipo de perfil</dt><dd>{user.perfil}</dd></div>
                  {user.cidade && <div><dt>Cidade / Estado</dt><dd>{user.cidade}</dd></div>}
                  <div><dt>Membro desde</dt><dd>{dateFormat.format(new Date(user.criado_em))}</dd></div>
                </dl>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
