// RPC diagnostics may contain simulator configuration. Keep proof, remove credentials and state dumps.
export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/private.?key|api.?key|password|secret|token|node_config|contract_state$/i.test(key))
    .map(([key, item]) => [key, redact(item)]));
  return value;
}
