/**
 * The foundation wordmark, colored to match the official ICF logo:
 * "Inspiring" blue→purple, "Children" orange→yellow→green, "Foundation"
 * purple→pink→orange. These brand hues are fixed (not theme-swapped) so the
 * logo looks the same in light and dark mode. Size is controlled by the parent
 * via `className`.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold uppercase tracking-tight ${className}`}>
      <span className="bg-gradient-to-r from-[#6ea6f2] to-[#b98be4] bg-clip-text text-transparent">
        Inspiring
      </span>{" "}
      <span className="bg-gradient-to-r from-[#ef9038] via-[#f3cf53] to-[#a4cf5a] bg-clip-text text-transparent">
        Children
      </span>{" "}
      <span className="bg-gradient-to-r from-[#9a6fd4] via-[#df8aad] to-[#ef9038] bg-clip-text text-transparent">
        Foundation
      </span>
    </span>
  );
}
