// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Trimmed Uniswap v4 type, interface and library declarations for the practical exam.
// Derived from the MIT-licensed sources in @uniswap/v4-core v1.0.2. See NOTICE.md.
// Everything here matches the real protocol, so what you learn transfers directly.

type Currency is address;
type PoolId is bytes32;
type BalanceDelta is int256;

/// @notice A pool with no hooks uses address(0) here.
interface IHooks {}

/// @notice The four fields that uniquely identify a v4 pool, plus the hooks address.
struct PoolKey {
    Currency currency0;
    Currency currency1;
    uint24 fee;
    int24 tickSpacing;
    IHooks hooks;
}

struct ModifyLiquidityParams {
    int24 tickLower;
    int24 tickUpper;
    int256 liquidityDelta;
    bytes32 salt;
}

struct SwapParams {
    bool zeroForOne;
    /// @dev Negative means exact input. Positive means exact output.
    int256 amountSpecified;
    uint160 sqrtPriceLimitX96;
}

library PoolIdLibrary {
    /// @notice Equal to keccak256(abi.encode(poolKey)).
    function toId(PoolKey memory poolKey) internal pure returns (PoolId poolId) {
        assembly ("memory-safe") {
            // 0xa0 is the size of the PoolKey struct, five 32 byte slots.
            poolId := keccak256(poolKey, 0xa0)
        }
    }
}

library BalanceDeltaLibrary {
    /// @notice Two int128 values packed into one int256. The upper half is amount0.
    function amount0(BalanceDelta balanceDelta) internal pure returns (int128 _amount0) {
        assembly ("memory-safe") {
            _amount0 := sar(128, balanceDelta)
        }
    }

    function amount1(BalanceDelta balanceDelta) internal pure returns (int128 _amount1) {
        assembly ("memory-safe") {
            _amount1 := signextend(15, balanceDelta)
        }
    }
}

interface IPoolManager {
    /// @notice Opens a pool at a starting price. Reverts if the pool already exists.
    function initialize(PoolKey memory key, uint160 sqrtPriceX96) external returns (int24 tick);

    /// @notice Raw storage read, used by PoolState below.
    function extsload(bytes32 slot) external view returns (bytes32 value);
}

library PoolState {
    /// @notice Index of the pools mapping inside PoolManager.
    bytes32 internal constant POOLS_SLOT = bytes32(uint256(6));

    /// @notice Reads the live price and tick of a pool.
    function getSlot0(IPoolManager manager, PoolId poolId)
        internal
        view
        returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)
    {
        bytes32 stateSlot = keccak256(abi.encodePacked(PoolId.unwrap(poolId), POOLS_SLOT));
        bytes32 data = manager.extsload(stateSlot);
        assembly ("memory-safe") {
            sqrtPriceX96 := and(data, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
            tick := signextend(2, shr(160, data))
            protocolFee := and(shr(184, data), 0xFFFFFF)
            lpFee := and(shr(208, data), 0xFFFFFF)
        }
    }
}

library TickMath {
    int24 internal constant MIN_TICK = -887272;
    int24 internal constant MAX_TICK = 887272;
    uint160 internal constant MIN_SQRT_PRICE = 4295128739;
    uint160 internal constant MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342;
}

/// @notice Router that adds and removes liquidity. It pulls tokens from whoever calls it,
///         so the caller must hold the tokens and approve this router first.
interface IPoolModifyLiquidityTest {
    function modifyLiquidity(PoolKey memory key, ModifyLiquidityParams memory params, bytes memory hookData)
        external
        payable
        returns (BalanceDelta delta);
}

/// @notice Router that performs swaps. Same approval rule as above.
interface IPoolSwapTest {
    struct TestSettings {
        bool takeClaims;
        bool settleUsingBurn;
    }

    function swap(PoolKey memory key, SwapParams memory params, TestSettings memory testSettings, bytes memory hookData)
        external
        payable
        returns (BalanceDelta delta);
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
