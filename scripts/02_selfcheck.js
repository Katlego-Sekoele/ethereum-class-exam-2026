// Optional. Run this whenever you want a second opinion on your work.
//
// It checks the shape of your contract and the rules it should be enforcing.
// It does not check your numbers, and it does not tell you what to write in
// results.json. Passing every line here is a good sign, not a guarantee of full marks.
//
// How to run it:
//   1. Fill in the four values just below.
//   2. Right click this file and choose "Run".
//
// This script only reads. It will not change anything you have deployed.

// ---------------------------------------------------------------------------
const EXAM_POOL_ADDRESS = "PASTE YOUR DEPLOYED ExamPool ADDRESS HERE";
const MY_FEE = 0; //  from your parameter sheet
const MY_TICK_SPACING = 0; //  from your parameter sheet
// ---------------------------------------------------------------------------

const ABI = [
  "function FEE() view returns (uint24)",
  "function TICK_SPACING() view returns (int24)",
  "function HOOKS() view returns (address)",
  "function alphaIsCurrency0() view returns (bool)",
  "function poolKey() view returns (tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks))",
  "function poolId() view returns (bytes32)",
  "function startingSqrtPriceX96() view returns (uint160)",
  "function currentSlot0() view returns (uint160,int24)",
  "function predictionRecorded() view returns (bool)",
  "function addLiquidity(int24,int24,int256) returns (int256,int256)",
  "function swapExactIn(bool,uint256) returns (int256,int256)",
];

let passes = 0;
let failures = 0;

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
    if (problem) bad(label, problem);
    else ok(label);
  } catch (error) {
    bad(label, (error && (error.reason || error.message)) || String(error));
  }
}

/// Expects the call to be rejected. Passing here means your validation works.
async function expectRejected(label, call) {
  try {
    await call();
    bad(label, "the call went through when it should have been rejected");
  } catch (error) {
    ok(label);
  }
}

(async () => {
  if (!EXAM_POOL_ADDRESS.startsWith("0x")) {
    console.error("Fill in EXAM_POOL_ADDRESS at the top of this file first.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(web3Provider);
  const pool = new ethers.Contract(EXAM_POOL_ADDRESS, ABI, provider.getSigner());

  console.log("Checking your contract.");
  console.log("");

  await check("FEE matches your sheet", async () => {
    const value = await pool.FEE();
    if (Number(value) !== MY_FEE) return `contract says ${value}, your sheet says ${MY_FEE}`;
  });

  await check("TICK_SPACING matches your sheet", async () => {
    const value = await pool.TICK_SPACING();
    if (Number(value) !== MY_TICK_SPACING) return `contract says ${value}, your sheet says ${MY_TICK_SPACING}`;
  });

  await check("HOOKS is the zero address", async () => {
    const value = await pool.HOOKS();
    if (value !== ethers.constants.AddressZero) return `got ${value}`;
  });

  await check("poolKey currencies are in protocol order", async () => {
    const key = await pool.poolKey();
    if (key.currency0.toLowerCase() >= key.currency1.toLowerCase()) {
      return "currency0 must sort below currency1";
    }
    if (Number(key.fee) !== MY_FEE || Number(key.tickSpacing) !== MY_TICK_SPACING) {
      return "the key does not carry your assigned fee and tick spacing";
    }
  });

  await check("alphaIsCurrency0 agrees with the pool key", async () => {
    const key = await pool.poolKey();
    const flag = await pool.alphaIsCurrency0();
    const alphaFirst = key.currency0.toLowerCase() < key.currency1.toLowerCase();
    void alphaFirst;
    if (typeof flag !== "boolean") return "expected a boolean";
  });

  await check("poolId is not empty", async () => {
    const id = await pool.poolId();
    if (!id || /^0x0+$/.test(id)) return "poolId came back empty";
  });

  let live;
  await check("the pool has been opened", async () => {
    const slot0 = await pool.currentSlot0();
    if (slot0[0].isZero()) return "currentSlot0 reports no price, so initializePool has not run yet";
    live = { tick: Number(slot0[1]) };
  });

  if (live) {
    const spacing = MY_TICK_SPACING;
    const base = Math.floor(live.tick / spacing) * spacing;
    const lower = base - 20 * spacing;
    const upper = base + 20 * spacing;
    const width = upper - lower;
    const liquidity = "10000000000000000000000";

    await expectRejected("a range off the tick grid is rejected", () =>
      pool.callStatic.addLiquidity(lower + 1, upper, liquidity),
    );

    await expectRejected("a range the wrong way round is rejected", () =>
      pool.callStatic.addLiquidity(upper, lower, liquidity),
    );

    await expectRejected("a range entirely above the live tick is rejected", () =>
      pool.callStatic.addLiquidity(upper, upper + width, liquidity),
    );

    await expectRejected("a range entirely below the live tick is rejected", () =>
      pool.callStatic.addLiquidity(lower - width, lower, liquidity),
    );

    const recorded = await pool.predictionRecorded();
    if (!recorded) {
      await expectRejected("swapping before a prediction is rejected", () =>
        pool.callStatic.swapExactIn(true, "1000000000000000000"),
      );
    } else {
      console.log("  skip  swapping before a prediction, you have already recorded one");
    }
  }

  console.log("");
  console.log(`${passes} passed, ${failures} failed`);
  if (failures === 0) {
    console.log("Shape and rules look right. Your numbers are still your own responsibility.");
  }
})();
