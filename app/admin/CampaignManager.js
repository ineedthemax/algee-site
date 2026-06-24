'use client'
import { useState, useEffect, useRef, useCallback, useId } from 'react'
import DOMPurify from 'dompurify'

// ── Rich Text Toolbar ─────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: 'Small',   value: '2', px: '13px' },
  { label: 'Normal',  value: '3', px: '16px' },
  { label: 'Large',   value: '5', px: '20px' },
  { label: 'Heading', value: '6', px: '28px' },
]

function ToolbarBtn({ title, active, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`rte-btn${active ? ' rte-btn-active' : ''}`}
    >
      {children}
    </button>
  )
}

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef    = useRef(null)
  const imgInputRef  = useRef(null)
  const savedRange   = useRef(null)
  const fileInputId  = useId()

  const [activeFormats, setActiveFormats] = useState({})
  const [fontSize,      setFontSize]      = useState('3')
  const [uploading,     setUploading]     = useState(false)
  const [videoModal,    setVideoModal]    = useState(false)
  const [videoUrl,      setVideoUrl]      = useState('')
  const [videoThumb,    setVideoThumb]    = useState('')

  // Sync initial value once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = DOMPurify.sanitize(value)
    }
  }, []) // eslint-disable-line

  const checkFormats = useCallback(() => {
    setActiveFormats({
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      ul:        document.queryCommandState('insertUnorderedList'),
      ol:        document.queryCommandState('insertOrderedList'),
      center:    document.queryCommandState('justifyCenter'),
    })
  }, [])

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML ?? '')
    checkFormats()
  }

  const insertHtml = (html) => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand('insertHTML', false, html)
    onChange(editorRef.current?.innerHTML ?? '')
  }

  const handleSizeChange = (val) => { setFontSize(val); exec('fontSize', val) }
  const handleInput      = () => { onChange(editorRef.current?.innerHTML ?? ''); checkFormats() }

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { alert(data.error); return }
      insertHtml(`<img src="${data.url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;display:block;" /><br/>`)
    } catch (err) { alert('Upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  // ── Video insert ──────────────────────────────────────────────────────────
  const getYouTubeThumb = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : ''
  }

  const handleVideoInsert = () => {
    if (!videoUrl.trim()) return
    const thumb = videoThumb.trim() || getYouTubeThumb(videoUrl) || ''
    const html = thumb
      ? `<a href="${videoUrl}" target="_blank" style="display:block;position:relative;margin:8px 0;border-radius:10px;overflow:hidden;text-decoration:none;">
           <img src="${thumb}" alt="Watch video" style="width:100%;display:block;border-radius:10px;" />
           <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);">
             <div style="width:56px;height:56px;background:rgba(196,34,46,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;">
               <div style="width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:16px solid white;margin-left:4px;"></div>
             </div>
           </div>
         </a><br/>`
      : `<a href="${videoUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background:#c4222e;color:#fff;border-radius:8px;font-weight:700;text-decoration:none;margin:8px 0;">▶ Watch Video</a><br/>`

    setVideoModal(false)
    setVideoUrl('')
    setVideoThumb('')
    setTimeout(() => insertHtml(html), 100)
  }

  return (
    <>
      <div className="rte-wrap">
        {/* Toolbar */}
        <div className="rte-toolbar">
          <ToolbarBtn title="Bold"      active={activeFormats.bold}      onClick={() => exec('bold')}>      <b>B</b></ToolbarBtn>
          <ToolbarBtn title="Italic"    active={activeFormats.italic}    onClick={() => exec('italic')}>    <i>I</i></ToolbarBtn>
          <ToolbarBtn title="Underline" active={activeFormats.underline} onClick={() => exec('underline')}> <u>U</u></ToolbarBtn>

          <div className="rte-divider" />

          <select className="rte-size-select" value={fontSize}
            onChange={e => handleSizeChange(e.target.value)}
            onMouseDown={e => e.stopPropagation()}>
            {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="rte-divider" />

          <ToolbarBtn title="Bullet list"   active={activeFormats.ul} onClick={() => exec('insertUnorderedList')}>≡</ToolbarBtn>
          <ToolbarBtn title="Numbered list" active={activeFormats.ol} onClick={() => exec('insertOrderedList')}>⒈</ToolbarBtn>

          <div className="rte-divider" />

          <ToolbarBtn title="Align left"   active={!activeFormats.center} onClick={() => exec('justifyLeft')}>⬛◻◻</ToolbarBtn>
          <ToolbarBtn title="Align center" active={activeFormats.center}  onClick={() => exec('justifyCenter')}>◻⬛◻</ToolbarBtn>

          <div className="rte-divider" />

          {/* Image upload */}
          <label htmlFor={fileInputId} className={`rte-btn${uploading ? ' rte-btn-active' : ''}`} title="Insert image" style={{ cursor: 'pointer' }}>
            {uploading ? '↑' : '🖼'}
          </label>
          <input
            id={fileInputId}
            ref={imgInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFile}
          />

          {/* Video insert */}
          <ToolbarBtn title="Insert video" active={videoModal} onClick={() => { saveSelection(); setVideoModal(true) }}>▶</ToolbarBtn>

          <div className="rte-divider" />

          <ToolbarBtn title="Clear formatting" active={false} onClick={() => exec('removeFormat')}>✕</ToolbarBtn>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rte-body"
          onInput={handleInput}
          onKeyUp={checkFormats}
          onMouseUp={checkFormats}
          onSelect={checkFormats}
          onBlur={saveSelection}
          data-placeholder={placeholder}
        />
      </div>

      {/* Video modal */}
      {videoModal && (
        <div className="rte-modal-overlay" onClick={() => setVideoModal(false)}>
          <div className="rte-modal" onClick={e => e.stopPropagation()}>
            <div className="rte-modal-title">Insert Video</div>
            <div className="rte-modal-hint">
              Paste a YouTube link - the thumbnail and play button are inserted automatically. Or add any video URL.
            </div>
            <label className="lm-label">Video URL *</label>
            <input className="lm-input" style={{ marginBottom: 10 }} value={videoUrl}
              onChange={e => { setVideoUrl(e.target.value); setVideoThumb(getYouTubeThumb(e.target.value)) }}
              placeholder="https://youtube.com/watch?v=..." autoFocus />
            <label className="lm-label">Thumbnail URL <span className="lm-optional">(auto-filled for YouTube)</span></label>
            <input className="lm-input" style={{ marginBottom: 16 }} value={videoThumb}
              onChange={e => setVideoThumb(e.target.value)}
              placeholder="https://..." />
            {videoThumb && (
              <img src={videoThumb} alt="preview" style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 160, objectFit: 'cover' }} />
            )}
            <div className="lm-form-actions">
              <button className="lm-btn-cancel" onClick={() => setVideoModal(false)}>Cancel</button>
              <button className="lm-btn-save" onClick={handleVideoInsert}>Insert</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Segment definitions ───────────────────────────────────────────────────────
const SEGMENTS = [
  { id: 'all',              label: 'All Fans',           desc: 'Every fan who signed up',                  icon: '◎' },
  { id: 'has-phone',        label: 'Has Phone (SMS)',     desc: 'Fans who gave their phone number',         icon: '📱' },
  { id: 'inner-circle',     label: 'Inner Circle',        desc: 'Active paid subscribers',                  icon: '👑' },
  { id: 'profile-complete', label: 'Profile Complete',    desc: 'Filled out Tell Us About You',             icon: '👤' },
  { id: 'no-profile',       label: 'No Profile Yet',      desc: 'Haven\'t done the survey — re-engage them', icon: '◻' },
  { id: 'location',         label: 'By Location',         desc: 'Filter by city, state, or country',        icon: '📍' },
]

const SEGMENT_LABELS = {
  'all':              'All Fans',
  'has-phone':        'Has Phone',
  'inner-circle':     'Inner Circle',
  'profile-complete': 'Profile Complete',
  'no-profile':       'No Profile Yet',
}

function SegmentPicker({ segment, location, onSegment, onLocation, count, countLoading }) {
  return (
    <div className="cm-segment-wrap">
      <div className="cm-segment-label">
        <span>Audience</span>
        {count !== null && !countLoading && (
          <span className="cm-segment-count">{count.toLocaleString()} fan{count !== 1 ? 's' : ''}</span>
        )}
        {countLoading && <span className="cm-segment-count cm-segment-counting">Counting…</span>}
      </div>
      <div className="cm-segment-grid">
        {SEGMENTS.map(seg => (
          <button
            key={seg.id}
            type="button"
            className={`cm-segment-btn${segment === seg.id ? ' cm-segment-active' : ''}`}
            onClick={() => onSegment(seg.id)}
          >
            <span className="cm-seg-icon">{seg.icon}</span>
            <span className="cm-seg-body">
              <span className="cm-seg-name">{seg.label}</span>
              <span className="cm-seg-desc">{seg.desc}</span>
            </span>
            {segment === seg.id && <span className="cm-seg-check">✓</span>}
          </button>
        ))}
      </div>
      {segment === 'location' && (
        <div style={{ marginTop: 10 }}>
          <input
            className="lm-input"
            placeholder="Enter city, state, or country (e.g. New York, CA, Netherlands)"
            value={location}
            onChange={e => onLocation(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </div>
  )
}

// ── Campaign Manager ──────────────────────────────────────────────────────────
export default function CampaignManager() {
  const [campaigns,    setCampaigns]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [composing,    setComposing]    = useState(false)
  const [form,         setForm]         = useState({ subject: '', body: '' })
  const [segment,      setSegment]      = useState('all')
  const [location,     setLocation]     = useState('')
  const [segCount,     setSegCount]     = useState(null)
  const [segCounting,  setSegCounting]  = useState(false)
  const [sending,      setSending]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    fetch('/api/admin/campaigns').then(r => r.json()).then(d => { setCampaigns(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  // Fetch audience count when segment or location changes
  useEffect(() => {
    if (!composing) return
    if (segment === 'location' && !location.trim()) { setSegCount(null); return }
    setSegCounting(true)
    const params = new URLSearchParams({ segment })
    if (segment === 'location' && location.trim()) params.set('location', location.trim())
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/admin/campaigns/count?${params}`)
        const data = await res.json()
        setSegCount(data.count ?? 0)
      } catch { setSegCount(null) }
      finally { setSegCounting(false) }
    }, 400)  // debounce location typing
    return () => clearTimeout(timer)
  }, [segment, location, composing])

  const handleSend = async () => {
    if (!form.subject.trim() || !form.body.trim()) { setError('Subject and body required'); return }
    const audienceLabel = segment === 'location'
      ? `fans in "${location}"`
      : `${segCount?.toLocaleString() ?? '?'} ${SEGMENT_LABELS[segment] ?? 'fans'}`
    if (!confirm(`Send to ${audienceLabel}? This cannot be undone.`)) return
    setSending(true); setError(null); setResult(null)
    const res  = await fetch('/api/admin/campaigns', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, segment, location }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
    setCampaigns(c => [data.campaign, ...c])
    setComposing(false)
    setForm({ subject: '', body: '' })
    setSegment('all')
    setLocation('')
  }

  const handleCompose = () => {
    setComposing(true)
    setResult(null)
    setSegment('all')
    setLocation('')
    setSegCount(null)
  }

  if (loading) return <div className="adm-loading">Loading...</div>

  return (
    <div className="lm-wrap">
      <div className="lm-header">
        <div>
          <div className="lm-title">Email Campaigns</div>
          <div className="lm-sub">Target specific fans or blast your whole list · {campaigns.length} sent</div>
        </div>
        {!composing && <button className="lm-btn-new" onClick={handleCompose}>+ Compose</button>}
      </div>

      {result && (
        <div className="pt-result pt-result-ok">
          ✓ Sent to {result.sent} / {result.total} fans
        </div>
      )}

      {composing && (
        <div className="lm-form-wrap">
          <div className="adm-section-label">New Campaign</div>

          {/* Audience segment picker */}
          <SegmentPicker
            segment={segment}
            location={location}
            onSegment={s => { setSegment(s); setLocation('') }}
            onLocation={setLocation}
            count={segCount}
            countLoading={segCounting}
          />

          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Subject Line</label>
            <input
              className="lm-input"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Love Lost is out now 🔴"
            />
          </div>
          <div className="lm-form-field" style={{ marginBottom: 10 }}>
            <label className="lm-label">Message Body</label>
            <RichTextEditor
              value={form.body}
              onChange={body => setForm(f => ({ ...f, body }))}
              placeholder="Write your message to fans..."
            />
          </div>

          {error && <div className="lm-error">{error}</div>}
          <div className="lm-form-actions">
            <button className="lm-btn-cancel" onClick={() => setComposing(false)} disabled={sending}>Cancel</button>
            <button
              className="lm-btn-save"
              onClick={handleSend}
              disabled={sending || (segment === 'location' && !location.trim())}
            >
              {sending
                ? 'Sending…'
                : segCount !== null
                  ? `Send to ${segCount.toLocaleString()} fan${segCount !== 1 ? 's' : ''}`
                  : 'Send Campaign'}
            </button>
          </div>
        </div>
      )}

      {campaigns.length === 0 && !composing
        ? <div className="adm-empty adm-card" style={{ textAlign: 'center', padding: '40px 20px' }}>No campaigns sent yet.</div>
        : (
          <div className="lm-list">
            {campaigns.map(c => {
              const segLabel = c.tier_filter
                ? (SEGMENT_LABELS[c.tier_filter] ?? c.tier_filter.replace('location:', '📍 '))
                : 'All Fans'
              return (
                <div key={c.id} className="lm-row">
                  <div className="lm-row-left">
                    <div className="lm-cat-dot" style={{ background: '#3b82f6' }} />
                    <div className="lm-row-info">
                      <div className="lm-row-title">{c.subject}</div>
                      <div className="lm-row-desc" style={{ maxHeight: 36, overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.body) }} />
                      <div className="lm-row-live">
                        <span className="cm-sent-segment">{segLabel}</span>
                        · {c.recipient_count?.toLocaleString() ?? '-'} fans
                        · {new Date(c.sent_at ?? c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
