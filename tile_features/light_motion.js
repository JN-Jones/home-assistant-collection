import {
    LitElement,
    html,
    css,
  } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

  const supportsLightMotionTileFeature = (stateObj) => {
    const domain = stateObj.entity_id.split(".")[0];
    return domain === "light";
  };
  
  class LightMotionTileFeature extends LitElement {
    static get properties() {
      return {
        hass: undefined,
        config: undefined,
        stateObj: undefined,
      };
    }
  
    static getStubConfig() {
      return {
        type: "custom:light-motion-tile-feature",
        motionEntity: null,
      };
    }
  
    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      if(config.motionEntity === null) {
        throw new Error("Motion Entity needed");
      }
      const domain = config.motionEntity.split(".")[0];
      if(domain !== "input_boolean") {
        throw new Error("Motion Entity needs to be input_boolean");
      }
      this.config = config;
    }
  
    _press(ev) {
      ev.stopPropagation();
      const set = ev.detail.value;
      this.hass.callService("input_boolean", set ? "turn_off" : "turn_on", {
        entity_id: this.config.motionEntity
      });
    }
  
    render() {
      if (
        !this.config ||
        !this.hass ||
        !this.stateObj ||
        !supportsLightMotionTileFeature(this.stateObj) ||
        this.config.motionEntity === null
      ) {
        return null;
      }

      const options = [{
          value: true,
          label: "On",
          icon: "hue:motion-sensor-movement"
        },
        {
          value: false,
          label: "Off",
          icon: "hue:motion-sensor-movement-off"
        }
      ];

      const motionEntity = this.hass.states[this.config.motionEntity];
      const value = motionEntity === undefined ? undefined : motionEntity.state === "off" ? true : false;
      const color = value ? "var(--state-alarm_control_panel-armed_night-color, var(--state-alarm_control_panel-active-color, var(--state-active-color)))" : undefined;

      return html`
        <div class="container">
          <ha-control-select
            .options=${options}
            .value=${value}
            hide-label
            @value-changed=${this._press}
            style=${color !== undefined ? "--control-select-color: "+ color : ""}
            .disabled=${this.stateObj.state === "unavailable" || motionEntity === undefined || motionEntity.state === "unavailable"}
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
  
  customElements.define("light-motion-tile-feature", LightMotionTileFeature);
  
  window.customTileFeatures = window.customTileFeatures || [];
  window.customTileFeatures.push({
    type: "light-motion-tile-feature",
    name: "Light Motion",
    supported: supportsLightMotionTileFeature, // Optional
    configurable: true, // Optional - defaults to false
  });
