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
  "function poolExists() view returns (bool)",
  "function currentTick() view returns (int24)",
  "function currentSlot0() view returns (uint160,int24)",
];

const TASK2_ABI = BASE_ABI.concat(["function startingSqrtPriceX96() view returns (uint160)"]);
const TASK3_ABI = BASE_ABI.concat(["function addLiquidity(int24,int24,int256) returns (int256,int256)"]);
const TASK4_ABI = BASE_ABI.concat([
  "function predictionRecorded() view returns (bool)",
  "function swapExactIn(bool,uint256) returns (int256,int256)",
]);
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"];

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

/// Expects the call to be rejected. Passing means your validation is working.
async function expectRejected(label, call) {
  try {
    await call();
    bad(label, "the call went through when it should have been rejected");
  } catch (error) {
    ok(label);
  }
}

(async () => {
  if (!TASK2_ADDRESS) {
    console.error("Fill in at least TASK2_ADDRESS at the top of this file first.");
    return;
  }
  if (MY_TICK_SPACING === 0) {
    console.error("Fill in MY_FEE and MY_TICK_SPACING from your parameter sheet first.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(web3Provider);
  const signer = provider.getSigner();

  const task2 = new ethers.Contract(TASK2_ADDRESS, TASK2_ABI, signer);
  let sharedPoolId;

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

  await check("startingSqrtPriceX96 returns one of your two numbers", async () => {
    const value = await task2.startingSqrtPriceX96();
    if (value.isZero()) return "it is still returning zero, so TODO 2.1 is not finished";
  });

  await check("the pool has been opened", async () => {
    sharedPoolId = await task2.poolId();
    if (!(await task2.poolExists())) return "openPool has not run yet, or it did not do anything";
  });

  // --- Task 3 --------------------------------------------------------------

  if (TASK3_ADDRESS) {
    console.log("");
    console.log("Task 3");
    const task3 = new ethers.Contract(TASK3_ADDRESS, TASK3_ABI, signer);

    await check("it points at the same pool as Task 2", async () => {
      const id = await task3.poolId();
      if (id !== sharedPoolId) {
        return "different pool id to Task 2, so a constructor value does not match. Check the fee, the tick spacing and both token addresses.";
      }
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

    if (await task3.poolExists()) {
      const live = Number(await task3.currentTick());
      const base = Math.floor(live / MY_TICK_SPACING) * MY_TICK_SPACING;
      const lower = base - 20 * MY_TICK_SPACING;
      const upper = base + 20 * MY_TICK_SPACING;
      const width = upper - lower;
      const liquidity = "10000000000000000000000";

      await expectRejected("a tick off the grid is rejected", () =>
        task3.callStatic.addLiquidity(lower + 1, upper, liquidity),
      );
      await expectRejected("a range the wrong way round is rejected", () =>
        task3.callStatic.addLiquidity(upper, lower, liquidity),
      );
      await expectRejected("a range entirely above the live tick is rejected", () =>
        task3.callStatic.addLiquidity(upper, upper + width, liquidity),
      );
      await expectRejected("a range entirely below the live tick is rejected", () =>
        task3.callStatic.addLiquidity(lower - width, lower, liquidity),
      );
    }
  }

  // --- Task 4 --------------------------------------------------------------

  if (TASK4_ADDRESS) {
    console.log("");
    console.log("Task 4");
    const task4 = new ethers.Contract(TASK4_ADDRESS, TASK4_ABI, signer);

    await check("it points at the same pool as Task 2", async () => {
      const id = await task4.poolId();
      if (id !== sharedPoolId) {
        return "different pool id to Task 2, so a constructor value does not match. Check the fee, the tick spacing and both token addresses.";
      }
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

    if (await task4.predictionRecorded()) {
      console.log("  skip  swapping before a prediction, you have already recorded one");
    } else {
      await expectRejected("swapping before a prediction is rejected", () =>
        task4.callStatic.swapExactIn(true, "1000000000000000000"),
      );
    }
  }

  console.log("");
  console.log(`${passes} passed, ${failures} failed`);
  if (failures === 0) {
    console.log("Shape and rules look right. Your numbers are still your own responsibility.");
  }
})();
