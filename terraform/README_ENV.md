# Terraform Environment Usage

No environment has been built from these templates (owner, 22 Oct 2026).

## AWS
The AWS variable files set `db_password`, so only templates are tracked:
`env/dev.tfvars.example`, `env/staging.tfvars.example`, `env/prod.tfvars.example`.
`terraform/aws/env/*.tfvars` is git-ignored: copy a template, set real values in the copy, never commit it.

Windows (PowerShell):
```
cd "C:\Users\kdufa\App Development\taradomemusik-site\terraform\aws"
Copy-Item env\dev.tfvars.example env\dev.tfvars
# edit env\dev.tfvars: replace CHANGE_ME (or delete the db_password line and set $env:TF_VAR_db_password;
# a value in the -var-file overrides TF_VAR_*)
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply -var-file=env/dev.tfvars
```

Mac (Terminal), from the repo root:
```
cd terraform/aws
cp env/dev.tfvars.example env/dev.tfvars
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply -var-file=env/dev.tfvars
```

## Azure
The Azure variable files hold no secrets and stay tracked.
```
cd terraform/azure
terraform init
terraform plan -var-file=env/dev.tfvars
terraform apply -var-file=env/dev.tfvars
```

IMPORTANT
- Replace CHANGE_ME secrets before applying; keep real secrets in a secret store, never in git.
- Configure a remote backend (see backend.tf.example).
