# Practical exam 2026: Uniswap v4

ECO5037W Fintech and Cryptocurrencies.

**Three hours. 100 marks. Open book.**

You will mint a pair of reward tokens, open a Uniswap v4 pool at an assigned price, seed it with
liquidity, and trade against it. Everything runs in your browser. Nothing is installed, nothing
costs anything, and there is no test network involved.

## Rules

You may use any documentation, any notes, and any AI assistant for the code. That is deliberate.
The code is worth 65 marks and the tools are part of how this work is done now.

The written section is worth 25 marks and is a different matter. Every question is tied to your
own assigned parameters, your own deployed addresses and the numbers your own run produced. An
answer that is correct in general but not about your pool earns nothing. Marks go to statements
that can be checked against what you submitted.

You may not share code, parameters, addresses or answers with another student. Every student has
a different pool, so shared answers are not subtle.

## Before you start

1. Open [remix.ethereum.org](https://remix.ethereum.org).
2. In the file explorer, use **Clone git repository** and paste this repository's URL. Do not
   download the files by hand, and do not work in a fresh workspace.
3. Open the **Deploy and Run** panel. Set **Environment** to **Remix VM (Cancun)** or newer.
   Uniswap v4 uses transient storage and will not run on an older setting.
4. Right click `scripts/01_setup.js` and choose **Run**. This puts the pool manager and the two
   routers into your sandbox and prints three addresses. Keep them.
5. Open `contracts/ExamSolution.sol`. That is the only file you edit.

Your sandbox gives you ten accounts with 100 test ether each. There is nothing to fund.

**If you reload the page or change the Environment, your sandbox is wiped.** You will have to run
the setup again and redeploy. Save your work to your own machine every half hour. The file
explorer has a download option.

## Your parameter sheet

You were handed a sheet with your student number on it. It gives you:

| Value | Used in |
| --- | --- |
| Token A name and symbol | Task 1 |
| Token B name and symbol | Task 1 |
| Initial supply | Task 1 |
| Fee tier | Task 2 |
| Tick spacing | Task 2 |
| Starting price | Task 2 |
| Liquidity to add | Task 3 |
| Swap input amount and direction | Task 4 |

Everyone has different values. Use yours.

## Task 1: mint your tokens (10 marks)

Finish `ExamToken` so it mints the whole initial supply to whoever deploys it.

Deploy it **twice** in the Deploy and Run panel, once for token A and once for token B, using the
names, symbols and supply from your sheet. Both use 18 decimals.

Write down both addresses. You will need them, and the order they come out in matters more than
you might expect.

## Task 2: open the pool (20 marks)

Fill in your assigned fee tier and tick spacing, then work out the starting price.

The pool identifies its two assets as `currency0` and `currency1`, sorted by address. You do not
choose which of your tokens takes which slot, and you only find out once they are deployed. So
you need the starting price for **both** possible orders:

```
price        = how much currency1 one unit of currency0 buys, in smallest units
sqrtPriceX96 = floor(sqrt(price) * 2**96)
```

Work both values out and put them in the two constants. Compute them however you like. Show your
working in `ANSWERS.md`.

Then finish `alphaIsCurrency0`, `poolKey`, `poolId`, `startingSqrtPriceX96`, `currentSlot0` and
`initializePool`. Deploy `ExamPool`, passing the three addresses from the setup script followed by
your two token addresses. Call `initializePool`.

Before it will do anything useful, `ExamPool` has to hold your tokens: use `transfer` on each
token to send its supply to your deployed `ExamPool` address. Look at TODO 3 for why.

## Task 3: add liquidity (20 marks)

Finish `addLiquidity`.

A range that the pool will accept and that actually earns fees has to satisfy three separate
conditions. Work out what they are, reject anything that fails one, and use a custom error that
names the problem. Then call the liquidity router and pull the two amounts out of the
`BalanceDelta` it hands back.

Call it with the liquidity amount from your sheet and a range you have chosen. Your range is your
decision, and you will be asked to justify it.

## Task 4: predict, then swap (15 marks)

Finish `recordPrediction` and `swapExactIn`.

`swapExactIn` must refuse to run until a prediction has been recorded. This is not busywork: you
are being asked to commit to a number before you can see the answer.

1. Work out how much output you expect for the input amount on your sheet. Write the number down
   with your reasoning, because you will need both.
2. Call `recordPrediction` with it.
3. Call `swapExactIn` with the amount and direction from your sheet.

Two things in the swap parameters catch people out. The sign of `amountSpecified` does not mean
what it meant in earlier versions of the protocol. And `sqrtPriceLimitX96` has to be a genuine
bound or the swap will not run at all. `TickMath` in `V4.sol` gives you the two extremes.

## Task 5: report your results (10 marks)

Fill in `results.json` with the values your run actually produced. Every field is checked by
reproducing your run from the contract you submitted, so the numbers have to be real. Read them
off the decoded output and the logs in the Remix terminal.

Leave a field out and you lose its marks. Guess a field and you lose its marks.

## Task 6: written section (25 marks)

Answer all five questions in `ANSWERS.md`. **120 words each, maximum.** Each is worth 5 marks and
is marked as nothing, half or full.

Full marks need specifics from your own work: your numbers, your addresses, your error messages,
your range. A correct general description of how Uniswap works scores nothing on any of them.

## Submitting

Submit exactly three files:

```
ExamSolution.sol
results.json
ANSWERS.md
```

Download them from the Remix file explorer and upload them to the submission link. Do not rename
them. Do not submit a zip of the whole workspace.

Before you submit, check that your `ExamSolution.sol` still compiles in Remix. A file that does
not compile scores zero on tasks 1 to 5, whatever is written in it.

## Reference

**The four fields that identify a pool.** Currencies in sorted order, fee, tick spacing, hooks.
Change any one of them and you are pointing at a different pool.

**Ticks.** `price = 1.0001 ** tick`. Any tick that holds liquidity must be a multiple of the
pool's tick spacing.

**The tools you have.** `V4.sol` holds the types, the pool key, the two router interfaces,
`PoolState.getSlot0` for the live price and tick, and `TickMath` for the price extremes. You do
not need anything outside this workspace.

**Compiler warnings.** The starting file produces about twenty warnings about unused parameters
and function mutability. That is expected. They disappear as you fill the functions in, so the
count dropping is a rough sign of progress. Warnings are not errors and cost you nothing.

**Optional.** `scripts/02_selfcheck.js` checks the shape of your contract and the rules it should
enforce. It does not check your numbers and it is not a mark predictor.

**If something breaks.** Ask the invigilator rather than spending twenty minutes on it. Setup
problems are not what is being examined here.
