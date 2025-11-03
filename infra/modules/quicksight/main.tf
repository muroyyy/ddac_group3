data "aws_caller_identity" "current" {}

# QuickSight Data Source
resource "aws_quicksight_data_source" "bloodbank_rds" {
  data_source_id = "bloodbank-rds-datasource"
  name           = "BloodBank RDS DataSource"
  type           = "MYSQL"

  parameters {
    rds {
      instance_id = var.rds_instance_id
      database    = var.database_name
    }
  }

  credentials {
    credential_pair {
      username = var.db_username
      password = var.db_password
    }
  }

  permission {
    principal = "arn:aws:quicksight:${var.aws_region}:${data.aws_caller_identity.current.account_id}:user/default/${var.quicksight_user}"
    actions = [
      "quicksight:UpdateDataSourcePermissions",
      "quicksight:DescribeDataSource",
      "quicksight:DescribeDataSourcePermissions",
      "quicksight:PassDataSource",
      "quicksight:UpdateDataSource",
      "quicksight:DeleteDataSource"
    ]
  }
}

# QuickSight Data Set
resource "aws_quicksight_data_set" "analytics_dataset" {
  data_set_id = "bloodbank-analytics-dataset"
  name        = "BloodBank Analytics Dataset"
  import_mode = "SPICE"

  physical_table_map {
    physical_table_map_id = "users-table"
    relational_table {
      data_source_arn = aws_quicksight_data_source.bloodbank_rds.arn
      catalog         = var.database_name
      schema          = var.database_name
      name            = "users"
      input_columns {
        name = "user_id"
        type = "INTEGER"
      }
      input_columns {
        name = "full_name"
        type = "STRING"
      }
      input_columns {
        name = "role"
        type = "INTEGER"
      }
      input_columns {
        name = "created_at"
        type = "DATETIME"
      }
      input_columns {
        name = "blood_type"
        type = "STRING"
      }
    }
  }

  permissions {
    principal = "arn:aws:quicksight:${var.aws_region}:${data.aws_caller_identity.current.account_id}:user/default/${var.quicksight_user}"
    actions = [
      "quicksight:UpdateDataSetPermissions",
      "quicksight:DescribeDataSet",
      "quicksight:DescribeDataSetPermissions",
      "quicksight:PassDataSet",
      "quicksight:DescribeIngestion",
      "quicksight:ListIngestions",
      "quicksight:UpdateDataSet",
      "quicksight:DeleteDataSet",
      "quicksight:CreateIngestion",
      "quicksight:CancelIngestion"
    ]
  }
}

# QuickSight Dashboard
resource "aws_quicksight_dashboard" "bloodbank_dashboard" {
  dashboard_id        = "bloodbank-analytics-dashboard"
  name               = "BloodBank Analytics Dashboard"
  version_description = "Initial version"

  definition {
    data_set_identifiers_declarations {
      data_set_arn = aws_quicksight_data_set.analytics_dataset.arn
      identifier   = "users"
    }
  }

  permissions {
    principal = "arn:aws:quicksight:${var.aws_region}:${data.aws_caller_identity.current.account_id}:user/default/${var.quicksight_user}"
    actions = [
      "quicksight:DescribeDashboard",
      "quicksight:ListDashboardVersions",
      "quicksight:UpdateDashboardPermissions",
      "quicksight:QueryDashboard",
      "quicksight:UpdateDashboard",
      "quicksight:DeleteDashboard",
      "quicksight:DescribeDashboardPermissions",
      "quicksight:ExportToCsv"
    ]
  }
}