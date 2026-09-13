/** Leave Phaser chrome and open the existing local reveal journal. */
export function openConsequenceJournal(): void {
  if (typeof window === "undefined") return;
  window.location.assign("/game/consequences");
}
