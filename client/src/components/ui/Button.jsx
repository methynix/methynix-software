import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

const variants = {
  primary: "bg-accent text-accentInk hover:bg-accentDeep hover:text-text",
  ghost: "border border-line text-text hover:border-accent hover:text-accent",
};

export const Button = ({ as = "button", to, variant = "primary", size = "md", className = "", children, ...props }) => {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (as === "link") {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (as === "a") {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
