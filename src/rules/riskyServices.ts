import type { Finding, PortMapping } from "../types.js";

interface RiskyPort {
  name: string;
  ports: string[];
}

const RISKY_PORTS: RiskyPort[] = [
  { name: "PostgreSQL", ports: ["5432"] },
  { name: "MySQL/MariaDB", ports: ["3306"] },
  { name: "Redis", ports: ["6379"] },
  { name: "MongoDB", ports: ["27017"] },
  { name: "Elasticsearch/OpenSearch", ports: ["9200"] },
  { name: "Admin or web panel", ports: ["8080", "9090", "3000"] }
];

export function findRiskyDirectExposure(serviceName: string, broadPorts: PortMapping[]): Finding[] {
  return broadPorts.flatMap((port) => {
    const matched = RISKY_PORTS.find((risk) => {
      return risk.ports.some((riskPort) => port.target === riskPort || port.published === riskPort);
    });

    if (!matched) {
      return [];
    }

    return [
      {
        ruleId: "risky-direct-port",
        severity: "high",
        service: serviceName,
        title: `${matched.name} has a host-published Compose port`,
        description:
          "This service has a host-published Compose port commonly associated with databases, search backends, caches, or admin panels.",
        evidence: port.evidence,
        recommendation:
          "Review whether this host-published Compose port is intentional. Real reachability still depends on firewall, VPN, proxy, DNS, cloud security group, and host rules."
      }
    ];
  });
}
