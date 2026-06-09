/** Minimal markdown → HTML for static SEO articles (headings, lists, bold, tables). */
export function markdownToHtml(md: string): string {
  const blocks = md.split(/\n\n+/);
  const html: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("| ")) {
      html.push(tableToHtml(trimmed));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items = trimmed
        .split("\n")
        .filter((l) => l.startsWith("- "))
        .map((l) => `<li>${inline(l.slice(2))}</li>`)
        .join("");
      html.push(`<ul>${items}</ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .filter((l) => /^\d+\.\s/.test(l))
        .map((l) => `<li>${inline(l.replace(/^\d+\.\s/, ""))}</li>`)
        .join("");
      html.push(`<ol>${items}</ol>`);
      continue;
    }

    html.push(`<p>${inline(trimmed.replace(/\n/g, " "))}</p>`);
  }

  return html.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-brand hover:text-accent">$1</a>',
    );
}

function tableToHtml(md: string): string {
  const rows = md.split("\n").filter((r) => r.trim().startsWith("|"));
  if (rows.length < 2) return `<p>${inline(md)}</p>`;

  const parseRow = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((c) => inline(c.trim()));

  const header = parseRow(rows[0]!);
  const bodyRows = rows.slice(2).map(parseRow);

  const thead = `<thead><tr>${header.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;

  return `<table>${thead}${tbody}</table>`;
}
