async function getStats() {
    const inputName = document.getElementById("username").value;
    const inputTag = document.getElementById("tag").value;
    const inputRegion = document.getElementById("region").value;
    const output = document.getElementById("output");
    const response = await fetch(`/api/stats?name=${inputName}&tag=${inputTag}&region=${inputRegion}`);
    const data = await response.text();
output.textContent = 
  data;
}
