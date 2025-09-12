// Gestionnaire pour la page Voir CRA
class VoirCRAManager {
    constructor() {
        this.csrf = document.getElementById('csrf-token');
        this.craTable = document.getElementById('craTable');
        this.craTableHeader = document.getElementById('craTableHeader');
        this.craTableBody = document.getElementById('craTableBody');
        this.exportCRABtn = document.getElementById('exportCRA');
        this.craTitle = document.getElementById('craTitle');
        this.craStatusInfo = document.getElementById('craStatusInfo');
        
        this.craId = null;
        this.currentMonth = null;
        this.currentYear = null;
        this.userId = null;
        this.craData = {};
        this.projects = [];
        this.craInfo = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation de la page Voir CRA...');
        
        // Get URL parameters
        this.parseURLParams();
        
        // Load CSRF token
        await this.loadCSRFToken();
        
        // Load user info
        await this.loadUserInfo();
        
        // Load CRA data
        await this.loadCRAData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Page Voir CRA initialisée avec succès !');
    }

    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.craId = urlParams.get('cra');
        this.currentMonth = parseInt(urlParams.get('month')) || 0;
        this.currentYear = parseInt(urlParams.get('year')) || new Date().getFullYear();
        
        console.log('📋 Paramètres URL:', {
            craId: this.craId,
            month: this.currentMonth,
            year: this.currentYear
        });
    }

    async loadCSRFToken() {
        try {
            const response = await fetch('/csrf-token', { credentials: 'same-origin' });
            const data = await response.json();
            this.csrf.value = data.token;
        } catch (error) {
            console.error('Erreur lors de la récupération du token CSRF:', error);
        }
    }

    async loadUserInfo() {
        try {
            const response = await fetch('/employe/user-info', { 
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            
            if (response.ok && data.user) {
                const userName = data.user.nom || data.user.name || 'Employé';
                this.userId = data.user.id_user || data.user.id;
                
                const headerUserNameElement = document.getElementById('headerUserName');
                if (headerUserNameElement) {
                    headerUserNameElement.textContent = userName;
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des informations utilisateur:', error);
        }
    }

    setupEventListeners() {
        // Time update
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Export button
        if (this.exportCRABtn) {
            this.exportCRABtn.addEventListener('click', () => this.exportCRA());
        }
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    async loadCRAData() {
        if (!this.craId) {
            console.error('❌ Aucun ID de CRA fourni');
            return;
        }

        try {
            console.log('🔍 Chargement des données CRA:', this.craId);
            
            // D'abord charger les activités (même logique que dashboard)
            await this.loadProjects();
            
            // Test ultra simple d'abord
            console.log('🧪 Test 1: Route basique');
            const testResponse = await fetch(`/employe/cra/test/${this.craId}`, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('✅ Test basique réussi:', testData);
            } else {
                console.error('❌ Test basique échoué:', testResponse.status);
                throw new Error('Test basique échoué');
            }
            
            // Test avec base de données
            console.log('🧪 Test 2: Base de données');
            const craResponse = await fetch(`/employe/cra/testdb/${this.craId}`, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!craResponse.ok) {
                throw new Error('Erreur lors du chargement du CRA');
            }
            
            const craData = await craResponse.json();
            
            console.log('📊 Données reçues:', craData);
            
            if (craData.success) {
                this.craInfo = craData.cra;
                this.craData = craData.data || {};
                
                console.log('📋 CRA Info:', this.craInfo);
                console.log('📊 CRA Data:', this.craData);
                console.log('🎯 Projects:', craData.projects);
                console.log('🔍 Debug Info:', craData.debug);
                
                // Utiliser les projets de la réponse seulement si aucune activité assignée n'a été chargée
                if (!this.projects || this.projects.length === 0) {
                    this.projects = craData.projects || [];
                }

                // Si le mois/année ne sont pas fournis, les déduire du CRA
                if ((isNaN(this.currentMonth) || isNaN(this.currentYear)) && this.craInfo && this.craInfo.dateMois) {
                    const d = new Date(this.craInfo.dateMois);
                    this.currentMonth = d.getMonth();
                    this.currentYear = d.getFullYear();
                }
                
                // Mettre à jour l'interface
                this.updateCRATitle();
                this.updateCRAStatus();
                this.buildCRATable();
                this.applyCRAData();
            } else {
                throw new Error(craData.message || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement du CRA:', error);
            alert('Erreur lors du chargement du CRA: ' + error.message);
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('/employe/activities', { 
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            
            if (response.ok && data.activities) {
                this.projects = data.activities.map(activity => ({
                    id: activity.id_activité,
                    name: activity.nom_act,
                    code: activity.nom_act.substring(0, 5).toUpperCase()
                }));
            } else {
                this.projects = [];
                console.log('Aucune activité assignée');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            this.projects = [];
        }
    }

    updateCRATitle() {
        if (this.craTitle && this.craInfo) {
            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];
            
            const date = new Date(this.craInfo.dateMois);
            const monthName = monthNames[date.getMonth()];
            const year = date.getFullYear();
            
            this.craTitle.textContent = `CRA - ${monthName} ${year}`;
        }
    }

    updateCRAStatus() {
        if (this.craStatusInfo && this.craInfo) {
            const statusText = {
                'en_attente': 'En attente',
                'valide': 'Validé',
                'refuse': 'Refusé'
            };
            
            const statusClass = {
                'en_attente': 'warning',
                'valide': 'success',
                'refuse': 'error'
            };
            
            const submissionText = this.craInfo.submittedAT ? 'Soumis' : 'Non soumis';
            const submissionDate = this.craInfo.submittedAT ? 
                new Date(this.craInfo.submittedAT).toLocaleDateString('fr-FR') : '';
            
            this.craStatusInfo.innerHTML = `
                <div class="status-badges">
                    <span class="status-badge ${statusClass[this.craInfo.status]}">${statusText[this.craInfo.status] || this.craInfo.status}</span>
                    <span class="submission-badge">${submissionText}${submissionDate ? ' le ' + submissionDate : ''}</span>
                </div>
            `;
        }
    }

    buildCRATable() {
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Build header
        this.buildTableHeader(daysInMonth);
        
        // Build body
        this.buildTableBody(daysInMonth);
    }

    buildTableHeader(daysInMonth) {
        let headerHTML = '<th class="project-header">Projet</th>';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            
            headerHTML += `<th class="day-header${weekendClass}">${day}</th>`;
        }
        
        headerHTML += '<th class="total-header">Total</th>';
        this.craTableHeader.innerHTML = headerHTML;
    }

    buildTableBody(daysInMonth) {
        let bodyHTML = '';
        
        this.projects.forEach(project => {
            bodyHTML += `<tr data-project-id="${project.id}">`;
            bodyHTML += `<td class="project-cell">${project.name}</td>`;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.currentYear, this.currentMonth, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const weekendClass = isWeekend ? ' weekend' : '';
                const dateKey = this.formatDate(this.currentYear, this.currentMonth + 1, day);
                
                bodyHTML += `<td>
                    <div class="day-cell-readonly zero${weekendClass}" 
                         data-project-id="${project.id}" 
                         data-date="${dateKey}"
                         data-day="${day}">0</div>
                </td>`;
            }
            
            bodyHTML += `<td class="total-cell" data-project-id="${project.id}">0</td>`;
            bodyHTML += '</tr>';
        });
        
        this.craTableBody.innerHTML = bodyHTML;
    }

    applyCRAData() {
        console.log('🎨 Application des données CRA...');
        console.log('📊 Données à appliquer:', this.craData);
        
        Object.entries(this.craData).forEach(([key, value]) => {
            const [projectId, date] = key.split('_');
            console.log(`🔍 Recherche cellule: projet=${projectId}, date=${date}, valeur=${value}`);
            
            const cell = this.craTableBody.querySelector(
                `.day-cell-readonly[data-project-id="${projectId}"][data-date="${date}"]`
            );
            
            if (cell) {
                console.log(`✅ Cellule trouvée, application de la valeur: ${value}`);
                cell.textContent = value;
                cell.className = `day-cell-readonly ${this.getValueClass(value)}`;
            } else {
                console.log(`❌ Cellule non trouvée pour: projet=${projectId}, date=${date}`);
            }
        });
        
        // Update all row totals
        this.projects.forEach(project => {
            this.updateRowTotal(project.id);
        });
        
        console.log('✅ Application des données terminée');
    }

    getValueClass(value) {
        switch (value) {
            case '0': return 'zero';
            case '0.5': return 'half';
            case '1': return 'one';
            default: return 'zero';
        }
    }

    updateRowTotal(projectId) {
        const row = this.craTableBody.querySelector(`tr[data-project-id="${projectId}"]`);
        const cells = row.querySelectorAll('.day-cell-readonly');
        let total = 0;
        
        cells.forEach(cell => {
            total += parseFloat(cell.textContent) || 0;
        });
        
        const totalCell = row.querySelector('.total-cell');
        totalCell.textContent = total.toFixed(1);
    }

    formatDate(year, month, day) {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    }

    exportCRA() {
        if (!this.craInfo) {
            alert('Aucune donnée CRA à exporter');
            return;
        }

        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        const date = new Date(this.craInfo.dateMois);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
        
        // Create HTML table for better Excel formatting
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #000; padding: 5px; text-align: center; }
        .header { background-color: #E6E6FA; font-weight: bold; }
        .project { background-color: #F0F8FF; text-align: left; font-weight: bold; }
        .weekend { background-color: #F5F5F5; }
        .total { background-color: #FFE4B5; font-weight: bold; }
    </style>
</head>
<body>
    <h2>CRA - ${monthName} ${year}</h2>
    <table>
        <thead>
            <tr class="header">
                <th class="project">Projet</th>`;
        
        // Header days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, date.getMonth(), day);
            const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            htmlContent += `<th class="header${weekendClass}">${day}</th>`;
        }
        
        htmlContent += '<th class="header total">Total</th></tr></thead><tbody>';
        
        // Project rows
        this.projects.forEach(project => {
            htmlContent += `<tr><td class="project">${project.name}</td>`;
            
            let rowTotal = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = this.formatDate(year, date.getMonth() + 1, day);
                const cellKey = `${project.id}_${dateKey}`;
                const value = this.craData[cellKey] || '0';
                rowTotal += parseFloat(value);
                
                const dayDate = new Date(year, date.getMonth(), day);
                const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
                const weekendClass = isWeekend ? ' weekend' : '';
                
                htmlContent += `<td class="${weekendClass}">${value}</td>`;
            }
            
            htmlContent += `<td class="total">${rowTotal.toFixed(1)}</td></tr>`;
        });
        
        htmlContent += '</tbody></table></body></html>';
        
        // Download file
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const userIdSuffix = this.userId ? `_User${this.userId}` : '';
        a.download = `CRA_${monthName}_${year}${userIdSuffix}_ID${this.craId}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.voirCRAManager = new VoirCRAManager();
});
