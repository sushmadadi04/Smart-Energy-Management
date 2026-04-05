const { useState, useEffect, useRef } = React;

// Main App Component with Routing
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [route, setRoute] = useState('dashboard');
    const [theme, setTheme] = useState('dark');

    const handleLogin = (t) => {
        localStorage.setItem('token', t);
        setToken(t);
        setRoute('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className={`dashboard-wrap ${theme}`}>
            <Sidebar route={route} setRoute={setRoute} />
            <main className="main-content">
                <Topbar route={route} onLogout={handleLogout} />
                {route === 'dashboard' && <Dashboard />}
                {route === 'analytics' && <Analytics />}
                {route === 'devices' && <Devices />}
                {route === 'settings' && <Settings theme={theme} setTheme={setTheme} />}
            </main>
        </div>
    );
}

// Topbar
function Topbar({ route, onLogout }) {
    const titles = {
        'dashboard': 'Energy Overview',
        'analytics': 'Analytics & History',
        'devices': 'Device Infrastructure',
        'settings': 'System Settings'
    };
    const subtitles = {
        'dashboard': 'Live monitoring and control matrix.',
        'analytics': 'Historical power consumption arrays.',
        'devices': 'Remotely manage your connected nodes.',
        'settings': 'Configure alarms and dashboard theme.'
    };

    return (
        <header>
            <div>
                <h1>{titles[route] || 'Dashboard'}</h1>
                <p className="subtitle">{subtitles[route]}</p>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
                <div className="status-indicator">
                    <span className="pulse"></span> System Online
                </div>
                <button className="logout-btn glass" onClick={onLogout} title="Logout" style={{padding: '8px 12px', border: '1px solid var(--border-color)', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: '8px', cursor: 'pointer', transition: '0.3s'}}>
                    <i className="ri-logout-box-r-line" style={{fontSize: '1.2rem'}}></i>
                </button>
            </div>
        </header>
    );
}

// Sidebar
function Sidebar({ route, setRoute }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <i className="ri-flashlight-fill"></i>
                <span>Pulse<span className="highlight">IoT</span></span>
            </div>
            <nav className="nav-menu">
                <a href="#" onClick={(e) => {e.preventDefault(); setRoute('dashboard')}} className={`nav-item ${route === 'dashboard' ? 'active' : ''}`}><i className="ri-dashboard-line"></i> Dashboard</a>
                <a href="#" onClick={(e) => {e.preventDefault(); setRoute('analytics')}} className={`nav-item ${route === 'analytics' ? 'active' : ''}`}><i className="ri-line-chart-line"></i> Analytics</a>
                <a href="#" onClick={(e) => {e.preventDefault(); setRoute('devices')}} className={`nav-item ${route === 'devices' ? 'active' : ''}`}><i className="ri-macbook-line"></i> Devices</a>
                <a href="#" onClick={(e) => {e.preventDefault(); setRoute('settings')}} className={`nav-item ${route === 'settings' ? 'active' : ''}`}><i className="ri-settings-4-line"></i> Settings</a>
            </nav>
            <div className="user-profile">
                <div className="avatar">Admin</div>
            </div>
        </aside>
    );
}

// Login
function Login({ onLogin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await res.json();
            if (data.success) {
                onLogin(data.token);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="login-wrap">
            <form className="glass login-box" onSubmit={submit}>
                <div className="logo" style={{display: 'flex', justifyContent: 'center', marginBottom: '30px', fontSize: '2rem'}}>
                    <i className="ri-flashlight-fill" style={{color: 'var(--neon-cyan)'}}></i>
                    <span style={{color:'white'}}>Pulse<span className="highlight" style={{color: 'var(--neon-purple)'}}>IoT</span></span>
                </div>
                <h2 style={{textAlign:'center', marginBottom: '20px'}}>Terminal Access</h2>
                {error && <div className="error-msg" style={{color: '#ff4444', textAlign:'center', marginBottom:'15px', background:'rgba(255,0,0,0.1)', padding:'10px', borderRadius:'8px'}}>{error}</div>}
                
                <div className="input-field" style={{marginBottom: '20px'}}>
                    <div style={{display:'flex', alignItems:'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)'}}>
                        <i className="ri-user-line" style={{marginRight: '10px', color: 'var(--text-muted)'}}></i>
                        <input type="text" placeholder="Username (admin)" value={user} onChange={e=>setUser(e.target.value)} required style={{background:'transparent', border:'none', color:'white', width:'100%', outline:'none'}} />
                    </div>
                </div>
                <div className="input-field" style={{marginBottom: '30px'}}>
                    <div style={{display:'flex', alignItems:'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)'}}>
                         <i className="ri-lock-password-line" style={{marginRight: '10px', color: 'var(--text-muted)'}}></i>
                         <input type="password" placeholder="Password (admin)" value={pass} onChange={e=>setPass(e.target.value)} required style={{background:'transparent', border:'none', color:'white', width:'100%', outline:'none'}} />
                    </div>
                </div>
                <button type="submit" className="login-btn" style={{width: '100%', padding: '14px', background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))', border: 'none', borderRadius: '8px', color:'white', fontWeight:'600', fontSize:'1.1rem', cursor:'pointer', transition:'0.3s'}}>
                    Authenticate <i className="ri-arrow-right-line" style={{verticalAlign: 'middle'}}></i>
                </button>
            </form>
        </div>
    );
}

// Dashboard
function Dashboard() {
    const [data, setData] = useState({ power: 0, voltage: 0, current: 0 });
    const chartRef = useRef(null);

    useEffect(() => {
        // Mock data points
        const timeLabels = [];
        const powerData = [];
        
        let interval = setInterval(async () => {
            const res = await fetch('/api/telemetry');
            const d = await res.json();
            setData(d);
            
            const timeStr = new Date(d.timestamp * 1000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit', hour:'2-digit' });
            
            timeLabels.push(timeStr);
            powerData.push(d.power);
            if(timeLabels.length > 20) {
                timeLabels.shift(); powerData.shift();
            }
            
            if(chartRef.current) {
               chartRef.current.data.labels = timeLabels;
               chartRef.current.data.datasets[0].data = powerData;
               chartRef.current.update();
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = document.getElementById('mainPowerChart');
        if(ctx) {
            Chart.defaults.color = '#9496a1';
            let gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, `rgba(0, 240, 255, 0.4)`);
            gradient.addColorStop(1, `rgba(0, 240, 255, 0)`);
            
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{ label: 'Power (W)', data: [], borderColor: '#00f0ff', backgroundColor: gradient, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, animation: {duration: 0}, plugins: {legend: {display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.05)'}}} }
            });
        }
        return () => { if(chartRef.current) chartRef.current.destroy(); }
    }, []);

    return (
        <div className="fade-in">
            <section className="metrics-grid">
                <div className="metric-card glass">
                    <div className="metric-icon val-power"><i className="ri-battery-2-charge-line"></i></div>
                    <div className="metric-info">
                        <h3>Total Power</h3>
                        <div className="value">{(data.power / 1000).toFixed(2)} kW</div>
                    </div>
                </div>
                <div className="metric-card glass">
                    <div className="metric-icon val-voltage"><i className="ri-flashlight-line"></i></div>
                    <div className="metric-info">
                        <h3>Avg Voltage</h3>
                        <div className="value">{data.voltage.toFixed(1)} V</div>
                    </div>
                </div>
                <div className="metric-card glass">
                    <div className="metric-icon val-current"><i className="ri-water-flash-line"></i></div>
                    <div className="metric-info">
                        <h3>Current Draw</h3>
                        <div className="value">{data.current.toFixed(1)} A</div>
                    </div>
                </div>
            </section>
            
            <section className="charts-wrap" style={{marginTop: '20px'}}>
                <div className="chart-card glass main-chart" style={{gridColumn: '1 / -1'}}>
                    <div className="card-header">
                        <h2>Real-time Power Consumption</h2>
                        <span className="badge">Live</span>
                    </div>
                    <div className="chart-container" style={{height: '350px'}}>
                        <canvas id="mainPowerChart"></canvas>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Analytics
function Analytics() {
    const [period, setPeriod] = useState('24h');
    const [data, setData] = useState({ history: [], total_usage: 0, total_cost: 0 });
    const chartRef = useRef(null);

    useEffect(() => {
        fetch(`/api/analytics?period=${period}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                updateChart(d.history);
            });
    }, [period]);

    const updateChart = (hist) => {
        const labels = hist.map(h => new Date(h.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
        const vals = hist.map(h => h.usage_kwh);
        
        if (chartRef.current) {
            chartRef.current.data.labels = labels;
            chartRef.current.data.datasets[0].data = vals;
            chartRef.current.update();
        } else {
            const ctx = document.getElementById('histChart');
            if(ctx) {
                let gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, `rgba(176, 82, 255, 0.4)`);
                gradient.addColorStop(1, `rgba(176, 82, 255, 0)`);
                
                chartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{ label: 'Usage (kWh)', data: vals, backgroundColor: gradient, borderColor: '#b052ff', borderWidth: 1, borderRadius: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.05)'}}} }
                });
            }
        }
    };
    
    return (
        <div className="fade-in">
            <div className="filters" style={{display:'flex', gap:'10px', marginBottom: '20px'}}>
                <button className={`filter-btn ${period==='24h'?'active':''}`} onClick={()=>setPeriod('24h')} style={{padding:'8px 16px', background: period==='24h'?'rgba(176,82,255,0.2)':'rgba(255,255,255,0.05)', border:`1px solid ${period==='24h'?'var(--neon-purple)':'var(--border-color)'}`, borderRadius:'8px', color:'white', cursor:'pointer', transition:'0.3s'}}>24 Hours</button>
                <button className={`filter-btn ${period==='7d'?'active':''}`} onClick={()=>setPeriod('7d')} style={{padding:'8px 16px', background: period==='7d'?'rgba(176,82,255,0.2)':'rgba(255,255,255,0.05)', border:`1px solid ${period==='7d'?'var(--neon-purple)':'var(--border-color)'}`, borderRadius:'8px', color:'white', cursor:'pointer', transition:'0.3s'}}>7 Days</button>
            </div>
            
            <section className="metrics-grid">
                 <div className="metric-card glass">
                    <div className="metric-icon val-voltage"><i className="ri-blaze-line"></i></div>
                    <div className="metric-info">
                        <h3>Total Usage</h3>
                        <div className="value">{data.total_usage} kWh</div>
                    </div>
                </div>
                 <div className="metric-card glass">
                    <div className="metric-icon val-current"><i className="ri-money-dollar-circle-line"></i></div>
                    <div className="metric-info">
                        <h3>Est. Cost</h3>
                        <div className="value">${data.total_cost}</div>
                    </div>
                </div>
            </section>
            
            <div className="chart-card glass fade-in" style={{marginTop:'20px', height: '400px'}}>
                <canvas id="histChart"></canvas>
            </div>
        </div>
    );
}

// Devices
function Devices() {
    const [devices, setDevices] = useState({});

    const loadDevices = async () => {
        const res = await fetch('/api/devices');
        setDevices(await res.json());
    };

    useEffect(() => { loadDevices(); }, []);

    const toggle = async (id, status) => {
        const newStatus = status === 'on' ? 'off' : 'on';
        await fetch(`/api/devices/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        loadDevices();
    };

    return (
        <div className="fade-in device-control glass">
            <div className="device-grid" id="deviceGrid">
                {Object.entries(devices).map(([id, dev]) => (
                    <div className="device-item fade-in" key={id}>
                        <div className="device-info">
                            <h4>{dev.name}</h4>
                            <p>Status: <span style={{color: dev.status === 'on' ? 'var(--neon-green)' : 'var(--text-muted)', fontWeight: 'bold'}}>{dev.status.toUpperCase()}</span></p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={dev.status === 'on'} onChange={() => toggle(id, dev.status)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Settings
function Settings({ theme, setTheme }) {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        fetch('/api/settings').then(res=>res.json()).then(setSettings);
    }, []);

    const save = async (e) => {
        e.preventDefault();
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        alert('Settings Saved Successfully!');
    };

    return (
        <div className="fade-in glass" style={{padding: '30px', maxWidth: '600px'}}>
            <form onSubmit={save} className="settings-form">
                <div style={{marginBottom: '20px'}}>
                    <label style={{display:'block', marginBottom:'8px', color:'var(--text-muted)'}}>Dashboard Theme</label>
                    <select value={settings.theme || 'dark'} onChange={e => {setSettings({...settings, theme: e.target.value}); setTheme(e.target.value)}} style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'white', outline:'none', fontSize:'1rem'}}>
                        <option value="dark">Dark Matrix</option>
                        <option value="light">Light Energy (WIP)</option>
                    </select>
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display:'block', marginBottom:'8px', color:'var(--text-muted)'}}>Voltage Alert Threshold (V)</label>
                    <input type="number" value={settings.alert_voltage || ''} onChange={e => setSettings({...settings, alert_voltage: e.target.value})} style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'white', outline:'none', fontSize:'1rem'}} />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display:'block', marginBottom:'8px', color:'var(--text-muted)'}}>Power Spike Threshold (W)</label>
                    <input type="number" value={settings.alert_power || ''} onChange={e => setSettings({...settings, alert_power: e.target.value})} style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'white', outline:'none', fontSize:'1rem'}} />
                </div>
                <label style={{display:'flex', alignItems:'center', gap:'10px', marginTop: '20px', cursor:'pointer', color:'white'}}>
                    <input type="checkbox" checked={settings.notifications || false} onChange={e => setSettings({...settings, notifications: e.target.checked})} style={{width:'20px', height:'20px'}} />
                    Enable Push Notifications for Critical Alerts
                </label>
                <button type="submit" className="login-btn" style={{marginTop: '30px', width: '100%', padding: '14px', background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-pink))', border: 'none', borderRadius: '8px', color:'white', fontWeight:'600', fontSize:'1.1rem', cursor:'pointer', transition:'0.3s'}}>Save Settings <i className="ri-save-line"></i></button>
            </form>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
