const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "MX";

export const ProjectThumb = ({ imageUrl, name, className = "" }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`w-full h-full flex items-center justify-center bg-raised ${className}`}>
      <span className="font-display text-4xl font-semibold text-faint">{initialsOf(name)}</span>
    </div>
  );
};
