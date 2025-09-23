output "app_public_ip" {
  description = "Public IP of the App Server"
  value       = aws_instance.app.public_ip
}

output "redis_public_ip" {
  description = "Public IP of the Redis Server"
  value       = aws_instance.redis.public_ip
}

output "postgres_public_ip" {
  description = "Public IP of the Postgres Server"
  value       = aws_instance.postgres.public_ip
}
