const qmListBtn = document.getElementById("qmListBtn");
const requestFormBtn = document.getElementById("requestFormBtn");
const qmOptions = document.getElementById("qmOptions");
const manageBtn = document.getElementById("manageBtn");
const manageOptions = document.getElementById("manageOptions");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");

const addForm = document.getElementById("addForm");
const removeForm = document.getElementById("removeForm");
const requestForm = document.getElementById("requestForm");

// Helper
function hideAll() {
  qmOptions.classList.add("hidden");
  manageOptions.classList.add("hidden");
  addForm.classList.add("hidden");
  removeForm.classList.add("hidden");
  requestForm.classList.add("hidden");
}

qmListBtn.addEventListener("click", () => {
  hideAll();
  qmOptions.classList.toggle("hidden");
});

manageBtn.addEventListener("click", () => {
  manageOptions.classList.toggle("hidden");
  addForm.classList.add("hidden");
  removeForm.classList.add("hidden");
});

addBtn.addEventListener("click", () => {
  addForm.classList.remove("hidden");
  removeForm.classList.add("hidden");
});

removeBtn.addEventListener("click", () => {
  removeForm.classList.remove("hidden");
  addForm.classList.add("hidden");

  // Placeholder values
  document.getElementById("removeCategory").innerHTML = `
    <option value="cat1">Category 1</option>
  `;
  document.getElementById("removeID").innerHTML = `
    <option value="id1">ID 1</option>
  `;
  document.getElementById("removeNameLabel").innerText = "John Doe";
});

requestFormBtn.addEventListener("click", () => {
  hideAll();
  requestForm.classList.remove("hidden");
});
