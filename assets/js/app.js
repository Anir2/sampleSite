const selectedDateBtn = document.getElementById("selectedDate");
const dateInput = document.getElementById("hiddenDatePicker");
const today = new Date();
today.setHours(0, 0, 0, 0);
let currentDate = new Date(today);

const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);

// Sample booked slots (in real use, this should be dynamic)
const bookedSlots = ["09:30", "11:00", "14:30"];

// Format full date display for the button
function formatDateDisplay(date) {
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const input = new Date(date);
  input.setHours(0, 0, 0, 0);

  const isToday = input.getTime() === today.getTime();
  const isTomorrow = input.getTime() === tomorrow.getTime();

  const dateWithoutYear = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (isToday) {
    return `Today<br><small class="text-muted">${dateWithoutYear}</small>`;
  } else if (isTomorrow) {
    return `Tomorrow<br><small class="text-muted">${dateWithoutYear}</small>`;
  } else {
    return fullDate;
  }
}

// Format short date for tooltips
function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

// Update displayed date and regenerate slots
function updateDateDisplay() {
  selectedDateBtn.innerHTML = formatDateDisplay(currentDate);

  // Update hidden input constraints
  dateInput.min = today.toISOString().split("T")[0];
  dateInput.max = maxDate.toISOString().split("T")[0];
  dateInput.value = currentDate.toISOString().split("T")[0];

  // Disable Prev button if currentDate is today
  const prevBtn = document.getElementById("prevBtn");
  const isToday = currentDate.toDateString() === today.toDateString();
  prevBtn.disabled = isToday;

  generateSlots();
}

// Move date forward or backward
function changeDate(offset) {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + offset);

  if (newDate < today || newDate > maxDate) return;

  currentDate = newDate;
  updateDateDisplay();
}

// Open native date picker
function openDatePicker() {
  dateInput.focus();
  dateInput.click();
}

// Handle date selection
dateInput.addEventListener("change", () => {
  const selectedValue = dateInput.value;

  if (!selectedValue) {
    currentDate = new Date(today);
    updateDateDisplay();
    return;
  }

  const selected = new Date(selectedValue);
  selected.setHours(0, 0, 0, 0);

  if (isNaN(selected.getTime())) {
    currentDate = new Date(today);
    updateDateDisplay();
    return;
  }

  if (selected < today) {
    currentDate = new Date(today);
    triggerShakeTooltip("Appointments cannot be in the past. Reset to <b>Today</b>.");
  } else if (selected > maxDate) {
    currentDate = new Date(maxDate);
    triggerShakeTooltip(`Appointments cannot exceed 3 months. Reset to <b>${formatShortDate(maxDate)}</b>.`);
  } else {
    currentDate = selected;
  }

  updateDateDisplay();
});

// Shake + tooltip for invalid selection
function triggerShakeTooltip(message) {
  const btn = selectedDateBtn;

  btn.classList.add("shake");
  if (navigator.vibrate) navigator.vibrate(200);

  setTimeout(() => btn.classList.remove("shake"), 300);

  btn.setAttribute("data-bs-toggle", "tooltip");
  btn.setAttribute("data-bs-placement", "bottom");
  btn.setAttribute("data-bs-html", "true");
  btn.setAttribute("title", message);

  // Dispose old tooltip & show new
  bootstrap.Tooltip.getInstance(btn)?.dispose();
  const tooltip = new bootstrap.Tooltip(btn);
  tooltip.show();

  // Blur the input field to hide keyboard
  dateInput.blur();

  setTimeout(() => tooltip.hide(), 3000);
}

// Generate time slots with logic for past/booked
function generateSlots() {
  const container = document.getElementById("slotsContainer");
  container.innerHTML = "";

  const isToday = currentDate.toDateString() === today.toDateString();
  const now = new Date();

  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 8 && min < 30) continue;
      if (hour === 17 && min > 30) continue;

      const time = new Date(currentDate);
      time.setHours(hour, min, 0, 0);

      const label = time.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      });

      // Check if past time today
      const isPast = isToday && time <= now;
      const isBooked = bookedSlots.includes(label);

      slots.push({ label, isPast, isBooked });
    }
  }

  if (isToday && slots.every(s => s.isPast)) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted my-3">
        <i class="bi bi-clock-slash"></i> No available time slots for today.<br>
        <button class="btn btn-outline-primary mt-2" onclick="changeDate(1)">Check Tomorrow</button>
      </div>`;
    return;
  }

  for (const slot of slots) {
    const div = document.createElement("div");
    div.className = "col-3 py-2";

    const btn = document.createElement("button");
    btn.className = "btn w-100 time";

    if (slot.isPast) {
      btn.classList.add("btn-outline-secondary");
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.innerHTML = `${slot.label}`;
      btn.setAttribute("title", "Time passed");
    } else if (slot.isBooked) {
      btn.classList.add("btn-secondary");
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.innerHTML = `${slot.label}`;
      btn.setAttribute("title", "This time slot was already booked");
    } else {
      btn.classList.add("btn-outline-success");
      btn.textContent = slot.label;
      btn.onclick = () => {
        document.querySelectorAll(".time").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
    }

    div.appendChild(btn);
    container.appendChild(div);
  }
}

// Init everything
updateDateDisplay();