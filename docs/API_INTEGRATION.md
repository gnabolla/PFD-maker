# API Integration Guide

This guide provides comprehensive documentation for integrating with the PDS Maker API. The API follows RESTful principles and uses JWT authentication for secure access.

## Table of Contents

1. [Base URL and Setup](#base-url-and-setup)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Code Examples](#code-examples)

## Base URL and Setup

### Development
```
http://localhost:3001/api
```

### Production
```
https://api.pdsmaker.ph/api
```

### Request Headers

All API requests should include the following headers:

```http
Content-Type: application/json
Accept: application/json
```

For authenticated endpoints, include:

```http
Authorization: Bearer <your-jwt-token>
```

## Authentication

### Registration

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "organization": "Department of Health"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "organization": "Department of Health",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "role": "user"
  }
}
```

### Get User Profile

Retrieve the authenticated user's profile.

**Endpoint:** `GET /auth/profile` *(Protected)*

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "organization": "Department of Health",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile` *(Protected)*

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "organization": "Department of Education"
}
```

### Change Password

Update user password.

**Endpoint:** `POST /auth/change-password` *(Protected)*

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

## API Endpoints

### PDS Management

All PDS endpoints require authentication.

#### List PDS Records

Get all PDS records for the authenticated user.

**Endpoint:** `GET /pds`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (draft, validated, completed)

**Response:**
```json
{
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "status": "draft",
      "personalInformation": {
        "firstName": "Juan",
        "surname": "Dela Cruz",
        "middleName": "Santos"
      },
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Create PDS Record

Create a new PDS record.

**Endpoint:** `POST /pds`

**Request Body:**
```json
{
  "personalInformation": {
    "surname": "DELA CRUZ",
    "firstName": "JUAN",
    "middleName": "SANTOS",
    "nameExtension": "JR",
    "dateOfBirth": "01/15/1985",
    "placeOfBirth": "Manila City",
    "civilStatus": "Married",
    "height": "1.70",
    "weight": "70",
    "bloodType": "O+",
    "gsisId": "11-1234567-8",
    "pagibigId": "1234-5678-9012",
    "philhealthId": "12-345678901-2",
    "sssId": "34-5678901-2",
    "tinId": "123-456-789-000",
    "citizenship": "Filipino",
    "residentialAddress": {
      "houseBlockLotNumber": "123",
      "street": "Rizal Street",
      "subdivisionVillage": "San Antonio Village",
      "barangay": "Barangay 123",
      "cityMunicipality": "Quezon City",
      "province": "Metro Manila",
      "zipCode": "1100"
    },
    "permanentAddress": {
      "houseBlockLotNumber": "456",
      "street": "Bonifacio Street",
      "subdivisionVillage": "San Pedro Village",
      "barangay": "Barangay 456",
      "cityMunicipality": "Manila City",
      "province": "Metro Manila",
      "zipCode": "1000"
    },
    "telephoneNumber": "02-1234567",
    "mobileNumber": "09171234567",
    "emailAddress": "juan.delacruz@email.com"
  },
  "familyBackground": {
    "spouse": {
      "surname": "DELA CRUZ",
      "firstName": "MARIA",
      "middleName": "REYES",
      "occupation": "Teacher",
      "employerBusinessName": "Department of Education",
      "businessAddress": "DepEd Complex, Pasig City",
      "telephoneNumber": "02-8901234"
    },
    "father": {
      "surname": "DELA CRUZ",
      "firstName": "PEDRO",
      "middleName": "GARCIA"
    },
    "mother": {
      "maidenName": "SANTOS",
      "surname": "DELA CRUZ",
      "firstName": "LUCIA",
      "middleName": "RIVERA"
    },
    "children": [
      {
        "fullName": "JUAN DELA CRUZ JR",
        "dateOfBirth": "06/15/2010"
      },
      {
        "fullName": "MARIA DELA CRUZ",
        "dateOfBirth": "12/20/2012"
      }
    ]
  }
}
```

#### Get PDS Record

Retrieve a specific PDS record.

**Endpoint:** `GET /pds/:id`

#### Update PDS Record

Update an existing PDS record.

**Endpoint:** `PUT /pds/:id`

**Request Body:** Same structure as Create PDS, with only the fields to update.

#### Delete PDS Record

Delete a PDS record.

**Endpoint:** `DELETE /pds/:id`

#### Validate PDS

Validate PDS data against CSC requirements.

**Endpoint:** `POST /pds/:id/validate`

**Response:**
```json
{
  "isValid": false,
  "errors": [
    {
      "field": "personalInformation.dateOfBirth",
      "message": "Date format must be MM/DD/YYYY",
      "code": "INVALID_DATE_FORMAT",
      "severity": "error",
      "suggestion": "Change '15/01/1985' to '01/15/1985'"
    }
  ],
  "warnings": [
    {
      "field": "educationalBackground.elementary.nameOfSchool",
      "message": "School name appears to contain abbreviation",
      "code": "POSSIBLE_ABBREVIATION",
      "severity": "warning",
      "suggestion": "Write full name instead of 'St. Mary's Elem. School'"
    }
  ]
}
```

### File Export

Export PDS data in various formats.

#### Export to Excel

**Endpoint:** `GET /export/pds/:id/excel`

**Response:** Binary Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

#### Export to Word

**Endpoint:** `GET /export/pds/:id/word`

**Response:** Binary Word file (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

#### Export to PDF

**Endpoint:** `GET /export/pds/:id/pdf`

**Response:** Binary PDF file (application/pdf)

### System Endpoints

#### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

#### Readiness Check

**Endpoint:** `GET /health/ready`

**Response:**
```json
{
  "status": "ready",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages.

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional information"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Business logic error |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

### Validation Error Example

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "personalInformation.email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "personalInformation.dateOfBirth",
      "message": "Date must be in MM/DD/YYYY format"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (configurable)
- **Max Requests:** 100 per window (configurable)
- **Headers:** Rate limit information is included in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

## Code Examples

### JavaScript (Node.js)

```javascript
const axios = require('axios');

class PDSMakerClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email,
        password
      });
      this.token = response.data.token;
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async createPDS(pdsData) {
    try {
      const response = await axios.post(`${this.baseURL}/pds`, pdsData, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async validatePDS(pdsId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/pds/${pdsId}/validate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async exportPDS(pdsId, format = 'pdf') {
    try {
      const response = await axios.get(
        `${this.baseURL}/export/pds/${pdsId}/${format}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          responseType: 'arraybuffer'
        }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

// Usage example
async function main() {
  const client = new PDSMakerClient();
  
  // Login
  await client.login('user@example.com', 'password123');
  
  // Create PDS
  const pds = await client.createPDS({
    personalInformation: {
      surname: 'DELA CRUZ',
      firstName: 'JUAN',
      middleName: 'SANTOS',
      // ... other fields
    }
  });
  
  // Validate PDS
  const validation = await client.validatePDS(pds.id);
  console.log('Validation result:', validation);
  
  // Export to PDF
  const pdfBuffer = await client.exportPDS(pds.id, 'pdf');
  require('fs').writeFileSync('pds.pdf', pdfBuffer);
}

main().catch(console.error);
```

### Python

```python
import requests
import json
from typing import Dict, Optional

class PDSMakerClient:
    def __init__(self, base_url: str = "http://localhost:3001/api"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def login(self, email: str, password: str) -> Dict:
        """Authenticate user and store JWT token"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data['token']
        self.session.headers['Authorization'] = f"Bearer {self.token}"
        return data
    
    def create_pds(self, pds_data: Dict) -> Dict:
        """Create a new PDS record"""
        response = self.session.post(
            f"{self.base_url}/pds",
            json=pds_data
        )
        response.raise_for_status()
        return response.json()
    
    def get_pds(self, pds_id: str) -> Dict:
        """Retrieve a specific PDS record"""
        response = self.session.get(f"{self.base_url}/pds/{pds_id}")
        response.raise_for_status()
        return response.json()
    
    def validate_pds(self, pds_id: str) -> Dict:
        """Validate PDS data against CSC requirements"""
        response = self.session.post(
            f"{self.base_url}/pds/{pds_id}/validate"
        )
        response.raise_for_status()
        return response.json()
    
    def export_pds(self, pds_id: str, format: str = 'pdf') -> bytes:
        """Export PDS in specified format"""
        response = self.session.get(
            f"{self.base_url}/export/pds/{pds_id}/{format}",
            stream=True
        )
        response.raise_for_status()
        return response.content

# Usage example
if __name__ == "__main__":
    client = PDSMakerClient()
    
    # Login
    client.login("user@example.com", "password123")
    
    # Create PDS
    pds_data = {
        "personalInformation": {
            "surname": "DELA CRUZ",
            "firstName": "JUAN",
            "middleName": "SANTOS",
            "dateOfBirth": "01/15/1985",
            "placeOfBirth": "Manila City",
            "civilStatus": "Married",
            # ... other fields
        }
    }
    
    pds = client.create_pds(pds_data)
    print(f"Created PDS with ID: {pds['id']}")
    
    # Validate
    validation_result = client.validate_pds(pds['id'])
    if not validation_result['isValid']:
        print("Validation errors:")
        for error in validation_result['errors']:
            print(f"- {error['field']}: {error['message']}")
    
    # Export to PDF
    pdf_content = client.export_pds(pds['id'], 'pdf')
    with open('pds_export.pdf', 'wb') as f:
        f.write(pdf_content)
```

### PHP

```php
<?php

class PDSMakerClient {
    private $baseURL;
    private $token;
    
    public function __construct($baseURL = 'http://localhost:3001/api') {
        $this->baseURL = $baseURL;
        $this->token = null;
    }
    
    public function login($email, $password) {
        $response = $this->request('POST', '/auth/login', [
            'email' => $email,
            'password' => $password
        ]);
        
        $this->token = $response['token'];
        return $response;
    }
    
    public function createPDS($pdsData) {
        return $this->request('POST', '/pds', $pdsData, true);
    }
    
    public function getPDS($pdsId) {
        return $this->request('GET', "/pds/{$pdsId}", null, true);
    }
    
    public function validatePDS($pdsId) {
        return $this->request('POST', "/pds/{$pdsId}/validate", [], true);
    }
    
    public function exportPDS($pdsId, $format = 'pdf') {
        $ch = curl_init($this->baseURL . "/export/pds/{$pdsId}/{$format}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Export failed with status code: {$httpCode}");
        }
        
        return $response;
    }
    
    private function request($method, $endpoint, $data = null, $authenticated = false) {
        $ch = curl_init($this->baseURL . $endpoint);
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        if ($authenticated && $this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            throw new Exception($error['error'] ?? "Request failed with status code: {$httpCode}");
        }
        
        return json_decode($response, true);
    }
}

// Usage example
try {
    $client = new PDSMakerClient();
    
    // Login
    $client->login('user@example.com', 'password123');
    
    // Create PDS
    $pdsData = [
        'personalInformation' => [
            'surname' => 'DELA CRUZ',
            'firstName' => 'JUAN',
            'middleName' => 'SANTOS',
            'dateOfBirth' => '01/15/1985',
            'placeOfBirth' => 'Manila City',
            // ... other fields
        ]
    ];
    
    $pds = $client->createPDS($pdsData);
    echo "Created PDS with ID: " . $pds['id'] . "\n";
    
    // Validate
    $validation = $client->validatePDS($pds['id']);
    if (!$validation['isValid']) {
        echo "Validation errors:\n";
        foreach ($validation['errors'] as $error) {
            echo "- {$error['field']}: {$error['message']}\n";
        }
    }
    
    // Export to PDF
    $pdfContent = $client->exportPDS($pds['id'], 'pdf');
    file_put_contents('pds_export.pdf', $pdfContent);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

## Best Practices

1. **Token Storage**: Store JWT tokens securely (e.g., in environment variables or secure storage, not in plain text)

2. **Error Handling**: Always implement proper error handling for API responses

3. **Rate Limiting**: Implement exponential backoff when encountering rate limits

4. **Data Validation**: Validate data client-side before sending to reduce API calls

5. **Batch Operations**: When processing multiple PDS records, consider implementing queuing to avoid rate limits

6. **File Downloads**: For large file exports, implement progress tracking and resume capabilities

7. **Timeout Handling**: Set appropriate timeouts for file upload/download operations

8. **Logging**: Log all API interactions for debugging and audit purposes

## Support

For API support and questions:

- Documentation: https://docs.pdsmaker.ph
- GitHub Issues: https://github.com/pds-maker/api/issues
- Email: api-support@pdsmaker.ph
- Developer Discord: https://discord.gg/pds-maker-dev