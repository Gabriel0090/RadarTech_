import { useEffect, useState } from 'react'
import './App.css'
import './Auth.css'
import { getCurrentUser, loginUser, logoutUser, registerUser } from './services/auth'

function Icon({ name, size = 16 }) {
  const paths = {
    search: 'M21 21l-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
    mic: 'M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Zm-6-4v1a6 6 0 0 0 12 0v-1m-6 7v4',
    bell: 'M10 21a2 2 0 0 0 4 0M3 17c2-2 3-4 3-8a6 6 0 0 1 12 0c0 4 1 6 3 8Z',
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)
    try {
      await loginUser({ email, senha: password })
      window.location.assign('/perfil')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/">RadarTech</a>
      <section className="auth-panel" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>
        <p className="auth-description">Entre na sua conta para continuar.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">E-mail</label>
          <input id="login-email" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Senha</label>
          <input id="login-password" type="password" placeholder="Digite sua senha" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
        </form>
        {message && <p className="auth-message" role="alert">{message}</p>}
        <p className="auth-switch">Ainda não tem conta? <a href="/cadastro">Cadastre-se</a></p>
      </section>
    </main>
  )
}

function Cadastro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)
    try {
      await registerUser({ nome: name, email, senha: password })
      setCreated(true)
      setMessage('Conta criada com sucesso! Agora você já pode fazer login.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/">RadarTech</a>
      <section className="auth-panel signup-panel" aria-labelledby="signup-title">
        <h1 id="signup-title">Cadastrar</h1>
        <p className="auth-description">Crie sua conta no RadarTech.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Nome</label>
          <input id="signup-name" type="text" placeholder="Seu nome completo" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required disabled={created} />
          <label htmlFor="signup-email">E-mail</label>
          <input id="signup-email" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={created} />
          <label htmlFor="signup-password">Senha</label>
          <input id="signup-password" type="password" placeholder="Crie uma senha (mínimo 8 caracteres)" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={created} />
          <button className="auth-submit" type="submit" disabled={isSubmitting || created}>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</button>
        </form>
        {message && <p className="auth-message" role={created ? 'status' : 'alert'}>{message}</p>}
        {created && <p className="auth-switch"><a href="/login">Ir para o login</a></p>}
        <p className="auth-switch">Já tem uma conta? <a href="/login">Fazer login</a></p>
      </section>
    </main>
  )
}

function PerfilSemLogin() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('Carregando perfil...')

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((data) => { if (active) { setUser(data); setMessage('') } })
      .catch((error) => {
        logoutUser()
        if (active) setMessage(error.message)
      })
    return () => { active = false }
  }, [])

  function handleLogout() {
    logoutUser()
    window.location.assign('/login')
  }

  if (!user) {
    return (
      <main className="home perfil-sem-login">
        <h1>Perfil</h1>
        <p>{message}</p>
        <a className="profile-button" href="/login">Login</a>
        <a href="/">Voltar para a tela inicial</a>
      </main>
    )
  }

  return (
    <main className="home perfil-sem-login">
      <h1>Olá, {user.nome}!</h1>
      <p>{user.email}</p>
      <p>Perfil: {user.perfil}</p>
      <button className="profile-button" type="button" onClick={handleLogout}>Sair</button>
      <a href="/">Voltar para a tela inicial</a>
    </main>
  )
}

export default function App() {
  const path = window.location.pathname

  if (path === '/perfil') return <PerfilSemLogin />
  if (path === '/login') return <Login />
  if (path === '/cadastro') return <Cadastro />

  return (
    <main className="home" aria-labelledby="home-title">
      <h1 id="home-title">Tela inicio</h1>
      <div className="screen">
        <header className="toolbar">
          <a className="desktop-brand" href="/">RadarTech</a>
          <a className="avatar" href="/perfil" aria-label="Abrir perfil" />
          <div className="search">
            <Icon name="search" />
            <input type="search" aria-label="Buscar" placeholder="Search" />
            <button type="button" aria-label="Busca por voz"><Icon name="mic" size={14} /></button>
          </div>
          <button type="button" className="notifications" aria-label="Notificações"><Icon name="bell" size={28} /></button>
        </header>

        <section className="cards" aria-label="Conteúdos">
          {[1, 2, 3, 4, 5].map((number) => (
            <article className={number === 3 ? 'card card-wide' : 'card'} key={number}>
              <div className="card-preview" aria-hidden="true" />
              <button type="button" className="play" aria-label={`Reproduzir conteúdo ${number}`}>
                <span aria-hidden="true" />Play
              </button>
            </article>
          ))}
        </section>

        <footer className="screen-footer" />
      </div>
    </main>
  )
}
