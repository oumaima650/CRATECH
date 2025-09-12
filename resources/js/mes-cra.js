// Gestionnaire pour la page Mes CRA
class MesCRAManager {
    constructor() {
        this.csrf = document.getElementById('csrf-token');
        this.userId = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation de la page Mes CRA...');
        
        // Load CSRF token
        await this.loadCSRFToken();
        
        // Load user info
        await this.loadUserInfo();
        
        // Load CRA list
        await this.loadMesCRA();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Page Mes CRA initialisée avec succès !');
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
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    async loadMesCRA() {
        const loadingSpinner = document.getElementById('craListLoading');
        const craList = document.getElementById('craList');
        
        console.log('🔍 Début du chargement des CRA...');
        
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
            console.log('✅ Spinner affiché');
        }
        if (craList) {
            craList.innerHTML = '';
            console.log('✅ Liste vidée');
        }
        
        try {
            console.log('🌐 Appel API vers /employe/mes-cra...');
            
            const response = await fetch('/employe/mes-cra', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('📡 Réponse reçue:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log('📋 Content-Type:', contentType);
            
            const text = await response.text();
            console.log('📄 Réponse brute:', text.substring(0, 200) + '...');
            
            let data;
            try {
                data = JSON.parse(text);
                console.log('✅ JSON parsé avec succès:', data);
            } catch (parseError) {
                console.error('❌ Erreur de parsing JSON:', parseError);
                console.error('📄 Contenu complet:', text);
                throw new Error('Réponse invalide du serveur');
            }
            
            if (data.success) {
                console.log('✅ Données CRA reçues:', data.cras.length, 'éléments');
                this.displayCRAList(data.cras);
            } else {
                console.log('⚠️ Aucun CRA trouvé');
                if (craList) craList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Aucun CRA trouvé</p>';
            }
        } catch (error) {
            console.error('❌ Erreur complète:', error);
            if (craList) craList.innerHTML = '<p style="text-align: center; color: #ef4444;">Erreur: ' + error.message + '</p>';
        } finally {
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
                console.log('✅ Spinner masqué');
            }
        }
    }
    
    displayCRAList(cras) {
        const craList = document.getElementById('craList');
        console.log('🎨 Affichage de la liste CRA, éléments:', cras);
        
        if (!craList) {
            console.error('❌ Element craList non trouvé!');
            return;
        }
        
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        if (cras.length === 0) {
            craList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Aucun CRA trouvé</p>';
            console.log('⚠️ Aucun CRA à afficher');
            return;
        }
        
        const htmlContent = cras.map(cra => {
            const parts = String(cra.dateMois).split('-');
            const year = parseInt(parts[0], 10);
            const monthIndex = Math.max(0, Math.min(11, (parseInt(parts[1], 10) || 1) - 1));
            const monthName = monthNames[monthIndex];
            
            const statusText = {
                'en_attente': 'En attente',
                'valide': 'Validé',
                'refuse': 'Refusé'
            };
            
            const submissionText = cra.is_submitted ? 'Soumis' : 'Non soumis';
            const submissionClass = cra.is_submitted ? 'submitted' : 'not-submitted';
            
            return `
                <div class="cra-item" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background: white;">
                    <div class="cra-info" style="display: flex; align-items: center; gap: 16px;">
                        <div class="cra-date" style="font-weight: 600; color: #1e293b; font-size: 16px;">${monthName} ${year}</div>
                        <div class="cra-status" style="display: flex; align-items: center; gap: 8px;">
                            <span class="status-badge ${cra.status}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; ${this.getStatusStyle(cra.status)}">${statusText[cra.status] || cra.status}</span>
                            <span class="submission-status ${submissionClass}" style="font-size: 14px; ${cra.is_submitted ? 'color: #10b981; font-weight: 500;' : 'color: #f59e0b;'}">${submissionText}</span>
                        </div>
                    </div>
                    <div class="cra-actions" style="display: flex; gap: 8px;">
                        <a href="/employe/voir-cra.html?cra=${cra.id_CRA}&month=${monthIndex}&year=${year}" class="btn btn-secondary btn-small">
                            <i class="fas fa-eye"></i> Voir
                        </a>
                        <button onclick="window.mesCRAManager.exportCRA(${cra.id_CRA}, '${monthName}', ${year})" class="btn btn-primary btn-small">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        ${(cra.status === 'en_attente' || cra.status === 'refuse') ? `
                            <a href="/employe/dashboard.html?cra=${cra.id_CRA}&month=${monthIndex}&year=${year}&edit=1" class="btn btn-primary btn-small">
                                <i class="fas fa-edit"></i> Modifier
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        craList.innerHTML = htmlContent;
        console.log('✅ Liste CRA affichée avec succès!');
    }
    
    getStatusStyle(status) {
        switch(status) {
            case 'en_attente':
                return 'background: #fef3c7; color: #92400e;';
            case 'valide':
                return 'background: #d1fae5; color: #065f46;';
            case 'refuse':
                return 'background: #fee2e2; color: #991b1b;';
            default:
                return 'background: #f3f4f6; color: #374151;';
        }
    }

    async exportCRA(craId, monthName, year) {
        try {
            console.log('🔄 Export CRA:', craId, monthName, year);
            
            // Récupérer les données du CRA
            const response = await fetch(`/employe/cra/export/${craId}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de l\'export');
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Créer le fichier Excel
                this.generateExcelFile(data.craData, monthName, year, craId);
            } else {
                alert('Erreur: ' + (data.message || 'Impossible d\'exporter le CRA'));
            }
        } catch (error) {
            console.error('❌ Erreur export:', error);
            alert('Erreur lors de l\'export: ' + error.message);
        }
    }

    generateExcelFile(craData, monthName, year, craId) {
        const daysInMonth = new Date(year, new Date(monthName + ' 1, ' + year).getMonth() + 1, 0).getDate();
        
        // Créer le contenu HTML pour Excel
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
        
        // En-têtes des jours
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, new Date(monthName + ' 1, ' + year).getMonth(), day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            htmlContent += `<th class="header${weekendClass}">${day}</th>`;
        }
        
        htmlContent += '<th class="header total">Total</th></tr></thead><tbody>';
        
        // Lignes des projets
        if (craData.projects && craData.projects.length > 0) {
            craData.projects.forEach(project => {
                htmlContent += `<tr><td class="project">${project.name}</td>`;
                
                let rowTotal = 0;
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateKey = `${year}-${String(new Date(monthName + ' 1, ' + year).getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const cellKey = `${project.id}_${dateKey}`;
                    const value = craData.data[cellKey] || '0';
                    rowTotal += parseFloat(value);
                    
                    const date = new Date(year, new Date(monthName + ' 1, ' + year).getMonth(), day);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const weekendClass = isWeekend ? ' weekend' : '';
                    
                    htmlContent += `<td class="${weekendClass}">${value}</td>`;
                }
                
                htmlContent += `<td class="total">${rowTotal.toFixed(1)}</td></tr>`;
            });
        }
        
        htmlContent += '</tbody></table></body></html>';
        
        // Télécharger le fichier
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CRA_${monthName}_${year}_ID${craId}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Fichier Excel généré et téléchargé');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.mesCRAManager = new MesCRAManager();
});
