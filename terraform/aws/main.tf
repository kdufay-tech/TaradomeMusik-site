# Baseline AWS resources (skeleton)
# - VPC, subnets, IGW, NAT
# - ECS cluster + services (web, api, workers)
# - ALB + target groups
# - RDS Postgres (recommended managed)
# - ElastiCache Redis
# - S3 bucket for media assets
# NOTE: Fill in CIDRs, service definitions, and task definitions per your container images.

resource "aws_s3_bucket" "media" {
  bucket = "${var.project}-${var.env}-media"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "media_bucket" {
  value = aws_s3_bucket.media.bucket
}
