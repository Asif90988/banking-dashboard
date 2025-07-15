# VPS_SETUP_NOTES.md

📅 **Created on:** 2025-07-12 19:47:37
👤 **Maintained by:** Asif

---

## 🔧 VPS Setup Directory

```bash
/home/zoha/citi-dashboard
```

## 🧠 Summary of Key VPS-Specific Adjustments

### ✅ Kafka Configuration
- Kafka and Zookeeper are installed at `/home/zoha/kafka`
- Kafka logs are stored in `/home/zoha/kafka/logs`
- Kafka runs on port `9092` and is used as middleware for dummy data streams.

### ✅ Dummy Data Generator Location
- Dummy data generator resides at:
```bash
/home/zoha/citi-dashboard-streamer/services/ProductionDataStreamer.js
```

### ✅ Project Startup Notes
- PM2 is used to start the backend via:
```bash
pm2 start backend/server.js
```

- Frontend is served using `next dev` or via a production build (TBD).

### ✅ GitHub Deployment Strategy
- Golden Copy is maintained on GitHub: https://github.com/Asif90988/banking-dashboard
- Git updates should only be pulled after confirming no local edits are pending.
- Pull script: `pull_updates_to_vps.sh`

---

## 🛑 Do Not Change Directly on VPS
To avoid Git conflicts, **do not make direct code changes** on the VPS. Always:
1. Make changes on local (Mac).
2. Push to GitHub.
3. Pull to VPS using `pull_updates_to_vps.sh`.

---

## 📝 Custom Scripts Present on VPS
| Script | Path | Description |
|--------|------|-------------|
| `pm2_restart.sh` | `~/citi-dashboard/` | Restarts the backend and frontend apps. |
| `pull_updates_to_vps.sh` | `~/citi-dashboard/` | Pulls the latest GitHub code. |

---

## 📌 Misc Notes
- Ubuntu 24.04 LTS
- Reverse DNS: `srv648752.hstgr.cloud`
- Logged-in user: `zoha`
