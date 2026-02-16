// Splits markdown into a nested tree of sections by heading level (#, ##, ###)
export interface MarkdownSectionNode {
  id: string;
  title: string;
  level: number;
  content: string[];
  children: MarkdownSectionNode[];
}

export function parseMarkdownSections(markdown: string): MarkdownSectionNode[] {
  const lines = markdown.split(/\r?\n/);
  const root: MarkdownSectionNode = {
    id: 'root',
    title: '',
    level: 0,
    content: [],
    children: [],
  };
  const stack: MarkdownSectionNode[] = [root];

  for (const line of lines) {
    const match = line.match(/^(#{1,3}) (.+)/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const node: MarkdownSectionNode = {
        id,
        title,
        level,
        content: [line],
        children: [],
      };
      // Find parent node
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      stack[stack.length - 1].content.push(line);
    }
  }
  return root.children;
}

