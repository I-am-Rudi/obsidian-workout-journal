import { App, Modal, Setting } from "obsidian";
import { WorkoutFileService } from "../utils/workoutFileService";
import {
  WorkoutStatisticsService,
  WorkoutStatistics,
} from "../utils/workoutStatisticsService";
import WorkoutTrackerPlugin from "../plugin";

export class WorkoutStatsModal extends Modal {
  plugin: WorkoutTrackerPlugin;
  fileService: WorkoutFileService;
  statisticsService: WorkoutStatisticsService;

  constructor(app: App, plugin: WorkoutTrackerPlugin) {
    super(app);
    this.plugin = plugin;
    this.fileService = new WorkoutFileService(
      app,
      plugin.settings.defaultWorkoutFolder
    );
    this.statisticsService = new WorkoutStatisticsService();
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", { text: "Workout Statistics" });

    // Show loading message
    const loadingEl = contentEl.createDiv({ text: "Loading statistics..." });

    try {
      const workouts = await this.fileService.loadAllWorkouts();
      const stats = this.statisticsService.calculateStatistics(workouts);
      loadingEl.remove();
      this.renderStatistics(contentEl, stats);
    } catch (error) {
      loadingEl.setText(`Error loading statistics: ${error.message}`);
    }
  }

  private renderStatistics(container: HTMLElement, stats: WorkoutStatistics) {
    // Overview Stats
    const overviewSection = container.createDiv();
    overviewSection.createEl("h3", { text: "Overview" });

    new Setting(overviewSection)
      .setName("Total Workouts")
      .setDesc(stats.totalWorkouts.toString());

    new Setting(overviewSection)
      .setName("Total Exercises")
      .setDesc(stats.totalExercises.toString());

    new Setting(overviewSection)
      .setName("Total Sets")
      .setDesc(stats.totalSets.toString());

    new Setting(overviewSection)
      .setName("Total Volume")
      .setDesc(
        `${stats.totalVolume.toLocaleString()} ${this.plugin.settings.weightUnit}`
      );

    new Setting(overviewSection)
      .setName("Average Workout Duration")
      .setDesc(`${stats.averageWorkoutDuration.toFixed(1)} minutes`);

    new Setting(overviewSection)
      .setName("Current Streak")
      .setDesc(
        `${stats.workoutStreak} day${stats.workoutStreak !== 1 ? "s" : ""}`
      );

    new Setting(overviewSection)
      .setName("Last Workout")
      .setDesc(stats.lastWorkoutDate || "No workouts yet");

    // Exercise Frequency
    if (Object.keys(stats.exerciseFrequency).length > 0) {
      const frequencySection = container.createDiv();
      frequencySection.createEl("h3", { text: "Exercise Frequency" });

      const sortedExercises = Object.entries(stats.exerciseFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Top 10 exercises

      sortedExercises.forEach(([exercise, count]) => {
        new Setting(frequencySection)
          .setName(exercise)
          .setDesc(`${count} time${count !== 1 ? "s" : ""}`);
      });
    }

    // Personal Records
    if (Object.keys(stats.personalRecords).length > 0) {
      const prSection = container.createDiv();
      prSection.createEl("h3", { text: "Personal Records" });

      Object.entries(stats.personalRecords).forEach(([exercise, record]) => {
        new Setting(prSection)
          .setName(exercise)
          .setDesc(
            `${record.weight} ${this.plugin.settings.weightUnit} × ${record.reps} reps (${record.date})`
          );
      });
    }

    // Recent Activity
    const recentSection = container.createDiv();
    recentSection.createEl("h3", { text: "Recent Activity" });

    const recentDates = Object.keys(stats.workoutsByDate).sort().slice(-7); // Last 7 days with workouts

    if (recentDates.length > 0) {
      recentDates.forEach((date) => {
        const workouts = stats.workoutsByDate[date];
        new Setting(recentSection)
          .setName(date)
          .setDesc(
            `${workouts.length} workout${
              workouts.length !== 1 ? "s" : ""
            }: ${workouts.map((w) => w.name).join(", ")}`
          );
      });
    } else {
      recentSection.createEl("p", { text: "No recent workouts found." });
    }

    // Refresh button
    new Setting(container).addButton((btn) =>
      btn.setButtonText("Refresh Statistics").onClick(async () => {
        container.empty();
        container.createEl("h2", { text: "Workout Statistics" });
        const loadingEl = container.createDiv({
          text: "Loading statistics...",
        });

        try {
          const workouts = await this.fileService.loadAllWorkouts();
          const newStats = this.statisticsService.calculateStatistics(workouts);
          loadingEl.remove();
          this.renderStatistics(container, newStats);
        } catch (error) {
          loadingEl.setText(`Error loading statistics: ${error.message}`);
        }
      })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
