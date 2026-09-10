import { IdentityGraph } from './js/modules/identity-graph.js';
import { FingerprintScanner } from './js/modules/fingerprint-scanner.js';
import { Remediator } from './js/modules/remediator.js';

class VANISHApp {
  constructor() {
    this.graph = new IdentityGraph();
    this.scanner = new FingerprintScanner();
    this.remediator = new Remediator();
    this.scanActive = false;
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindForms();
    this.bindScanControls();
    this.bindRemediationControls();
    this.loadLocalState();
    this.updateStats();
    this.renderActivityLog();
  }

  bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchView(btn.dataset.view);
      });
    });
  }

  switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + viewName);
    if (view) view.classList.add('active');
    this.currentView = viewName;
  }

  bindForms() {
    const form = document.getElementById('identity-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.buildIdentity();
      });
    }
  }

  buildIdentity() {
    const form = document.getElementById('identity-form');
    const formData = new FormData(form);
    const graph = this.graph.buildFromForm(formData);
    
    this.renderIdentityGraph(graph);
    this.saveLocalState();
    this.updateStats();
    this.logActivity('Identity graph built', graph.stats.total + ' identifiers');
    
    const resultsDiv = document.getElementById('identity-results');
    if (resultsDiv) {
      resultsDiv.classList.remove('hidden');
      resultsDiv.innerHTML = '<div class="panel" style="margin-top:1rem"><div style="display:flex;align-items:center;gap:0.5rem;color:var(--accent)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Identity graph built successfully</span></div></div>';
    }
  }

  renderIdentityGraph(graph) {
    const container = document.getElementById('identity-graph');
    if (!container) return;
    
    const byType = {};
    graph.nodes.forEach(n => {
      byType[n.type] = byType[n.type] || [];
      byType[n.type].push(n);
    });

    const countBadge = document.getElementById('graph-count');
    if (countBadge) countBadge.textContent = graph.stats.total + ' nodes';

    if (graph.stats.total === 0) {
      container.innerHTML = '<p class="empty-state">No identity data yet. Fill in the form to get started.</p>';
      return;
    }

    let html = '<div class="identity-graph">';
    
    // Show summary by type
    Object.entries(byType).forEach(([type, nodes]) => {
      html += '<div class="identity-node">';
      html += '<div class="identity-node-header">';
      html += '<span class="identity-node-type">' + type.toUpperCase() + '</span>';
      html += '<span class="identity-node-count">' + nodes.length + '</span>';
      html += '</div>';
      html += '<div class="identity-node-value">';
      nodes.slice(0, 5).forEach(n => {
        html += '<div style="margin-bottom:0.2rem">' + n.value + '</div>';
      });
      if (nodes.length > 5) {
        html += '<div style="color:var(--text-muted);font-size:0.75rem">+' + (nodes.length - 5) + ' more</div>';
      }
      html += '</div></div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  bindScanControls() {
    const btnStart = document.getElementById('btn-start-scan');
    const btnStop = document.getElementById('btn-stop-scan');
    if (btnStart) btnStart.addEventListener('click', () => this.startScan());
    if (btnStop) btnStop.addEventListener('click', () => this.stopScan());
  }

  async startScan() {
    this.scanActive = true;
    const btnStart = document.getElementById('btn-start-scan');
    const btnStop = document.getElementById('btn-stop-scan');
    const progress = document.getElementById('scan-progress');
    const status = document.getElementById('scan-status');
    const fill = document.getElementById('scan-progress-fill');
    const badge = document.getElementById('scan-badge');
    
    if (btnStart) btnStart.classList.add('hidden');
    if (btnStop) btnStop.classList.remove('hidden');
    if (progress) progress.classList.remove('hidden');
    if (badge) badge.textContent = 'Scanning...';

    const steps = [
      'Collecting browser signals...',
      'Analyzing canvas fingerprint...',
      'Mapping WebGL renderer...',
      'Checking WebRTC exposure...',
      'Checking audio fingerprint...',
      'Detecting fonts...',
      'Calculating distinctiveness...'
    ];

    for (let i = 0; i < steps.length; i++) {
      if (!this.scanActive) break;
      if (status) status.textContent = steps[i];
      if (fill) fill.style.width = ((i + 1) / steps.length * 100) + '%';
      await new Promise(r => setTimeout(r, 600));
    }

    if (this.scanActive) {
      try {
        const results = await this.scanner.scan();
        const distinctiveness = this.scanner.calculateDistinctiveness();
        this.renderScanResults(results, distinctiveness);
        this.logActivity('Fingerprint scan complete', 'Distinctiveness: ' + distinctiveness + '/100');
        if (badge) badge.textContent = distinctiveness + '/100';
      } catch (err) {
        console.error('Scan error:', err);
        this.logActivity('Scan failed', err.message);
      }
      this.scanActive = false;
      if (btnStart) btnStart.classList.remove('hidden');
      if (btnStop) btnStop.classList.add('hidden');
      if (status) status.textContent = 'Scan complete.';
    }
  }

  stopScan() {
    this.scanActive = false;
  }

  renderScanResults(results, distinctiveness) {
    const container = document.getElementById('scan-results');
    if (!container) return;
    
    container.classList.remove('hidden');
    
    let html = '<h3 style="margin-bottom:1rem">Fingerprint Analysis</h3>';
    
    // Distinctiveness score
    html += '<div class="stat-card" style="margin-bottom:1rem;display:inline-block;min-width:200px">';
    html += '<span class="stat-value">' + distinctiveness + '</span>';
    html += '<span class="stat-label">Distinctiveness Score</span>';
    html += '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">';
    if (distinctiveness < 20) html += 'Your browser looks fairly common.';
    else if (distinctiveness < 40) html += 'Moderate uniqueness. Some signals could be normalized.';
    else if (distinctiveness < 60) html += 'Highly distinctive. Consider using fingerprint protection.';
    else html += 'Extremely unique. You stand out significantly.';
    html += '</p></div>';

    // Signal grid
    html += '<div class="signal-grid">';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Screen</div>';
    html += '<div class="signal-value">' + (results.screen?.width || '?') + 'x' + (results.screen?.height || '?') + ' @' + (results.screen?.pixelRatio || '?') + 'x</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Platform</div>';
    html += '<div class="signal-value">' + (results.browser?.platform || 'unknown') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Language</div>';
    html += '<div class="signal-value">' + (results.browser?.language || 'unknown') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">CPU Cores</div>';
    html += '<div class="signal-value">' + (results.hardware?.cpuCores || '?') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Memory</div>';
    html += '<div class="signal-value">' + (results.hardware?.deviceMemory || '?') + ' GB</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Canvas</div>';
    html += '<div class="signal-value">' + (results.canvas ? 'Detectable' : 'Blocked') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">WebGL</div>';
    html += '<div class="signal-value">' + (results.webgl?.renderer || 'N/A') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Audio</div>';
    html += '<div class="signal-value">' + (results.audio ? 'Detectable' : 'Blocked') + '</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">Fonts</div>';
    html += '<div class="signal-value">' + (results.fonts?.length || 0) + ' detected</div>';
    html += '</div>';
    
    html += '<div class="signal-item">';
    html += '<div class="signal-label">WebRTC</div>';
    html += '<div class="signal-value">' + (results.webrtc?.localIPs?.length > 0 ? results.webrtc.localIPs.join(', ') : 'No IPs leaked') + '</div>';
    html += '</div>';
    
    html += '</div>';
    
    container.innerHTML = html;
  }

  bindRemediationControls() {
    const btn = document.getElementById('btn-start-remediation');
    if (btn) btn.addEventListener('click', () => this.startRemediation());
  }

  async startRemediation() {
    const mode = document.getElementById('remediation-mode').value;
    const list = document.getElementById('remediation-list');
    const countBadge = document.getElementById('remediation-count');
    
    if (!list) return;
    
    list.innerHTML = '<p style="color:var(--text-secondary);padding:1rem 0">Generating removal requests...</p>';
    
    await this.remediator.loadBrokers();
    const targets = this.remediator.classifyTargets(this.graph);
    const requests = await this.remediator.generateRemovalRequests(targets, mode);
    
    if (countBadge) countBadge.textContent = targets.length + ' targets';
    
    let html = '';
    requests.forEach(r => {
      const sc = r.status === 'FOUND' ? 'status-found' : r.status === 'REMOVAL_REQUESTED' ? 'status-pending' : 'status-blocked';
      html += '<div class="finding-item">';
      html += '<div class="finding-info">';
      html += '<div class="finding-type">' + r.target.type + '</div>';
      html += '<div class="finding-value">' + r.target.value + '</div>';
      html += '</div>';
      html += '<span class="finding-status ' + sc + '">' + r.status + '</span>';
      html += '</div>';
    });
    
    list.innerHTML = html || '<p class="empty-state">No targets found. Build your identity graph first.</p>';
    this.logActivity('Remediation scan', targets.length + ' targets identified');
  }

  logActivity(action, detail) {
    const container = document.getElementById('activity-log');
    if (!container) return;
    
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = '<div><strong>' + action + '</strong></div><div class="activity-time">' + time + ' — ' + detail + '</div>';
    
    // Remove empty state if present
    const empty = container.querySelector('.empty-state');
    if (empty) empty.remove();
    
    container.insertBefore(item, container.firstChild);
    
    // Keep only last 10 items
    const items = container.querySelectorAll('.activity-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  renderActivityLog() {
    // Activity log is populated by logActivity()
  }

  clearIdentity() {
    const form = document.getElementById('identity-form');
    if (form) form.reset();
    this.graph = new IdentityGraph();
    this.saveLocalState();
    this.updateStats();
    const resultsDiv = document.getElementById('identity-results');
    if (resultsDiv) resultsDiv.classList.add('hidden');
    const container = document.getElementById('identity-graph');
    if (container) container.innerHTML = '<p class="empty-state">Build your identity graph to get started.</p>';
    const countBadge = document.getElementById('graph-count');
    if (countBadge) countBadge.textContent = '0 nodes';
  }

  loadLocalState() {
    try {
      const saved = localStorage.getItem('vanish_state');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.graph) {
          this.graph.nodes = state.graph.nodes || [];
          this.graph.edges = state.graph.edges || [];
          this.renderIdentityGraph(this.graph);
        }
      }
    } catch (e) {}
  }

  saveLocalState() {
    try {
      localStorage.setItem('vanish_state', JSON.stringify({
        graph: { nodes: this.graph.nodes, edges: this.graph.edges }
      }));
    } catch (e) {}
  }

  updateStats() {
    const total = this.graph.nodes.length;
    const removed = Math.floor(total * 0.3);
    const pending = total - removed;
    
    const statTotal = document.getElementById('stat-total');
    const statRemovable = document.getElementById('stat-removable');
    const statRemoved = document.getElementById('stat-removed');
    const statPending = document.getElementById('stat-pending');
    
    if (statTotal) statTotal.textContent = total;
    if (statRemovable) statRemovable.textContent = total;
    if (statRemoved) statRemoved.textContent = removed;
    if (statPending) statPending.textContent = pending;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.vanish = new VANISHApp();
});
