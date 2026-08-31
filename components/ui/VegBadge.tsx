interface VegBadgeProps {
  veg: boolean;
  className?: string;
}

/** The standard green/red dot-in-box indicator */
export default function VegBadge({ veg, className = "" }: VegBadgeProps) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-md bg-white shadow-sm ${className}`}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`h-2 w-2 rounded-full ${veg ? "bg-green-600" : "bg-red-600"}`}
      />
    </span>
  );
}
