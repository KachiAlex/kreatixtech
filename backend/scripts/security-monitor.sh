#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Kreatix VPS Security Monitor
# Collects security data and pushes to Kreatix Admin Portal backend
# Run via cron every 5 minutes: */5 * * * * /opt/kreatix-scripts/security-monitor.sh
# ─────────────────────────────────────────────────────────────────────────────

API_URL="http://localhost:5100/api/security/report"
AGENT_SECRET="KreatixSecurityAgent_2026_Xy9Km"
LOG_FILE="/var/log/kreatix-security-monitor.log"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"; }

python3 - "$API_URL" "$AGENT_SECRET" << 'PYEOF'
import sys, json, subprocess, os, re, datetime, urllib.request

API_URL = sys.argv[1]
AGENT_SECRET = sys.argv[2]

def run(cmd):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return r.stdout.strip()
    except:
        return ""

hostname = run("hostname")
uptime = run("uptime -p | sed 's/up //'")
load_avg = run("cat /proc/loadavg | awk '{print $1, $2, $3}'")

disk_line = run("df -h / | awk 'NR==2{print $2, $3, $4, $5}'")
disk_parts = disk_line.split() if disk_line else []
disk_usage = {"total": disk_parts[0], "used": disk_parts[1], "avail": disk_parts[2], "usePercent": disk_parts[3]} if len(disk_parts) >= 4 else {}

mem_line = run("free -m | awk 'NR==2{print $2, $3, $4, $6, $7}'")
mem_parts = list(map(int, mem_line.split())) if mem_line else []
memory_usage = {"total": mem_parts[0], "used": mem_parts[1], "free": mem_parts[2], "cached": mem_parts[3], "available": mem_parts[4]} if len(mem_parts) >= 5 else {}

f2b_stats = {}
banned_ips = []
events = []

f2b_status = run("fail2ban-client status 2>/dev/null")
if f2b_status:
    f2b_current = run("fail2ban-client status 2>/dev/null | grep 'Currently banned' | grep -oP '\\d+'")
    f2b_jails = run("fail2ban-client status 2>/dev/null | grep 'Jail list' | sed 's/.*://' | tr -d ' '")
    f2b_failed = run("fail2ban-client status sshd 2>/dev/null | grep 'Currently failed' | grep -oP '\\d+'")
    f2b_total = run("fail2ban-client status sshd 2>/dev/null | grep 'Total banned' | grep -oP '\\d+'")
    f2b_stats = {"currentlyBanned": int(f2b_current) if f2b_current else 0, "currentlyFailed": int(f2b_failed) if f2b_failed else 0, "totalBanned": int(f2b_total) if f2b_total else 0, "jails": f2b_jails or ""}
    banned_raw = run("fail2ban-client status sshd 2>/dev/null | grep 'Banned IP list' | sed 's/.*://' | sed 's/^ *//'")
    if banned_raw:
        for ip in banned_raw.split():
            banned_ips.append({"ipAddress": ip, "jail": "sshd", "reason": "fail2ban SSH brute-force"})

ufw_status = run("ufw status verbose 2>/dev/null | head -1") or "unknown"
ufw_rules = []
ufw_rules_raw = run("ufw status 2>/dev/null | grep -E 'ALLOW|DENY|LIMIT' | head -20")
if ufw_rules_raw:
    ufw_rules = [line.strip() for line in ufw_rules_raw.split('\n') if line.strip()]

docker_ports = []
docker_raw = run("docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null")
if docker_raw:
    for line in docker_raw.split('\n'):
        parts = line.split(None, 1)
        if len(parts) >= 2:
            docker_ports.append({"container": parts[0], "ports": parts[1]})
        elif len(parts) == 1:
            docker_ports.append({"container": parts[0], "ports": ""})

open_ports = []
ss_raw = run("ss -tlnp 2>/dev/null | grep LISTEN | awk '{print $4}' | sed 's/.*://' | sort -un | head -30")
if ss_raw:
    open_ports = [int(p) for p in ss_raw.split('\n') if p.isdigit()]

ssh_password = run("grep -i '^PasswordAuthentication' /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}'") or "unknown"
ssh_cloud = run("cat /etc/ssh/sshd_config.d/50-cloud-init.conf 2>/dev/null | grep -i '^PasswordAuthentication' | awk '{print $2}'") or "not found"
ssh_root = run("grep -i '^PermitRootLogin' /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}'") or "unknown"
ssh_maxauth = run("grep -i '^MaxAuthTries' /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}'") or "default"
ssh_keys = run("wc -l < /root/.ssh/authorized_keys 2>/dev/null") or "0"
ssh_keys2 = os.path.exists("/root/.ssh/authorized_keys2")
ssh_config = {"passwordAuth": ssh_password, "cloudInitOverride": ssh_cloud, "permitRootLogin": ssh_root, "maxAuthTries": ssh_maxauth, "authorizedKeysCount": int(ssh_keys) if ssh_keys.isdigit() else 0, "authorizedKeys2Exists": ssh_keys2}

ss_estab = run("ss -tn state established 2>/dev/null | wc -l")
ssh_conn = run("ss -tn state established 2>/dev/null | grep ':22 ' | wc -l")
active_conn = {"totalEstablished": int(ss_estab) if ss_estab.isdigit() else 0, "sshConnections": int(ssh_conn) if ssh_conn.isdigit() else 0}

now = datetime.datetime.now().isoformat()

failed_raw = run("journalctl -u ssh --since '5 min ago' 2>/dev/null | grep 'Failed password' | tail -20")
if not failed_raw:
    failed_raw = run("grep 'Failed password' /var/log/auth.log 2>/dev/null | tail -20")
for line in (failed_raw.split('\n') if failed_raw else []):
    if not line.strip(): continue
    ip_match = re.search(r'from ([0-9.]+)', line)
    if ip_match:
        ip = ip_match.group(1)
        events.append({"type": "SSH_FAILED", "severity": "MEDIUM", "ipAddress": ip, "description": f"Failed SSH login attempt from {ip}", "timestamp": now})

success_raw = run("journalctl -u ssh --since '5 min ago' 2>/dev/null | grep 'Accepted' | tail -10")
if not success_raw:
    success_raw = run("grep 'Accepted' /var/log/auth.log 2>/dev/null | tail -10")
for line in (success_raw.split('\n') if success_raw else []):
    if not line.strip(): continue
    ip_match = re.search(r'from ([0-9.]+)', line)
    if ip_match:
        ip = ip_match.group(1)
        events.append({"type": "SSH_SUCCESS", "severity": "INFO", "ipAddress": ip, "description": f"Successful SSH login from {ip}", "timestamp": now})

bans_raw = run("journalctl -u fail2ban --since '5 min ago' 2>/dev/null | grep 'Ban' | tail -10")
if not bans_raw:
    bans_raw = run("grep 'Ban' /var/log/fail2ban.log 2>/dev/null | tail -10")
for line in (bans_raw.split('\n') if bans_raw else []):
    if not line.strip(): continue
    ip_match = re.search(r'Ban ([0-9.]+)', line)
    if ip_match:
        ip = ip_match.group(1)
        events.append({"type": "FAIL2BAN_BAN", "severity": "HIGH", "ipAddress": ip, "description": f"IP {ip} banned by fail2ban", "timestamp": now})

failed_24h = run("journalctl -u ssh --since '24 hours ago' 2>/dev/null | grep -c 'Failed password'") or "0"
bans_24h = run("journalctl -u fail2ban --since '24 hours ago' 2>/dev/null | grep -c 'Ban '") or "0"
summary = {"failedSSH24h": int(failed_24h) if failed_24h.isdigit() else 0, "bansToday": int(bans_24h) if bans_24h.isdigit() else 0, "sshKeysCount": int(ssh_keys) if ssh_keys.isdigit() else 0, "ufwActive": ufw_status}

payload = {"hostname": hostname, "uptime": uptime, "loadAverage": load_avg, "diskUsage": disk_usage, "memoryUsage": memory_usage, "fail2banStats": f2b_stats, "ufwStatus": ufw_status, "ufwRules": ufw_rules, "dockerPorts": docker_ports, "openPorts": open_ports, "sshConfig": ssh_config, "activeConnections": active_conn, "summary": summary, "events": events, "bannedIPs": banned_ips}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json', 'X-Agent-Secret': AGENT_SECRET})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    print(f"Report sent successfully: {resp.status}")
except Exception as e:
    print(f"ERROR: {e}")
PYEOF

log "Script completed"
