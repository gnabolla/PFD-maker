# SSL Certificate Directory

This directory should contain your SSL certificates for HTTPS configuration.

## Required Files

1. **cert.pem** - Your SSL certificate
2. **key.pem** - Your private key
3. **chain.pem** - Certificate chain (intermediate certificates)

## Generating Self-Signed Certificates (Development Only)

For development purposes, you can generate self-signed certificates:

```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate signing request
openssl req -new -key key.pem -out csr.pem

# Generate self-signed certificate
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# Copy cert as chain for self-signed
cp cert.pem chain.pem
```

## Production Certificates

For production, use certificates from a trusted Certificate Authority (CA) such as:
- Let's Encrypt (free)
- DigiCert
- GlobalSign
- Sectigo

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificates will be in /etc/letsencrypt/live/your-domain.com/
# Copy them to this directory or create symlinks
```

## Security Notes

1. **Never commit private keys to version control**
2. Set appropriate file permissions:
   ```bash
   chmod 600 key.pem
   chmod 644 cert.pem chain.pem
   ```
3. Regularly renew certificates before expiration
4. Use strong key sizes (minimum 2048-bit RSA or 256-bit ECC)