import { LitElement, css, html } from "lit";

class BpEntryCard extends LitElement {
  static properties = {
    config: { attribute: false },
    _status: { state: true },
    _time: { state: true },
    _systolic: { state: true },
    _diastolic: { state: true },
    _pulse: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color, #111827);
      --bp-border: var(--divider-color, #d1d5db);
      --bp-surface: var(--card-background-color, #ffffff);
      --bp-accent: var(--primary-color, #2563eb);
      --bp-muted: var(--secondary-text-color, #6b7280);
      --bp-danger: #b91c1c;
      --bp-disabled-bg: #d3d3d3;
      --bp-disabled-fg: #6b6b6b;
      --bp-disabled-border: #b8b8b8;
    }

    .card {
      display: grid;
      gap: 0.875rem;
      padding: 1rem;
      border: 1px solid var(--bp-border);
      border-radius: 16px;
      background: var(--bp-surface);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
    }

    .title {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.2;
    }

    .subtitle {
      margin: 0.15rem 0 0;
      color: var(--bp-muted);
      font-size: 0.92rem;
    }

    .grid {
      display: grid;
      gap: 0.75rem;
    }

    .row {
      display: grid;
      grid-template-columns: 5.5rem 1fr auto;
      gap: 0.5rem;
      align-items: center;
    }

    .row label {
      font-weight: 600;
    }

    .sample {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .sample span {
      color: var(--bp-muted);
      font-weight: 600;
    }

    input,
    button {
      font: inherit;
    }

    input {
      min-height: 2.5rem;
      border: 1px solid var(--bp-border);
      border-radius: 10px;
      padding: 0.45rem 0.7rem;
      background: var(--bp-surface);
      color: inherit;
      box-sizing: border-box;
    }

    .bp-time {
      width: 100%;
    }

    .bp-number {
      width: 4.25rem;
      text-align: center;
    }

    .bp-number::-webkit-outer-spin-button,
    .bp-number::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    button {
      min-height: 2.5rem;
      padding: 0.5rem 0.9rem;
      border: 1px solid transparent;
      border-radius: 10px;
      color: white;
      background: var(--bp-accent);
      cursor: pointer;
    }

    button.secondary {
      color: var(--primary-text-color, #111827);
      background: transparent;
      border-color: var(--bp-border);
    }

    button:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--bp-accent);
      outline-offset: 2px;
    }

    button:disabled {
      background-color: var(--bp-disabled-bg);
      color: var(--bp-disabled-fg);
      border-color: var(--bp-disabled-border);
      cursor: not-allowed;
      opacity: 1;
    }

    .status {
      min-height: 1.25rem;
      margin: 0;
      font-size: 0.95rem;
      color: var(--bp-muted);
    }

    .status.error {
      color: var(--bp-danger);
    }

    .heart {
      color: var(--bp-danger);
      font-weight: 700;
      user-select: none;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this.hass = null;
    this._status = "";
    this._time = "";
    this._systolic = "";
    this._diastolic = "";
    this._pulse = "";
  }

  setConfig(config) {
    this.config = config;
    this._status = "";
    this._setCurrentTime();
  }

  get _saveScriptEntityId() {
    const configuredScript = this.config?.save_script ?? this.config?.script;
    if (!configuredScript) {
      return null;
    }

    if (typeof configuredScript === "string") {
      return configuredScript.startsWith("script.") ? configuredScript : `script.${configuredScript}`;
    }

    if (typeof configuredScript === "object" && typeof configuredScript.entity_id === "string") {
      return configuredScript.entity_id.startsWith("script.")
        ? configuredScript.entity_id
        : `script.${configuredScript.entity_id}`;
    }

    return null;
  }

  get _bounds() {
    return {
      systolic: { min: 70, max: 250 },
      diastolic: { min: 40, max: 150 },
      pulse: { min: 30, max: 220 },
    };
  }

  get _isSaveEnabled() {
    return this._isValidValue(this._systolic, this._bounds.systolic.min, this._bounds.systolic.max)
      && this._isValidValue(this._diastolic, this._bounds.diastolic.min, this._bounds.diastolic.max)
      && this._isValidValue(this._pulse, this._bounds.pulse.min, this._bounds.pulse.max)
      && this._time.length > 0;
  }

  render() {
    const bounds = this._bounds;

    return html`
      <section class="card">
        <div class="header">
          <div>
            <h2 class="title">Blood pressure entry</h2>
            <p class="subtitle">Log a manual reading from the Home Assistant card.</p>
          </div>
        </div>

        <div class="grid">
          <div class="row">
            <label for="time">Time</label>
            <input
              id="time"
              class="bp-time"
              type="datetime-local"
              .value=${this._time}
              @input=${this._onTimeInput}
            />
            <button type="button" class="secondary" @click=${this._setCurrentTime}>Now</button>
          </div>

          <div class="row">
            <label>Sample</label>
            <div class="sample">
              <input
                id="systolic"
                class="bp-number"
                type="number"
                inputmode="numeric"
                min=${bounds.systolic.min}
                max=${bounds.systolic.max}
                step="1"
                placeholder="120"
                aria-label="Systolic"
                .value=${this._systolic}
                @input=${this._onSystolicInput}
              />
              <span>/</span>
              <input
                id="diastolic"
                class="bp-number"
                type="number"
                inputmode="numeric"
                min=${bounds.diastolic.min}
                max=${bounds.diastolic.max}
                step="1"
                placeholder="80"
                aria-label="Diastolic"
                .value=${this._diastolic}
                @input=${this._onDiastolicInput}
              />
              <span class="heart">&hearts;</span>
              <input
                id="pulse"
                class="bp-number"
                type="number"
                inputmode="numeric"
                min=${bounds.pulse.min}
                max=${bounds.pulse.max}
                step="1"
                placeholder="72"
                aria-label="Pulse"
                .value=${this._pulse}
                @input=${this._onPulseInput}
              />
            </div>
            <button type="button" ?disabled=${!this._isSaveEnabled} @click=${this._save}>
              Save
            </button>
          </div>
        </div>

        <p id="status" class=${this._status.startsWith("Error") ? "status error" : "status"}>
          ${this._status}
        </p>
      </section>
    `;
  }

  firstUpdated() {
    if (!this._time) {
      this._setCurrentTime();
    }
  }

  _isValidValue(value, min, max) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= min && parsed <= max;
  }

  _setCurrentTime() {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
    this._time = new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  }

  _focusField(selector) {
    this.renderRoot?.querySelector(selector)?.focus();
  }

  _onTimeInput(event) {
    this._time = event.target.value;
  }

  _onSystolicInput(event) {
    this._systolic = event.target.value;

    if (event.target.value.length >= 2 && Number(event.target.value) > 80) {
      this._focusField("#diastolic");
    }
  }

  _onDiastolicInput(event) {
    this._diastolic = event.target.value;

    if (event.target.value.length >= 2 && Number(event.target.value) > 50) {
      this._focusField("#pulse");
    }
  }

  _onPulseInput(event) {
    this._pulse = event.target.value;
  }

  async _save() {
    const bounds = this._bounds;
    const systolic = Number(this._systolic);
    const diastolic = Number(this._diastolic);
    const pulse = Number(this._pulse);

    if (!this._isSaveEnabled) {
      this._status = `Enter integers within ranges: systolic ${bounds.systolic.min}-${bounds.systolic.max}, diastolic ${bounds.diastolic.min}-${bounds.diastolic.max}, pulse ${bounds.pulse.min}-${bounds.pulse.max}.`;
      return;
    }

    if (!this.hass?.callService) {
      this._status = "Error: Home Assistant service API is unavailable.";
      return;
    }

    try {
      const scriptEntityId = this._saveScriptEntityId;

      if (scriptEntityId) {
        await this.hass.callService("script", "turn_on", {
          entity_id: scriptEntityId,
        });
        this._status = `Saved via ${scriptEntityId}.`;
        return;
      }

      await this.hass.callService("blood_pressure", "add_sample", {
        timestamp: this._time,
        systolic,
        diastolic,
        pulse,
      });
      this._status = "Saved.";
    } catch (err) {
      this._status = `Error: ${err.message ?? err}`;
    }
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("bp-entry-card", BpEntryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "bp-entry-card",
  name: "Blood Pressure Entry",
  description: "Manual blood pressure reading entry form",
});