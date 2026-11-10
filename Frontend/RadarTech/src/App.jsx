import './App.css'

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
function PerfilSemLogin() {
  return (
    <main className="home perfil-sem-login">
      <h1>Bem-vindo ao RadarTech</h1>
      <p>Faça login para acessar seu perfil e recursos personalizados.</p>
      <button type="button" onClick={() => { /* Lógica de login */ }}>Login</button>
      <p>Caso não tenha uma conta, cadastre-se.</p>
       <button type="button" onClick={() => { /* Lógica de login */ }}>Cadastrar</button>
      <a href="/">Voltar para a tela inicial</a>
    </main>
  )
}

export default function App() {
  if (window.location.pathname === '/perfil') {
    return <PerfilSemLogin />
  }

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
