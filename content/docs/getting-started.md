---
title: "Getting Started"
description: "Set up YourApp in under 10 minutes."
section: "Getting Started"
order: 1
---

## Prerequisites

- Node.js 18 or later
- An AWS account
- AWS CLI configured (`aws configure`)

## Installation

```bash
git clone https://github.com/yourapp/yourapp
cd yourapp
npm install
```

## Start the backend sandbox

```bash
npx ampx sandbox
```

This provisions your personal AWS resources (Cognito, DynamoDB, S3) and generates `amplify_outputs.json`.

## Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up for an account.

## Next steps

- [Configure your profile](/docs/profile-setup)
- [Understanding the dashboard](/docs/dashboard)
