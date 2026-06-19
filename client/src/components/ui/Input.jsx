export const Input = ({ label, error, type = "text", hint, ...props }) => (
  <label className="flex flex-col gap-2 w-full">
    <span className="text-xs font-medium text-dim">{label}</span>
    {type === "textarea" ? (
      <textarea
        {...props}
        className={`bg-ink border p-3.5 rounded-lg text-text placeholder:text-faint outline-none h-36 resize-y transition-colors duration-200 focus:border-accent ${
          error ? "border-red-500/70" : "border-line"
        }`}
      />
    ) : (
      <input
        {...props}
        type={type}
        className={`bg-ink border p-3.5 rounded-lg text-text placeholder:text-faint outline-none transition-colors duration-200 focus:border-accent ${
          error ? "border-red-500/70" : "border-line"
        }`}
      />
    )}
    {error ? (
      <span className="text-xs text-red-300">{error}</span>
    ) : hint ? (
      <span className="text-xs text-faint">{hint}</span>
    ) : null}
  </label>
);
