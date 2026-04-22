'use client'

import { useState } from 'react'
import Link from 'next/link'

const MAX_CHARS = 280

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)   return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function PostCard({ post, isMe }) {
  return (
    <div className={`fw-card${isMe ? ' fw-card-me' : ''}`}>
      {isMe && <div className="fw-card-you">You</div>}
      <p className="fw-card-message">"{post.message}"</p>
      <div className="fw-card-footer">
        <span className="fw-card-name">
          {post.display_name || 'A Fan'}
          {post.city ? <span className="fw-card-city"> · {post.city}</span> : null}
        </span>
        <span className="fw-card-time">{timeAgo(post.created_at)}</span>
      </div>
    </div>
  )
}

export default function FanWall({ posts, currentUserId, userPost }) {
  const [message,     setMessage]     = useState('')
  const [displayName, setDisplayName] = useState('')
  const [city,        setCity]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)
  const [submitted,   setSubmitted]   = useState(false)
  const [localPost,   setLocalPost]   = useState(userPost)

  const charsLeft = MAX_CHARS - message.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/fan-wall/post', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: message.trim(), displayName: displayName.trim(), city: city.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong')
      setSubmitted(true)
      setLocalPost({ message: message.trim(), display_name: displayName.trim() || 'A Fan', city: city.trim() })
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const alreadyPosted = !!localPost

  return (
    <div className="fw-page">
      <div className="fw-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">Fan Community</div>
          <h1>The Fan <span className="italic">Wall.</span></h1>
          <p className="page-hero-sub">
            Real words from the fans who built this. Leave yours.
          </p>
        </div>

        {/* Post form */}
        <div className="fw-form-wrap">
          {!currentUserId ? (
            <div className="fw-login-nudge">
              <span>Sign in to leave your message on the wall.</span>
              <Link href="/account" className="fw-login-link">Join free →</Link>
            </div>
          ) : submitted || alreadyPosted ? (
            <div className="fw-posted-confirm">
              <div className="fw-posted-icon">✦</div>
              <div className="fw-posted-text">
                <div className="fw-posted-title">
                  {submitted ? 'You\'re on the wall.' : 'You\'re already on the wall.'}
                </div>
                <div className="fw-posted-sub">
                  "{localPost.message}"
                </div>
                {submitted && (
                  <div className="fw-posted-pts">+20 points added to your account.</div>
                )}
              </div>
            </div>
          ) : (
            <form className="fw-form" onSubmit={handleSubmit}>
              <div className="fw-form-header">
                <div className="fw-form-title">Leave your mark.</div>
                <div className="fw-form-sub">What do you want Algee to know?</div>
              </div>

              <div className="fw-form-fields">
                <div className="fw-message-wrap">
                  <textarea
                    className="fw-textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Write your message..."
                    rows={3}
                    required
                  />
                  <div className={`fw-chars${charsLeft < 20 ? ' fw-chars-warn' : ''}`}>
                    {charsLeft}
                  </div>
                </div>

                <div className="fw-form-row">
                  <input
                    className="fw-input"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name (optional)"
                    maxLength={40}
                  />
                  <input
                    className="fw-input"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Your city (optional)"
                    maxLength={40}
                  />
                </div>

                {error && <div className="fw-error">{error}</div>}

                <button
                  type="submit"
                  className="fw-submit"
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? 'Posting...' : 'Post to the wall · +20 pts'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats bar */}
        <div className="fw-stats-bar">
          <span className="fw-stats-count">
            {posts.length} {posts.length === 1 ? 'message' : 'messages'} on the wall
          </span>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="fw-empty">
            Be the first to leave a message.
          </div>
        ) : (
          <div className="fw-grid">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isMe={post.user_id === currentUserId}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
