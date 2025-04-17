'use client'

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: '#111',
        color: '#fff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
    </div>
  )
}
