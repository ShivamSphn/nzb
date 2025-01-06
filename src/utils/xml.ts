export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function unescapeXml(escaped: string): string {
  return escaped.replace(/&lt;|&gt;|&amp;|&apos;|&quot;/g, function (c) {
    switch (c) {
      case '&lt;':
        return '<';
      case '&gt;':
        return '>';
      case '&amp;':
        return '&';
      case '&apos;':
        return "'";
      case '&quot;':
        return '"';
      default:
        return c;
    }
  });
}
