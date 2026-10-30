# Fokus-Training

Tablet-App (PWA) für tägliches Fokus-Training bei linksseitigem Neglect. Läuft nach der Installation komplett offline, alle Daten bleiben auf dem Tablet. Kein Medizinprodukt, ersetzt keine Therapie.

Ziel-Gerät: Samsung Galaxy Tab A11+, Chrome, Querformat. Layout ist auf 1280 × 800 dp gebaut und skaliert auf jede Bildschirmgröße.

## Auf dem Tablet installieren

1. In Chrome die GitHub-Pages-Adresse öffnen (`https://<name>.github.io/fokus-training/`).
2. Einmal komplett laden lassen (danach ist alles offline gespeichert).
3. Chrome-Menü > **Zum Startbildschirm hinzufügen** > Installieren.
4. App vom Startbildschirm öffnen. Sie startet im Vollbild, Querformat, Bildschirm bleibt an.
5. Pflege-Bereich (Zahnrad oben rechts 3 Sekunden halten) > Einstellungen > **Speicher** antippen, damit Android die Daten nie löscht.

**Updates:** Jeder Push auf `main` wird automatisch veröffentlicht. Das Tablet holt das Update beim nächsten Start mit Internet und wendet es an, sobald Conny auf dem Startbildschirm ist (nie mitten im Spiel).

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `app/config.json` | **Alle Stufenwerte und Zeiten.** Einzige Datei, die Therapeuten anpassen müssen. |
| `app/js/games/` | Die sechs Spiele, `common.js` (Spielzeit, Messung, Zufallsregeln), `board.js` (Such-Bretter) |
| `app/js/screens/` | Bildschirme: `basic.js` (Start, Müdigkeit, Ergebnis, Ruhebild), `game.js` (Spiel + Pause), `care.js` (Pflege-Bereich), `history.js` (Therapeuten-Verlauf) |
| `app/js/state.js` | Einstellungen, Tagesplan, Empfehlungs-Regel |
| `app/js/export.js` | CSV, Sicherung (JSON), PDF-Bericht über die Druckansicht |
| `app/sw.js` | Offline-Cache. Neue Dateien hier eintragen (`node tools/check-precache.cjs` prüft das). |
| `design/` | Original-Design aus Claude Design und das Handover |

Vanilla JavaScript ohne Build-Schritt, keine Abhängigkeiten, keine Drittanbieter-Skripte. Schrift (Atkinson Hyperlegible) und Töne (Web Audio) sind lokal.

## Daten

- Gespeichert in IndexedDB auf dem Tablet. Kein Konto, kein Server, keine Übertragung.
- Pro Runde: Datum, Spiel, Stufe, Dauer, Trefferquote gesamt und je Bildschirmdrittel, verpasste Ziele, Reaktionszeiten, Fehltreffer, Müdigkeit vorher/nachher, Pausen, Abbrüche, Links-Hilfe, Anker.
- Export im Pflege-Bereich: Verlauf > **CSV** oder **Bericht** (Drucken > Als PDF speichern). Einstellungen > **Sicherung** speichert alles als JSON (auch zum Umzug auf ein neues Tablet).

## Empfehlungs-Regel

Letzte 3 Runden eines Spiels auf der eingestellten Stufe:

- Trefferquote ≥ 85 % und Müdigkeit nachher höchstens „mittel“: grüner Pfeil hoch
- Trefferquote < 60 % oder zweimal „müde“: blauer Pfeil runter
- sonst: gelb, Stufe halten

Die App ändert die Stufe nie selbst. Innerhalb einer Runde wird nur das Tempo bei Fehlern sanft verlangsamt.

## Lokal testen

```bash
cd app && python3 -m http.server 8123
# http://localhost:8123 öffnen (Service Worker läuft nur über http(s), nicht file://)
```

In der Browser-Konsole ist `fokus.state` erreichbar (Einstellungen, Verlauf), z. B. für Fernwartung.

## Deploy (GitHub Pages)

Einmalig im Repo: **Settings > Pages > Source: GitHub Actions**. Danach veröffentlicht `.github/workflows/pages.yml` den Ordner `app/` bei jedem Push auf `main`.
