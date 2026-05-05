---
title: "The Dashboard"
description: "Understanding the health monitoring dashboard."
section: "Features"
order: 1
---

## Overview

The dashboard is your post-login home screen. It shows real-time health status for the three core backend services:

| Service | What it checks |
|---|---|
| Auth Session | Whether your Cognito session is active and when it expires |
| Amplify API | Whether the AppSync GraphQL endpoint is reachable |
| Data Layer | Whether DynamoDB queries are succeeding |

## Health statuses

- **Healthy** (green) — the service responded successfully
- **Checking…** (grey) — a check is in progress
- **Unavailable** (red) — the service did not respond within 10 seconds

## Refreshing

Click the **Refresh** button to re-run all checks. Each check has a 10-second timeout — if a service doesn't respond in time, it's marked unavailable.

## Notifications

If you enable notifications in your [profile settings](/docs/profile-setup), the dashboard will alert you whenever a service transitions from Healthy to Unavailable.
