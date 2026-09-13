// Optional. Checks your work so far and points at anything obviously wrong.
//
// It checks the shape of your contracts and the rules they should be enforcing.
// It does not check your numbers and it does not tell you what to put in results.json.
// Passing every line is a good sign, not a promise of full marks.
//
// How to run it:
//   1. Fill in the five values below. Leave an address as "" if you have not got
//      that far yet, and that part is skipped.
//   2. Right click this file and choose "Run".
//
// This script only reads. It will not change anything you have deployed.

// ---------------------------------------------------------------------------
const TASK2_ADDRESS = "";
const TASK3_ADDRESS = "";
const TASK4_ADDRESS = "";
const MY_FEE = 0; //          from your parameter sheet
const MY_TICK_SPACING = 0; // from your parameter sheet
// ---------------------------------------------------------------------------

const BASE_ABI = [
  "function FEE() view returns (uint24)",
  "function TICK_SPACING() view returns (int24)",
  "function tokenA() view returns (address)",
  "function tokenB() view returns (address)",
  "function currency0() view returns (address)",
  "function currency1() view returns (address)",
  "function alphaIsCurrency0() view returns (bool)",
  "function poolId() view returns (bytes32)",
  "function poolManager() view returns (address)",
  "function poolExists() view returns (bool)",
  "function currentTick() view returns (int24)",
  "function currentSlot0() view returns (uint160,int24)",
];

const TASK2_ABI = BASE_ABI.concat([
  "function startingSqrtPriceX96() view returns (uint160)",
  "function sqrtPriceIfAlphaIsCurrency0() view returns (uint160)",
  "function sqrtPriceIfBetaIsCurrency0() view returns (uint160)",
]);
const TASK3_ABI = BASE_ABI.concat(["function addLiquidity(int24,int24,int256) returns (int256,int256)"]);
const TASK4_ABI = BASE_ABI.concat([
  "function predictionRecorded() view returns (bool)",
  "function swapExactIn(bool,uint256) returns (int256,int256)",
]);
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"];

let passes = 0;
let failures = 0;
let skipped = 0;

function skip(label) {
  skipped++;
  console.log(`  skip  ${label}`);
}

function ok(label) {
  passes++;
  console.log(`  pass  ${label}`);
}

function bad(label, why) {
  failures++;
  console.log(`  FAIL  ${label}`);
  if (why) console.log(`        ${why}`);
}

async function check(label, fn) {
  try {
    const problem = await fn();
    if (problem) {
      bad(label, problem);
      return false;
    }
    ok(label);
    return true;
  } catch (error) {
    bad(label, (error && (error.reason || error.message)) || String(error));
    return false;
  }
}

async function runChecks(label, fn) {
  try {
    await fn();
  } catch (error) {
    bad(label, error.reason || error.message || String(error));
  }
}

// ethers/Remix can wrap Error(string) revert data in several nested objects.
// Do not match message substrings: messages may contain the submitted call itself.
function revertReason(error) {
  const seen = new Set();
  function read(value) {
    if (typeof value === "string") {
      if (/^0x08c379a0[0-9a-f]*$/i.test(value)) {
        try {
          return ethers.utils.defaultAbiCoder.decode(["string"], "0x" + value.slice(10))[0];
        } catch (_) { /* malformed revert data */ }
      }
      if (value.startsWith("{")) {
        try { return read(JSON.parse(value)); } catch (_) { /* not JSON */ }
      }
      return;
    }
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    for (const key of ["data", "error", "originalError", "result", "return", "body"]) {
      const reason = read(value[key]);
      if (reason !== undefined) return reason;
    }
    if (value.code === "CALL_EXCEPTION" && typeof value.reason === "string") return value.reason;
  }
  return read(error);
}

async function expectRejected(label, expectedReason, call) {
  try {
    await call();
    bad(label, "the call went through when it should have been rejected");
  } catch (error) {
    const reason = revertReason(error);
    if (reason === expectedReason) ok(label);
    else bad(label, `expected "${expectedReason}"; received ${reason || error.message || String(error)}`);
  }
}

(async () => {
  if (!TASK2_ADDRESS) {
    console.error("Fill in at least TASK2_ADDRESS at the top of this file first.");
    return;
  }
  if (!Number.isInteger(MY_FEE) || MY_FEE <= 0 || MY_FEE > 1000000 ||
      !Number.isInteger(MY_TICK_SPACING) || MY_TICK_SPACING <= 0 || MY_TICK_SPACING > 32767) {
    console.error("Fill in MY_FEE and MY_TICK_SPACING from your parameter sheet first.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(web3Provider);
  const signer = provider.getSigner();

  const task2 = new ethers.Contract(TASK2_ADDRESS, TASK2_ABI, signer);
  let sharedPoolId, sharedManager;

  console.log("");
  console.log("Task 2");

  await check("fee and tick spacing match your sheet", async () => {
    const fee = Number(await task2.FEE());
    const spacing = Number(await task2.TICK_SPACING());
    if (fee !== MY_FEE) return `the contract was deployed with fee ${fee}, your sheet says ${MY_FEE}`;
    if (spacing !== MY_TICK_SPACING) {
      return `the contract was deployed with spacing ${spacing}, your sheet says ${MY_TICK_SPACING}`;
    }
  });

  await check("the two currencies are in protocol order", async () => {
    const c0 = (await task2.currency0()).toLowerCase();
    const c1 = (await task2.currency1()).toLowerCase();
    if (c0 >= c1) return "currency0 must sort below currency1";
  });

  await check("startingSqrtPriceX96 selects the price for your token order", async () => {
    const value = await task2.startingSqrtPriceX96();
    if (value.isZero()) return "it is still returning zero, so TODO 2.1 is not finished";
    const expected = await task2.alphaIsCurrency0()
      ? await task2.sqrtPriceIfAlphaIsCurrency0()
      : await task2.sqrtPriceIfBetaIsCurrency0();
    if (!value.eq(expected)) return "TODO 2.1 selected the wrong starting price for your token order";
    // The live price is allowed to differ after Task 4. Do not compare it here.
  });

  await check("the pool has been opened", async () => {
    sharedPoolId = await task2.poolId();
    sharedManager = (await task2.poolManager()).toLowerCase();
    if (!(await task2.poolExists())) return "openPool has not run yet, or it did not do anything";
  });

  // --- Task 3 --------------------------------------------------------------

  if (TASK3_ADDRESS) {
    console.log("");
    console.log("Task 3");
    const task3 = new ethers.Contract(TASK3_ADDRESS, TASK3_ABI, signer);

    const samePool = await check("it points at the same pool and manager as Task 2", async () => {
      const id = await task3.poolId();
      if (id !== sharedPoolId || (await task3.poolManager()).toLowerCase() !== sharedManager) {
        return "constructor values differ from Task 2. Check the pool manager, fee, tick spacing and both token addresses.";
      }
      if (!(await task3.poolExists())) return "this pool is not open";
    });

    await check("it is holding both of your tokens", async () => {
      const a = new ethers.Contract(await task3.tokenA(), ERC20_ABI, signer);
      const b = new ethers.Contract(await task3.tokenB(), ERC20_ABI, signer);
      const balanceA = await a.balanceOf(TASK3_ADDRESS);
      const balanceB = await b.balanceOf(TASK3_ADDRESS);
      if (balanceA.isZero() || balanceB.isZero()) {
        return "one of the balances is zero, so transfer your tokens to this contract first";
      }
    });

    if (samePool) await runChecks("Task 3 probes could not finish", async () => {
      const live = Number(await task3.currentTick());
      const base = Math.floor(live / MY_TICK_SPACING) * MY_TICK_SPACING;
      const lower = base - 20 * MY_TICK_SPACING;
      const upper = base + 20 * MY_TICK_SPACING;
      const width = upper - lower;
      const liquidity = "10000000000000000000000";
      console.log(`  info  liquidity probes use live tick ${live}, range [${lower}, ${upper}); this may differ from your original range after a swap`);

      // Always build a new probe range around the LIVE tick, including after swaps.
      // Near protocol limits there may be no room for all range probes.
      if (lower - width < -887272 || upper + width > 887272) {
        skip("liquidity probes: live price is too close to a protocol tick limit");
        return;
      }
      if (MY_TICK_SPACING > 1) {
        await expectRejected("a lower tick off the grid is rejected", "tickLower is not a multiple of the tick spacing", () =>
          task3.callStatic.addLiquidity(lower + 1, upper, liquidity),
        );
        await expectRejected("an upper tick off the grid is rejected", "tickUpper is not a multiple of the tick spacing", () =>
          task3.callStatic.addLiquidity(lower, upper + 1, liquidity),
        );
      } else skip("off-grid checks: every integer tick is on a spacing-1 grid");
      await expectRejected("a range the wrong way round is rejected", "tickLower must be below tickUpper", () =>
        task3.callStatic.addLiquidity(upper, lower, liquidity),
      );
      await expectRejected("a range entirely above the live tick is rejected", "your range does not contain the live tick", () =>
        task3.callStatic.addLiquidity(upper, upper + width, liquidity),
      );
      await expectRejected("a range entirely below the live tick is rejected", "your range does not contain the live tick", () =>
        task3.callStatic.addLiquidity(lower - width, lower, liquidity),
      );
      await check("a valid liquidity addition returns a nonzero delta", async () => {
        const [amount0, amount1] = await task3.callStatic.addLiquidity(lower, upper, liquidity);
        // Reusing an existing position after Task 4 can collect fees. Its net
        // deltas need not both be negative; rejecting positive deltas is wrong.
        if (amount0.isZero() && amount1.isZero()) return "no tokens moved; check the router call in TODO 3.3";
      });
    });
    else skip("Task 3 probes: first fix the pool/manager check");
  }

  // --- Task 4 --------------------------------------------------------------

  if (TASK4_ADDRESS) {
    console.log("");
    console.log("Task 4");
    const task4 = new ethers.Contract(TASK4_ADDRESS, TASK4_ABI, signer);

    const samePool = await check("it points at the same pool and manager as Task 2", async () => {
      const id = await task4.poolId();
      if (id !== sharedPoolId || (await task4.poolManager()).toLowerCase() !== sharedManager) {
        return "constructor values differ from Task 2. Check the pool manager, fee, tick spacing and both token addresses.";
      }
      if (!(await task4.poolExists())) return "this pool is not open";
    });

    await check("it is holding both of your tokens", async () => {
      const a = new ethers.Contract(await task4.tokenA(), ERC20_ABI, signer);
      const b = new ethers.Contract(await task4.tokenB(), ERC20_ABI, signer);
      const balanceA = await a.balanceOf(TASK4_ADDRESS);
      const balanceB = await b.balanceOf(TASK4_ADDRESS);
      if (balanceA.isZero() || balanceB.isZero()) {
        return "one of the balances is zero, so transfer your tokens to this contract first";
      }
    });

    if (samePool) await runChecks("Task 4 prediction state could not be read", async () => {
      if (await task4.predictionRecorded()) {
        skip("prediction guard: a prediction already exists; run on a fresh Task4Swap before recording to test this guard");
      } else {
        await expectRejected("swapping before a prediction is rejected", "record your prediction before you swap", () =>
          task4.callStatic.swapExactIn(true, "1000000000000000000"),
        );
      }
    });
    else skip("Task 4 prediction probe: first fix the pool/manager check");
  }

  console.log("");
  if (!TASK3_ADDRESS) skip("Task 3: no address supplied");
  if (!TASK4_ADDRESS) skip("Task 4: no address supplied");
  console.log(`${passes} passed, ${failures} failed, ${skipped} skipped`);
  if (failures === 0) {
    console.log("Completed checks passed. Skipped checks are unverified; this is not a mark predictor.");
  }
})().catch(error => console.error("Self-check could not finish:", error.message || error));
