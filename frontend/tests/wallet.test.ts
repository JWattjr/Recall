import { test } from "node:test";
import assert from "node:assert/strict";
import {
  connectWallet,
  ensureNetwork,
  submitWrite,
  type Provider,
} from "../src/lib/network";
import { contractReadReason } from "../src/lib/rpc-error";
const owner = "0xdb433ff614bdd1ece21aa97221c3e0a7ecf79c92";
function install(provider?: Provider) {
  Object.assign(globalThis, { window: { ethereum: provider } });
}
test("Missing wallet explains the required installation", async () => {
  install();
  await assert.rejects(connectWallet(), /EIP-1193/);
});
test("Unknown network is added and switched before connecting", async () => {
  let chain = "0x1",
    switches = 0;
  const calls: string[] = [];
  install({
    async request({ method }) {
      calls.push(method);
      if (method === "eth_requestAccounts") return [owner];
      if (method === "eth_chainId") return chain;
      if (method === "wallet_switchEthereumChain") {
        if (++switches === 1) throw { code: 4902 };
        chain = "0xf22f";
      }
      return null;
    },
  });
  assert.equal(await connectWallet(), owner);
  assert.ok(calls.includes("wallet_addEthereumChain"));
  assert.equal(switches, 2);
});
test("Rejected switch cannot proceed to signing", async () => {
  install({
    async request({ method }) {
      if (method === "eth_chainId") return "0x1";
      throw new Error("User rejected switch");
    },
  });
  await assert.rejects(ensureNetwork(), /rejected/);
});
test("A wallet that reports success without switching is rejected", async () => {
  install({
    async request({ method }) {
      return method === "eth_chainId" ? "0x1" : null;
    },
  });
  await assert.rejects(ensureNetwork(), /61999/);
});
test("Account changes invalidate the selected signer before any write", async () => {
  install({
    async request({ method }) {
      if (method === "eth_chainId") return "0xf22f";
      if (method === "eth_accounts")
        return ["0x0000000000000000000000000000000000000001"];
      throw new Error("Unexpected signing request");
    },
  });
  await assert.rejects(
    submitWrite(owner, "register_source", [
      "id",
      "https://example.com",
      "Example",
    ]),
    /account changed/,
  );
});
test("Nested RPC NOT_FOUND is recognized without leaking receipt diagnostics", () => {
  assert.equal(
    contractReadReason({
      cause: {
        data: {
          receipt: {
            result: Buffer.from(
              "\x01[NOT_FOUND] notice is not registered",
            ).toString("base64"),
            node_config: { private_key: "not-public" },
          },
        },
      },
    }),
    "[NOT_FOUND] notice is not registered",
  );
});
