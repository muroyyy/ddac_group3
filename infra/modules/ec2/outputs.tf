output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.main.id
}

output "public_ip" {
  description = "EC2 Elastic IP"
  value       = aws_eip.main.public_ip
}