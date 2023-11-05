import {
    LitElement,
    html,
    css,
  } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

  const supportsSceneTileFeature = (stateObj) => {
    const domain = stateObj.entity_id.split(".")[0];
    return domain === "light";
  };
  
  class SceneTileFeature extends LitElement {
    static get properties() {
      return {
        hass: undefined,
        config: undefined,
        stateObj: undefined,
      };
    }
  
    static getStubConfig() {
      return {
        type: "custom:scene-tile-feature",
        scenes: null,
      };
    }
  
    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      if(config.scenes === null) {
        throw new Error("Scenes needed");
      }
      let scenes = config.scenes;
      if(!Array.isArray(scenes)) {
        scenes = [scenes];
      }
      const notScenes = scenes.filter(scene => {
        const domain = scene.split(".")[0];
        return domain !== "scene";
      });
      if(notScenes.length > 0) {
        throw new Error("Scenes should only contain scene domain entitites");
      }

      this.config = config;
    }
  
    _press(ev) {
      ev.stopPropagation();
      const set = ev.detail.value;
      this.hass.callService("scene", "turn_on", {
        entity_id: set,
      });
    }
  
    render() {
      if (
        !this.config ||
        !this.hass ||
        !this.stateObj ||
        !supportsSceneTileFeature(this.stateObj) ||
        this.config.scenes === null
      ) {
        return null;
      }

      let scenes = this.config.scenes;
      if(!Array.isArray(scenes)) {
        scenes = [scenes];
      }
      const options = scenes.map(scene => ({
          value: scene,
          label: this.hass.formatEntityAttributeValue(this.hass.states[scene], "name")
        })
      );

      return html`
        <div class="container">
          <ha-control-select
            .options=${options}
            @value-changed=${this._press}
            .disabled=${this.stateObj.state === "unavailable" || scenes.length === 0}
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
  
  customElements.define("scene-tile-feature", SceneTileFeature);
  
  window.customTileFeatures = window.customTileFeatures || [];
  window.customTileFeatures.push({
    type: "scene-tile-feature",
    name: "Scenes",
    supported: supportsSceneTileFeature, // Optional
    configurable: true, // Optional - defaults to false
  });
