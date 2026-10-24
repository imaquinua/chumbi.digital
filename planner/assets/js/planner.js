document.addEventListener('DOMContentLoaded', () => {
    const app = {
        // --- CONFIGURATION ---
        habits: [
            "Dormir 8 horas", "Beber 2L de agua", "Estudiar italiano", "Escribir",
            "Leer 50 páginas", "Entrenar", "Comer bien", "Sonreír"
        ],

        // --- STATE ---
        currentDate: new Date('2025-07-01'), // Static for "Julio 2025" as requested
        data: {},

        // --- DOM ELEMENTS ---
        elements: {
            monthDisplay: document.getElementById('current-month'),
            keyEventsList: document.getElementById('key-events-list'),
            habitList: document.getElementById('habit-list'),
            habitChart: document.getElementById('habit-chart'),
            goalInputs: document.querySelectorAll('.goals-list input'),
            reflectionSliders: document.querySelectorAll('.reflection-metrics input[type="range"]'),
            clearDataBtn: document.getElementById('clear-data-btn'),
            exportPdfBtn: document.getElementById('export-pdf-btn'),
            notebookContainer: document.getElementById('notebook-container')
        },

        // --- INITIALIZATION ---
        init() {
            this.loadData();
            this.renderMonth();
            this.renderKeyEvents();
            this.renderHabits();
            this.updateGraph();
            this.attachEventListeners();
        },

        // --- DATA HANDLING ---
        getStorageKey() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth() + 1;
            return `planner-data-${year}-${month}`;
        },
        
        loadData() {
            const savedData = localStorage.getItem(this.getStorageKey());
            this.data = savedData ? JSON.parse(savedData) : {
                keyEvents: {},
                habits: {},
                goals: ["", "", ""],
                reflection: { energia: 8, emocional: 7, vida: 10 }
            };
        },

        saveData() {
            localStorage.setItem(this.getStorageKey(), JSON.stringify(this.data));
            this.updateGraph();
        },

        clearData() {
            if (confirm("¿Estás seguro de que quieres borrar todos los datos de este mes? Esta acción no se puede deshacer.")) {
                localStorage.removeItem(this.getStorageKey());
                location.reload();
            }
        },

        exportPDF() {
            const element = this.elements.notebookContainer;
            const opt = {
                margin:       0.5,
                filename:     `Crea_Chispa_${this.getStorageKey()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        },
        
        // --- RENDER FUNCTIONS ---
        renderMonth() {
            const monthName = this.currentDate.toLocaleString('es-ES', { month: 'long' });
            const year = this.currentDate.getFullYear();
            this.elements.monthDisplay.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        },

        getDaysInMonth() {
            return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        },

        renderKeyEvents() {
            this.elements.keyEventsList.innerHTML = '';
            const days = this.getDaysInMonth();
            for (let i = 1; i <= days; i++) {
                const day = i.toString().padStart(2, '0');
                const eventHtml = `
                    <div class="daily-event">
                        <span>${day}</span>
                        <input type="text" data-day="${i}" value="${this.data.keyEvents[i] || ''}" placeholder="He aprendido a hacer pizza casera...">
                    </div>`;
                this.elements.keyEventsList.insertAdjacentHTML('beforeend', eventHtml);
            }
        },

        renderHabits() {
            this.elements.habitList.innerHTML = '';
            const days = this.getDaysInMonth();
            this.habits.forEach((habit, habitIndex) => {
                let daysHtml = '';
                for (let day = 1; day <= days; day++) {
                    const isChecked = (this.data.habits[day] && this.data.habits[day][habitIndex]) ? 'checked' : '';
                    daysHtml += `<div class="habit-checkbox ${isChecked}" data-day="${day}" data-habit="${habitIndex}"></div>`;
                }
                const habitRowHtml = `
                    <div class="habit-row">
                        <div class="habit-name">${habit}</div>
                        <div class="habit-days">${daysHtml}</div>
                    </div>
                `;
                this.elements.habitList.insertAdjacentHTML('beforeend', habitRowHtml);
            });
        },

        updateGraph() {
            const days = this.getDaysInMonth();
            const dailyTotals = Array(days).fill(0);
            
            for(let day = 1; day <= days; day++) {
                if (this.data.habits[day]) {
                    dailyTotals[day - 1] = this.data.habits[day].filter(Boolean).length;
                }
            }

            const svg = this.elements.habitChart;
            svg.innerHTML = ''; // Clear previous graph

            const maxHabits = this.habits.length;
            const width = svg.clientWidth;
            const height = svg.clientHeight;
            const padding = 20;

            // Create points
            const points = dailyTotals.map((total, index) => {
                const x = padding + (index / (days - 1)) * (width - 2 * padding);
                const y = height - padding - (total / maxHabits) * (height - 2 * padding);
                return { x, y };
            });

            // Create polyline
            if (points.length > 1) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ');
                path.setAttribute('d', d);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'var(--color-accent-2)');
                path.setAttribute('stroke-width', '2');
                svg.appendChild(path);
            }
            
            // Create dots
            points.forEach(p => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '4');
                circle.setAttribute('fill', 'var(--color-accent)');
                svg.appendChild(circle);
            });
        },

        // --- EVENT LISTENERS ---
        attachEventListeners() {
            // Key Events
            this.elements.keyEventsList.addEventListener('input', (e) => {
                if (e.target.matches('input')) {
                    const day = e.target.dataset.day;
                    this.data.keyEvents[day] = e.target.value;
                    this.saveData();
                }
            });

            // Habits
            this.elements.habitList.addEventListener('click', (e) => {
                if (e.target.matches('.habit-checkbox')) {
                    const day = e.target.dataset.day;
                    const habitIndex = parseInt(e.target.dataset.habit, 10);
                    
                    if (!this.data.habits[day]) {
                        this.data.habits[day] = Array(this.habits.length).fill(false);
                    }
                    
                    this.data.habits[day][habitIndex] = !this.data.habits[day][habitIndex];
                    e.target.classList.toggle('checked');
                    this.saveData();
                }
            });

            // Goals
            this.elements.goalInputs.forEach((input, index) => {
                input.value = this.data.goals[index] || '';
                input.addEventListener('input', () => {
                    this.data.goals[index] = input.value;
                    this.saveData();
                });
            });

            // Reflection
            this.elements.reflectionSliders.forEach(slider => {
                const metricName = slider.id;
                slider.value = this.data.reflection[metricName];
                slider.nextElementSibling.textContent = slider.value;

                slider.addEventListener('input', () => {
                    slider.nextElementSibling.textContent = slider.value;
                    this.data.reflection[metricName] = parseInt(slider.value, 10);
                    this.saveData();
                });
            });
            
            // Actions
            this.elements.clearDataBtn.addEventListener('click', () => this.clearData());
            this.elements.exportPdfBtn.addEventListener('click', () => this.exportPDF());

            // Resize
            window.addEventListener('resize', () => this.updateGraph());
        }
    };

    app.init();
});
