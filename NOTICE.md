# Third party notices

## Uniswap v4 core

This workspace uses `@uniswap/v4-core` version 1.0.2.

`contracts/V4.sol` holds trimmed type, interface and library declarations derived from the MIT
licensed sources in that package: `types/PoolKey.sol`, `types/PoolId.sol`, `types/PoolOperation.sol`,
`types/BalanceDelta.sol`, `interfaces/IPoolManager.sol`, `libraries/StateLibrary.sol` and
`libraries/TickMath.sol`. The names and signatures match the real protocol, so what you learn here
transfers to real deployments.

`artifacts/` holds the compiled `PoolManager`, `PoolSwapTest` and `PoolModifyLiquidityTest` from the
same package, used as deployment bytecode for teaching and assessment only. `PoolManager.sol` is
licensed BUSL-1.1, which permits non production use.

Uniswap is not affiliated with this course and does not endorse it.

## Token names

The token names and symbols on your parameter sheet are invented for teaching purposes. They do not
refer to any real reward programme, company or product.
