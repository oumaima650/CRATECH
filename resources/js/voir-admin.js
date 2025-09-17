/**
 * Gestionnaire pour la page de visualisation CRA Admin
 * Version dédiée pour les administrateurs avec gestion robuste des paramètres URL
 */
class VoirCRAAdminManager {
    constructor() {
        this.craId = null;
        this.currentMonth = 0;
        this.currentYear = new Date().getFullYear();
        this.csrf = { value: '' };
        this.isLoading = false;
        
        console.log('🚀 Initialisation de la page Voir CRA Admin...');
    }

    async init() {
        try {
            // Parse URL parameters
            this.parseURLParams();
            
            // Load CSRF token
            await this.loadCSRFToken();
            
            // Load CRA data
            if (this.craId) {
                await this.loadCRAData();
            } else {
                this.showError('Aucun ID de CRA spécifié dans l\'URL');
                return;
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Page Voir CRA Admin initialisée avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement de la page');
        }
    }

    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Récupération robuste du CRA ID
        this.craId = urlParams.get('cra') || urlParams.get('id') || null;
        
        // Debug des paramètres URL
        console.log('🔍 Debug URL complète:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        console.log('🔍 craId récupéré:', this.craId);
        
        // Validation du CRA ID
        if (this.craId && this.craId !== 'null' && this.craId !== 'undefined') {
            this.craId = parseInt(this.craId, 10);
            if (isNaN(this.craId)) {
                console.error('❌ CRA ID invalide:', urlParams.get('cra'));
                this.craId = null;
            }
        } else {
            console.warn('⚠️ Aucun CRA ID valide trouvé dans l\'URL');
            this.craId = null;
        }
        
        // Récupération du mois et année
        const m = urlParams.get('month');
        this.currentMonth = m !== null ? parseInt(m, 10) : 0;
        this.currentYear = parseInt(urlParams.get('year'), 10) || new Date().getFullYear();
        
        console.log('📋 Paramètres finaux:', {
            craId: this.craId,
            month: this.currentMonth,
            year: this.currentYear
        });
    }

    async loadCSRFToken() {
        try {
            const response = await fetch('/csrf-token', { credentials: 'same-origin' });
            if (response.ok) {
                const data = await response.json();
                this.csrf.value = data.token;
                console.log('🔐 Token CSRF chargé');
            }
        } catch (error) {
            console.warn('⚠️ Impossible de charger le token CSRF:', error);
        }
    }

    async loadCRAData() {
        if (!this.craId) {
            this.showError('ID de CRA manquant');
            return;
        }

        this.showLoading(true);
        
        try {
            console.log('🔍 Chargement des données CRA Admin pour ID:', this.craId);
            
            const url = `/admin/api/cra/${this.craId}/details-public`;
            console.log('📡 URL API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin'
            });

            console.log('📡 Statut réponse:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur API:', response.status, errorText);
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Données CRA reçues:', data);

            if (data.success && data.cra) {
                this.displayCRAData(data.cra);
            } else {
                throw new Error(data.message || 'Données CRA invalides');
            }

        } catch (error) {
            console.error('❌ Erreur chargement CRA:', error);
            this.showError(`Erreur lors du chargement: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    displayCRAData(cra) {
        // Mise à jour du titre avec les informations du CRA
        const craTitle = document.getElementById('craTitle');
        if (craTitle) {
            const period = this.formatPeriod(cra.dateMois);
            craTitle.textContent = `CRA - ${cra.user_name || 'Utilisateur'} - ${period}`;
        }

        // Mise à jour des informations de statut
        const craStatusInfo = document.getElementById('craStatusInfo');
        if (craStatusInfo) {
            const status = this.formatStatus(cra.status);
            const submittedDate = cra.submittedAT ? new Date(cra.submittedAT).toLocaleDateString('fr-FR') : 'Non soumis';
            craStatusInfo.innerHTML = `
                <div class="status-info">
                    <span class="status-badge ${cra.status || 'en_attente'}">${status}</span>
                    <span class="submitted-date">Soumis le: ${submittedDate}</span>
                </div>
            `;
        }

        // Générer le tableau calendrier
        this.generateCalendarTable(cra);

        console.log('✅ Informations CRA affichées');
    }

    generateCalendarTable(cra) {
        const tableHeader = document.getElementById('craTableHeader');
        const tableBody = document.getElementById('craTableBody');
        
        if (!tableHeader || !tableBody) {
            console.warn('⚠️ Éléments du tableau non trouvés');
            return;
        }

        // Générer l'en-tête avec les jours du mois
        const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        let headerHTML = '<th class="project-header">Projet</th>';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            headerHTML += `<th class="day-header ${isWeekend ? 'weekend' : ''}" title="${dayName} ${day}">${day}</th>`;
        }
        
        tableHeader.innerHTML = headerHTML;

        // Générer le corps du tableau avec les activités
        this.populateTableBody(cra.activities || [], daysInMonth);

        console.log('✅ Tableau calendrier généré');
    }

    populateTableBody(activities, daysInMonth) {
        const tableBody = document.getElementById('craTableBody');
        
        // Grouper les activités par projet
        const projectActivities = {};
        activities.forEach(activity => {
            const projectName = activity.project_name || 'Projet sans nom';
            if (!projectActivities[projectName]) {
                projectActivities[projectName] = {};
            }
            const day = new Date(activity.date).getDate();
            if (!projectActivities[projectName][day]) {
                projectActivities[projectName][day] = [];
            }
            projectActivities[projectName][day].push(activity);
        });

        // Générer les lignes du tableau
        let bodyHTML = '';
        
        if (Object.keys(projectActivities).length === 0) {
            bodyHTML = `<tr><td colspan="${daysInMonth + 1}" class="text-center">Aucune activité trouvée pour ce CRA</td></tr>`;
        } else {
            Object.entries(projectActivities).forEach(([projectName, days]) => {
                bodyHTML += `<tr><td class="project-name">${this.escapeHtml(projectName)}</td>`;
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const dayActivities = days[day] || [];
                    const totalHours = dayActivities.reduce((sum, act) => sum + (parseFloat(act.hours) || 0), 0);
                    const cellClass = totalHours > 0 ? 'has-activity' : 'empty-day';
                    const cellContent = totalHours > 0 ? totalHours.toFixed(1) : '';
                    const title = dayActivities.map(act => act.description).join('; ');
                    
                    bodyHTML += `<td class="day-cell ${cellClass}" title="${this.escapeHtml(title)}">${cellContent}</td>`;
                }
                
                bodyHTML += '</tr>';
            });
        }
        
        tableBody.innerHTML = bodyHTML;
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    setupEventListeners() {
        // Bouton d'export
        const exportBtn = document.getElementById('exportCRA');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCRA());
        }
    }

    async exportCRA() {
        if (!this.craId) {
            this.showError('Impossible d\'exporter: ID de CRA manquant');
            return;
        }

        try {
            console.log('📤 Export du CRA:', this.craId);
            
            const url = `/admin/api/cra/${this.craId}/details-public`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `CRA_${this.craId}_${this.currentMonth + 1}_${this.currentYear}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);
                
                console.log('✅ Export réussi');
            } else {
                throw new Error(`Erreur d'export: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erreur export:', error);
            this.showError(`Erreur lors de l'export: ${error.message}`);
        }
    }

    // Utilitaires
    formatPeriod(dateMois) {
        if (!dateMois) return 'N/A';
        try {
            const date = new Date(dateMois);
            return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
        } catch {
            return dateMois;
        }
    }

    formatStatus(status) {
        const statusMap = {
            'en_attente': 'En attente',
            'valide': 'Validé',
            'refuse': 'Refusé'
        };
        return statusMap[status] || status || 'Inconnu';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        this.isLoading = show;
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        console.error('❌ Erreur:', message);
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            alert(`Erreur: ${message}`);
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    const manager = new VoirCRAAdminManager();
    manager.init();
});