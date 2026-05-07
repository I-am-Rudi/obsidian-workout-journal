import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
  private message: string;
  private onConfirm: () => void;

  constructor(app: App, message: string, onConfirm: () => void) {
    super(app);
    this.message = message;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", { text: this.message });

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Discard session")
          .setWarning()
          .onClick(() => {
            this.onConfirm();
            this.close();
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText("Keep session")
          .setCta()
          .onClick(() => {
            this.close();
          })
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}
