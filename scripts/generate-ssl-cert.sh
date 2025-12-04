#!/bin/bash

# Generate SSL Certificate for StreamFlix
echo "Generating SSL Certificate for StreamFlix..."

mkdir -p ssl

# Generate RSA-2048 private key
openssl genrsa -out ssl/private.key 2048

# Generate Certificate Signing Request
openssl req -new -key ssl/private.key -out ssl/cert.csr -subj "/C=US/ST=CA/L=San Francisco/O=StreamFlix/OU=IT Department/CN=streamflix.com"

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/private.key -out ssl/cert.pem

# Set proper permissions
chmod 600 ssl/private.key
chmod 644 ssl/cert.pem

# Generate Diffie-Hellman parameters
openssl dhparam -out ssl/dhparam.pem 2048

echo "SSL Certificate generated successfully!"
echo "Files created:"
echo "  - ssl/private.key (RSA-2048 private key)"
echo "  - ssl/cert.pem (SSL certificate)"
echo "  - ssl/dhparam.pem (DH parameters)"