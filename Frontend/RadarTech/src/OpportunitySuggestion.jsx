import { useEffect, useRef, useState } from 'react'
import { request } from './services/api'
import { getAccessToken } from './services/auth'
import Logo from './Logo'
import './OpportunitySuggestion.css'

const initial = { titulo:'', tipo:'', nivel:'', descricao:'', publico_alvo:'', requisitos:'', modalidade:'', cidade:'', estado:'', data_inicio:'', data_fim:'', prazo_inscricao:'', preco:'', url_inscricao:'', url_imagem:'', instituicao:'', contato_sugestao:'' }
const sections = ['Informações básicas', 'Datas de realização e prazo de inscrição', 'Descrição, público-alvo e requisitos', 'Modalidade e localização', 'Valor e link oficial de inscrição', 'Instituição responsável e contato', 'Responsabilidade e revisão']

export default function OpportunitySuggestion() {
  const token = getAccessToken()
  const [form, setForm] = useState(initial)
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState([])
  const [subjectsError, setSubjectsError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [preview, setPreview] = useState(false)
  const previewRef = useRef(null)
  useEffect(() => { if (preview) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [preview])
  const [error, setError] = useState('')
  const [priceMode, setPriceMode] = useState('unknown')
  useEffect(() => { request('/api/v1/subjects').then(setSubjects).catch(() => setSubjectsError('Não foi possível carregar os assuntos. Você pode enviar sem selecioná-los.')) }, [])
  function field(e) { setForm({ ...form, [e.target.name]: e.target.value }) }
  async function submit(e) {
    e.preventDefault(); setError('')
    if (!form.titulo.trim()) { setError('Informe o título da oportunidade.'); return }
    if (!confirmed) { setError('Confirme a responsabilidade pelo link antes de enviar.'); return }
    if (form.data_inicio && form.data_fim && form.data_fim < form.data_inicio) { setError('O término deve ser posterior ao início.'); return }
    const payload = Object.fromEntries(Object.entries(form).filter(([key, value]) => key !== 'preco' && value.trim()).map(([key, value]) => [key, key.startsWith('data_') || key === 'prazo_inscricao' ? new Date(value).toISOString() : value.trim()]))
    payload.preco = priceMode === 'free' ? 0 : priceMode === 'paid' ? Number(form.preco) : null
    payload.assunto_ids = selected
    setSubmitting(true)
    try { await request('/api/v1/events/suggestions', { method:'POST', token, body:JSON.stringify(payload) }); setSubmitted(true) } catch (err) { setError(err.message) } finally { setSubmitting(false) }
  }
  const input = (name, label, props={}) => <label>{label}<input name={name} value={form[name]} onChange={field} {...props} /></label>
  const text = (name,label) => <label>{label}<textarea name={name} value={form[name]} onChange={field} rows="3" /></label>
  const select = (name,label,options) => <label>{label}<select name={name} value={form[name]} onChange={field}><option value="">Selecione</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
  const section = (n, content) => <section className="suggest-section"><h2><span>{n}</span>{sections[n-1]}</h2>{content}</section>
  return <main className="suggest-page"><header className="suggest-header"><a href="/" aria-label="RadarTech, início"><Logo /></a><span>ENVIO DE OPORTUNIDADE</span><a className="suggest-profile" href="/perfil">Perfil</a></header><div className="suggest-heading"><a href="/">← Voltar</a><h1>Cadastrar oportunidade</h1><small>Apenas informações antes de publicar</small></div>
    {!token ? <div className="suggest-notice">Para enviar uma oportunidade, <a href="/login?next=%2Foportunidades%2Fnova">entre na sua conta</a>.</div> : submitted ? <div className="suggest-notice" role="status"><h2>Oportunidade enviada para revisão</h2><p>Ela ficará pendente até a análise da equipe.</p><a href="/">Voltar às oportunidades</a></div> : <form onSubmit={submit}>
      <div className="suggest-body">
        {section(1,<><p>Identifique a oportunidade e classifique sua categoria e assuntos principais.</p>{input('titulo','Título da oportunidade *',{required:true,maxLength:200,placeholder:'Ex.: Aceleração Frontend'})}<label>Imagem de divulgação (opcional)<div className="suggest-image">{form.url_imagem ? <img src={form.url_imagem} alt="Prévia da imagem de divulgação" onError={e => { e.currentTarget.style.display = 'none' }} onLoad={e => { e.currentTarget.style.display = 'block' }} /> : <span>Imagem aqui</span>}</div><input name="url_imagem" type="url" pattern="https?://.+" placeholder="URL da imagem (https://...)" value={form.url_imagem} onChange={field} /></label><div className="suggest-grid">{select('tipo','Tipo de oportunidade',['Curso','Hackathon','Evento','Palestra','Bolsa','Workshop','Programa'])}{select('nivel','Nível recomendado',['Iniciante','Intermediário','Avançado','Todos os níveis'])}</div><fieldset><legend>Assuntos relacionados</legend>{subjectsError && <p>{subjectsError}</p>}{subjects.length ? subjects.map(s=><label className="subject-option" key={s.id_assunto}><input type="checkbox" checked={selected.includes(s.id_assunto)} onChange={e=>setSelected(e.target.checked ? [...selected,s.id_assunto] : selected.filter(id=>id!==s.id_assunto))} />{s.nome}</label>) : !subjectsError && <p>Nenhum assunto disponível.</p>}</fieldset></>)}
        {section(2,<><p>Indique quando a oportunidade acontece e o prazo para se inscrever.</p><div className="suggest-grid">{input('data_inicio','Data e hora de início',{type:'datetime-local'})}{input('data_fim','Data e hora de término',{type:'datetime-local'})}</div><div className="suggest-deadline">{input('prazo_inscricao','Prazo final de inscrição',{type:'datetime-local'})}</div></>)}
        {section(3,<>{text('descricao','Descrição completa')}<div className="suggest-grid">{text('publico_alvo','Público-alvo')}{text('requisitos','Requisitos')}</div></>)}
        {section(4,<>{select('modalidade','Modalidade',['Online','Presencial','Híbrido'])}<div className="suggest-grid">{input('cidade','Cidade',{maxLength:120})}{input('estado','Estado',{maxLength:100})}</div></>)}
        {section(5,<><fieldset><legend>Investimento</legend><div className="price-options">{[['free','Gratuita (R$ 0,00)'],['paid','Paga'],['unknown','Não informado']].map(([v,l])=><label key={v}><input type="radio" name="priceMode" value={v} checked={priceMode===v} onChange={()=>setPriceMode(v)} />{l}</label>)}</div></fieldset>{priceMode==='paid' && input('preco','Valor em reais',{type:'number',min:'0.01',step:'0.01',required:true})}{input('url_inscricao','Link oficial de inscrição',{type:'url',pattern:'https?://.+',placeholder:'https://...'})}</>)}
        {section(6,<><div className="suggest-grid">{input('instituicao','Instituição responsável',{maxLength:200,placeholder:'Ex.: Universidade Federal / Comunidade Dev'})}{input('contato_sugestao','E-mail de contato (opcional)',{type:'email',maxLength:254,placeholder:'contato@instituicao.edu.br'})}</div><p>Se não for informado, usaremos o e-mail da sua conta para contato da curadoria.</p></>)}
        {section(7,<label className="suggest-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} required />Confirmo que o link informado pertence à instituição organizadora e que a sugestão ficará pendente até a revisão.</label>)}
        {error && <p className="suggest-error" role="alert">{error}</p>}
        {preview && <div ref={previewRef} className="suggest-section" role="status"><h2>Pré-visualização</h2><strong>{form.titulo || 'Título da oportunidade'}</strong><p>{[form.tipo,form.modalidade,form.cidade].filter(Boolean).join(' · ') || 'Informações ainda não preenchidas'}</p>{form.url_imagem && <img className="preview-image" src={form.url_imagem} alt="Imagem da oportunidade" />}<p>{form.descricao}</p></div>}
      </div><footer className="suggest-actions"><span>Status inicial: pendente</span><div><a href="/">Cancelar</a><button type="button" onClick={()=>setPreview(!preview)}>{preview ? 'Fechar prévia' : 'Pré-visualizar card'}</button><button className="primary" disabled={submitting}>{submitting ? 'Enviando…' : 'Enviar para revisão'}</button></div></footer>
    </form>}
  </main>
}
