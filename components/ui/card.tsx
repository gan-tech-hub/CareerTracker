type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-md border border-border bg-white p-5 shadow-panel ${className}`}
    >
      {children}
    </section>
  );
}
