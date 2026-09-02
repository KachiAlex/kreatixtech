#!/bin/sh
curl -s -X POST http://127.0.0.1:5180/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"akoma@kreatixtech.com","password":"dikaoliver2660","name":"Akoma","adminSecret":"KreatixAdmin2026!Secret_Xy9Lm"}'
echo ""
