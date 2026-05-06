import { App, Setting } from "obsidian";
import WorkoutTrackerPlugin from "../plugin";
import { ExerciseTemplateSettingModal } from "./ExerciseTemplateSettingModal";

export class ExerciseSettingsPage {
  render(containerEl: HTMLElement, app: App, plugin: WorkoutTrackerPlugin, onBack: () => void): void {
    containerEl.empty();

    new Setting(containerEl)
      .addButton((btn) =>
        btn.setButtonText("← General Settings").onClick(() => {
          onBack();
        })
      );

    containerEl.createEl("h2", { text: "Exercise Templates" });
    containerEl.createEl("p", {
      text: "Exercise templates are legacy definitions stored in plugin settings. Use 'Migrate Templates to Notes' on the main settings page to convert them to full exercise notes.",
      cls: "setting-item-description",
    });

    const listContainer = containerEl.createDiv();
    this.renderList(listContainer, plugin);

    new Setting(containerEl).addButton((btn) =>
      btn
        .setButtonText("Add Exercise Template")
        .setCta()
        .onClick(() => {
          new ExerciseTemplateSettingModal(app, plugin, () => {
            this.renderList(listContainer, plugin);
          }).open();
        })
    );
  }

  private renderList(container: HTMLElement, plugin: WorkoutTrackerPlugin): void {
    container.empty();

    if (plugin.settings.exerciseTemplates.length === 0) {
      container.createEl("p", {
        text: "No exercise templates defined.",
        cls: "setting-item-description",
      });
      return;
    }

    plugin.settings.exerciseTemplates.forEach((template, index) => {
      new Setting(container)
        .setName(template.name)
        .setDesc(`${template.type} | ${template.muscleGroups.join(", ")}`)
        .addButton((btn) =>
          btn
            .setButtonText("Remove")
            .setWarning()
            .onClick(async () => {
              plugin.settings.exerciseTemplates.splice(index, 1);
              await plugin.saveSettings();
              this.renderList(container, plugin);
            })
        );
    });
  }
}
