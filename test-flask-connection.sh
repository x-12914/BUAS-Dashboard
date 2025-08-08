#!/bin/bash
# test-flask-connection.sh - Test if Flask backend is responding

echo "🔍 Testing Flask backend connection..."

FLASK_URL="http://143.244.133.125:5000"
LOCAL_FLASK_URL="http://localhost:5000"

# Test VPS Flask
echo "Testing VPS Flask at $FLASK_URL"
if curl -s -u admin:supersecret "$FLASK_URL/api/health" > /dev/null; then
    echo "✅ VPS Flask is responding"
    
    # Test dashboard data endpoint
    echo "Testing dashboard data endpoint..."
    response=$(curl -s -u admin:supersecret "$FLASK_URL/api/dashboard-data")
    if [[ $response == *"connection_status"* ]]; then
        echo "✅ Flask dashboard data endpoint working"
        echo "📊 Sample response: $(echo $response | head -c 100)..."
    else
        echo "❌ Dashboard data endpoint not returning expected data"
    fi
else
    echo "❌ VPS Flask not responding"
    
    # Test local Flask as fallback
    echo "Testing local Flask at $LOCAL_FLASK_URL"
    if curl -s -u admin:supersecret "$LOCAL_FLASK_URL/api/health" > /dev/null; then
        echo "✅ Local Flask is responding"
    else
        echo "❌ Local Flask also not responding"
        echo "🔧 Make sure Flask backend is running on port 5000"
    fi
fi

echo "🏁 Flask connection test complete"
