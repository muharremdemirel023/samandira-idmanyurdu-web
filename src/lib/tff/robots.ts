type RobotsRule = { allow: boolean; pattern: RegExp; length: number };

export type RobotsRules = { isAllowed(path: string): boolean };

function toPattern(value: string) {
  const anchored = value.endsWith("$");
  const body = (anchored ? value.slice(0, -1) : value)
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/**
 * RFC 9309'a uygun sade robots.txt yorumlayıcısı: istemciye özel grup varsa o,
 * yoksa "*" grubu uygulanır; en uzun eşleşen kural kazanır, eşitlikte Allow.
 */
export function parseRobots(text: string, userAgentToken: string): RobotsRules {
  const groups: Array<{ agents: string[]; rules: RobotsRule[] }> = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current && value) {
      current.rules.push({ allow: key === "allow", pattern: toPattern(value), length: value.length });
    }
  }

  const token = userAgentToken.toLowerCase();
  const specific = groups.filter((group) => group.agents.some((agent) => agent !== "" && agent !== "*" && token.includes(agent)));
  const applicable = specific.length > 0 ? specific : groups.filter((group) => group.agents.includes("*"));
  const rules = applicable.flatMap((group) => group.rules);

  return {
    isAllowed(path: string) {
      let winner: RobotsRule | null = null;
      for (const rule of rules) {
        if (!rule.pattern.test(path)) continue;
        if (!winner || rule.length > winner.length || (rule.length === winner.length && rule.allow)) {
          winner = rule;
        }
      }
      return winner?.allow ?? true;
    },
  };
}
