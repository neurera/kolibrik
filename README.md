# Kolibrík · testerský AI agent za 20 minút

Autor: Patrik Skovajsa, spoluzakladateľ a CTO, [neurera.ai](https://neurera.ai) · [LinkedIn](https://www.linkedin.com/in/patrikskovajsa/)

Repo: https://github.com/neurera/kolibrik · Demo k workshopu „Postav si testerského AI agenta za 20 minút – a prečo ťa (zatiaľ) nenahradí".

## Čo tu je
- `presentation/workshop-live.html` – prezentácia z workshopu, jeden súbor, funguje offline. Otvorte v Chrome, N zobrazí poznámky k slajdu, medzera spustí ukážku.
- `src/` – mini aplikácia košíka (statické HTML + JS). **Obsahuje zámerne zasadenú chybu** (nižšie).
- `requirements/REQ-042.md` – požiadavka so zámernou nejednoznačnosťou („zľava na celý obsah košíka").
- `CLAUDE.md` – „osobnosť" agenta: senior tester, pravidlá (nedomýšľaj si, padajúci test = nález, src/ nechytaj).
- `.claude/skills/testcases/SKILL.md` – príkaz `/testcases REQ-042` (najprv otvorené otázky, potom test cases).
- `.claude/settings.json` – allow/deny pravidlá + `PreToolUse` hook.
- `.claude/hooks/protect-assertions.js` – poistka od testera: blokuje úpravy asercií v `tests/` a akýkoľvek zápis do `src/`.
- `tests/cart.spec.ts` – 3 Playwright testy (TC-03 prejde, **TC-07 padne na chybe**, TC-05 prejde).
- `tests/unit.js` – ten istý nález bez prehliadača: `npm run test:unit`.

## Predpoklady (macOS)
Potrebuješ Node.js 20+ (npm a npx sú jeho súčasťou) a Claude Code.
```bash
brew install node                            # alebo LTS inštalátor z nodejs.org
node -v && npm -v                            # overenie
curl -fsSL https://claude.ai/install.sh | bash   # Claude Code, natívny inštalátor (Node netreba)
claude --version                             # po zatvorení a otvorení terminálu
```
Alternatíva: `brew install --cask claude-code`. Claude Code vyžaduje platený účet (Pro, Max, Team alebo Console s API kreditom); pri prvom spustení `claude` sa prihlásiš cez prehliadač. Bez Homebrew stiahni Node LTS z nodejs.org. Na Windows/Linuxe je postup rovnaký, inštalátor Claude Code je na code.claude.com.

## Spustenie za 10 minút
```bash
npm install
npx playwright install chromium
npx playwright init-agents --loop=claude     # vytvorí .claude/agents/playwright-test-{planner,generator,healer}.md + .mcp.json (Playwright ≥ 1.56)
claude                                       # v tomto priečinku
```
V Claude Code potom:
1. `/testcases REQ-042`
2. `použi agenta playwright-test-planner: preskúmaj košík na http://localhost:4173 a naplánuj testy pre REQ-042`
3. `použi agenta playwright-test-generator: naimplementuj scenáre 1 a 2 z specs/cart-plan.md a spusti ich`
4. `použi agenta playwright-test-healer: sprav, aby testy prešli` – a sleduj, čo urobí hook.

Agenti z `init-agents` sú v repe už vygenerovaní (Playwright 1.63), po update Playwrightu ich vygeneruj znova.

### Ak Claude Code hlási „Unknown command: /testcases"
1. Skilly sa načítavajú len pri štarte: `/exit` a znova `claude` v tomto priečinku.
2. Over, že máš skrytý priečinok `.claude` celý: `ls -la .claude` má ukázať `skills`, `commands`, `hooks`, `settings.json`, `agents`. Finder a `cp` bez `-a` skryté priečinky preskakujú, klonuj cez `git clone`.
3. Ten istý príkaz je v repe dvakrát, pre staršie aj novšie verzie Claude Code: `.claude/skills/testcases/SKILL.md` a `.claude/commands/testcases.md`. Ak sa `/testcases` zobrazí dvakrát, jeden z nich zmaž.
4. Núdzová cesta, ktorá funguje vždy: `Prečítaj .claude/skills/testcases/SKILL.md a vykonaj ho pre REQ-042.`

`.claude/settings.local.json` si vytvára Claude Code sám (tvoje osobné povolenia), je v `.gitignore`.

Overenie pred prvým spustením Claude Code (bez neho):
```bash
npm run test:unit        # TC-07 má padnúť
npx playwright test      # otvorí Chromium: 3 prejdú (vrátane prázdneho seed testu), TC-07 padne na 1,00 € vs. 2,00 €
```

Aplikácia sa spúšťa `npm run serve` (Playwright config ju spustí sám).

## Zasadená chyba
`src/cart.js`, funkcia `computeDiscount`: zľava sa počíta z jednotkovej ceny, nie z ceny × množstvo.
Pri 1 kuse sedí (1,00 €), pri 2 kusoch je 1,00 € namiesto 2,00 €. Presne tam je požiadavka nejednoznačná.

## Čo je otestované a čo nie (29. 9. 2026, izolované Linux prostredie)
Otestované naozaj:
- `npm install`, `npm run serve` (HTTP 200 na :4173), `npm run test:unit` (TC-07 padne).
- `npx playwright test` s týmto `playwright.config.ts` (headed + slowMo pod Xvfb, webServer sa spustil sám): **2 passed, 1 failed** – TC-07, Expected "2,00 €", Received "1,00 €".
- `npx playwright init-agents --loop=claude` aj `--loop=vscode`: vygenerovali agentov, `.mcp.json` a `tests/seed.spec.ts`.
- Hook `protect-assertions.js` s payloadom v tvare PreToolUse (`tool_input.file_path`, `old_string`): asercia v tests/ → exit 2, zápis do src/ → exit 2, report → exit 0.
- `settings.json` je validný JSON.

Otestované na macOS (Apple Silicon, 29. 9. 2026): `npm install`, `npx playwright install chromium`, `init-agents --loop=claude`, `npm run test:unit`, `npx playwright test` (3 passed, TC-07 failed) a `/testcases REQ-042` v Claude Code.

Neotestované systematicky: správanie agentov planner/generator/healer je pri každom behu iné. Pred ukážkou naživo to spusti aspoň 3×.

## Pred pódiom
- Zafixuj verzie (`npm ci`), prejdi celý tok 3× na čistom stave (`git reset --hard && git clean -fd`).
- Režim oprávnení: `acceptEdits` + allow pravidlá zo `settings.json`, alebo `auto` + deny. Nikdy `--dangerously-skip-permissions` na vlastnom notebooku.
- Predhrej `npx` cache a `npx playwright install`, konferenčná Wi-Fi je najčastejšia príčina pádu.
- Maj pripravený `specs/cart-plan.md` z ranného behu plannera a nahraté video celého flow.
- Terminál 20–24 pt, prehliadač v `--headed` so `slowMo: 400`, obe okná vedľa seba.

## Fair play a limity
- **Chyba je zasadená zámerne.** Nejde o to, či ju agent nájde, ale čo urobí, keď na ňu narazí (`healer` + hook).
- **Kolibrík je hračka.** Na legacy UI bez rolí, s iframe-ami, SSO alebo captchou planner často zlyhá. `/testcases` (test cases + otvorené otázky z požiadavky) funguje na hocičom.
- **Claude Code je platený a kód ide do cloudu Anthropicu.** Playwright agenti bežia aj vo VS Code s Copilotom: `npx playwright init-agents --loop=vscode`. Princíp (pravidlá v CLAUDE.md/AGENTS.md, otvorené otázky, poistka) je rovnaký.
- **Prvé nastavenie za firemným proxy je hodina, nie desať minút.** Potom je to minúta.
- **Každý beh je iný.** Healer raz test preskočí, raz siahne na aserciu. Na dobré správanie sa nedá spoľahnúť, na hook a deny pravidlá áno.
- **Agent robí checking. Tester robí testing.** Hook je hranica medzi nimi.
