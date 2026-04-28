Crowd Logic

Wait time: Math.round((queueSize × avgServiceTime) / capacityPerHour) → produces minutes → fed to formatWaitTime()
Crowd level: queueSize ≤ 5 → low, ≤ 15 → medium, > 15 → high — passed to CrowdBadge
No CSS, routing, or other components were touched
