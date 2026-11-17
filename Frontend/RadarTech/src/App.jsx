import { useState } from 'react'
import './App.css'
import './Auth.css'
import { loginUser, registerUser } from './services/auth'
import { EventDetails } from './Events'
import Home from './Home'
import OpportunitySuggestion from './OpportunitySuggestion'
import Profile from './Profile'
import Logo from './Logo'

function Auth({ signup = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState(false)
  const next = new URLSearchParams(window.location.search).get('next') === '/oportunidades/nova' ? '?next=%2Foportunidades%2Fnova' : ''

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage('')
    setIsSubmitting(true)
    try {
      if (signup) {
        await registerUser({ nome: form.get('nome').trim(), email: form.get('email'), senha: form.get('senha'), telefone: form.get('telefone').trim() || null, cidade: form.get('cidade').trim() || null })
        setCreated(true)
        setMessage('Conta criada com sucesso! Entre para continuar.')
      } else {
        await loginUser({ email: form.get('email'), senha: form.get('senha') })
        window.location.assign(next ? '/oportunidades/nova' : '/perfil')
      }
    } catch (error) { setMessage(error.message) } finally { setIsSubmitting(false) }
  }

  return <main className="auth-page">
    <aside className="auth-identity"><Logo />{signup}</aside>
    <header className="auth-mobile-header"><Logo /><a href="/">← Voltar</a></header>
    <section className="auth-content">
      <a className="auth-back" href="/">← Voltar para oportunidades</a>
      <div className="auth-panel">
        <h1>{signup ? 'Criar nova conta' : 'Bem-vindo(a) de volta'}</h1>
        <p className="auth-description">{signup ? 'Preencha seus dados básicos para começar.' : 'Acesse sua conta para sugerir oportunidades, salvar favoritos e interagir.'}</p>
        <nav className="auth-tabs" aria-label="Autenticação"><a className={!signup ? 'active' : ''} href={'/login' + next}>Entrar</a><a className={signup ? 'active' : ''} href={'/cadastro' + next}>Criar conta</a></nav>
        <form onSubmit={handleSubmit}>
          {signup && <label>Nome completo <b>*</b><input name="nome" autoComplete="name" placeholder="Ex.: Mariana Silva" maxLength={120} required disabled={created} /></label>}
          <label>E-mail <b>*</b><input name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com.br" maxLength={254} required disabled={created} /></label>
          <label>Senha <b>*</b>{!signup && <button className="forgot-password" type="button" onClick={() => setMessage('A recuperação de senha ainda não está disponível.')}>Esqueci minha senha</button>}<span className="password-field"><input name="senha" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Mínimo de 8 caracteres' : 'Digite sua senha'} minLength={signup ? 8 : undefined} maxLength={72} required disabled={created} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></span></label>
          {signup && <div className="auth-row"><label>Telefone (opcional)<input name="telefone" type="tel" autoComplete="tel" placeholder="(51) 99999-0000" maxLength={30} disabled={created} /></label><label>Cidade (opcional)<input name="cidade" autoComplete="address-level2" placeholder="Ex.: Porto Alegre" maxLength={120} disabled={created} /></label></div>}
          {message && <p className="auth-message" role={created ? 'status' : 'alert'}>{message}</p>}
          {created ? <a className="auth-submit auth-submit-link" href={'/login' + next}>Ir para o login</a> : <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</button>}
        </form>
      </div>
    </section>
  </main>
}

export default function App() {
  const path = window.location.pathname
  const eventRoute = path.match(/^\/eventos\/(\d+)\/?$/)

  if (eventRoute) return <EventDetails eventId={eventRoute[1]} />
  if (path === '/oportunidades/nova') return <OpportunitySuggestion />
  if (path === '/perfil') return <Profile />
  if (path === '/login') return <Auth />
  if (path === '/cadastro') return <Auth signup />

  return <Home />
}
