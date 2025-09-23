let namesData = [];
let weeksData = [];
let statusesData = [];
let historyData = {};

function createDropdown(options, selectedValue = "") {
  const select = document.createElement("select");
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === selectedValue) option.selected = true;
    select.appendChild(option);
  });
  return select;
}

function applyStatusColor(select) {
  select.className = "status-select";
  const selectedStatus = select.value;
  select.classList.add(`status-${selectedStatus}`);
}

function renderTable() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  namesData.sort((a, b) => a.name.localeCompare(b.name));

  namesData.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.dataset.empId = emp.id;

    const nameCell = document.createElement("td");
    nameCell.textContent = emp.name;
    row.appendChild(nameCell);

    const weekCell = document.createElement("td");
    const defaultWeek = Object.keys(historyData[emp.id] || {})[0] || weeksData[0];
    const weekSelect = createDropdown(weeksData, defaultWeek);
    weekSelect.classList.add("week-select");
    weekCell.appendChild(weekSelect);
    row.appendChild(weekCell);

    const renderDays = (week) => {
      while (row.children.length > 2) row.removeChild(row.lastChild);

      const daysData = historyData[emp.id]?.[week] || {};
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(day => {
        const cell = document.createElement("td");
        const selectedStatus = daysData[day] || "Empty";
        const daySelect = createDropdown(statusesData, selectedStatus);
        daySelect.classList.add("status-select");
        daySelect.dataset.day = day;
        applyStatusColor(daySelect);
        daySelect.addEventListener("change", () => applyStatusColor(daySelect));
        cell.appendChild(daySelect);
        row.appendChild(cell);
      });
    };

    renderDays(defaultWeek);
    weekSelect.addEventListener("change", () => renderDays(weekSelect.value));

    tableBody.appendChild(row);
  });
}

async function loadData() {
  const namesRes = await fetch("/input/names.json");
  const weeksRes = await fetch("/input/selection.json");
  const statusRes = await fetch("/input/status.json");
  const historyRes = await fetch("/history");

  namesData = await namesRes.json();
  weeksData = await weeksRes.json();
  statusesData = await statusRes.json();

  try {
    historyData = await historyRes.json();
  } catch {
    historyData = {};
  }

  renderTable();
}

document.addEventListener("DOMContentLoaded", loadData);

document.getElementById("saveBtn").addEventListener("click", async () => {
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach(row => {
    const empId = row.dataset.empId;
    const week = row.querySelector(".week-select").value;
    const days = {};
    row.querySelectorAll(".status-select").forEach(sel => {
      days[sel.dataset.day] = sel.value;
    });

    if (!historyData[empId]) historyData[empId] = {};
    historyData[empId][week] = days;
  });

  const response = await fetch("/save-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(historyData)
  });

  if (response.ok) {
    alert("✅ History saved successfully.");
  } else {
    alert("❌ Error saving history.");
  }
});
