import type { EPGProgram } from "../types";

function parseXmltvDate(value: string): number {
  // Format: YYYYMMDDHHMMSS +ZZZZ  (offset optional)
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/);
  if (!m) return Date.parse(value) || Date.now();
  const [, y, mo, d, h, mi, s, offset] = m;
  let iso = `${y}-${mo}-${d}T${h}:${mi}:${s}`;
  if (offset) {
    iso += `${offset.substring(0, 3)}:${offset.substring(3)}`;
  } else {
    iso += "Z";
  }
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Date.now() : t;
}

/**
 * Parses an XMLTV document into a map of channelId -> programs[]
 */
export function parseXMLTV(xml: string): Map<string, EPGProgram[]> {
  const result = new Map<string, EPGProgram[]>();
  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) {
      return result;
    }
  } catch {
    return result;
  }

  const programmeNodes = Array.from(doc.getElementsByTagName("programme"));
  let counter = 0;
  for (const node of programmeNodes) {
    counter += 1;
    const channelId = node.getAttribute("channel") || "";
    if (!channelId) continue;
    const startRaw = node.getAttribute("start") || "";
    const stopRaw = node.getAttribute("stop") || "";
    const titleNode = node.getElementsByTagName("title")[0];
    const descNode = node.getElementsByTagName("desc")[0];
    const categoryNode = node.getElementsByTagName("category")[0];

    const program: EPGProgram = {
      id: `${channelId}-${counter}-${startRaw}`,
      channelId,
      title: titleNode?.textContent?.trim() || "Untitled Program",
      description: descNode?.textContent?.trim(),
      start: parseXmltvDate(startRaw),
      end: parseXmltvDate(stopRaw || startRaw),
      category: categoryNode?.textContent?.trim(),
    };
    const arr = result.get(channelId) || [];
    arr.push(program);
    result.set(channelId, arr);
  }

  for (const [key, arr] of result) {
    arr.sort((a, b) => a.start - b.start);
    result.set(key, arr);
  }

  return result;
}
