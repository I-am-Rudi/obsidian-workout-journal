import { App, Modal, Setting } from "obsidian";
import { RoutineDefinition, WorkoutPlanDefinition } from "../types";

export class PlanSelectionModal extends Modal {
  plans: WorkoutPlanDefinition[];
  routinesById: Map<string, RoutineDefinition>;
  onSelect: (plan: WorkoutPlanDefinition, routine: RoutineDefinition) => void;

  constructor(
    app: App,
    plans: WorkoutPlanDefinition[],
    routines: RoutineDefinition[],
    onSelect: (plan: WorkoutPlanDefinition, routine: RoutineDefinition) => void
  ) {
    super(app);
    this.plans = plans;
    this.routinesById = new Map(routines.map((routine) => [routine.id, routine]));
    this.onSelect = onSelect;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Start workout from plan" });

    if (!this.plans.length) {
      contentEl.createEl("p", { text: "No workout plan notes found." });
      return;
    }

    this.plans.forEach((plan) => {
      const section = contentEl.createDiv({ cls: "workout-plan-selection" });
      section.createEl("h3", { text: plan.name });
      if (!plan.routines.length) {
        section.createEl("p", { text: "No routines configured." });
        return;
      }

      plan.routines.forEach((entry) => {
        const routine = this.routinesById.get(entry.routineId);
        new Setting(section)
          .setName(entry.day ? `${entry.day}: ${entry.routineName}` : entry.routineName)
          .setDesc(entry.notes || "")
          .addButton((btn) =>
            btn
              .setButtonText("Start")
              .setDisabled(!routine)
              .onClick(() => {
                if (!routine) return;
                this.onSelect(plan, routine);
                this.close();
              })
          );
      });
    });
  }
}
