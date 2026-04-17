resource "azurerm_resource_group" "rg" {
  name     = "${var.project}-${var.env}-rg"
  location = var.location
}

resource "azurerm_storage_account" "media" {
  name                     = replace("${var.project}${var.env}media", "-", "")
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
}

output "storage_account_name" {
  value = azurerm_storage_account.media.name
}
