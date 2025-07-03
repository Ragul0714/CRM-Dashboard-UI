document.addEventListener('DOMContentLoaded', () => {

    const getElement = (selector) => document.querySelector(selector);
    const getAllElements = (selector) => document.querySelectorAll(selector);
    const getFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const ModalModule = (() => {
        const modal = getElement('#mainModal');
        const modalOverlay = getElement('.modal-overlay');
        const modalTitle = getElement('#modalTitle');
        const modalBody = getElement('#modalBody');
        const modalFooter = getElement('#modalFooter');
        const closeModalBtn = getElement('.close-modal-btn');

        const openModal = (title, bodyHtml, footerHtml = '') => {
            modalTitle.textContent = title;
            modalBody.innerHTML = bodyHtml;
            modalFooter.innerHTML = footerHtml;
            modal.classList.add('active');
            modalOverlay.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            modalOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; 
        };

        const closeModal = () => {
            modal.classList.remove('active');
            modalOverlay.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            modalOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; 
            modalTitle.textContent = '';
            modalBody.innerHTML = '';
            modalFooter.innerHTML = '';
        };

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal); 

        return {
            open: openModal,
            close: closeModal
        };
    })();

    const SidebarModule = (() => {
        const sidebar = getElement('.sidebar');
        const sidebarToggle = getElement('.sidebar-toggle');
        const mainNavLinks = getAllElements('.main-nav ul li a');
        const dashboardSections = getAllElements('.dashboard-section');

        const toggleSidebar = () => {
            sidebar.classList.toggle('active');
            if (window.innerWidth <= 768) { 
                const overlay = getElement('.modal-overlay'); 
                if (sidebar.classList.contains('active')) {
                    overlay.classList.add('active');
                    overlay.style.zIndex = '1045'; 
                    overlay.addEventListener('click', toggleSidebar); 
                } else {
                    overlay.classList.remove('active');
                    overlay.style.zIndex = '1040'; 
                    overlay.removeEventListener('click', toggleSidebar);
                }
            }
        };

        const switchSection = (sectionId) => {
            dashboardSections.forEach(section => {
                section.classList.remove('active-section');
            });
            getElement(sectionId).classList.add('active-section');
        };

        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }

        mainNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                mainNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const sectionId = link.dataset.section; 
                if (sectionId) {
                    switchSection(`#${sectionId}`);
                }


                if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            });
        });

        const initialSection = window.location.hash || '#dashboard';
        const activeLink = getElement(`.main-nav ul li a[data-section="${initialSection.substring(1)}"]`);
        if (activeLink) {
            mainNavLinks.forEach(l => l.classList.remove('active'));
            activeLink.classList.add('active');
            switchSection(initialSection);
        } else {
             switchSection('#dashboard'); 
        }

        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                if (getElement('.modal-overlay').classList.contains('active')) {
                    getElement('.modal-overlay').classList.remove('active');
                    getElement('.modal-overlay').style.zIndex = '1040';
                    getElement('.modal-overlay').removeEventListener('click', toggleSidebar);
                }
            }
        });

        return {
            init: () => {  }
        };
    })();

    const DashboardCardsModule = (() => {
        const dashboardCardsContainer = getElement('.dashboard-cards');

        
        const fetchCardData = async () => {
            
            return new Promise(resolve => {
                setTimeout(() => { 
                    resolve([
                        { icon: 'fas fa-user-plus', title: 'New Leads', value: Math.floor(Math.random() * 100) + 1200 },
                        { icon: 'fas fa-handshake', title: 'Closed Deals', value: Math.floor(Math.random() * 10000) + 50000, prefix: '$' },
                        { icon: 'fas fa-percent', title: 'Conversion Rate', value: (Math.random() * 5 + 15).toFixed(1), suffix: '%' },
                        { icon: 'fas fa-dollar-sign', title: 'Revenue', value: Math.floor(Math.random() * 50000) + 100000, prefix: '$' }
                    ]);
                }, 500);
            });
        };

        const renderCards = (cardsData) => {
            dashboardCardsContainer.innerHTML = ''; 
            cardsData.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card', 'stat-card');
                cardElement.innerHTML = `
                    <div class="card-icon"><i class="${card.icon}"></i></div>
                    <div class="card-info">
                        <h4>${card.title}</h4>
                        <p>${card.prefix || ''}${card.value.toLocaleString()}${card.suffix || ''}</p>
                    </div>
                `;
                dashboardCardsContainer.appendChild(cardElement);
            });
        };

        const init = async () => {
            const data = await fetchCardData();
            renderCards(data);
        };

        return { init };
    })();

    const LeadsTableModule = (() => {
        const leadSearchInput = getElement('#leadSearch');
        const leadsTableBody = getElement('#leadsTableBody');
        const leadsPagination = getElement('#leadsPagination');

        let allLeadsData = []; 
        const leadsPerPage = 5;
        let currentPage = 1;

        
        const fetchLeadsData = async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", source: "Website", status: "new", notes: "Interested in premium package." },
                        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+0987654321", source: "Referral", status: "contacted", notes: "Discussed features, follow-up needed next week." },
                        { id: 3, name: "Peter Jones", email: "peter@example.com", phone: "+1122334455", source: "Campaign", status: "qualified", notes: "Ready for a demo." },
                        { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "+9988776655", source: "Social Media", status: "new", notes: "Sent introductory email." },
                        { id: 5, name: "Bob White", email: "bob@example.com", phone: "+4433221100", source: "Website", status: "qualified", notes: "Requested a quote." },
                        { id: 6, name: "Charlie Green", email: "charlie@example.com", phone: "+1231231234", source: "Email", status: "contacted", notes: "Followed up with brochure." },
                        { id: 7, name: "Diana Prince", email: "diana@example.com", phone: "+5675675678", source: "Cold Call", status: "lost", notes: "Not interested at this time." },
                        { id: 8, name: "Eve Black", email: "eve@example.com", phone: "+8768768765", source: "Website", status: "new", notes: "New signup." },
                        { id: 9, name: "Frank Miller", email: "frank@example.com", phone: "+1239876543", source: "Referral", status: "qualified", notes: "High potential." },
                        { id: 10, name: "Grace Lee", email: "grace@example.com", phone: "+0981234567", source: "Campaign", status: "new", notes: "Attended webinar." },
                    ]);
                }, 700);
            });
        };

        const renderLeadsTable = (leadsToRender) => {
            leadsTableBody.innerHTML = '';
            const startIndex = (currentPage - 1) * leadsPerPage;
            const endIndex = startIndex + leadsPerPage;
            const paginatedLeads = leadsToRender.slice(startIndex, endIndex);

            if (paginatedLeads.length === 0) {
                leadsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No leads found.</td></tr>';
                return;
            }

            paginatedLeads.forEach(lead => {
                const row = document.createElement('tr');
                row.dataset.leadId = lead.id; 
                row.innerHTML = `
                    <td>${lead.name}</td>
                    <td>${lead.email}</td>
                    <td>${lead.phone}</td>
                    <td>${lead.source}</td>
                    <td><span class="status ${lead.status}">${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</span></td>
                    <td><button class="action-btn view-btn" title="View Details" aria-label="View details for ${lead.name}"><i class="fas fa-eye"></i></button></td>
                `;
                leadsTableBody.appendChild(row);
            });
            renderPagination(leadsToRender.length);
        };

        const renderPagination = (totalLeads) => {
            const totalPages = Math.ceil(totalLeads / leadsPerPage);
            leadsPagination.innerHTML = '';

            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Prev';
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener('click', () => {
                currentPage--;
                applySearchAndRender();
            });
            leadsPagination.appendChild(prevBtn);

            const pageInfo = document.createElement('span');
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            leadsPagination.appendChild(pageInfo);

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener('click', () => {
                currentPage++;
                applySearchAndRender();
            });
            leadsPagination.appendChild(nextBtn);
        };

        const applySearchAndRender = () => {
            const searchTerm = leadSearchInput.value.toLowerCase();
            const filteredLeads = allLeadsData.filter(lead =>
                Object.values(lead).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                )
            );
            renderLeadsTable(filteredLeads);
        };

        const showLeadDetails = (leadId) => {
            const lead = allLeadsData.find(l => l.id === parseInt(leadId));
            if (lead) {
                const bodyHtml = `
                    <p><strong>Name:</strong> ${lead.name}</p>
                    <p><strong>Email:</strong> ${lead.email}</p>
                    <p><strong>Phone:</strong> ${lead.phone}</p>
                    <p><strong>Source:</strong> ${lead.source}</p>
                    <p><strong>Status:</strong> <span class="status ${lead.status}">${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</span></p>
                    <p><strong>Notes:</strong> ${lead.notes || 'No notes.'}</p>
                `;
                ModalModule.open(`Lead Details: ${lead.name}`, bodyHtml);
            }
        };

        const init = async () => {
            allLeadsData = await fetchLeadsData();
            applySearchAndRender(); 

            leadSearchInput.addEventListener('keyup', () => {
                currentPage = 1; 
                applySearchAndRender();
            });

            
            leadsTableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row && row.dataset.leadId) {
                    showLeadDetails(row.dataset.leadId);
                }
            });
        };

        return { init };
    })();

    
    const KanbanModule = (() => {
        const kanbanBoard = getElement('.kanban-board');
        const newTaskInput = getElement('#newTaskInput');
        const addTaskBtn = getElement('#addTaskBtn');
        const kanbanColumns = getAllElements('.kanban-column');

        let tasks = []; 

        
        const fetchTasks = async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { id: 'task-1', title: 'Initial Client Outreach', description: 'Contact new leads from the database.', dueDate: '2025-07-05', status: 'todo' },
                        { id: 'task-2', title: 'Prepare Demo Presentation', description: 'Gather slides and product features.', dueDate: '2025-07-07', status: 'todo' },
                        { id: 'task-3', title: 'Follow-up with John Doe', description: 'Send updated proposal.', dueDate: '2025-07-03', status: 'inprogress' },
                        { id: 'task-4', title: 'CRM Setup Completed', description: 'Initial configuration of new system.', completedDate: '2025-06-30', status: 'done' },
                        { id: 'task-5', title: 'Review Q2 Performance', description: 'Analyze sales data for the second quarter.', dueDate: '2025-07-10', status: 'todo' },
                        { id: 'task-6', title: 'Onboard New Sales Rep', description: 'Provide training and resources.', dueDate: '2025-07-12', status: 'inprogress' },
                    ]);
                }, 600);
            });
        };

        const renderTasks = () => {
            kanbanColumns.forEach(column => {
                column.innerHTML = `<h3>${column.querySelector('h3').textContent.split('<span')[0].trim()} <span class="task-count">(0)</span></h3>`; // Clear and reset column header
            });

            const updateCount = (columnId, count) => {
                const column = getElement(`#${columnId}`);
                if (column) {
                    const countSpan = column.querySelector('.task-count');
                    if (countSpan) {
                        countSpan.textContent = `(${count})`;
                    }
                }
            };

            const counts = { todo: 0, inprogress: 0, done: 0 };

            tasks.forEach(task => {
                const columnElement = getElement(`#column-${task.status}`);
                if (columnElement) {
                    const taskCard = document.createElement('div');
                    taskCard.classList.add('task-card');
                    taskCard.setAttribute('draggable', 'true');
                    taskCard.dataset.taskId = task.id;
                    taskCard.dataset.status = task.status;
                    taskCard.setAttribute('tabindex', '0');
                    taskCard.setAttribute('role', 'listitem'); 

                    taskCard.innerHTML = `
                        <h4>${task.title}</h4>
                        <p>${task.description}</p>
                        <span class="task-date">${task.dueDate ? `Due: ${task.dueDate}` : `Completed: ${task.completedDate}`}</span>
                    `;
                    columnElement.appendChild(taskCard);
                    counts[task.status]++;
                }
            });
            updateCount('column-todo', counts.todo);
            updateCount('column-inprogress', counts.inprogress);
            updateCount('column-done', counts.done);
        };

        const addTask = () => {
            const title = newTaskInput.value.trim();
            if (title) {
                const newTask = {
                    id: `task-${Date.now()}`, 
                    title: title,
                    description: 'No description yet.',
                    dueDate: getFormattedDate(new Date(new Date().setDate(new Date().getDate() + 7))), 
                    status: 'todo'
                };
                tasks.unshift(newTask); 
                renderTasks();
                newTaskInput.value = '';
                newTaskInput.focus();
                console.log('Task Added:', newTask);
            }
        };

        const showTaskDetails = (taskId) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const bodyHtml = `
                    <p><strong>Title:</strong> ${task.title}</p>
                    <p><strong>Description:</strong> ${task.description || 'N/A'}</p>
                    <p><strong>Status:</strong> <span class="status ${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span></p>
                    ${task.dueDate ? `<p><strong>Due Date:</strong> ${task.dueDate}</p>` : ''}
                    ${task.completedDate ? `<p><strong>Completed On:</strong> ${task.completedDate}</p>` : ''}
                `;
                ModalModule.open(`Task Details: ${task.title}`, bodyHtml);
            }
        };

        let draggedItem = null;

        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedItem = e.target;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId); 
                setTimeout(() => {
                    draggedItem.classList.add('dragging');
                }, 0);
            }
        });

        kanbanBoard.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });

        kanbanColumns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault(); 
                e.dataTransfer.dropEffect = 'move'; 
                const afterElement = getDragAfterElement(column, e.clientY);
                const draggable = getElement('.dragging');
                if (draggable && column.contains(draggable)) return; 

                if (draggable) {
                    if (afterElement == null) {
                        column.appendChild(draggable);
                    } else {
                        column.insertBefore(draggable, afterElement);
                    }
                }
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const droppedTaskElement = getElement(`.task-card[data-task-id="${taskId}"]`);
                const newStatus = column.dataset.status;

                if (droppedTaskElement && newStatus) {
                    const taskIndex = tasks.findIndex(task => task.id === taskId);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].status = newStatus;
                        if (newStatus === 'done' && !tasks[taskIndex].completedDate) {
                            tasks[taskIndex].completedDate = getFormattedDate(new Date());
                            delete tasks[taskIndex].dueDate;
                        } else if (newStatus !== 'done' && tasks[taskIndex].completedDate) {
                            delete tasks[taskIndex].completedDate; 
                        }
                    }
                    droppedTaskElement.dataset.status = newStatus; 

                    renderTasks();
                    console.log(`Task ${taskId} moved to ${newStatus}`);
                }
            });
        });

        function getDragAfterElement(column, y) {
            const draggableElements = [...column.querySelectorAll('.task-card:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: -Infinity }).element;
        }

        const init = async () => {
            tasks = await fetchTasks();
            renderTasks();

            addTaskBtn.addEventListener('click', addTask);
            newTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            kanbanBoard.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                if (taskCard && taskCard.dataset.taskId) {
                    showTaskDetails(taskCard.dataset.taskId);
                }
            });
        };

        return { init };
    })();

    const CalendarModule = (() => {
        const currentMonthYearSpan = getElement('#currentMonthYear');
        const calendarGrid = getElement('#calendarGrid');
        const prevMonthBtn = getElement('#prevMonthBtn');
        const nextMonthBtn = getElement('#nextMonthBtn');
        const addEventBtn = getElement('#addEventBtn');

        let currentCalendarDate = new Date(); 

        let events = [
            { id: 1, date: '2025-07-08', title: 'Client Meeting (John Doe)', description: 'Discuss Q3 strategy.' },
            { id: 2, date: '2025-07-15', title: 'Team Sync', description: 'Weekly team performance review.' },
            { id: 3, date: '2025-07-22', title: 'Project Deadline', description: 'Submit final CRM UI to client.' },
            { id: 4, date: '2025-08-05', title: 'Vacation Start', description: 'Out of office.' },
        ];

        const renderCalendar = (date) => {
            calendarGrid.innerHTML = `
                <div class="day-name">Sun</div>
                <div class="day-name">Mon</div>
                <div class="day-name">Tue</div>
                <div class="day-name">Wed</div>
                <div class="day-name">Thu</div>
                <div class="day-name">Fri</div>
                <div class="day-name">Sat</div>
            `;

            const year = date.getFullYear();
            const month = date.getMonth(); 

            currentMonthYearSpan.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

            const firstDayOfMonth = new Date(year, month, 1).getDay(); 
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.classList.add('day', 'empty');
                calendarGrid.appendChild(emptyDay);
            }

            
            for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day');
                dayElement.textContent = dayNum;

                const fullDate = new Date(year, month, dayNum);
                const formattedFullDate = getFormattedDate(fullDate);

                
                const today = new Date();
                if (dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }

    
                const dayEvents = events.filter(event => event.date === formattedFullDate);
                if (dayEvents.length > 0) {
                    dayElement.classList.add('has-event');
                    dayElement.dataset.date = formattedFullDate; 
                    const eventIndicator = document.createElement('span');
                    eventIndicator.classList.add('event-indicator');
                    eventIndicator.textContent = `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`;
                    dayElement.appendChild(eventIndicator);
                }
                calendarGrid.appendChild(dayElement);
            }
        };

        const showEventDetails = (date) => {
            const dayEvents = events.filter(event => event.date === date);
            if (dayEvents.length === 0) return;

            let bodyHtml = `<h4>Events for ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:</h4>`;
            dayEvents.forEach(event => {
                bodyHtml += `
                    <div class="event-item" style="margin-bottom: 10px; padding: 8px; background-color: #f0f0f0; border-radius: 5px;">
                        <p><strong>${event.title}</strong></p>
                        <p style="font-size: 0.9em; color: #555;">${event.description}</p>
                    </div>
                `;
            });
            ModalModule.open('Calendar Events', bodyHtml);
        };

        const addCalendarEvent = () => {
            const bodyHtml = `
                <p><label for="eventTitle">Title:</label><br><input type="text" id="eventTitle" style="width:100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"></p>
                <p><label for="eventDate">Date:</label><br><input type="date" id="eventDate" value="${getFormattedDate(new Date())}" style="width:100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"></p>
                <p><label for="eventDescription">Description:</label><br><textarea id="eventDescription" style="width:100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; height: 80px;"></textarea></p>
            `;
            const footerHtml = `<button id="saveEventBtn" class="action-btn primary-btn">Save Event</button>`;

            ModalModule.open('Add New Event', bodyHtml, footerHtml);

            
            const saveEventBtn = getElement('#saveEventBtn');
            saveEventBtn.addEventListener('click', () => {
                const title = getElement('#eventTitle').value.trim();
                const date = getElement('#eventDate').value;
                const description = getElement('#eventDescription').value.trim();

                if (title && date) {
                    const newEvent = {
                        id: events.length + 1, 
                        title,
                        date,
                        description: description || 'No description.'
                    };
                    events.push(newEvent);
                    renderCalendar(currentCalendarDate); 
                    ModalModule.close();
                    console.log('Event Added:', newEvent);
                } else {
                    alert('Please enter event title and date.');
                }
            });
        };

        const init = () => {
            renderCalendar(currentCalendarDate);

            prevMonthBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                renderCalendar(currentCalendarDate);
            });

            nextMonthBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                renderCalendar(currentCalendarDate);
            });

            addEventBtn.addEventListener('click', addCalendarEvent);

            calendarGrid.addEventListener('click', (e) => {
                const dayElement = e.target.closest('.day.has-event');
                if (dayElement && dayElement.dataset.date) {
                    showEventDetails(dayElement.dataset.date);
                }
            });
        };

        return { init };
    })();

    
    DashboardCardsModule.init();
    LeadsTableModule.init();
    KanbanModule.init();
    CalendarModule.init();
    SidebarModule.init(); 
});