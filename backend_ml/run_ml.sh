#!/bin/bash

echo "========================================"
echo "  Starting Campus Fix ML Service"
echo "========================================"
echo ""
echo "Checking Python installation..."
python3 --version
echo ""
echo "Starting ML API on http://localhost:8000"
echo ""
python3 ml_api.py

