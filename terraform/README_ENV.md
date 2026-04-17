# Terraform Environment Usage

## AWS
cd terraform/aws
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply -var-file=env/dev.tfvars

## Azure
cd terraform/azure
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply -var-file=env/dev.tfvars

IMPORTANT
- Replace CHANGE_ME secrets before applying.
- Configure a remote backend (see backend.tf.example).
