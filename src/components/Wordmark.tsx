export function Wordmark() {
  return (
    <a className="wordmark" href="/" aria-label="obsidi.xyz home">
      <svg viewBox="0 0 28 32" fill="none" aria-hidden="true">
        <path
          d="M9 3h15v22H9M4 8h15v21H4z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M8 13h7M8 18h7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span>obsidi.xyz</span>
    </a>
  );
}
