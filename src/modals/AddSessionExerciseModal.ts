import { App, Modal, Setting } from "obsidian";
import { ExerciseDefinition, WorkoutSessionExercise } from "../types";

export class AddSessionExerciseModal extends Modal {
  private exercises: ExerciseDefinition[];
  private onAdd: (exercise: WorkoutSessionExercise) => void;
  private searchQuery = "";
  private listEl: HTMLElement;

  constructor(
    app: App,
    exercises: ExerciseDefinition[],
    onAdd: (exercise: WorkoutSessionExercise) => void
  ) {
    super(app);
    this.exercises = exercises;
    this.onAdd = onAdd;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Add Exercise to Session" });

    new Setting(contentEl).setName("Search").addText((text) => {
      text.setPlaceholder("Type to filter exercises…").onChange((value) => {
        this.searchQuery = value.toLowerCase();
        this.renderList();
      });
      // Auto-focus the search field
      setTimeout(() => text.inputEl.focus(), 50);
    });

    this.listEl = contentEl.createDiv({ cls: "workout-add-exercise-list" });
    this.renderList();
  }

  private renderList() {
    this.listEl.empty();
    const filtered = this.exercises.filter(
      (ex) =>
        !this.searchQuery ||
        ex.name.toLowerCase().includes(this.searchQuery) ||
        ex.muscleGroups.some((mg) => mg.toLowerCase().includes(this.searchQuery))
    );

    if (filtered.length === 0) {
      this.listEl.createEl("p", { text: "No exercises found.", cls: "workout-add-exercise-empty" });
      return;
    }

    filtered.forEach((ex) => {
      const item = this.listEl.createDiv({ cls: "workout-add-exercise-item" });
      const nameEl = item.createEl("span", { text: ex.name, cls: "workout-add-exercise-name" });
      if (ex.muscleGroups?.length) {
        nameEl.createEl("small", {
          text: ` — ${ex.muscleGroups.join(", ")}`,
          cls: "workout-add-exercise-muscles",
        });
      }
      item.addEventListener("click", () => {
        this.onAdd(this.buildSessionExercise(ex));
        this.close();
      });
    });
  }

  private buildSessionExercise(ex: ExerciseDefinition): WorkoutSessionExercise {
    const numSets = ex.defaultSets ?? 3;
    const sets = Array.from({ length: numSets }, (_, i) => ({
      setIndex: i + 1,
      targetReps: ex.defaultReps,
      targetWeight: ex.defaultWeight,
      actualReps: ex.defaultReps,
      actualWeight: ex.defaultWeight,
      duration: ex.defaultDuration,
      distance: ex.defaultDistance,
      completed: false,
    }));
    return {
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets,
      completed: false,
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}
