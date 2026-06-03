export const CONFIGURATION_ONLY_WARNING_LINES = [
  "ExposeMap reads local Compose configuration only.",
  "It does not test live reachability, firewall, DNS, VPN, tunnels, cloud security groups, or vulnerabilities.",
  "Do not paste real Compose files or secrets into public issues. Use sanitized examples only."
];

export const CLASSIFICATION_WARNING_LINES = [
  "published means host-published in Compose, not internet-reachable.",
  "internal means no host-published ports found, not impossible to reach."
];

export const STATIC_COMPOSE_LIMITATION_WARNING =
  "Some Compose features, such as profiles, extends, include, anchors, merge keys, or variable interpolation, may require expanded Compose config for safer review.";

export const CONFIGURATION_ONLY_WARNING = CONFIGURATION_ONLY_WARNING_LINES.join("\n");

export const REPORT_WARNING_LINES = [
  ...CLASSIFICATION_WARNING_LINES,
  ...CONFIGURATION_ONLY_WARNING_LINES,
  STATIC_COMPOSE_LIMITATION_WARNING
];
