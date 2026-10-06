function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function span(className: string, text: string) {
  return `<span class="${className}">${escapeHtml(text)}</span>`;
}

function isTagStart(source: string, index: number) {
  if (source[index] !== "<") return false;
  const next = source[index + 1];
  if (next === "/") return /[A-Za-z]/.test(source[index + 2] ?? "");
  return /[A-Za-z]/.test(next ?? "");
}

export function highlightJsx(source: string) {
  let index = 0;
  let html = "";

  const readString = (quote: string) => {
    let end = index + 1;
    while (end < source.length) {
      if (source[end] === "\\") {
        end += 2;
        continue;
      }
      if (source[end] === quote) {
        end += 1;
        break;
      }
      end += 1;
    }
    const text = source.slice(index, end);
    index = end;
    return span("hljs-string", text);
  };

  const readTag = () => {
    let chunk = "";
    const closing = source[index + 1] === "/";
    chunk += span("hljs-punctuation", closing ? "</" : "<");
    index += closing ? 2 : 1;
    const nameStart = index;
    while (index < source.length && /[A-Za-z0-9_$.]/.test(source[index])) index += 1;
    chunk += span("hljs-name", source.slice(nameStart, index));
    if (closing) {
      while (index < source.length && source[index] !== ">") {
        chunk += span("hljs-punctuation", source[index]);
        index += 1;
      }
      if (source[index] === ">") {
        chunk += span("hljs-punctuation", ">");
        index += 1;
      }
      return chunk;
    }
    while (index < source.length) {
      const char = source[index];
      if (char === "/" && source[index + 1] === ">") {
        chunk += span("hljs-punctuation", "/>");
        index += 2;
        break;
      }
      if (char === ">") {
        chunk += span("hljs-punctuation", ">");
        index += 1;
        break;
      }
      if (char === " " || char === "\n" || char === "\t" || char === "\r") {
        chunk += char;
        index += 1;
        continue;
      }
      if (char === '"' || char === "'") {
        chunk += readString(char);
        continue;
      }
      if (char === "=" || char === "{" || char === "}" || char === "?" || char === "|" || char === "(" || char === ")" || char === ",") {
        chunk += span("hljs-punctuation", char);
        index += 1;
        continue;
      }
      if (/[0-9]/.test(char)) {
        const start = index;
        while (index < source.length && /[0-9.]/.test(source[index])) index += 1;
        chunk += span("hljs-number", source.slice(start, index));
        continue;
      }
      if (/[A-Za-z_$]/.test(char)) {
        const start = index;
        while (index < source.length && /[A-Za-z0-9_$.]/.test(source[index])) index += 1;
        const word = source.slice(start, index);
        let look = index;
        while (look < source.length && (source[look] === " " || source[look] === "\n" || source[look] === "\t")) look += 1;
        chunk += span(source[look] === "=" ? "hljs-attr" : "hljs-boolean", word);
        continue;
      }
      chunk += span("hljs-punctuation", char);
      index += 1;
    }
    return chunk;
  };

  while (index < source.length) {
    if (isTagStart(source, index)) {
      html += readTag();
      continue;
    }
    if (source[index] === '"' || source[index] === "'" || source[index] === "`") {
      html += readString(source[index]);
      continue;
    }
    let end = index + 1;
    while (
      end < source.length &&
      !isTagStart(source, end) &&
      source[end] !== '"' &&
      source[end] !== "'" &&
      source[end] !== "`"
    ) {
      end += 1;
    }
    html += escapeHtml(source.slice(index, end));
    index = end;
  }

  return html;
}
