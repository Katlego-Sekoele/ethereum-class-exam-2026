// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./V4.sol";
import "./ExamBase.sol";

// =============================================================================
// TASK 2. Three things to fill in.
// Opens your pool at the starting price on your sheet.
// =============================================================================

contract Task2Pool is ExamBase {
    /// @notice The two starting prices from your parameter sheet.
    uint160 public immutable sqrtPriceIfAlphaIsCurrency0;
    uint160 public immutable sqrtPriceIfBetaIsCurrency0;

    event PoolOpened(
        bytes32 poolId,
        address currency0,
        address currency1,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        int24 tick
    );

    constructor(
        address _poolManager,
        address _tokenA,
        address _tokenB,
        uint24 _fee,
        int24 _tickSpacing,
        uint160 _sqrtPriceIfAlphaIsCurrency0,
        uint160 _sqrtPriceIfBetaIsCurrency0
    ) ExamBase(_poolManager, _tokenA, _tokenB, _fee, _tickSpacing) {
        sqrtPriceIfAlphaIsCurrency0 = _sqrtPriceIfAlphaIsCurrency0;
        sqrtPriceIfBetaIsCurrency0 = _sqrtPriceIfBetaIsCurrency0;
    }

    /// @notice The starting price that matches the way the pool actually sorted your tokens.
    function startingSqrtPriceX96() public view returns (uint160) {
        // TODO 2.1 --------------------------------------------------------
        // Your sheet gave you two starting prices, because the pool sorts your two
        // tokens by address and you do not get to choose which one becomes currency0.
        //
        // alphaIsCurrency0() is already written for you. It returns true when your
        // token A came out as currency0.
        //
        // Return whichever of the two prices above is the right one.
        // Replace the line below.

        return 0; // <-- replace this
    }

    /// @notice Opens the pool. You only ever call this once.
    function openPool() external returns (int24 tick) {
        require(!poolExists(), "this pool is already open, you only open it once");

        PoolKey memory key = poolKey();
        uint160 startingPrice = startingSqrtPriceX96();
        require(startingPrice != 0, "startingSqrtPriceX96 still returns zero, finish TODO 2.1 first");

        // TODO 2.2 --------------------------------------------------------
        // Open the pool.
        //
        //     poolManager.initialize(key, startingPrice)
        //
        // takes the pool key and the starting price, and returns the tick the pool
        // opened at. Put that returned tick into the variable below.
        // Replace the line below.

        tick = 0; // <-- replace this

        // TODO 2.3 --------------------------------------------------------
        // Announce it, so the marker can see what you did. Emit PoolOpened with
        // these seven values, in this order:
        //
        //     poolId(), currency0(), currency1(), FEE, TICK_SPACING, startingPrice, tick
        //
        // Write one emit statement below.

    }
}
