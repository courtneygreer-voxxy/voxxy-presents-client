function Error({ statusCode }) {
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
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        {statusCode || 'Client-side'}
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#374151' }}>
        {statusCode
          ? `A ${statusCode} error occurred on server`
          : 'An error occurred on client'}
      </h2>
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error