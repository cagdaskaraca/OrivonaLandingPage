type AiConceptSuggestionsProps = {
  ideas: string[];
};

export function AiConceptSuggestions({ ideas }: AiConceptSuggestionsProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ideas.map((idea) => (
        <li
          key={idea}
          className="rounded-full border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 px-4 py-2 text-sm text-violet-50"
        >
          {idea}
        </li>
      ))}
    </ul>
  );
}
