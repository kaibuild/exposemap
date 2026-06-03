export const CONFIGURATION_ONLY_WARNING = [
  "ExposeMap reads local Compose configuration only.",
  "It does not test live reachability, firewall, DNS, VPN, tunnels, cloud security groups, or vulnerabilities.",
  "Do not paste real Compose files or secrets into public issues. Use sanitized examples only."
].join("\n");
