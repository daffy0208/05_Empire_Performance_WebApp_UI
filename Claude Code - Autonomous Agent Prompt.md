Claude Code - Autonomous Agent Prompt

> Use **multiple autonomous agents in parallel** to simulate all possible user behaviors, actions, and interaction flows on the website.
>
> * Cover every feature, use case, and edge-case permutation.
> * Continuously detect errors, failures, or unexpected behaviors.
> * For each issue discovered, generate and apply a working fix automatically.
> * Validate that the fix fully resolves the issue without introducing regressions.
> * Only produce a final report **after all identified issues have been fixed and verified**.
>
> The final report must include:
>
> 1. A list of all tested user actions and scenarios.
> 2. All issues detected (with root cause analysis).
> 3. The solutions implemented for each issue.
> 4. Verification evidence that the fixes resolved the problems.

---

### Why this is better

* **Clarity**: The structure clearly separates *what to do* (simulate + test) from *how to report* (after fixes are verified).
* **Completeness**: Ensures coverage of permutations, not just common paths.
* **Safety**: Explicitly prevents premature reporting before solutions are validated.
* **Traceability**: Requires root cause analysis and verification evidence, making the output more useful and reliable.

---

