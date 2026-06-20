class BpEntryCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this._renderToken = (this._renderToken || 0) + 1;
    this._render(this._renderToken).catch((err) => {
      const status = this.querySelector("#status");
      if (status) {
        status.textContent = `Error loading card: ${err.message ?? err}`;
      }
    });
  }

  set hass(hass) {
    this._hass = hass;
  }

  async _render(renderToken) {
    const version = new URL(import.meta.url).searchParams.get("v") ?? String(Date.now());

    const [cssResponse, htmlResponse] = await Promise.all([
      fetch(new URL(`./bp-entry-card.css?v=${encodeURIComponent(version)}`, import.meta.url)),
      fetch(new URL(`./bp-entry-card.html?v=${encodeURIComponent(version)}`, import.meta.url)),
    ]);

    if (!cssResponse.ok || !htmlResponse.ok) {
      throw new Error("Failed to load card template assets.");
    }

    if (renderToken !== this._renderToken) {
      return;
    }

    const [cssText, htmlText] = await Promise.all([
      cssResponse.text(),
      htmlResponse.text(),
    ]);

    if (renderToken !== this._renderToken) {
      return;
    }

    this.innerHTML = `
      <style>${cssText}</style>
      ${htmlText}
    `;

    this.querySelector("#save").addEventListener("click", () => this._save());
    this.querySelector("#now").addEventListener("click", () => this._setCurrentTime());

    const systolicInput = this.querySelector("#systolic");
    const diastolicInput = this.querySelector("#diastolic");
    const pulseInput = this.querySelector("#pulse");

    this._setCurrentTime();

    systolicInput.addEventListener("input", () => {
      const value = Number(systolicInput.value);
      if (systolicInput.value.length >= 2 && value > 80) {
        diastolicInput.focus();
      }
    });

    diastolicInput.addEventListener("input", () => {
      const value = Number(diastolicInput.value);
      if (diastolicInput.value.length >= 2 && value > 50) {
        pulseInput.focus();
      }
    });
  }

  _setCurrentTime() {
    const timeInput = this.querySelector("#time");
    if (!timeInput) {
      return;
    }

    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localMinute = new Date(now.getTime() - tzOffsetMs)
      .toISOString()
      .slice(0, 16);
    timeInput.value = localMinute;
  }

  async _save() {
    const systolic = Number(this.querySelector("#systolic").value);
    const diastolic = Number(this.querySelector("#diastolic").value);
    const pulse = Number(this.querySelector("#pulse").value);
    const timestamp = this.querySelector("#time").value;

    const status = this.querySelector("#status");

    if (
      !Number.isInteger(systolic) ||
      !Number.isInteger(diastolic) ||
      !Number.isInteger(pulse) ||
      systolic < 1 ||
      diastolic < 1 ||
      pulse < 1
    ) {
      status.textContent = "Enter integer systolic, diastolic, and pulse values.";
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