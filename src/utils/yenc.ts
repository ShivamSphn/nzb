export function yEncParse(subject: string): { name?: string; size?: string } {
  const match = subject.match(/^=\?utf-8\?q\?(.*)\?=$/i);
  if (match) {
    subject = decodeURIComponent(
      match[1].replace(/=([0-9A-F]{2})/gi, "%$1").replace(/_/g, " ")
    );
  }

  const nameMatch = subject.match(/\"([^\"]+)\"/);
  const sizeMatch = subject.match(/\((\d+)\/(\d+)\)/);

  return {
    name: nameMatch ? nameMatch[1] : undefined,
    size: sizeMatch ? sizeMatch[2] : undefined,
  };
}
