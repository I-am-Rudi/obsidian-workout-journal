import { App, Setting } from "obsidian";
import WorkoutTrackerPlugin from "../plugin";
import { WorkoutTemplateSettingModal } from "./WorkoutTemplateSettingModal";

export class RoutineSettingsPage {
  render(containerEl: HTMLElement, app: App, plugin: WorkoutTrackerPlugin, onBack: () => void): void {
    containerEl.empty();

    new Setting(containerEl)
      .addButton((btn) =>
        btn.setButtonText("← General settings").onClick(() => {
          onBack();
        })
      );

    containerEl.createEl("h2", { text: "Routine templates" });
    containerEl.createEl("p", {
      text: "Routine templates are legacy definitions stored in plugin settings. Use 'Migrate Templates to Notes' on the main settings page to convert them into full routine notes that support detailed per-exercise set configuration.",
      cls: "setting-item-description",
    });

    const listContainer = containerEl.createDiv();
    this.renderList(listContainer, plugin);

    new Setting(containerEl).addButton((btn) =>
      btn
        .setButtonText("Add routine template")
        .setCta()
        .onClick(() => {
          new WorkoutTemplateSettingModal(app, plugin, () => {
            this.renderList(listContainer, plugin);
          }).open();
        })
    );
  }

  private renderList(container: HTMLElement, plugin: WorkoutTrackerPlugin): void {
    container.empty();

    if (plugin.settings.workoutTemplates.length === 0) {
      container.createEl("p", {
        text: "No routine templates defined.",
        cls: "setting-item-description",
      });
      return;
    }

    plugin.settings.workoutTemplates.forEach((template, index) => {
      new Setting(container)
        .setName(template.name)
        .setDesc(`${template.exercises.join(", ")} | ${template.estimatedDuration} min`)
        .addButton((btn) =>
          btn
            .setButtonText("Remove")
            .setWarning()
            .onClick(async () => {
              plugin.settings.workoutTemplates.splice(index, 1);
              await plugin.saveSettings();
              this.renderList(container, plugin);
            })
        );
    });
  }
}
