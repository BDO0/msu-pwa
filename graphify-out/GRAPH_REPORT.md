# Graph Report - Capstone  (2026-05-19)

## Corpus Check
- 8 files · ~164,227 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1314 nodes · 3321 edges · 59 communities (22 shown, 37 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1b6e9300`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]

## God Nodes (most connected - your core abstractions)
1. `f` - 60 edges
2. `sr` - 36 edges
3. `ke` - 32 edges
4. `p` - 26 edges
5. `T` - 26 edges
6. `be` - 26 edges
7. `cr` - 26 edges
8. `N` - 25 edges
9. `ee` - 24 edges
10. `ft` - 23 edges

## Surprising Connections (you probably didn't know these)
- `renderGame()` --calls--> `initStationChallenge()`  [EXTRACTED]
  js/app.js → js/matchup.js
- `renderGame()` --calls--> `initWordWeaver()`  [EXTRACTED]
  js/app.js → js/matchup.js
- `renderGame()` --calls--> `initDarangenGame()`  [EXTRACTED]
  js/app.js → js/matchup.js

## Communities (59 total, 37 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (7): be, de, dt, fe, ft, it, re

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (3): cr, p, wr

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (7): constructor(), he, lr, te, ue, y, zt

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (49): adminBtnClose, adminBtnSubmit, adminErrorMsg, adminForm, adminLoginLink, adminModal, adminModalTemplate, adminOverlay (+41 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (4): dr, Q, tt, xe

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (7): ht, kt, Qt, vt, wt, xt, yt

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (3): ke, or, w

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (5): ar, d, gt, j, le

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (4): ae, oe, pe, se

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (4): b, l, r(), u

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (23): adminContent, app, artifactData, artifactsListBody, auth, btnLogin, btnLogout, btnSubmit (+15 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (4): br(), gr, mr, Vr

### Community 16 - "Community 16"
Cohesion: 0.1
Nodes (11): a, c, g, h, Hr, K, kr, O (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (4): artifacts, completers, firebaseConfig, q

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (3): ASSETS_TO_CACHE, fetchedResponse, isFirebaseStorage

## Knowledge Gaps
- **50 isolated node(s):** `ASSETS_TO_CACHE`, `isFirebaseStorage`, `fetchedResponse`, `firebaseConfig`, `app` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `f` connect `Community 4` to `Community 16`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `ft` connect `Community 0` to `Community 16`, `Community 19`, `Community 6`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ot` connect `Community 50` to `Community 16`, `Community 29`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `ASSETS_TO_CACHE`, `isFirebaseStorage`, `fetchedResponse` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._