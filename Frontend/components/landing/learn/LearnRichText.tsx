import Link from "next/link";

const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Renders `[label](/path)` as links and `**text**` as bold; everything else is plain text. */
export function LearnRichText({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <>
      {text.split(TOKEN).map((part, index) => {
        const link = part.match(LINK);
        if (link) {
          return (
            <Link
              key={index}
              href={link[2]}
              className={`font-medium underline decoration-1 underline-offset-2 transition-colors ${
                dark
                  ? "text-[#8eb0ff] decoration-[#8eb0ff]/40 hover:text-white"
                  : "text-[#0050cb] decoration-[#0050cb]/30 hover:decoration-[#0050cb]"
              }`}
            >
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className={`font-semibold ${dark ? "text-white" : "text-[#141b2b]"}`}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}
