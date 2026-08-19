// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./V4.sol";
import "./ERC20.sol";

// =============================================================================
// This is the only file you edit, and the only Solidity file you submit.
//
// Do not rename the contracts, the functions, the events or the public constants.
// The marking harness calls them by name. If you rename something, that check
// scores zero even when your logic is right.
//
// You may add helper functions and extra state if you find it useful.
// =============================================================================

/// @notice Task 1. Both of your tokens are deployed from this one contract.
contract ExamToken is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 initialSupply_)
        ERC20(name_, symbol_, 18)
    {
        // TODO 1: mint the whole initial supply to whoever deploys the token.
        // The base contract in ERC20.sol gives you what you need.
    }
}

/// @notice Tasks 2 to 4.
contract ExamPool {
    using PoolIdLibrary for PoolKey;
    using BalanceDeltaLibrary for BalanceDelta;
    using PoolState for IPoolManager;

    // --- Your assigned parameters -------------------------------------------
    // Fill these in from your parameter sheet. Everyone has different values.

    // TODO 2a: your assigned fee tier.
    uint24 public constant FEE = 0;

    // TODO 2b: your assigned tick spacing.
    int24 public constant TICK_SPACING = 0;

    // This pool has no hooks. Leave it alone.
    address public constant HOOKS = address(0);

    // TODO 2c: the starting price, as sqrtPriceX96, for BOTH possible sort orders.
    //
    // The pool sorts your two currencies by address, and you do not get to choose
    // which of your tokens ends up as currency0. So work out both values.
    //
    //   price        = how much currency1 one unit of currency0 buys, in smallest units
    //   sqrtPriceX96 = floor(sqrt(price) * 2**96)
    //
    // Compute these however you like. Show your working in ANSWERS.md.
    uint160 public constant SQRT_PRICE_X96_IF_ALPHA_IS_CURRENCY0 = 0;
    uint160 public constant SQRT_PRICE_X96_IF_BETA_IS_CURRENCY0 = 0;

    // --- Wiring --------------------------------------------------------------

    IPoolManager public immutable poolManager;
    IPoolModifyLiquidityTest public immutable liquidityRouter;
    IPoolSwapTest public immutable swapRouter;
    address public immutable alphaToken;
    address public immutable betaToken;

    uint256 public predictedAmountOut;
    bool public predictionRecorded;

    // --- Events --------------------------------------------------------------
    // Emit these with exactly these fields. Do not change the shapes.

    event PoolOpened(
        PoolId indexed id,
        Currency currency0,
        Currency currency1,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        int24 tick
    );
    event LiquidityAdded(
        PoolId indexed id, int24 tickLower, int24 tickUpper, int256 liquidityDelta, int256 amount0, int256 amount1
    );
    event PredictionRecorded(uint256 expectedAmountOut);
    event SwapExecuted(PoolId indexed id, bool zeroForOne, uint256 amountIn, int256 amount0, int256 amount1);

    constructor(
        IPoolManager _poolManager,
        IPoolModifyLiquidityTest _liquidityRouter,
        IPoolSwapTest _swapRouter,
        address _alphaToken,
        address _betaToken
    ) {
        poolManager = _poolManager;
        liquidityRouter = _liquidityRouter;
        swapRouter = _swapRouter;
        alphaToken = _alphaToken;
        betaToken = _betaToken;

        // TODO 3: the routers move tokens out of this contract with transferFrom,
        // so this contract has to approve them before any of it works.
        // Think about how many approvals that is, and for which tokens.
    }

    // --- Task 2: open the pool ----------------------------------------------

    /// @notice True when the alpha token sorts below the beta token.
    function alphaIsCurrency0() public view returns (bool) {
        // TODO 4: how does the protocol decide which currency is currency0?
        revert("TODO 4: alphaIsCurrency0");
    }

    /// @notice The four fields that identify your pool, plus the hooks address.
    function poolKey() public view returns (PoolKey memory) {
        // TODO 5: build the pool key. The currencies must be in the protocol order.
        revert("TODO 5: poolKey");
    }

    function poolId() public view returns (bytes32) {
        // TODO 6: derive the pool id from the pool key.
        revert("TODO 6: poolId");
    }

    /// @notice The starting price that matches the sort order you actually got.
    function startingSqrtPriceX96() public view returns (uint160) {
        // TODO 7: pick the right one of your two constants.
        revert("TODO 7: startingSqrtPriceX96");
    }

    /// @notice The live price and tick, read out of the pool manager.
    function currentSlot0() public view returns (uint160 sqrtPriceX96, int24 tick) {
        // TODO 8: PoolState.getSlot0 is available to you. See V4.sol.
        revert("TODO 8: currentSlot0");
    }

    function currentTick() public view returns (int24 tick) {
        (, tick) = currentSlot0();
    }

    /// @notice Opens the pool at your assigned starting price.
    function initializePool() external returns (int24 tick) {
        // TODO 9: open the pool, then emit PoolOpened.
        revert("TODO 9: initializePool");
    }

    // --- Task 3: add liquidity ----------------------------------------------

    /// @notice Adds liquidity across a tick range.
    /// @dev Reject a range the protocol or the pool would not accept, and say why
    ///      with a custom error. Three things can be wrong with a range.
    function addLiquidity(int24 tickLower, int24 tickUpper, int256 liquidityDelta)
        external
        returns (int256 amount0, int256 amount1)
    {
        // TODO 10: validate the range before you touch the router.
        //   Is the range the right way round?
        //   Do both ticks sit on this pool's tick grid?
        //   Does the range actually contain the live tick, and does it matter?
        //
        // TODO 11: call the liquidity router, then read the two amounts out of the
        // BalanceDelta it returns, and emit LiquidityAdded.
        revert("TODO 10 and 11: addLiquidity");
    }

    // --- Task 4: predict, then swap -----------------------------------------

    /// @notice Commit to the output you expect, before you find out what it is.
    function recordPrediction(uint256 expectedAmountOut) external {
        // TODO 12: store the prediction and emit PredictionRecorded.
        // It can only be set once.
        revert("TODO 12: recordPrediction");
    }

    /// @notice Swaps an exact amount in.
    /// @dev This must refuse to run until a prediction has been recorded.
    function swapExactIn(bool zeroForOne, uint256 amountIn) external returns (int256 amount0, int256 amount1) {
        // TODO 13: build the swap parameters.
        //   Look carefully at what the sign of amountSpecified means in v4.
        //   sqrtPriceLimitX96 has to be a real bound or the swap will not run.
        //   TickMath in V4.sol gives you the two extremes.
        //
        // TODO 14: call the swap router, read the amounts, and emit SwapExecuted.
        revert("TODO 13 and 14: swapExactIn");
    }
}
