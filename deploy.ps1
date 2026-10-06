#Requires -Version 5.1
<#
.SYNOPSIS
    Deploys ShoppersMart to S3 + CloudFront via CloudFormation.

.PARAMETER StackName
    Name of the CloudFormation stack. Default: shoppersmart-website

.PARAMETER BucketName
    Globally unique S3 bucket name.   Default: shoppersmart-website-<random>

.PARAMETER Region
    AWS region to deploy into.        Default: us-east-1

.PARAMETER Profile
    AWS CLI named profile to use.     Default: (default profile)

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -BucketName "my-shoppersmart" -Region "eu-west-1"
#>

[CmdletBinding()]
param (
    [string]$StackName       = "shoppersmart-website",
    [string]$BucketName      = "",
    [string]$ImagesBucketName = "",
    [string]$Region          = "us-east-1",
    [string]$Profile         = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Generate random bucket names if none supplied
if ($BucketName -eq "") {
    $rand       = Get-Random -Minimum 100000 -Maximum 999999
    $BucketName = "shoppersmart-website-$rand"
}
if ($ImagesBucketName -eq "") {
    $rand             = Get-Random -Minimum 100000 -Maximum 999999
    $ImagesBucketName = "shoppersmart-images-$rand"
}

# -------------------------------------------------------
# Helper functions
# -------------------------------------------------------

function Write-Step([string]$msg) {
    Write-Host ""
    Write-Host ">> $msg" -ForegroundColor Cyan
}

function Write-Ok([string]$msg) {
    Write-Host "   OK  $msg" -ForegroundColor Green
}

function Write-Err([string]$msg) {
    Write-Host "   ERR $msg" -ForegroundColor Red
}

function Get-AwsBaseArgs {
    $base = @("--region", $Region, "--output", "json")
    if ($Profile -ne "") { $base += @("--profile", $Profile) }
    return $base
}

# -------------------------------------------------------
# Step 1 - Check AWS CLI is installed
# -------------------------------------------------------

Write-Step "Step 1 - Checking AWS CLI"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Err "AWS CLI not found. Download from https://aws.amazon.com/cli/ then re-run."
    exit 1
}

$version = aws --version 2>&1
Write-Ok "AWS CLI found: $version"

# -------------------------------------------------------
# Step 2 - Verify AWS credentials
# -------------------------------------------------------

Write-Step "Step 2 - Verifying AWS credentials"

try {
    $identityJson = aws sts get-caller-identity @(Get-AwsBaseArgs)
    $identity     = $identityJson | ConvertFrom-Json
    Write-Ok "Signed in as: $($identity.Arn)"
} catch {
    Write-Err "Credentials invalid or not configured. Run: aws configure"
    exit 1
}

# -------------------------------------------------------
# Step 3 - Check template.yaml exists
# -------------------------------------------------------

Write-Step "Step 3 - Locating template.yaml"

$ScriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplatePath = Join-Path $ScriptDir "template.yaml"

if (-not (Test-Path $TemplatePath)) {
    Write-Err "template.yaml not found at: $TemplatePath"
    exit 1
}

Write-Ok "Found: $TemplatePath"

# -------------------------------------------------------
# Step 3b - If the stack already exists, reuse its bucket
#           names so CloudFormation does not try to replace
#           the S3 buckets (S3 buckets cannot be renamed).
# -------------------------------------------------------

$stackExists = $false
try {
    $existingStack = aws cloudformation describe-stacks --stack-name $StackName @(Get-AwsBaseArgs) | ConvertFrom-Json
    $stackExists   = $true
    $existingParams = $existingStack.Stacks[0].Parameters

    $existingBucket = ($existingParams | Where-Object { $_.ParameterKey -eq "BucketName"       }).ParameterValue
    $existingImages = ($existingParams | Where-Object { $_.ParameterKey -eq "ImagesBucketName" }).ParameterValue

    if ($existingBucket -and $BucketName -ne $existingBucket) {
        Write-Host "   Reusing existing website bucket: $existingBucket" -ForegroundColor DarkYellow
        $BucketName = $existingBucket
    }
    if ($existingImages -and $ImagesBucketName -ne $existingImages) {
        Write-Host "   Reusing existing images bucket : $existingImages" -ForegroundColor DarkYellow
        $ImagesBucketName = $existingImages
    }
} catch {
    # Stack does not exist yet - first deploy, use generated names
    $stackExists = $false
}

# -------------------------------------------------------
# Step 4 - Deploy CloudFormation stack
# -------------------------------------------------------

Write-Step "Step 4 - Deploying CloudFormation stack '$StackName'"
Write-Host "   Bucket name        : $BucketName"        -ForegroundColor Gray
Write-Host "   Images bucket name : $ImagesBucketName"  -ForegroundColor Gray
Write-Host "   Region             : $Region"            -ForegroundColor Gray
Write-Host "   Note: CloudFront distribution creation takes 5-15 minutes." -ForegroundColor DarkYellow

$cfnArgs = @(
    "cloudformation", "deploy",
    "--stack-name",          $StackName,
    "--template-file",       $TemplatePath,
    "--parameter-overrides", "BucketName=$BucketName", "ImagesBucketName=$ImagesBucketName",
    "--capabilities",        "CAPABILITY_IAM",
    "--no-fail-on-empty-changeset"
) + (Get-AwsBaseArgs)

aws @cfnArgs

if ($LASTEXITCODE -ne 0) {
    Write-Err "CloudFormation deploy failed. Open the AWS Console -> CloudFormation for details."
    exit 1
}

Write-Ok "Stack deployed."

# -------------------------------------------------------
# Step 5 - Read outputs from the stack
# -------------------------------------------------------

Write-Step "Step 5 - Reading stack outputs"

$stackRaw  = aws cloudformation describe-stacks --stack-name $StackName @(Get-AwsBaseArgs)
$stackObj  = $stackRaw | ConvertFrom-Json
$outputs   = $stackObj.Stacks[0].Outputs

$ActualBucket           = ($outputs | Where-Object { $_.OutputKey -eq "BucketName"                     }).OutputValue
$ActualImagesBucket     = ($outputs | Where-Object { $_.OutputKey -eq "ImagesBucketName"               }).OutputValue
$CloudFrontURL          = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontURL"                  }).OutputValue
$CloudFrontDomain       = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontDomainName"           }).OutputValue
$DistributionId         = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontDistributionId"       }).OutputValue
$WebsiteURL             = ($outputs | Where-Object { $_.OutputKey -eq "WebsiteURL"                     }).OutputValue
$DashboardURL           = ($outputs | Where-Object { $_.OutputKey -eq "DashboardURL"                   }).OutputValue
$ImagesPath             = ($outputs | Where-Object { $_.OutputKey -eq "ImagesCloudFrontPath"           }).OutputValue
$ImagesAccelEndpoint    = ($outputs | Where-Object { $_.OutputKey -eq "ImagesBucketAcceleratedEndpoint"}).OutputValue

Write-Ok "Website bucket     : $ActualBucket"
Write-Ok "Images bucket      : $ActualImagesBucket"
Write-Ok "CloudFront URL     : $CloudFrontURL"
Write-Ok "Images CDN path    : $ImagesPath"
Write-Ok "Distribution ID    : $DistributionId"
Write-Ok "Dashboard          : $DashboardURL"
Write-Ok "Images accel. URL  : $ImagesAccelEndpoint (use for fast image uploads)"
Write-Ok "S3 website URL     : $WebsiteURL (direct access blocked - for reference only)"

# -------------------------------------------------------
# Step 6 - Upload website files
# -------------------------------------------------------

Write-Step "Step 6 - Uploading website files to s3://$ActualBucket"

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".txt"   = "text/plain"
}

$excludeFiles = @("template.yaml", "deploy.ps1", ".gitignore")

$files = Get-ChildItem -Path $ScriptDir -File |
         Where-Object { $excludeFiles -notcontains $_.Name }

if ($files.Count -eq 0) {
    Write-Err "No website files found in $ScriptDir"
    exit 1
}

foreach ($file in $files) {
    $ext      = $file.Extension.ToLower()
    $mimeType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
    $s3Uri    = "s3://$ActualBucket/$($file.Name)"

    Write-Host "   Uploading $($file.Name) ..." -ForegroundColor Gray

    $uploadArgs = @(
        "s3", "cp",
        $file.FullName, $s3Uri,
        "--content-type",  $mimeType,
        "--cache-control", "max-age=300"
    ) + (Get-AwsBaseArgs)

    aws @uploadArgs

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to upload $($file.Name)"
        exit 1
    }
}

Write-Ok "All files uploaded."

# -------------------------------------------------------
# Step 7 - Invalidate CloudFront cache
# Ensures visitors immediately see the newly uploaded files
# rather than stale cached content from a previous deploy.
# -------------------------------------------------------

Write-Step "Step 7 - Invalidating CloudFront cache (distribution: $DistributionId)"

$invalidationArgs = @(
    "cloudfront", "create-invalidation",
    "--distribution-id", $DistributionId,
    "--paths",           "/*"
) + (Get-AwsBaseArgs)

$invalidationRaw = aws @invalidationArgs
if ($LASTEXITCODE -ne 0) {
    Write-Err "Cache invalidation failed. You can retry manually:"
    Write-Host "   aws cloudfront create-invalidation --distribution-id $DistributionId --paths '/*'" -ForegroundColor Gray
    # Non-fatal - files are still uploaded; the cache will expire on its own.
} else {
    $invalidation   = $invalidationRaw | ConvertFrom-Json
    $invalidationId = $invalidation.Invalidation.Id
    Write-Ok "Invalidation created: $invalidationId (propagates within ~60 seconds)"
}

# -------------------------------------------------------
# Done
# -------------------------------------------------------

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "  ShoppersMart is live!"                                  -ForegroundColor Yellow
Write-Host ""
Write-Host "  Website URL  : $CloudFrontURL"      -ForegroundColor White
Write-Host "  Images path  : $ImagesPath"         -ForegroundColor White
Write-Host "  Dashboard    : $DashboardURL"        -ForegroundColor White
Write-Host "  Web Bucket   : $ActualBucket"        -ForegroundColor White
Write-Host "  Img Bucket   : $ActualImagesBucket"  -ForegroundColor White
Write-Host "  Stack Name   : $StackName"       -ForegroundColor White
Write-Host "  Region       : $Region"          -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Open the URL above in your browser to view the site."
Write-Host ""
Write-Host "  To redeploy files only (no CloudFormation change):"
Write-Host "    Re-run this script - it will upload files and invalidate the cache."
Write-Host ""
Write-Host "  To remove all AWS resources later:"
Write-Host "    aws s3 rm s3://$ActualBucket --recursive"
Write-Host "    aws s3 rm s3://$ActualImagesBucket --recursive"
Write-Host "    aws cloudformation delete-stack --stack-name $StackName --region $Region"
Write-Host ""
