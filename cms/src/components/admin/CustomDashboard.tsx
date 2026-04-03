import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const CustomDashboard = async () => {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch statistics
  const { totalDocs: totalArticles } = await payload.find({
    collection: 'articles',
    limit: 0,
  })

  const { totalDocs: publishedArticles } = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    limit: 0,
  })

  const { totalDocs: totalAuthors } = await payload.find({
    collection: 'authors',
    limit: 0,
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', margin: '0.5rem 0 0' }}>Selamat datang di TallasseeTV CMS Admin Panel</p>
      </header>

      <div className="dashboard-metrics">
        <div className="metric-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <h3>Total Artikel</h3>
          <p className="metric-value">{totalArticles}</p>
        </div>
        
        <div className="metric-card" style={{ borderTop: '4px solid #10b981' }}>
          <h3>Artikel Aktif (Published)</h3>
          <p className="metric-value" style={{ color: '#10b981' }}>{publishedArticles}</p>
        </div>
        
        <div className="metric-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <h3>Draft Artikel</h3>
          <p className="metric-value" style={{ color: '#f59e0b' }}>{totalArticles - publishedArticles}</p>
        </div>
        
        <div className="metric-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <h3>Data Penulis</h3>
          <p className="metric-value">{totalAuthors}</p>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'var(--theme-elevation-150)',
        borderRadius: '1rem',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <h2>Akses Cepat</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a href="/admin/collections/articles/create" style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600
          }}>+ Tulis Artikel Baru</a>
          
          <a href="/admin/collections/media/create" style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--theme-bg)',
            color: 'var(--theme-text)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600
          }}>Upload Media</a>
        </div>
      </div>
    </div>
  )
}
