class CRAManager {
    constructor() {
        this.monthSelect = document.getElementById('monthSelect');
        this.yearSelect = document.getElementById('yearSelect');
        this.prevBtn = document.getElementById('prevMonth');
        this.nextBtn = document.getElementById('nextMonth');
        this.craTable = document.getElementById('craTable');
        this.craTableHeader = document.getElementById('craTableHeader');
        this.craTableBody = document.getElementById('craTableBody');
        this.submitCRABtn = document.getElementById('submitCRA');
        this.exportCRABtn = document.getElementById('exportCRA');
        this.dayValueModal = document.getElementById('dayValueModal');
        this.csrf = document.getElementById('csrf-token');

        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.selectedValue = '0';
        this.craData = {};
        this.projects = [];
        this.currentCRAId = null;
        this.autoSaveEnabled = false;
        this.currentCell = null;

        this.init();
    }

    async init() {
        await this.fetchCSRFToken();
        await this.loadUserInfo();
        this.parseURLParams();
        this.setupEventListeners();
        this.updateSelectors();
        await this.loadProjects();
        this.buildCRATable();
    }

    async fetchCSRFToken() {
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

                const userNameElement = document.getElementById('userName');
                const headerUserNameElement = document.getElementById('headerUserName');

                if (userNameElement) {
                    userNameElement.textContent = userName;
                }
                if (headerUserNameElement) {
                    headerUserNameElement.textContent = userName;
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des informations utilisateur:', error);
        }
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.nextBtn.addEventListener('click', () => this.navigateMonth(1));
        this.monthSelect.addEventListener('change', () => this.onDateChange());
        this.yearSelect.addEventListener('change', () => this.onDateChange());
        this.submitCRABtn.addEventListener('click', () => this.submitCRA());
        this.exportCRABtn.addEventListener('click', () => this.exportCRA());

        // Navigation events - removed since using separate pages now

        // Modal event listeners
        this.setupModalListeners();
    }

    setupModalListeners() {
        const valueOptions = this.dayValueModal.querySelectorAll('.value-option-compact');

        this.dayValueModal.addEventListener('click', (e) => {
            if (e.target === this.dayValueModal) {
                this.closeModal();
            }
        });

        valueOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                this.applyValueToCell(value);
                this.closeModal();
            });
        });
    }

    parseURLParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            const monthParam = params.get('month');
            const yearParam = params.get('year');
            const craParam = params.get('cra');
            // edit param is not strictly needed here
            // const editParam = params.get('edit');

            if (yearParam && !isNaN(parseInt(yearParam))) {
                this.currentYear = parseInt(yearParam);
            }
            if (monthParam !== null) {
                let m = parseInt(monthParam);
                if (!isNaN(m)) {
                    // Accept both 0-based and 1-based
                    if (m > 11) m = m - 1;
                    if (m >= 0 && m <= 11) this.currentMonth = m;
                }
            }
            if (craParam && !isNaN(parseInt(craParam))) {
                this.currentCRAId = parseInt(craParam);
            }
        } catch (e) {
            console.warn('Paramètres URL invalides, utilisation des valeurs par défaut');
        }
    }


    updateSelectors() {
        // Update month selector with full month names
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        this.monthSelect.innerHTML = '';
        monthNames.forEach((monthName, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = monthName;
            if (index === this.currentMonth) option.selected = true;
            this.monthSelect.appendChild(option);
        });

        // Update year selector with extended range
        this.yearSelect.innerHTML = '';
        const startYear = 2020;
        const endYear = new Date().getFullYear() + 5;

        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.currentYear) option.selected = true;
            this.yearSelect.appendChild(option);
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('/employe/activities', { credentials: 'same-origin' });
            const data = await response.json();

            if (response.ok && data.activities) {
                this.projects = data.activities.map(activity => ({
                    id: activity.id_activité,
                    name: activity.nom_act,
                    code: activity.nom_act.substring(0, 5).toUpperCase()
                }));
            } else {
                this.projects = [];
                this.showNotification('Aucune activité assignée', 'info');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            this.projects = [];
            this.showNotification('Erreur lors du chargement des activités', 'error');
        }
    }

    buildCRATable() {
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Build header
        this.buildTableHeader(daysInMonth);

        // Build body
        this.buildTableBody(daysInMonth);

        // Load existing data
        this.loadCRAData();
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

            let rowTotal = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.currentYear, this.currentMonth, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const weekendClass = isWeekend ? ' weekend' : '';
                const dateKey = this.formatDate(this.currentYear, this.currentMonth + 1, day);
                const cellKey = `${project.id}_${dateKey}`;

                bodyHTML += `<td>
                    <div class="day-cell zero${weekendClass}" 
                         data-project-id="${project.id}" 
                         data-date="${dateKey}"
                         data-day="${day}">0</div>
                </td>`;
            }

            bodyHTML += `<td class="total-cell" data-project-id="${project.id}">0</td>`;
            bodyHTML += '</tr>';
        });

        this.craTableBody.innerHTML = bodyHTML;

        // Add click listeners to cells
        this.addCellListeners();
    }

    addCellListeners() {
        const dayCells = this.craTableBody.querySelectorAll('.day-cell');
        dayCells.forEach(cell => {
            cell.addEventListener('click', () => {
                this.openModal(cell);
            });
        });
    }

    openModal(cell) {
        this.currentCell = cell;
        console.log('Opening modal for cell:', cell);

        const modal = this.dayValueModal;
        console.log('Modal element:', modal);

        if (!modal) {
            console.error('Modal not found!');
            return;
        }

        // Affichage simple pour test
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '10000';
        modal.style.background = 'rgba(0, 0, 0, 0.5)';

        console.log('Modal should be visible now');
    }

    closeModal() {
        const modal = this.dayValueModal;

        modal.style.display = 'none';

        // Reset all styles
        modal.style.position = '';
        modal.style.top = '';
        modal.style.left = '';
        modal.style.transform = '';
        modal.style.zIndex = '';
        modal.style.background = '';

        this.currentCell = null;
    }

    applyValueToCell(value) {
        if (!this.currentCell) return;

        const projectId = this.currentCell.dataset.projectId;
        const date = this.currentCell.dataset.date;

        // Update cell
        this.currentCell.textContent = value;
        this.currentCell.className = `day-cell ${this.getValueClass(value)}`;

        // Store in data
        const key = `${projectId}_${date}`;
        this.craData[key] = value;

        // Update row total
        this.updateRowTotal(projectId);

        // Auto-save if enabled
        if (this.autoSaveEnabled) {
            this.autoSave();
        } else {
            // Enable auto-save after first modification
            this.enableAutoSave();
        }
    }

    async enableAutoSave() {
        if (!this.currentCRAId) {
            await this.createCRA();
        }
        this.autoSaveEnabled = true;
        this.showNotification('Auto-sauvegarde activée', 'info');
    }

    async createCRA() {
        try {
            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];

            const userIdSuffix = this.userId ? `_User${this.userId}` : '';
            const excelFileName = `CRA_${monthNames[this.currentMonth]}_${this.currentYear}${userIdSuffix}.xls`;

            const payload = {
                year: this.currentYear,
                month: this.currentMonth + 1,
                status: 'en_attente',
                excel_path: excelFileName
            };

            const response = await fetch('/employe/cra/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                this.currentCRAId = result.cra_id;
            }
        } catch (error) {
            console.error('Erreur lors de la création du CRA:', error);
        }
    }

    async autoSave() {
        if (!this.currentCRAId) return;

        try {
            const payload = {
                cra_id: this.currentCRAId,
                data: this.craData
            };

            await fetch('/employe/cra/autosave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Erreur lors de l\'auto-sauvegarde:', error);
        }
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
        const cells = row.querySelectorAll('.day-cell');
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

    navigateMonth(direction) {
        this.currentMonth += direction;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }

        this.updateSelectors();
        this.buildCRATable();
    }

    onDateChange() {
        this.currentMonth = parseInt(this.monthSelect.value);
        this.currentYear = parseInt(this.yearSelect.value);
        this.buildCRATable();
    }

    async loadCRAData() {
        try {
            const response = await fetch(`/employe/cra/load?year=${this.currentYear}&month=${this.currentMonth + 1}`, {
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                this.applyCRAData(data);
                await this.checkSubmissionStatus();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données CRA:', error);
        }
    }

    applyCRAData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const [projectId, date] = key.split('_');
            const cell = this.craTableBody.querySelector(
                `.day-cell[data-project-id="${projectId}"][data-date="${date}"]`
            );

            if (cell) {
                cell.textContent = value;
                cell.className = `day-cell ${this.getValueClass(value)}`;
                this.craData[key] = value;
            }
        });

        // Update all row totals
        this.projects.forEach(project => {
            this.updateRowTotal(project.id);
        });
    }

    async saveCRA() {
        try {
            if (!this.currentCRAId) {
                await this.createCRA();
            }

            const payload = {
                cra_id: this.currentCRAId,
                year: this.currentYear,
                month: this.currentMonth + 1,
                data: this.craData,
                status: 'en_attente'
            };

            const response = await fetch('/employe/cra/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('CRA sauvegardé avec succès!', 'success');
            } else {
                this.showNotification(result.message || 'Erreur lors de la sauvegarde', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    async submitCRA() {
        try {
            // S'assurer qu'un CRA existe pour le mois/année courants
            if (!this.currentCRAId) {
                await this.createCRA();
            }
            if (!this.currentCRAId) {
                this.showNotification('Impossible de déterminer le CRA à soumettre', 'error');
                return;
            }

            const payload = {
                cra_id: this.currentCRAId
            };

            const response = await fetch('/employe/cra/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrf.value
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('CRA soumis avec succès!', 'success');
                this.submitCRABtn.disabled = true;
                this.submitCRABtn.innerHTML = '<i class="fas fa-check"></i> Soumis';
                // Verrouiller l'édition après soumission
                this.lockEditing();
            } else {
                this.showNotification(result.message || 'Erreur lors de la soumission', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            this.showNotification('Erreur lors de la soumission', 'error');
        }
    }

    lockEditing() {
        // Désactiver uniquement l'édition des cellules pour le mois courant
        try {
            const dayCells = this.craTableBody.querySelectorAll('.day-cell');
            dayCells.forEach(c => {
                c.style.pointerEvents = 'none';
                c.style.opacity = '0.7';
            });
        } catch (e) { console.warn('Lock editing failed', e); }
    }

    async checkSubmissionStatus() {
        try {
            const resp = await fetch(`/employe/cra/status?year=${this.currentYear}&month=${this.currentMonth + 1}`, { credentials: 'same-origin' });
            const st = await resp.json();
            if (resp.ok && st.success) {
                if (st.submitted) {
                    // Verrouiller l'édition du mois courant
                    this.lockEditing();

                    // Masquer le bouton de soumission s'il est déjà soumis
                    if (this.submitCRABtn) {
                        this.submitCRABtn.style.display = 'none';
                    }

                    this.showNotification('Ce CRA est déjà soumis ! Aucune modification ne sera prise en considération', 'info');
                } else {
                    this.unlockEditing();

                    // Réafficher le bouton de soumission s'il n'est pas encore soumis
                    if (this.submitCRABtn) {
                        this.submitCRABtn.style.display = 'flex';
                    }
                }
            }
        } catch (e) {
            console.warn('Status check failed', e);
        }
    }

    unlockEditing() {
        try {
            const dayCells = this.craTableBody.querySelectorAll('.day-cell');
            dayCells.forEach(c => {
                c.style.pointerEvents = '';
                c.style.opacity = '';
            });
        } catch (e) { console.warn('Unlock editing failed', e); }
    }

    exportCRA() {
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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
        .grand-total { background-color: #FFB6C1; font-weight: bold; }
    </style>
</head>
<body>
    <h2>CRA - ${monthNames[this.currentMonth]} ${this.currentYear}</h2>
    <table>
        <thead>
            <tr class="header">
                <th rowspan="2">Projet</th>`;

        // Add day names header
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dayName = dayNames[date.getDay()];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            htmlContent += `<th class="header${weekendClass}">${dayName}</th>`;
        }
        htmlContent += `<th class="header" rowspan="2">Total</th></tr>`;

        // Add day numbers header
        htmlContent += `<tr class="header">`;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            htmlContent += `<th class="header${weekendClass}">${day}</th>`;
        }
        htmlContent += `</tr></thead><tbody>`;

        // Data rows for each project
        this.projects.forEach(project => {
            htmlContent += `<tr><td class="project">${project.name}</td>`;
            let total = 0;

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.currentYear, this.currentMonth, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const weekendClass = isWeekend ? ' weekend' : '';
                const dateKey = this.formatDate(this.currentYear, this.currentMonth + 1, day);
                const cellKey = `${project.id}_${dateKey}`;
                const value = this.craData[cellKey] || '0';
                htmlContent += `<td class="${weekendClass}">${value}</td>`;
                total += parseFloat(value);
            }

            htmlContent += `<td class="total">${total.toFixed(1)}</td></tr>`;
        });

        // Add summary row
        htmlContent += `<tr><td class="grand-total">TOTAL GÉNÉRAL</td>`;
        let grandTotal = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendClass = isWeekend ? ' weekend' : '';
            let dayTotal = 0;
            this.projects.forEach(project => {
                const dateKey = this.formatDate(this.currentYear, this.currentMonth + 1, day);
                const cellKey = `${project.id}_${dateKey}`;
                const value = parseFloat(this.craData[cellKey] || '0');
                dayTotal += value;
            });
            htmlContent += `<td class="grand-total${weekendClass}">${dayTotal.toFixed(1)}</td>`;
            grandTotal += dayTotal;
        }
        htmlContent += `<td class="grand-total">${grandTotal.toFixed(1)}</td></tr>`;

        htmlContent += `</tbody></table>
    <br><p><strong>Total Requis: ${grandTotal.toFixed(1)}</strong></p>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const userIdSuffix = this.userId ? `_User${this.userId}` : '';
        a.download = `CRA_${monthNames[this.currentMonth]}_${this.currentYear}${userIdSuffix}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    viewCRA(craId, month, year) {
        this.currentMonth = month;
        this.currentYear = year;
        this.currentCRAId = craId;
        this.showCRADashboard();
        this.loadCRAData();
    }

    editCRA(craId, month, year) {
        this.viewCRA(craId, month, year);
    }

    generateCalendar() {
        const tbody = this.calendarTable.querySelector('tbody');
        tbody.innerHTML = '';

        // Get days in month
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Generate rows for each activity
        this.activities.forEach(activity => {
            const row = document.createElement('tr');

            // Activity name cell
            const activityCell = document.createElement('td');
            activityCell.className = 'project-cell';
            activityCell.textContent = activity.nom_act;
            row.appendChild(activityCell);

            // Day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('td');
                dayCell.className = 'day-cell';

                // Check if weekend
                const date = new Date(this.currentYear, this.currentMonth, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                if (isWeekend) {
                    dayCell.classList.add('weekend');
                    dayCell.textContent = '0';
                } else {
                    dayCell.classList.add('zero');
                    dayCell.textContent = '0';
                }

                // Allow clicking on all days (including weekends)
                dayCell.addEventListener('click', () => this.openModal(dayCell, activity.id_activité, day));

                row.appendChild(dayCell);
            }

            tbody.appendChild(row);
        });
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.background = 'var(--success)';
        } else if (type === 'error') {
            notification.style.background = 'var(--error)';
        } else {
            notification.style.background = 'var(--primary-blue)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CRAManager();
});


