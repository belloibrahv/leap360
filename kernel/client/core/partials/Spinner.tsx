const Spinner = ({ size = 1.5 }: { size?: number }) => (
  <span className="inline-flex items-center justify-center">
    <svg
      style={{ width: `${size}rem`, height: `${size}rem` }}
      className={`animate-spin text-[#1d5b73]`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        stroke="currentColor"
        strokeWidth="4"
        cx="12"
        cy="12"
        r="10"
      />
      <path
        fill="currentColor"
        className="opacity-75"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  </span>
);

export default Spinner;
