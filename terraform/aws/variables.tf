variable "aws_region" { type = string }
variable "project" { type = string default = "taradome" }
variable "env" { type = string default = "prod" }
variable "db_username" { type = string }
variable "db_password" { type = string sensitive = true }
