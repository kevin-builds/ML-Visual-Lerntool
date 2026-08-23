export async function fetchExamples() {
  const response = await fetch("/api/examples");
  const payload = await response.json();
  return payload.names;
}

export async function fetchDataset(name) {
  const response = await fetch("/api/data?name=" + encodeURIComponent(name));
  return response.json();
}

export async function uploadCsv(file) {
  const body = new FormData();
  body.append("file", file);

  try {
    const response = await fetch("/api/upload", { method: "POST", body: body });
    return await response.json();
  } catch (problem) {
    return { error: "Die Datei konnte nicht übertragen werden." };
  }
}

export async function requestTraining(settings) {
  const response = await fetch("/api/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return response.json();
}
