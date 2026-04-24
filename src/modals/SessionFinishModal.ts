import { App, Modal, Setting } from "obsidian";
import { SessionFinishOptions } from "../types";

export class SessionFinishModal extends Modal {
  onSubmit: (options: SessionFinishOptions) => void;
  options: SessionFinishOptions = {
    storeNewTargets: true,
    persistRoutineChanges: false,
  };

  constructor(app: App, onSubmit: (options: SessionFinishOptions) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Finish Workout" });
    contentEl.createEl("p", {
      text: "Save workout log and choose what to persist for future sessions.",
    });

    new Setting(contentEl)
      .setName("Store new target values")
      .setDesc("Use completed set values as targets for next workout.")
      .addToggle((toggle) =>
        toggle.setValue(this.options.storeNewTargets).onChange((value) => {
          this.options.storeNewTargets = value;
        })
      );

    new Setting(contentEl)
      .setName("Persist routine changes")
      .setDesc("Apply set count/order/notes changes back to the routine note.")
      .addToggle((toggle) =>
        toggle.setValue(this.options.persistRoutineChanges).onChange((value) => {
          this.options.persistRoutineChanges = value;
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
