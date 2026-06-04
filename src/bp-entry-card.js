class BpEntryCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.innerHTML = `
      <ha-card header="Blood Pressure">
        <div class="card-content">
          <label>Time</label>
          <input id="time" type="datetime-local">

          <label>Systolic</label>
          <input id="systolic" type="number" inputmode="numeric">

          <label>Diastolic</label>
          <input id="diastolic" type="number" inputmode="numeric">

          <label>Pulse</label>
          <input id="pulse" type="number" inputmode="numeric">

          <button id="save">Save</button>
          <div id="status"></div>
        </div>
      </ha-card>
    `;

    this.querySelector("#save").addEventListener("click", () => this._save());
  }

  set hass(hass) {
    this._hass = hass;
  }

  async _save() {
    const systolic = Number(this.querySelector("#systolic").value);
    const diastolic = Number(this.querySelector("#diastolic").value);
    const pulse = Number(this.querySelector("#pulse").value);
    const timestamp = this.querySelector("#time").value;

    const status = this.querySelector("#status");

    if (!systolic || !diastolic || !pulse) {
      status.textContent = "Enter systolic, diastolic, and pulse.";
      return;
    }

    try {
      await this._hass.callService("blood_pressure", "add_sample", {
        timestamp,
        systolic,
        diastolic,
        pulse,
      });
      status.textContent = "Saved.";
    } catch (err) {
      status.textContent = `Error: ${err.message ?? err}`;
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("bp-entry-card", BpEntryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "bp-entry-card",
  name: "Blood Pressure Entry",
  description: "Manual blood pressure reading entry form",
});