# Practical exam 2026: Uniswap v4

ECO5037W Fintech and Cryptocurrencies.

**Three hours. 100 marks. Open book.**

You will mint two reward tokens, open a Uniswap v4 pool at a set price, put liquidity into it, and
trade against it. Everything runs in your browser. Nothing is installed, nothing costs anything,
and there is no test network involved.

The code is already written for you. Your job is to fill in the gaps, each one marked with a
`TODO` and a hint. There are eleven gaps in total and most are a single line.

---

## Rules

You may use any documentation, any notes, and any AI assistant for the code.

The written section is different. Every question is about your own parameters, your own addresses
and your own numbers. A correct general answer about Uniswap that is not about your pool earns
nothing.

Do not share code, parameters, addresses or answers. Every student has a different pool.

---

## Setup, about five minutes

**Step 1.** Open [remix.ethereum.org](https://remix.ethereum.org).

**Step 2.** In the file explorer on the left, click the **Clone git repository** button and paste
this repository's URL. Wait for the files to appear.

**Step 3.** Click the **Deploy and Run** tab on the far left (the Ethereum logo). At the top, set
**Environment** to **Remix VM (Cancun)**. If you see an older name like Shanghai or London, change
it. Uniswap v4 will not run on those.

**Step 4.** In the file explorer, right click `scripts/01_setup.js` and choose **Run**. Watch the
terminal at the bottom. After a few seconds it prints three addresses.

**Step 5.** Copy those three addresses into the table below. You will paste them repeatedly.

```
Pool manager     0x ______________________________________
Liquidity router 0x ______________________________________
Swap router      0x ______________________________________
```

> **If you reload the page or change the Environment, everything you deployed is wiped.** You would
> have to start again from Step 4. Do not reload the page. If it happens anyway, tell the
> invigilator, then work back through the steps. Your written code is safe, only the deployments
> are lost.

---

## Your parameter sheet

You were given a sheet with your student number on it. Keep it next to you. Everyone has different
values, so a neighbour's numbers will not work for you.

---

## Task 1: mint your tokens (10 marks)

**Open** `contracts/Task1Token.sol`. There is one gap, `TODO 1.1`. Fill it in.

**Compile it.** Click the **Solidity Compiler** tab (third icon down) and press **Compile**. Fix
anything red before moving on.

**Deploy it twice.** Go back to **Deploy and Run**. In the **Contract** dropdown choose
`ExamToken`. Expand the orange **Deploy** button to reveal the three constructor fields, then:

Deployment one, your token A:

| Field | What to type |
| --- | --- |
| `name_` | Token A name from your sheet, in quotes |
| `symbol_` | Token A symbol from your sheet, in quotes |
| `initialSupply_` | The long `initialSupply_` number from your sheet, copied exactly |

Press **Deploy**. The contract appears under **Deployed Contracts** at the bottom. Click the copy
icon next to it to get its address.

> Copy the supply straight off your sheet. It has 25 digits, and that is correct. The token has 18
> decimals, so the number you type is the smallest unit, not whole tokens. Typing a short round
> number here mints almost nothing, and the first transfer you attempt will then fail.

Deployment two, your token B: same again, with token B's name and symbol.

**Write both addresses down now.** Everything from here needs them, and they are painful to
recover if you lose them.

```
Token A address 0x ______________________________________
Token B address 0x ______________________________________
```

---

## Task 2: open the pool (20 marks)

**Open** `contracts/Task2Pool.sol`. There are three gaps, `TODO 2.1` to `TODO 2.3`. Fill them in
and compile.

**Deploy `Task2Pool` once.** Choose it in the **Contract** dropdown and fill in the seven
constructor fields:

| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Fee tier from your sheet |
| `_tickSpacing` | Tick spacing from your sheet |
| `_sqrtPriceIfAlphaIsCurrency0` | First long number from your sheet |
| `_sqrtPriceIfBetaIsCurrency0` | Second long number from your sheet |

Those last two long numbers are the starting price, written the way the protocol wants it. Your
sheet gives you both because the pool sorts your two tokens by address, and you do not get to
choose which one becomes `currency0`. Your code picks the right one in `TODO 2.1`.

**Call the functions.** Expand your deployed `Task2Pool` and click, in this order:

1. `alphaIsCurrency0` (blue, free). Note whether it says true or false.
2. `poolId` (blue, free). Write it down.
3. `startingSqrtPriceX96` (blue, free). It returns whichever of your two long numbers
   applies. Write it down.
4. `openPool` (orange, costs gas). This is the one that actually opens the pool.
5. `currentSlot0` (blue, free). It returns two numbers. The second is the tick.

**Record these:**

```
alphaIsCurrency0        ______________________________________
poolId                0x ______________________________________
startingSqrtPriceX96    ______________________________________
tick after openPool     ______________________________________
Task2Pool address     0x ______________________________________
```

---

## Task 3: add liquidity (20 marks)

**Open** `contracts/Task3Liquidity.sol`. There are three gaps, `TODO 3.1` to `TODO 3.3`. Fill them
in and compile.

**Deploy `Task3Liquidity` once**, with these six fields:

| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_liquidityRouter` | Liquidity router address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Fee tier from your sheet, the same value as Task 2 |
| `_tickSpacing` | Tick spacing from your sheet, the same value as Task 2 |

> The fee and tick spacing must match Task 2 exactly. Change either one and you are pointing at a
> completely different pool, which does not exist, and everything will fail.

**Send it your tokens.** This contract pays for the liquidity, so it has to be holding tokens.
Under **Deployed Contracts**, expand your **token A** and call `transfer` with:

- `to`: your `Task3Liquidity` address
- `amount`: the Task 3 send amount from your sheet, which is half your supply

Do the same on your **token B**.

**Choose your range.** Call `currentTick` on `Task3Liquidity` to see the live tick. Now pick a
`tickLower` below it and a `tickUpper` above it. Both must be exact multiples of your tick spacing.

A safe way to do it: take the live tick, round it to a multiple of your spacing, then go twenty
spacings either side. With spacing 60 and a live tick of 20150, that is 20100 in the middle, so
18900 and 21300.

Your live tick may well be negative, depending on which of your tokens became currency0. That is
normal and nothing is wrong. The same method works: with spacing 10 and a live tick of -17274, you
could use -17270 in the middle, so -17470 and -17070.

**Call `addLiquidity`** with your `tickLower`, your `tickUpper`, and the liquidity amount from your
sheet. In the terminal, expand the transaction and look at **decoded output**. It gives you
`amount0` and `amount1`, both negative because the tokens left your contract.

**Record these:**

```
tickLower        ______________________________________
tickUpper        ______________________________________
amount0          ______________________________________
amount1          ______________________________________
Task3 address 0x ______________________________________
```

---

## Task 4: predict, then swap (15 marks)

**Open** `contracts/Task4Swap.sol`. There are four gaps, `TODO 4.1` to `TODO 4.4`. Fill them in
and compile.

**Deploy `Task4Swap` once**, with the swap router this time:

| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_swapRouter` | Swap router address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Same as Tasks 2 and 3 |
| `_tickSpacing` | Same as Tasks 2 and 3 |

**Send it your tokens too**, the same way as Task 3: call `transfer` on token A and on token B,
this time to your `Task4Swap` address, using the Task 4 send amount from your sheet. That is the
other half of your supply, so both contracts end up funded and your own balance ends at zero.

**Work out what you expect.** Your sheet gives you a swap input amount and a direction. Before you
run anything, work out roughly how much you expect to get back. Your starting price tells you the
rough exchange rate, and the fee tier tells you what comes off the top. You do not have to be
exact, but you do need a number and a reason for it.

**Call `recordPrediction`** with that number, written in the same units as everything else, so
18 decimals. If you expect about 3 tokens back, that is `3000000000000000000`.

Your contract will not let you swap until you have recorded something.

**Call `swapExactIn`** with the direction and amount from your sheet:

- `zeroForOne`: true if your sheet says currency0 into currency1, false otherwise
- `amountIn`: the swap input amount from your sheet

Check **decoded output** again. One amount is negative, the token you paid. The other is positive,
the token you received. The positive one is your actual output.

Copy both numbers exactly, minus sign and all. They are long because they are in the smallest unit
of the token, the same as everything else.

**Record these:**

```
predicted output    ______________________________________
actual output       ______________________________________
Task4 address     0x ______________________________________
```

---

## Task 5: report your results (10 marks)

Open `results.json` and fill in every field with the values you wrote down. This is checked by
running your submitted contracts again and comparing, so the numbers have to be real. A guessed
number scores nothing, and a blank field scores nothing.

Very long numbers, like the amounts and the price, go in as text inside quotes. The template
already shows which ones.

---

## Task 6: written section (25 marks)

Answer all five questions in `ANSWERS.md`. **120 words each, maximum.** Each is worth 5 marks and
is marked as nothing, half or full.

Full marks need specifics from your own work: your numbers, your addresses, your error messages,
your range.

---

## Submitting

Submit exactly six files:

```
Task1Token.sol
Task2Pool.sol
Task3Liquidity.sol
Task4Swap.sol
results.json
ANSWERS.md
```

Download each one from the Remix file explorer, right click and choose **Download**. Do not rename
them, and do not submit the whole workspace as a zip.

Before you submit, press **Compile** one last time and check there are no red errors. Files that do
not compile score zero on Tasks 1 to 5, whatever is written in them.

---

## Reference

**Which files you edit.** Only the four task files. `V4.sol`, `ERC20.sol` and `ExamBase.sol` are
provided and already finished. Reading them is a good idea. Changing them is not.

**What identifies a pool.** The two currencies in sorted order, the fee, the tick spacing, and the
hooks address. Change any one of them and you are talking about a different pool.

**Ticks.** `price = 1.0001 ** tick`. Any tick that holds liquidity has to be a multiple of the
pool's tick spacing.

**Compiler warnings.** The starting files produce warnings about unused variables. That is normal
and costs you nothing. They disappear as you fill the gaps in. Only red errors matter.

**Optional, `scripts/02_price.js`.** Shows where the two long price numbers on your sheet come
from. You do not need it to finish the exam.

**Optional, `scripts/03_selfcheck.js`.** Checks the shape of your contracts and the rules they
should be enforcing. It does not check your numbers and it is not a mark predictor.

**If something breaks.** Ask the invigilator rather than spending twenty minutes on it. Setup
problems are not what is being examined here.
