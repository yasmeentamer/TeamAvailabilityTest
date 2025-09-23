# EC2 for App
resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"   # Example Ubuntu AMI
  instance_type = var.instance_type
  tags = { Name = "myTA-app" }

  user_data = <<-EOT
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              docker run -d -p 3000:3000 \
                -e REDIS_HOST=${aws_instance.redis.private_ip} \
                -e POSTGRES_HOST=${aws_instance.postgres.private_ip} \
                yasmeen/myta-app:latest
              EOT
}

# EC2 for Redis
resource "aws_instance" "redis" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  tags = { Name = "myTA-redis" }

  user_data = <<-EOT
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              docker run -d -p 6379:6379 redis:7
              EOT
}

# EC2 for Postgres
resource "aws_instance" "postgres" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  tags = { Name = "myTA-postgres" }

  user_data = <<-EOT
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              docker run -d -p 5432:5432 \
                -e POSTGRES_USER=admin \
                -e POSTGRES_PASSWORD=admin123 \
                -e POSTGRES_DB=mytadb \
                postgres:15
              EOT
}
