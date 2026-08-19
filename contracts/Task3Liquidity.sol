// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./V4.sol";
import "./ExamBase.sol";

// =============================================================================
// TASK 3. Three things to fill in.
// Puts liquidity into the pool you opened in Task 2.
//
// This contract has to be holding your tokens before addLiquidity will work.
// The exam instructions tell you when to send them across.
// =============================================================================

contract Task3Liquidity is ExamBase {
    using BalanceDeltaLibrary for BalanceDelta;

    IPoolModifyLiquidityTest public immutable liquidityRouter;

    event LiquidityAdded(
        bytes32 poolId, int24 tickLower, int24 tickUpper, int256 liquidityDelta, int256 amount0, int256 amount1
    );

    constructor(
        address _poolManager,
        address _liquidityRouter,
        address _tokenA,
        address _tokenB,
        uint24 _fee,
        int24 _tickSpacing
    ) ExamBase(_poolManager, _tokenA, _tokenB, _fee, _tickSpacing) {
        liquidityRouter = IPoolModifyLiquidityTest(_liquidityRouter);

        // Provided. The router takes the tokens out of this contract when you add
        // liquidity, so it needs permission to move them first.
        IERC20(_tokenA).approve(_liquidityRouter, type(uint256).max);
        IERC20(_tokenB).approve(_liquidityRouter, type(uint256).max);
    }

    /// @notice Adds liquidity between two ticks.
    function addLiquidity(int24 tickLower, int24 tickUpper, int256 liquidityDelta)
        external
        returns (int256 amount0, int256 amount1)
    {
        require(poolExists(), "the pool is not open, run Task 2 first and check your constructor values match");
        require(liquidityDelta > 0, "liquidity must be greater than zero");
        require(tickLower < tickUpper, "tickLower must be below tickUpper");

        int24 liveTick = currentTick();

        // TODO 3.1 --------------------------------------------------------
        // Both ticks have to sit on this pool's tick grid. The grid steps in units
        // of TICK_SPACING, so a tick is on the grid when dividing it by TICK_SPACING
        // leaves no remainder. The remainder operator in Solidity is %.
        //
        // Replace the two conditions marked below.

        require(true /* replace: tickLower is on the grid */, "tickLower is not a multiple of the tick spacing");
        require(true /* replace: tickUpper is on the grid */, "tickUpper is not a multiple of the tick spacing");

        // TODO 3.2 --------------------------------------------------------
        // Liquidity is only active while the price sits inside your range. So the
        // range has to contain the live tick: liveTick must be at or above tickLower,
        // and strictly below tickUpper.
        //
        // Replace the condition marked below.

        require(true /* replace: the range contains liveTick */, "your range does not contain the live tick");

        // TODO 3.3 --------------------------------------------------------
        // Ask the router to add the liquidity. The call looks like this:
        //
        //     liquidityRouter.modifyLiquidity(
        //         poolKey(),
        //         ModifyLiquidityParams({
        //             tickLower: tickLower,
        //             tickUpper: tickUpper,
        //             liquidityDelta: liquidityDelta,
        //             salt: bytes32(0)
        //         }),
        //         ""
        //     )
        //
        // It gives you back a BalanceDelta. Replace the line below with that call.

        BalanceDelta delta = BalanceDelta.wrap(0); // <-- replace this

        // Provided. amount0 and amount1 come back negative, because the tokens left
        // this contract and went into the pool.
        amount0 = delta.amount0();
        amount1 = delta.amount1();
        emit LiquidityAdded(poolId(), tickLower, tickUpper, liquidityDelta, amount0, amount1);
    }
}
