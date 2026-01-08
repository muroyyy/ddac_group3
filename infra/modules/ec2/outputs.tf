output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.main.id
}

output "public_ip" {
  description = "EC2 public IP"
  value       = aws_eip.main.public_ip
}

output "public_dns" {
  description = "EC2 public DNS name"
  value       = aws_eip.main.public_dns
}