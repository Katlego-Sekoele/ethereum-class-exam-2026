// Run from the repository root in PowerShell: Get-Content tests/selfcheck.test.cjs -Raw | node
// Exercises the actual Remix script with mocked RPC responses; no deployments.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('scripts/02_selfcheck.js', 'utf8');
const bn = value => ({
  value: BigInt(value),
  isZero() { return this.value === 0n; },
  eq(other) { return this.value === other.value; },
});
const revert = reason => Object.assign(new Error(reason), { code: 'CALL_EXCEPTION', reason });
const predictionReason = 'record your prediction before you swap';
const rangeReason = 'your range does not contain the live tick';

async function run(options = {}) {
  const logs = [], probes = [];
  const spacing = options.spacing || 10;
  const live = options.live ?? 11632;
  const alphaFirst = options.alphaFirst ?? true;
  const base = {
    FEE: async () => 500,
    TICK_SPACING: async () => spacing,
    currency0: async () => '0x01',
    currency1: async () => '0x02',
    tokenA: async () => 'a',
    tokenB: async () => 'b',
    alphaIsCurrency0: async () => alphaFirst,
    poolId: async () => 'same-key',
    poolManager: async () => '0xmanager',
    poolExists: async () => true,
    currentTick: async () => live,
    startingSqrtPriceX96: async () => bn(options.wrongPrice ? 7 : alphaFirst ? 100 : 25),
    sqrtPriceIfAlphaIsCurrency0: async () => bn(100),
    sqrtPriceIfBetaIsCurrency0: async () => bn(25),
  };
  const task3 = {
    ...base,
    callStatic: {
      addLiquidity: async (lower, upper) => {
        probes.push([lower, upper]);
        if (options.rpcError) throw new Error('RPC disconnected');
        if (lower >= upper) throw revert('tickLower must be below tickUpper');
        if (lower % spacing && !options.missingLowerGuard) throw revert('tickLower is not a multiple of the tick spacing');
        if (upper % spacing && !options.missingUpperGuard) throw revert('tickUpper is not a multiple of the tick spacing');
        if (!(lower <= live && live < upper) && !options.missingRangeGuard) throw revert(rangeReason);
        // Model the protocol independently rejecting ticks when TODO 3.1 is absent.
        if (lower % spacing || upper % spacing) throw revert('TickMisaligned');
        return (options.noOp ? [0, 0] : options.fees ? [30, -10] : [-100, -100]).map(bn);
      },
    },
  };
  const task4 = {
    ...base,
    predictionRecorded: async () => options.predicted || false,
    callStatic: {
      swapExactIn: async () => {
        if (options.swapSucceeds) return [bn(-1), bn(1)];
        if (options.swapError) throw options.swapError;
        throw revert(predictionReason);
      },
    },
  };
  if (options.wrongManager) task3.poolManager = async () => '0xother';
  if (options.missingPool) task3.poolExists = async () => false;
  if (options.tickReadFails) task3.currentTick = async () => { throw new Error('tick RPC failed'); };
  if (options.predictionReadFails) task4.predictionRecorded = async () => { throw new Error('prediction RPC failed'); };
  const contracts = { t2: base, t3: task3, t4: task4, a: { balanceOf: async () => bn(500000) }, b: { balanceOf: async () => bn(500000) } };
  const ethers = {
    providers: { Web3Provider: function () { this.getSigner = () => ({}); } },
    Contract: function (address) { return contracts[address]; },
    utils: { defaultAbiCoder: { decode: (_, data) => {
      // Minimal Error(string) decoder for testing nested RPC error extraction.
      const length = Number(BigInt('0x' + data.slice(66, 130)));
      return [Buffer.from(data.slice(130, 130 + length * 2), 'hex').toString('utf8')];
    } } },
  };
  const script = source
    .replace('const TASK2_ADDRESS = ""', 'const TASK2_ADDRESS = "t2"')
    .replace('const TASK3_ADDRESS = ""', `const TASK3_ADDRESS = "${options.omitTask3 ? '' : 't3'}"`)
    .replace('const TASK4_ADDRESS = ""', 'const TASK4_ADDRESS = "t4"')
    .replace('const MY_FEE = 0', 'const MY_FEE = 500')
    .replace('const MY_TICK_SPACING = 0', `const MY_TICK_SPACING = ${spacing}`);
  await vm.runInNewContext(script, { ethers, web3Provider: {}, console: {
    log: (...args) => logs.push(args.join(' ')), error: (...args) => logs.push(args.join(' ')),
  } });
  const output = logs.join('\n');
  assert.match(output, /\d+ passed, \d+ failed, \d+ skipped/, output);
  return { output, probes };
}

(async () => {
  let cases = 0;
  for (const spacing of [10, 60, 200]) {
    // Before/after trades in either direction; both currency orderings and grid crossings.
    for (const live of [11632, 11629, 11641, -11633, -11641, -11629]) {
      const { output, probes } = await run({ spacing, live, predicted: true, alphaFirst: live > 0 });
      assert.match(output, /0 failed, 1 skipped/);
      const [lower, upper] = probes.at(-1);
      assert.ok(lower <= live && live < upper);
      assert.ok(lower % spacing === 0);
      assert.ok(upper % spacing === 0);
      cases++;
    }
  }
  const expectedFailures = [
    [{ noOp: true }, /no tokens moved/],
    [{ rpcError: true }, /RPC disconnected/],
    [{ missingLowerGuard: true }, /TickMisaligned/],
    [{ missingUpperGuard: true }, /TickMisaligned/],
    [{ missingRangeGuard: true }, /the call went through/],
    [{ wrongPrice: true }, /wrong starting price/],
    [{ wrongManager: true }, /constructor values differ/],
    [{ missingPool: true }, /this pool is not open/],
    [{ tickReadFails: true }, /tick RPC failed/],
    [{ predictionReadFails: true }, /prediction RPC failed/],
    [{ swapError: revert('SwapAmountCannotBeZero') }, /SwapAmountCannotBeZero/],
    [{ swapError: new Error('RPC disconnected') }, /RPC disconnected/],
    [{ swapError: new Error(predictionReason) }, /expected/],
    [{ swapSucceeds: true }, /the call went through/],
  ];
  for (const [options, message] of expectedFailures) {
    const { output } = await run(options);
    assert.match(output, /[1-9]\d* failed/);
    assert.match(output, message);
    cases++;
  }
  const hex = Buffer.from(predictionReason).toString('hex');
  const revertData = '0x08c379a0' + '20'.padStart(64, '0') +
    (hex.length / 2).toString(16).padStart(64, '0') + hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  for (const options of [
    {}, { fees: true, predicted: true }, { spacing: 1 }, { live: 887271, predicted: true },
    { omitTask3: true },
    { swapError: { error: { data: { return: revertData } } } },
    { swapError: { body: JSON.stringify({ error: { data: revertData } }) } },
  ]) {
    const { output } = await run(options);
    assert.match(output, /0 failed/);
    cases++;
  }
  new vm.Script(fs.readFileSync('scripts/01_setup.js', 'utf8'));
  console.log(`${cases} self-check regression cases passed; both scripts parse.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
