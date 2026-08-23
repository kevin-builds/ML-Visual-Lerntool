import { controls, table, view } from "./elements.js";
import { state, setAxisRange } from "./state.js";
import { formatNumber, unitOf } from "./format.js";
import { fetchExamples, fetchDataset, uploadCsv } from "./api.js";

const VORSCHAU = 5;

export async function loadExamples() {
  const namen = await fetchExamples();

  controls.dataset.innerHTML = "";
  for (const name of namen) {
    const option = document.createElement("option");
    option.textContent = name;
    controls.dataset.appendChild(option);
  }
}

export async function loadDataset() {
  const gewaehlt = controls.dataset.selectedOptions[0];

  state.dataset = gewaehlt && gewaehlt.dataset.uploaded === "true"
    ? state.uploaded
    : await fetchDataset(controls.dataset.value);

  table.headX.textContent = "x " + state.dataset.x_label;
  table.headY.textContent = "y " + state.dataset.y_label;
  view.predictUnit.textContent = unitOf(state.dataset.x_label);

  renderTable();
  showShare(state.trainingShare);
  setAxisRange(state.dataset);
}

export function showShare(share) {
  state.trainingShare = share;

  for (const button of controls.shareButtons.children) {
    button.classList.toggle("active", Number(button.dataset.share) === share);
  }

  table.segmentTrain.textContent = "Training " + share + " %";
  table.segmentTest.textContent = "Test " + (100 - share) + " %";
  table.segmentTrain.style.flexBasis = share + "%";
  table.segmentTest.style.flexBasis = (100 - share) + "%";
}

export function showCounts() {
  const training = state.training.x.length;
  const test = state.test.x.length;

  table.splitCaption.textContent = test === 0
    ? training + " Punkte zum Lernen, keine Testdaten."
    : training + " Punkte zum Lernen, " + test + " werden zurückgehalten.";
}

export function renderTable() {
  const gesamt = state.dataset.x.length;
  const sichtbar = state.tableExpanded ? gesamt : Math.min(VORSCHAU, gesamt);

  table.body.innerHTML = "";
  for (let i = 0; i < sichtbar; i += 1) {
    const zeile = document.createElement("tr");
    for (const wert of [state.dataset.x[i], state.dataset.y[i]]) {
      const zelle = document.createElement("td");
      zelle.textContent = formatNumber(wert, 0);
      zeile.appendChild(zelle);
    }
    table.body.appendChild(zeile);
  }

  table.frame.classList.toggle("expanded", state.tableExpanded);

  const rest = gesamt - Math.min(VORSCHAU, gesamt);
  if (rest <= 0) {
    table.more.textContent = "";
  } else {
    table.more.textContent = state.tableExpanded
      ? "weniger anzeigen"
      : rest + " weitere Zeilen";
  }
}

export function toggleTable() {
  state.tableExpanded = !state.tableExpanded;
  renderTable();
}

function showUploadNote(text, isError) {
  controls.uploadNote.textContent = text;
  controls.uploadNote.classList.toggle("error", Boolean(isError));
}

export async function handleUpload(file, onAccepted) {
  if (!file) {
    return;
  }

  showUploadNote("„" + file.name + "“ wird gelesen …", false);
  const payload = await uploadCsv(file);

  if (payload.error) {
    showUploadNote(payload.error, true);
    return;
  }

  state.uploaded = payload;

  let option = controls.dataset.querySelector('option[data-uploaded="true"]');
  if (option === null) {
    option = document.createElement("option");
    option.dataset.uploaded = "true";
    controls.dataset.appendChild(option);
  }
  option.textContent = file.name;
  controls.dataset.value = file.name;

  showUploadNote(payload.x.length + " Punkte übernommen.", false);
  await onAccepted();
}
