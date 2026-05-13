# Graph Report - Capstone  (2026-05-12)

## Corpus Check
- 8 files · ~161,791 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1288 nodes · 3285 edges · 59 communities (17 shown, 42 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e72473f2`
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
- [[_COMMUNITY_Community 19|Community 19]]
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
- [[_COMMUNITY_Community 38|Community 38]]
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
- [[_COMMUNITY_Community 54|Community 54]]
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
- `e()` --calls--> `I`  [EXTRACTED]
  js/html5-qrcode.min.js → js/html5-qrcode.min.js  _Bridges community 43 → community 4_
- `e()` --calls--> `r()`  [EXTRACTED]
  js/html5-qrcode.min.js → js/html5-qrcode.min.js  _Bridges community 43 → community 7_
- `T` --calls--> `r()`  [EXTRACTED]
  js/html5-qrcode.min.js → js/html5-qrcode.min.js  _Bridges community 7 → community 29_
- `c` --calls--> `T`  [EXTRACTED]
  js/html5-qrcode.min.js → js/html5-qrcode.min.js  _Bridges community 4 → community 29_
- `ir()` --calls--> `rr()`  [EXTRACTED]
  js/html5-qrcode.min.js → js/html5-qrcode.min.js  _Bridges community 4 → community 18_

## Communities (59 total, 42 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (10): ht, kt, Qt, te, ue, vt, xt, y (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (5): dr, he, Q, tt, xe

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (4): de, dt, fe, ft

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (16): _, a, c, g, h, Hr, I, K (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (6): ar, constructor(), d, gt, j, lr

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (3): ce, ie, me

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (4): b, l, r(), u

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (4): ae, le, oe, pe

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (25): appContent, cacheImages(), cacheWarmer(), checkCompletion(), getStationData(), init(), initData(), markViewed() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (23): adminContent, app, artifactData, artifactsListBody, auth, btnLogin, btnLogout, btnSubmit (+15 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (4): br(), gr, mr, Vr

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (4): artifacts, completers, firebaseConfig, q

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (3): ASSETS_TO_CACHE, fetchedResponse, isFirebaseStorage

## Knowledge Gaps
- **33 isolated node(s):** `ASSETS_TO_CACHE`, `isFirebaseStorage`, `fetchedResponse`, `firebaseConfig`, `app` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `f` connect `Community 3` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `N` connect `Community 21` to `Community 4`, `Community 6`, `Community 40`, `Community 18`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Q` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `ASSETS_TO_CACHE`, `isFirebaseStorage`, `fetchedResponse` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._