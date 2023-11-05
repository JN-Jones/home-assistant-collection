import {
    LitElement,
    html,
    css,
  } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

  const supportsManualControlTileFeature = (stateObj) => {
    const domain = stateObj.entity_id.split(".")[0];
    return domain === "light";
  };
  
  class ManualControlTileFeature extends LitElement {
    static get properties() {
      return {
        hass: undefined,
        config: undefined,
        stateObj: undefined,
      };
    }
  
    static getStubConfig() {
      return {
        type: "custom:manual-control-tile-feature",
        alEntity: null,
      };
    }
  
    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      if(config.alEntity === null) {
        throw new Error("Adaptive Lighting Entity needed");
      }
      const domain = config.alEntity.split(".")[0];
      if(domain !== "switch") {
        throw new Error("Adaptive Lighting needs to be switch");
      }

      this.config = config;
    }
  
    _press(ev) {
      ev.stopPropagation();
      const set = ev.detail.value;
      this.hass.callService("adaptive_lighting", "set_manual_control", {
        entity_id: this.config.alEntity,
        lights: [this.stateObj.entity_id],
        manual_control: !set
      });
    }
  
    render() {
      if (
        !this.config ||
        !this.hass ||
        !this.stateObj ||
        !supportsManualControlTileFeature(this.stateObj) ||
        this.config.alEntity === null
      ) {
        return null;
      }

      const options = [{
          value: true,
          label: "On",
          icon: "mdi:lightbulb-auto-outline"
        },
        {
          value: false,
          label: "Off",
          icon: "mdi:lightbulb-question-outline"
        }
      ];

      const alEntity = this.hass.states[this.config.alEntity];
      const manualControl = alEntity.attributes.manual_control;
      
      const value = manualControl === undefined ? undefined : !manualControl.includes(this.stateObj.entity_id);
      const color = value ? "var(--state-alarm_control_panel-armed_night-color, var(--state-alarm_control_panel-active-color, var(--state-active-color)))" : undefined;

      return html`
        <div class="container">
          <ha-control-select
            .options=${options}
            .value=${value}
            hide-label
            @value-changed=${this._press}
            style=${color !== undefined ? "--control-select-color: " + color : ""}
            .disabled=${this.stateObj.state === "unavailable" || manualControl === undefined || alEntity.state === "unavailable"}
          >
          </ha-control-select>
        </div>
      `;
    }
  
    static get styles() {
      return css`
        ha-control-select {
          --control-select-color: var(--tile-color);
          --control-select-background: var(--tile-color);
          --control-select-background-opacity: 0.2;
          --control-select-padding: 0;
          --control-select-thickness: 40px;
          --control-select-border-radius: 10px;
          --control-select-button-border-radius: 10px;
        }
        .container {
          padding: 0 12px 12px 12px;
          width: auto;
        }
      `;
    }
  }
  
  customElements.define("manual-control-tile-feature", ManualControlTileFeature);
  
  window.customTileFeatures = window.customTileFeatures || [];
  window.customTileFeatures.push({
    type: "manual-control-tile-feature",
    name: "Manual Control",
    supported: supportsManualControlTileFeature, // Optional
    configurable: true, // Optional - defaults to false
  });
