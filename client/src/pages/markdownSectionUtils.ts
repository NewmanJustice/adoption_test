// Splits markdown into sections by top-level heading (e.g., #, ##)
export function splitMarkdownSections(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const sections: { id: string; title: string; content: string }[] = [];
  let current: { id: string; title: string; content: string[] } | null = null;

  for (const line of lines) {
    const match = line.match(/^# (.+)/); // Only top-level headings
    if (match) {
      if (current) {
        sections.push({
          id: current.id,
          title: current.title,
          content: current.content.join('\n').trim(),
        });
      }
      const title = match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      current = { id, title, content: [line] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) {
    sections.push({
      id: current.id,
      title: current.title,
      content: current.content.join('\n').trim(),
    });
  }
  return sections;
}
