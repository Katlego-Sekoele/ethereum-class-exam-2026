// Run this first, once, at the start of the exam.
//
// It puts Uniswap v4 into your sandbox: the PoolManager plus the two routers your
// contract talks to. Nothing here is yours to write or to change.
//
// How to run it:
//   1. In the Deploy and Run panel, set Environment to "Remix VM (Cancun)" or newer.
//      Uniswap v4 uses transient storage, so an older setting will not work.
//   2. Right click this file in the file explorer and choose "Run".
//   3. Copy the three addresses it prints. You need them to deploy your own contract.
//
// If you reload the page or change the Environment, the sandbox is wiped and you
// have to run this again, then redeploy everything. It takes about two minutes.

const ARTIFACTS = ["PoolManager", "PoolSwapTest", "PoolModifyLiquidityTest"];

// PoolManager is a large contract. The Deploy panel default of 3,000,000 is not
// enough for it, so each deployment asks for a much higher limit. The ladder below
// steps down in case the sandbox refuses the first value.
const GAS_LADDER = [12000000, 10000000, 8000000, 6000000];

async function readArtifact(name) {
  const candidates = [
    `artifacts/${name}.json`,
    `browser/artifacts/${name}.json`,
    `./artifacts/${name}.json`,
    `contracts/artifacts/${name}.json`,
  ];
  for (const candidate of candidates) {
    try {
      const raw = await remix.call("fileManager", "getFile", candidate);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      // try the next path
    }
  }
  throw new Error(
    `Could not find artifacts/${name}.json. Check that the artifacts folder sits at the top ` +
      `level of this workspace, next to contracts and scripts.`,
  );
}

async function deploy(name, signer, args) {
  const artifact = await readArtifact(name);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  let lastError;
  for (const gasLimit of GAS_LADDER) {
    try {
      const contract = await factory.deploy(...args, { gasLimit });
      await contract.deployed();
      console.log(`  ${name} deployed at ${contract.address}  (gas limit ${gasLimit})`);
      return contract;
    } catch (error) {
      lastError = error;
      console.log(`  ${name} did not fit in ${gasLimit} gas, trying a lower limit`);
    }
  }
  throw lastError;
}

(async () => {
  try {
    const provider = new ethers.providers.Web3Provider(web3Provider);
    const signer = provider.getSigner();
    const owner = await signer.getAddress();

    console.log("Setting up the sandbox. This takes a few seconds.");
    console.log(`Your account: ${owner}`);

    const poolManager = await deploy("PoolManager", signer, [owner]);
    const liquidityRouter = await deploy("PoolModifyLiquidityTest", signer, [poolManager.address]);
    const swapRouter = await deploy("PoolSwapTest", signer, [poolManager.address]);

    console.log("");
    console.log("=================================================================");
    console.log("Sandbox ready. Keep these three addresses somewhere safe.");
    console.log("");
    console.log(`  Pool manager     ${poolManager.address}`);
    console.log(`  Liquidity router ${liquidityRouter.address}`);
    console.log(`  Swap router      ${swapRouter.address}`);
    console.log("");
    console.log("You pass these to your ExamPool constructor, in this order:");
    console.log("  poolManager, liquidityRouter, swapRouter, tokenA, tokenB");
    console.log("=================================================================");
  } catch (error) {
    console.error("Setup failed.");
    console.error(error.message || error);
    console.error("");
    console.error("Most common causes:");
    console.error("  Environment is not set to Remix VM (Cancun) or newer.");
    console.error("  The artifacts folder is missing or in the wrong place.");
    console.error("If neither applies, ask the invigilator rather than losing time on it.");
  }
})();
