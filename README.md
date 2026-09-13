# Practical exam 2026: Uniswap v4

ECO5037W Fintech and Cryptocurrencies.

**Three hours. 100 marks. Open book.**

You will mint two reward tokens, open a Uniswap v4 pool at a set price, put liquidity into it, and
trade against it.

Four incomplete smart contracts are provided with gaps marked as
`TODO`. There are eleven gaps in total.

---

## Rules

You may use any documentation, any notes, and any course resources for the code.

The written section is different. Every question is about your own parameters, your own addresses
and your own numbers.

Do not share code, parameters, addresses or answers.

---

## Setup

**Step 1.** Open [remix.ethereum.org](https://remix.ethereum.org).

**Step 2.** On the top navigation bar, click the *Sign In** button and sign in via your GitHub account.

**Step 3.** Once connected, click your profile icon and select **Clone**. Paste your fork of the repository's URL and click **OK**. Wait for the files to appear in the file explorer on the left. (*NB* Make sure you are cloning your fork, not the original repository.)

**Step 4.** In the **Deploy** panel, set Environment to **Remix VM (Osaka)**.
In the file explorer, right click `scripts/01_setup.js` and choose **Run**. Watch the
terminal at the bottom. After a few seconds it prints three addresses.

**Step 5.** Copy those three addresses into the table below. You will paste them repeatedly. (There is a button that says *EDIT* at the top of this page, click it to edit this markdown file.)

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

You were given a sheet called `STUDENTNUMBER.txt` with your own parameters for the exam. You will need them repeatedly. Copy them exactly, digit for digit. You can find it under `sheets/STUDENTNUMBER.txt` in the file explorer. Do not rename it. Do not share it.

---

## Task 1: mint your tokens (10 marks)

**Open** `contracts/Task1Token.sol`. Complete `TODO 1.1`.

**Compile it.** Click the **Compile** button (blue button on the top left). Fix anything red before moving on.

**Deploy it twice.** Click the **Deploy and Run transactions button** (looks like a Solidity icon). In the **Contract** dropdown choose
`ExamToken`. (If it says `Task1Token.sol` instead, click the *Compile* button next to it, then follow the next steps.)

**Fill in the three fields for each deployment:**
Deployment one, your token A:

| Field | What to type |
| --- | --- |
| `name_` | Token A name from your sheet |
| `symbol_` | Token A symbol from your sheet |
| `initialSupply_` | The long `initialSupply_` number from your sheet |

Press **Deploy**. The contract appears under **Deployed Contracts** at the bottom. Click the copy
icon next to it to get its address.


Deployment two, your token B: same again, with token B's name and symbol and initial supply.

**Write both addresses down now.** Everything from here needs them, and they are annoying to
recover if you lose them. (Replace the underscores in the table below with your addresses, the 0x is just a hint at what the address should look like, so remove it too before you paste.)

```
Token A address 0x ______________________________________
Token B address 0x ______________________________________
```

---

## Task 2: open the pool (20 marks)

**Open** `contracts/Task2Pool.sol`. Complete `TODO 2.1`, `TODO 2.2`, and `TODO 2.3`.

**Compile it.** Click the **Compile** button (blue button on the top left). Fix anything red before moving on.

**Deploy `Task2Pool` once.** Click the **Deploy and Run transactions button** as we did before.
In the **Contract** dropdown choose `Task2Pool` and click **Deploy**. (If it says `Task2Pool.sol` instead, click the *Compile* button next to it, then follow the next steps.)

**Fill in the seven fields for this deployment:**

| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Fee tier from your sheet |
| `_tickSpacing` | Tick spacing from your sheet |
| `_sqrtPriceIfAlphaIsCurrency0` | First long number from your sheet |
| `_sqrtPriceIfBetaIsCurrency0` | Second long number from your sheet |

Press **Deploy**.

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

*Remember to get the address of the deployed contract, click the copy icon next to the address in the **Deployed Contracts** section.*

---

## Task 3: add liquidity (20 marks)

**Open** `contracts/Task3Liquidity.sol`. Complete `TODO 3.1`, `TODO 3.2`, and `TODO 3.3`.

**Compile it.** Click the **Compile** button (blue button on the top left). Fix anything red before moving on.

**Deploy `Task3Liquidity` once.** Click the **Deploy and Run transactions button** as we did before.
In the **Contract** dropdown choose `Task3Liquidity` and click **Deploy**. (If it says `Task3Liquidity.sol` instead, click the *Compile* button next to it, then follow the next steps.)

**Fill in the six fields for this deployment:**

| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_liquidityRouter` | Liquidity router address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Fee tier from your sheet, the same value as Task 2 |
| `_tickSpacing` | Tick spacing from your sheet, the same value as Task 2 |

Press **Deploy**.

> The fee and tick spacing must match Task 2 exactly. Change either one and you are pointing at a
> completely different pool, which does not exist, and everything will fail.

**Send it your tokens.** This contract pays for the liquidity, so it has to be holding tokens.

Under **Deployed Contracts**, expand your **token A** and call `transfer` with:

- `to`: your `Task3Liquidity` address
- `amount`: the Task 3 send amount from your sheet, which is half your supply

Do the same on your **token B**.

**Choose your range.** Call `currentTick` on `Task3Liquidity` to see the live tick. Now pick a
`tickLower` below it and a `tickUpper` above it. Both must be exact multiples of your tick spacing.

A safe way to do it: take the live tick, round it to a multiple of your spacing, then go **twenty
spacings** either side. With spacing 60 and a live tick of 20150, that is 20100 in the middle, so
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

*Remember to get the address of the deployed contract, click the copy icon next to the address in the **Deployed Contracts** section.*
---

## Task 4: predict, then swap (15 marks)

**Open** `contracts/Task4Swap.sol`. Complete `TODO 4.1`, `TODO 4.2`, `TODO 4.3`, and `TODO 4.4`.

**Compile it.** Click the **Compile** button (blue button on the top left). Fix anything red before moving on.

**Deploy `Task4Swap` once.** Click the **Deploy and Run transactions button** as we did before. In the **Contract** dropdown choose `Task4Swap` and click **Deploy**. (If it says `Task4Swap.sol` instead, click the *Compile* button next to it, then follow the next steps.)

**Fill in the six fields for this deployment:**


| Field | What to type |
| --- | --- |
| `_poolManager` | Pool manager address from Step 5 |
| `_swapRouter` | Swap router address from Step 5 |
| `_tokenA` | Your token A address |
| `_tokenB` | Your token B address |
| `_fee` | Same as Tasks 2 and 3 |
| `_tickSpacing` | Same as Tasks 2 and 3 |

Press **Deploy**.

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

*Remember to get the address of the deployed contract, click the copy icon next to the address in the **Deployed Contracts** section.*
---

## Task 5: report your results (10 marks)

Open `results.json` and fill in every field with the values you wrote down.

Very long numbers, like the amounts and the price, go in as text inside quotes. The template
already shows which ones. *NB if the numbers are negative, keep the minus sign. Do not round or truncate anything.*

---

## Task 6: written section (25 marks)

Answer all five questions in `ANSWERS.md`. **120 words each, maximum.** Each is worth 5 marks.

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

Before you submit, press **Compile** one last time and check there are no red errors.
Each task is assessed separately. Compilation errors affect the relevant task. Correct logic may receive partial credit where the intended implementation is clear.

Once you have all files downloaded and checked, create a zip file called `STUDENTNUMBER.zip` and submit it to Amathuba to the exam assignment. Do not submit anything else. Do not submit a folder, only a zip file.

---

## References & Resources

**Which files you edit.** Complete the four task contracts, `results.json` and `ANSWERS.md`.
You may also fill in the address records in this README and the five configuration values in
the optional self-check script. `V4.sol`, `ERC20.sol` and `ExamBase.sol` are provided and already finished.

**Uniswap v4.** [Uniswap v4 docs](https://docs.uniswap.org/contracts/v4). Very comprehensive, but you do not need to read it all. The exam is designed so you can complete it without reading the docs, but they are there if you want to check something.

**Ticks.** `price = 1.0001 ** tick`. Any tick that holds liquidity has to be a multiple of the
pool's tick spacing.

**Compiler warnings.** The starting files produce warnings about unused variables. That is normal
and costs you nothing. They disappear as you fill the gaps in. Only red errors matter.

**Optional, `scripts/02_selfcheck.js`.** Checks the shape of your contracts and the rules they
should be enforcing. It does not check your numbers and it is not a mark predictor.
It simulates calls without saving changes.

**If something breaks.** Ask the invigilator rather than spending twenty minutes on it. Setup
problems are not what is being examined here.
