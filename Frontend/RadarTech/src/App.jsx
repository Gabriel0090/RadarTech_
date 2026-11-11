import { useState } from 'react'
import './App.css'
import './Auth.css'

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

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('A interface está pronta. A autenticação será conectada ao backend.')
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/">RadarTech</a>
      <section className="auth-panel" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>
        <p className="auth-description">Entre na sua conta para continuar.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <a className="forgot-link" href="mailto:suporte@radartech.com?subject=Recuperar%20senha">Forgot password?</a>
        {message && <p className="auth-message" role="status">{message}</p>}
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

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('Cadastro visual pronto. A criação da conta será conectada ao backend.')
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/">RadarTech</a>
      <section className="auth-panel signup-panel" aria-labelledby="signup-title">
        <h1 id="signup-title">Cadastrar</h1>
        <p className="auth-description">Crie sua conta no RadarTech.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Nome</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="signup-password">Senha</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Crie uma senha"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="auth-submit" type="submit">Cadastrar</button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-switch">Já tem uma conta? <a href="/login">Fazer login</a></p>
      </section>
    </main>
  )
}

function PerfilSemLogin() {
  return (
    <main className="home perfil-sem-login">
      <h1>Bem-vindo ao RadarTech</h1>
      <p>Faça login para acessar seu perfil e recursos personalizados.</p>
      <a className="profile-button" href="/login">Login</a>
      <p>Caso não tenha uma conta, cadastre-se.</p>
      <a className="profile-button" href="/cadastro">Cadastrar</a>
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
