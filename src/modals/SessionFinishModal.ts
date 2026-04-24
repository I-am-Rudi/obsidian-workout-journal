import { App, Modal, Setting } from "obsidian";
import { SessionFinishOptions } from "../types";

export class SessionFinishModal extends Modal {
  onSubmit: (options: SessionFinishOptions) => void;
  hasUnfinishedSets: boolean;
  options: SessionFinishOptions = {
    fillUncompletedSets: false,
    storeNewTargets: true,
    routineChangeStrategy: "ignore",
  };

  constructor(
    app: App,
    hasUnfinishedSets: boolean,
    onSubmit: (options: SessionFinishOptions) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.hasUnfinishedSets = hasUnfinishedSets;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Finish Workout" });

    if (this.hasUnfinishedSets) {
      new Setting(contentEl)
        .setName("Finish uncompleted sets?")
        .setDesc("Set incomplete sets to target values and mark them complete.")
        .addToggle((toggle) =>
          toggle.setValue(false).onChange((value) => {
            this.options.fillUncompletedSets = value;
          })
        );
    }

    new Setting(contentEl)
      .setName("Store new target values")
      .setDesc("Use completed set values as targets for next workout.")
      .addToggle((toggle) =>
        toggle.setValue(this.options.storeNewTargets).onChange((value) => {
          this.options.storeNewTargets = value;
        })
      );

    new Setting(contentEl)
      .setName("Routine changes")
      .setDesc("Choose what to do with routine edits made during the workout.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("ignore", "Ignore changes")
          .addOption("overwrite", "Overwrite existing routine")
          .addOption("create_new", "Create new routine")
          .setValue(this.options.routineChangeStrategy)
          .onChange((value) => {
            this.options.routineChangeStrategy = value as
              | "overwrite"
              | "create_new"
              | "ignore";
          })
      );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Finish Workout")
        .setCta()
        .onClick(() => {
          this.onSubmit(this.options);
          this.close();
        })
    );
  }
}
