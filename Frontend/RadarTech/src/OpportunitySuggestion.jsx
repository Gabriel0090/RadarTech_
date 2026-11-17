import { useState } from 'react'
import { request } from './services/api'
import { getAccessToken } from './services/auth'
import './Auth.css'

export default function OpportunitySuggestion() {
  const token = getAccessToken()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const title = fields.get('titulo').trim()
    if (!title) {
      setError('Informe o título da oportunidade.')
      return
    }

    const payload = { titulo: title }
    for (const field of ['tipo', 'descricao', 'url_inscricao']) {
      const value = fields.get(field).trim()
      if (value) payload[field] = value
    }

    setSubmitting(true)
    setError('')
    try {
      await request('/api/v1/events/suggestions', { method: 'POST', token, body: JSON.stringify(payload) })
      setSubmitted(true)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/">RadarTech</a>
      <section className="auth-panel" aria-labelledby="suggestion-title">
        <h1 id="suggestion-title">Cadastrar oportunidade</h1>
        {!token ? (
          <p className="auth-switch"><a href="/login?next=%2Foportunidades%2Fnova">Entre na sua conta para enviar uma oportunidade</a>.</p>
        ) : submitted ? (
          <p role="status">Oportunidade enviada para revisão.</p>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="suggest-title">Título</label>
            <input id="suggest-title" name="titulo" maxLength={200} required />
            <label htmlFor="suggest-type">Categoria</label>
            <input id="suggest-type" name="tipo" maxLength={50} />
            <label htmlFor="suggest-description">Descrição</label>
            <textarea id="suggest-description" name="descricao" rows={4} />
            <label htmlFor="suggest-url">Link de inscrição</label>
            <input id="suggest-url" name="url_inscricao" type="url" pattern="https?://.+" />
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Enviando…' : 'Enviar para revisão'}</button>
          </form>
        )}
        {error && <p className="auth-message" role="alert">{error}</p>}
        <p className="auth-switch"><a href="/">Voltar à home</a></p>
      </section>
    </main>
  )
}
