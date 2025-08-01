export default function Custom500() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>500</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#374151' }}>Server Error</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Sorry, something went wrong on our end.</p>
      <a 
        href="/" 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#7c3aed',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem'
        }}
      >
        ← Back to Home
      </a>
    </div>
  )
}