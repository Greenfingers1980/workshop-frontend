// src/components/ThemeToggle.tsx
export function ThemeToggle() {
  return (
    <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
      <button 
        className="btn-secondary"
        onClick={() => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}