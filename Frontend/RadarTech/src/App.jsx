import { useState } from 'react'
import './App.css'
import './Auth.css'
import { loginUser, registerUser } from './services/auth'
import { EventDetails } from './Events'
import Home from './Home'
import OpportunitySuggestion from './OpportunitySuggestion'
import Profile from './Profile'

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
      window.location.assign(new URLSearchParams(window.location.search).get('next') === '/oportunidades/nova' ? '/oportunidades/nova' : '/perfil')
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

export default function App() {
  const path = window.location.pathname
  const eventRoute = path.match(/^\/eventos\/(\d+)\/?$/)

  if (eventRoute) return <EventDetails eventId={eventRoute[1]} />
  if (path === '/oportunidades/nova') return <OpportunitySuggestion />
  if (path === '/perfil') return <Profile />
  if (path === '/login') return <Login />
  if (path === '/cadastro') return <Cadastro />

  return <Home />
}
