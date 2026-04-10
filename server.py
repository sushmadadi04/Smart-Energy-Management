import time
import math
import random
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')

devices = {
    "main_breaker": {"status": "on", "name": "Main Breaker", "base_power": 50},
    "lights": {"status": "on", "name": "Lights", "base_power": 500},
    "fans": {"status": "on", "name": "Fans", "base_power": 300},
    "solar_inverter": {"status": "on", "name": "Solar Inverter", "base_power": -1500}, # Provides power
    "hvac_system": {"status": "on", "name": "HVAC System", "base_power": 2500}
}

settings_db = {
    "theme": "dark",
    "alert_voltage": 240,
    "alert_current": 50,
    "notifications": True
}

base_values = {
    "voltage": 220.0,
}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get('username') == 'admin' and data.get('password') == 'admin':
        return jsonify({"success": True, "token": "mock-jwt-token"})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    t = time.time()
    
    # Calculate power for each device based on its base_power and some noise
    # Main breaker being off means all are 0
    main_on = devices["main_breaker"]["status"] == "on"
    
    device_power_draw = {}
    total_power = 0
    
    current_voltage = base_values["voltage"] + (math.sin(t / 5) * 2 + random.uniform(-0.5, 0.5))

    for key, info in devices.items():
        # The main breaker itself will have a small baseline power draw if it is ON
        if main_on and info["status"] == "on":
            noise_factor = (math.cos(t / 3) * 0.1) + random.uniform(-0.05, 0.05)
            # Apply individual power draw
            power = info["base_power"] * (1 + noise_factor)
            device_power_draw[key] = round(power, 2)
            total_power += power
        else:
            device_power_draw[key] = 0.0
            
    # Add a small base power if main breaker is on
    if main_on:
        total_power += 50 + random.uniform(-5, 5)
        
    current_amps = max(0, total_power / current_voltage) if total_power > 0 else 0
    
    return jsonify({
        "timestamp": t,
        "voltage": round(current_voltage, 2),
        "current": round(current_amps, 2),
        "power": round(total_power, 2),
        "device_power": device_power_draw
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    period = request.args.get('period', '24h')
    data_points = 24 if period == '24h' else 7
    history = []
    base_t = time.time() - (data_points * 3600 if period == '24h' else data_points * 86400)
    
    for i in range(data_points):
        step = 3600 if period == '24h' else 86400
        history.append({
            "timestamp": base_t + (i * step),
            "usage_kwh": random.uniform(10, 50) if period == '24h' else random.uniform(200, 500),
            "cost": random.uniform(100, 500) if period == '24h' else random.uniform(2000, 5000) # INR
        })
        
    return jsonify({
        "period": period,
        "history": history,
        "total_usage": round(sum(h['usage_kwh'] for h in history), 2),
        "total_cost": round(sum(h['cost'] for h in history), 2)
    })

@app.route('/api/devices', methods=['GET'])
def get_devices():
    return jsonify(devices)

@app.route('/api/devices/<device_id>', methods=['POST'])
def toggle_device(device_id):
    if device_id in devices:
        data = request.json
        devices[device_id]["status"] = data.get("status", "off")
        return jsonify({"success": True, "device": devices[device_id]})
    return jsonify({"error": "Device not found"}), 404

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'POST':
        data = request.json
        settings_db.update(data)
        return jsonify({"success": True, "settings": settings_db})
    return jsonify(settings_db)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

