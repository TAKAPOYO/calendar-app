// State
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed
let selectedDate = null;

// Storage key helpers
function storageKey(date) {
  return `cal_${date}`;
}

function getData(date) {
  const raw = localStorage.getItem(storageKey(date));
  return raw ? JSON.parse(raw) : { note: '', todos: [] };
}

function saveData(date, data) {
  localStorage.setItem(storageKey(date), JSON.stringify(data));
}

function hasData(date) {
  const data = getData(date);
  return data.note.trim() !== '' || data.todos.length > 0;
}

// Format date string as YYYY-MM-DD
function dateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateString) {
  const [y, m, d] = dateString.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

// Render calendar
function renderCalendar() {
  const monthYearEl = document.getElementById('month-year');
  const calendarDaysEl = document.getElementById('calendar-days');

  monthYearEl.textContent = `${currentYear}年 ${currentMonth + 1}月`;
  calendarDaysEl.innerHTML = '';

  const today = new Date();
  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const ds = dateStr(prevYear, prevMonth, day);
    const cell = createDayCell(day, ds, true);
    calendarDaysEl.appendChild(cell);
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = dateStr(currentYear, currentMonth, d);
    const cell = createDayCell(d, ds, false);
    if (ds === todayStr) cell.classList.add('today');
    if (ds === selectedDate) cell.classList.add('selected');
    calendarDaysEl.appendChild(cell);
  }

  // Next month padding
  const totalCells = calendarDaysEl.children.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const ds = dateStr(nextYear, nextMonth, d);
    const cell = createDayCell(d, ds, true);
    calendarDaysEl.appendChild(cell);
  }
}

function createDayCell(day, ds, otherMonth) {
  const cell = document.createElement('div');
  cell.classList.add('day-cell');
  if (otherMonth) cell.classList.add('other-month');
  if (hasData(ds)) cell.classList.add('has-data');
  cell.textContent = day;
  cell.addEventListener('click', () => selectDate(ds));
  return cell;
}

// Select a date
function selectDate(ds) {
  selectedDate = ds;
  document.getElementById('selected-date-title').textContent = formatDisplayDate(ds);
  renderCalendar();
  loadSidePanel(ds);
}

// Load note and todos for selected date
function loadSidePanel(ds) {
  const data = getData(ds);

  document.getElementById('note-input').value = data.note;
  renderTodos(data.todos, ds);
}

function renderTodos(todos, ds) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(ds, index));

    const span = document.createElement('span');
    span.classList.add('todo-text');
    span.textContent = todo.text;

    const delBtn = document.createElement('button');
    delBtn.classList.add('delete-todo');
    delBtn.textContent = '×';
    delBtn.addEventListener('click', () => deleteTodo(ds, index));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function toggleTodo(ds, index) {
  const data = getData(ds);
  data.todos[index].done = !data.todos[index].done;
  saveData(ds, data);
  renderTodos(data.todos, ds);
  updateCalendarCell(ds);
}

function deleteTodo(ds, index) {
  const data = getData(ds);
  data.todos.splice(index, 1);
  saveData(ds, data);
  renderTodos(data.todos, ds);
  updateCalendarCell(ds);
}

function updateCalendarCell(ds) {
  // Re-check has-data for the date cell
  const cells = document.querySelectorAll('.day-cell');
  cells.forEach(cell => {
    const cellText = cell.textContent;
    // We identify cells by their data attribute if set, otherwise by content
    // Simple re-render is easier
  });
  renderCalendar();
  if (selectedDate) loadSidePanel(selectedDate);
}

// Event listeners
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCalendar();
});

document.getElementById('next-btn').addEventListener('click', () => {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCalendar();
});

document.getElementById('save-note-btn').addEventListener('click', () => {
  if (!selectedDate) return;
  const data = getData(selectedDate);
  data.note = document.getElementById('note-input').value;
  saveData(selectedDate, data);
  renderCalendar();
  if (selectedDate) loadSidePanel(selectedDate);
});

document.getElementById('add-todo-btn').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

function addTodo() {
  if (!selectedDate) return;
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  const data = getData(selectedDate);
  data.todos.push({ text, done: false });
  saveData(selectedDate, data);
  input.value = '';
  renderTodos(data.todos, selectedDate);
  renderCalendar();
  if (selectedDate) loadSidePanel(selectedDate);
}

// Initial render
renderCalendar();
