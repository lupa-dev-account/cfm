#!/bin/bash
# Script to update passwords via Supabase Management API
# Usage: ./update-passwords-api.sh

# Configuration - UPDATE THESE VALUES
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"

# User UUIDs (from your fix-authentication.sql)
ADMIN_UUID="4cb06658-7033-4be4-b8e3-0fe4d7ec888f"
COMPADMIN_UUID="2188be2b-f26a-4b5f-ad39-8ca4a73d17a2"
EMPLOYEE_UUID="2d33a610-a160-43f7-b438-dedc7c9d7602"

# New passwords
ADMIN_PASSWORD="admin123"
COMPADMIN_PASSWORD="compadmin123"
EMPLOYEE_PASSWORD="agostinho123"

echo "Updating passwords via Supabase Management API..."
echo ""

# Update Super Admin
echo "Updating Super Admin password..."
curl -X PUT "${SUPABASE_URL}/auth/v1/admin/users/${ADMIN_UUID}" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"${ADMIN_PASSWORD}\"}" \
  -w "\nStatus: %{http_code}\n\n"

# Update Company Admin
echo "Updating Company Admin password..."
curl -X PUT "${SUPABASE_URL}/auth/v1/admin/users/${COMPADMIN_UUID}" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"${COMPADMIN_PASSWORD}\"}" \
  -w "\nStatus: %{http_code}\n\n"

# Update Employee
echo "Updating Employee password..."
curl -X PUT "${SUPABASE_URL}/auth/v1/admin/users/${EMPLOYEE_UUID}" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"${EMPLOYEE_PASSWORD}\"}" \
  -w "\nStatus: %{http_code}\n\n"

echo "Done! Check the HTTP status codes above (200 = success)"








