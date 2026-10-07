# ShoppersMart

[![Deploy to S3 + Invalidate CloudFront](https://github.com/<YOUR_GITHUB_USERNAME>/E-COMMERCE/actions/workflows/deploy.yml/badge.svg)](https://github.com/<YOUR_GITHUB_USERNAME>/E-COMMERCE/actions/workflows/deploy.yml)

> A full-featured, serverless e-commerce storefront built with vanilla HTML/CSS/JS and hosted entirely on AWS — no backend servers, no runtime costs at idle.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [AWS Services Used](#aws-services-used)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Setup & Deployment](#setup--deployment)
  - [Option A — PowerShell (one-command deploy)](#option-a--powershell-one-command-deploy)
  - [Option B — GitHub Actions (CI/CD)](#option-b--github-actions-cicd)
- [Configuration](#configuration)
- [Uploading Product Images](#uploading-product-images)
- [Tearing Down Resources](#tearing-down-resources)
- [Security Notes](#security-notes)

---

## Overview

**ShoppersMart** is a responsive Amazon-style storefront that demonstrates how to host a production-quality static website on AWS with zero servers. Key capabilities:

- **Product catalogue** with category browsing, full-text search, sorting, and pagination
- **Shopping cart** with persistent state (localStorage) and order confirmation flow
- **Promotional hero slider** with auto-play and keyboard navigation
- **Today's Deals strip** surfacing discounted products
- **Quick-view modal** with quantity selection and Buy Now shortcut
- **Fully accessible** — semantic HTML, ARIA labels, keyboard navigable throughout

---

## Live Demo

> **Note:** If you have deployed a live instance, replace the placeholder below with your CloudFront URL.  
> You can find your URL by running `.\deploy.ps1` (it is printed at the end) or by checking the `CloudFrontURL` output in the AWS CloudFormation console.

```
https://<your-cloudfront-distribution-id>.cloudfront.net
```

No live demo is published in this repository to avoid exposing AWS account identifiers.

---

## Screenshots

> Add screenshots by dragging images into this section or by replacing the paths below.  
> Suggested captures: homepage, category filter, product modal, cart, mobile view.

| Homepage | Product Modal | Cart |
|----------|--------------|------|
| _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ |

**How to capture screenshots quickly:**
1. Deploy the site with `.\deploy.ps1` and open the printed CloudFront URL.
2. Press **F12 → Toggle device toolbar** to preview the mobile layout.
3. Use your OS screenshot tool or browser's built-in screenshot (`Ctrl+Shift+S` in Firefox DevTools).
4. Save images to a `/docs/screenshots/` folder and update the table above.

---

## Architecture

```
                          ┌─────────────────────────────────────────────┐
                          │              AWS Cloud (us-east-1)           │
                          │                                              │
  Browser ──HTTPS──►  ┌───┴──────────────┐   WAF WebACL                │
                       │   CloudFront CDN  │◄── (SQLi + KnownBadInputs) │
                       │  (HTTP/2 & HTTP/3)│                             │
                       └─────┬──────┬─────┘                             │
                             │      │                                    │
               /images/*  ◄──┘      └──► /* (default)                  │
                             │                         │                 │
                    ┌────────▼────────┐    ┌───────────▼─────────┐     │
                    │  Images S3      │    │  Website S3 Bucket   │     │
                    │  Bucket         │    │  (index.html,        │     │
                    │  (product imgs) │    │   styles.css,        │     │
                    │  OAC-protected  │    │   script.js)         │     │
                    │  Lifecycle:     │    │  OAC-protected       │     │
                    │  60d→Standard-IA│    │  Versioning enabled  │     │
                    │ 180d→Glacier    │    │  Transfer Accel. ON  │     │
                    └─────────────────┘    └─────────────────────┘     │
                                                                         │
                    ┌─────────────────────────────────────────────────┐  │
                    │  CloudWatch Dashboard  (Requests + S3 metrics)  │  │
                    └─────────────────────────────────────────────────┘  │
                          └─────────────────────────────────────────────┘
```

**Traffic flow:**
1. A visitor's browser hits the CloudFront distribution over HTTPS.
2. WAF inspects each request against SQL injection and known-bad-input rule sets before forwarding it.
3. Requests for `/images/*` are routed to the **images S3 bucket** via a dedicated cache behaviour (24 h TTL).
4. All other requests are routed to the **website S3 bucket** (5 min TTL).
5. Both buckets use **Origin Access Control (OAC)** — they are fully private; only CloudFront can read them.
6. CloudWatch metrics are published to a managed dashboard for traffic and S3 request monitoring.

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| **Amazon S3** | Static website hosting (website bucket) and product image storage (images bucket). Both use Transfer Acceleration and versioning. |
| **Amazon CloudFront** | Global CDN — HTTPS termination, HTTP/2+HTTP/3, edge caching, and separate `/images/*` origin routing. |
| **AWS WAF v2** | WebACL attached to CloudFront with `AWSManagedRulesSQLiRuleSet` and `AWSManagedRulesKnownBadInputsRuleSet`. |
| **AWS CloudFormation** | Infrastructure-as-Code — the entire stack is defined in `template.yaml` and deployed atomically. |
| **Amazon CloudWatch** | Dashboard showing CloudFront request volume and S3 `AllRequests` metrics. |
| **GitHub Actions** | CI/CD pipeline — syncs changed website files to S3 and invalidates the CloudFront cache on every push to `main`. |

---

## Repository Structure

```
E-COMMERCE/
├── index.html          # Main storefront (single-page app)
├── styles.css          # All styles — responsive, no CSS framework
├── script.js           # App logic: products, cart, search, modals
├── template.yaml       # CloudFormation template (S3 + CloudFront + WAF)
├── deploy.ps1          # One-command PowerShell deployment script
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions CI/CD pipeline
└── README.md
```

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **AWS CLI v2** | Needed by `deploy.ps1` and the GitHub Actions workflow | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |
| **AWS credentials** | An IAM user or role with CloudFormation, S3, CloudFront, and WAF permissions | `aws configure` |
| **PowerShell 5.1+** | Required to run `deploy.ps1` | Pre-installed on Windows; [available on macOS/Linux](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) |
| **Git** | Source control | [git-scm.com](https://git-scm.com/) |

> **IAM permissions required for deployment:**  
> `cloudformation:*`, `s3:*`, `cloudfront:*`, `wafv2:*`, `iam:CreateServiceLinkedRole`  
> Scope these to the specific stack/resource ARNs in a production environment.

---

## Setup & Deployment

### Option A — PowerShell (one-command deploy)

This is the fastest path for a first deploy or for deploying from your local machine.

```powershell
# Clone the repo
git clone https://github.com/<YOUR_GITHUB_USERNAME>/E-COMMERCE.git
cd E-COMMERCE

# Configure AWS credentials (skip if already configured)
aws configure

# Deploy everything — CloudFormation stack + S3 upload + CloudFront invalidation
.\deploy.ps1
```

The script will:
1. Validate your AWS CLI installation and credentials.
2. Create (or update) the CloudFormation stack `shoppersmart-website` in `us-east-1`.
3. Upload all website files (`index.html`, `styles.css`, `script.js`) to S3 with correct MIME types.
4. Invalidate the CloudFront cache so changes are live immediately.
5. Print the CloudFront URL when complete.

> ⏱ **First deploy takes 5–15 minutes** — CloudFront distribution creation is the slow step. Re-deploys (file updates only) are typically under 60 seconds.

**Optional parameters:**

```powershell
# Deploy to a different region or use a named AWS profile
.\deploy.ps1 -Region "eu-west-1" -Profile "my-aws-profile"

# Specify a custom bucket name (must be globally unique)
.\deploy.ps1 -BucketName "my-shoppersmart-site"
```

---

### Option B — GitHub Actions (CI/CD)

Every push to `main` that touches `index.html`, `styles.css`, `script.js`, or `assets/**` automatically syncs the changed files and invalidates CloudFront.

**1. Run the initial deploy manually** (Option A above) to create the CloudFormation stack and buckets. The GitHub Actions workflow only handles file sync — it does not create infrastructure.

**2. Add the following secrets** to your GitHub repository  
(*Settings → Secrets and variables → Actions → New repository secret*):

| Secret name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key |
| `AWS_REGION` | Region, e.g. `us-east-1` |
| `S3_BUCKET_NAME` | Website bucket name, e.g. `shoppersmart-website-996178` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID, e.g. `E1ABCDEF2GHIJK` |

> 🔒 **Never commit credentials to the repository.** These values belong only in GitHub Secrets.

**3. Push to `main`** — the pipeline runs automatically and prints a deployment summary.

You can find the bucket name and distribution ID in the CloudFormation stack outputs:

```powershell
aws cloudformation describe-stacks `
  --stack-name shoppersmart-website `
  --query "Stacks[0].Outputs" `
  --output table
```

---

## Configuration

### WAF (Web Application Firewall)

WAF is enabled by default. To disable it (e.g. for a cost-sensitive dev environment), pass the parameter during deploy:

```powershell
.\deploy.ps1  # then edit template.yaml to set EnableWAF default to "false"
```

Or deploy the stack directly:

```powershell
aws cloudformation deploy `
  --stack-name shoppersmart-website `
  --template-file template.yaml `
  --parameter-overrides EnableWAF=false `
  --capabilities CAPABILITY_IAM
```

### CloudFront Price Class

The default `PriceClass_100` uses North America and Europe edge locations only (lowest cost). Change it in `template.yaml` under `PriceClass`:

| Value | Coverage |
|-------|----------|
| `PriceClass_100` | North America + Europe (default) |
| `PriceClass_200` | + Asia, Middle East, Africa |
| `PriceClass_All` | All global edge locations |

---

## Uploading Product Images

Product images are served from the images S3 bucket via the `/images/*` CloudFront path.

**Upload a single image:**

```powershell
aws s3 cp .\my-product-photo.jpg `
  s3://<images-bucket-name>/my-product-photo.jpg `
  --content-type "image/jpeg"
```

**Upload an entire images folder:**

```powershell
aws s3 sync .\local-images\ s3://<images-bucket-name>/ `
  --exclude "*" --include "*.jpg" --include "*.png" --include "*.webp"
```

**Use Transfer Acceleration for faster uploads** (especially useful outside `us-east-1`):

```powershell
aws s3 cp .\my-product-photo.jpg `
  s3://<images-bucket-name>/my-product-photo.jpg `
  --endpoint-url https://<images-bucket-name>.s3-accelerate.amazonaws.com
```

> The accelerated endpoint is printed by `deploy.ps1` as `Images accel. URL`. You can also retrieve it from the CloudFormation stack output `ImagesBucketAcceleratedEndpoint`.

Reference an uploaded image in `script.js` by setting `image: "my-product-photo.jpg"` on a product object. The storefront prefixes it with `/images/` automatically and falls back to the emoji placeholder if the file is not found.

---

## Tearing Down Resources

To remove all AWS resources created by this project and stop incurring charges:

```powershell
# 1. Empty both S3 buckets first (CloudFormation cannot delete non-empty buckets)
aws s3 rm s3://<website-bucket-name> --recursive
aws s3 rm s3://<images-bucket-name> --recursive

# 2. Delete the CloudFormation stack (removes S3, CloudFront, WAF, CloudWatch dashboard)
aws cloudformation delete-stack `
  --stack-name shoppersmart-website `
  --region us-east-1
```

> ⚠️ CloudFront distribution deletion can take 15–20 minutes. The stack status will show `DELETE_IN_PROGRESS` until it completes.

---

## Security Notes

- **No credentials in source.** AWS credentials are supplied at runtime via `aws configure` locally, or via GitHub Secrets in CI. Nothing sensitive is committed to this repository.
- **Buckets are fully private.** Both S3 buckets block all public access. Only the CloudFront distribution (authenticated via OAC/SigV4) can read from them.
- **WAF protection.** The CloudFront distribution is fronted by a WAF WebACL with managed rules for SQL injection and known-bad inputs. Additional managed rule groups can be added to `template.yaml`.
- **HTTPS enforced.** The CloudFront distribution is configured with `redirect-to-https` — plain HTTP requests are automatically redirected.
- **Versioning enabled.** Both S3 buckets have versioning on, allowing rollback to a previous deployment if needed.
