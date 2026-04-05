import time
import math
import random
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')

devices = {
    "main_breaker": {"status": "on", "name": "Main Breaker"},
    "hvac_system": {"status": "on", "name": "HVAC System"},
    "lighting": {"status": "on", "name": "Lighting"},
    "server_rack": {"status": "on", "name": "Server Rack"},
    "ev_charger": {"status": "off", "name": "EV Charger"},
    "solar_inverter": {"status": "on", "name": "Solar Inverter"}
}

settings_db = {
    "theme": "dark",
    "alert_voltage": 240,
    "alert_power": 5000,
    "notifications": True
}

base_values = {
    "voltage": 220.0,
    "current": 15.0,
}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get('username') == 'admin' and data.get('password') == 'admin':
        return jsonify({"success": True, "token": "mock-jwt-token"})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    t = time.time()
    active_devices = sum(1 for d in devices.values() if d["status"] == "on")
    multiplier = max(0.1, active_devices / len(devices))
    
    voltage_noise = math.sin(t / 5) * 2 + random.uniform(-0.5, 0.5)
    current_noise = math.cos(t / 3) * (5 * multiplier) + random.uniform(-1.0, 1.0)
    
    current_voltage = base_values["voltage"] + voltage_noise
    if active_devices == 0:
        current_amps = random.uniform(0.0, 0.5)
    else:
        current_amps = max(0, (base_values["current"] * multiplier) + current_noise)
        
    power_watts = current_voltage * current_amps
    
    return jsonify({
        "timestamp": t,
        "voltage": round(current_voltage, 2),
        "current": round(current_amps, 2),
        "power": round(power_watts, 2)
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    # Return mock historical data
    period = request.args.get('period', '24h')
    data_points = 24 if period == '24h' else 7
    history = []
    base_t = time.time() - (data_points * 3600)
    
    for i in range(data_points):
        step = 3600 if period == '24h' else 86400
        history.append({
            "timestamp": base_t + (i * step),
            "usage_kwh": random.uniform(10, 50),
            "cost": random.uniform(1, 5)
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
